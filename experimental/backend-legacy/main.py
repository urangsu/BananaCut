from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import rembg
import cv2
import numpy as np
from PIL import Image, ImageFilter
import io
import zipfile
import os

app = FastAPI(title="BananaCut Backend", description="Dalgaurak Studio API")

# CORS configuration to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# The Brain (Gemini Vision API) - Skeleton
# ==============================================================================
# import google.generativeai as genai
# 
# # Configure with your API key
# genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
# model = genai.GenerativeModel('gemini-2.0-flash')
# 
# def detect_islands_with_gemini(image_bytes: bytes) -> str:
#     """
#     Uses Gemini 2.0 Flash to detect un-transparent white spaces (islands)
#     between objects and furniture.
#     """
#     try:
#         img = Image.open(io.BytesIO(image_bytes))
#         prompt = "캐릭터의 꼬리와 본체 사이의 틈새 좌표를 찾아줘"
#         response = model.generate_content([prompt, img])
#         return response.text
#     except Exception as e:
#         print(f"Gemini API Error: {e}")
#         return ""
# ==============================================================================

def remove_white_islands(img: Image.Image) -> Image.Image:
    """
    Removes white islands (background holes) that rembg might have missed,
    while keeping small white areas (eyes, teeth) and props on the desk.
    Also acts as a fallback if rembg fails to remove a white background.
    """
    np_img = np.array(img)
    h, w = np_img.shape[:2]
    
    # 1. Identify pure white pixels (background islands are usually pure white #ffffff)
    # We use > 250 to avoid removing light-colored character parts (like a belly)
    r, g, b, a = np_img[:,:,0], np_img[:,:,1], np_img[:,:,2], np_img[:,:,3]
    white_mask = ((r > 250) & (g > 250) & (b > 250) & (a > 0)).astype(np.uint8) * 255
    
    # 2. Find the actual content bounding box (ignoring black borders from video frames)
    content_mask = ((r > 10) | (g > 10) | (b > 10)).astype(np.uint8)
    coords = cv2.findNonZero(content_mask)
    if coords is not None:
        cx_min, cy_min, cw, ch = cv2.boundingRect(coords)
    else:
        cx_min, cy_min, cw, ch = 0, 0, w, h
        
    cx_max = cx_min + cw
    cy_max = cy_min + ch
    
    # 3. Find connected components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(white_mask, connectivity=8)
    
    for i in range(1, num_labels):
        x, y, comp_w, comp_h, area = stats[i]
        cx, cy = centroids[i]
        
        component_mask = (labels == i)
        
        # Check if the component touches the outer edges of the ACTUAL content
        # We use a 5-pixel margin to account for slight cropping or noise
        margin = 5
        touches_top = np.any(component_mask[max(0, cy_min):min(h, cy_min + margin), :])
        touches_left = np.any(component_mask[:, max(0, cx_min):min(w, cx_min + margin)])
        touches_right = np.any(component_mask[:, max(0, cx_max - margin):min(w, cx_max)])
        
        is_background = False
        
        # Rule 1: If it touches the top, left, or right edge of the content, it's background.
        if touches_top or touches_left or touches_right:
            is_background = True
            
        # Rule 2: If it's a massive white area (> 10% of image), it's almost certainly background.
        elif area > (h * w * 0.1):
            is_background = True
            
        # Rule 3: If it's a large island in the upper/middle area (e.g., between tail and body)
        # Area > 0.5% of image, and centroid is in the upper 70% of the image.
        elif area > (h * w * 0.005) and cy < (h * 0.7):
            is_background = True
            
        # Rule 4: Keep small white areas (eyes, teeth) and props on the desk (bottom 30%)
        # These will not trigger Rules 1-3.
        
        if is_background:
            np_img[component_mask, 3] = 0
            
    return Image.fromarray(np_img)

def process_image(image_bytes: bytes) -> Image.Image:
    """
    The Blade: Processes a single frame.
    1. Removes general background using rembg (keeps character and desk).
    2. Removes remaining white islands (e.g. between tail and body) while keeping eyes/props.
    3. Smart crops to the bounding box of the non-transparent pixels.
    4. Resizes and pastes onto a 500x700 transparent canvas (bottom-aligned).
    5. Edge-Purifies using OpenCV (erode + gaussian blur).
    """
    # 1. Remove general background
    try:
        output_bytes = rembg.remove(image_bytes)
        img = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    except Exception as e:
        print(f"rembg failed: {e}")
        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    
    # 2. Remove white islands
    img = remove_white_islands(img)
    
    # 3. Safe-Zone Fitting: Smart Crop
    np_img = np.array(img)
    alpha = np_img[:, :, 3]
    coords = cv2.findNonZero(alpha)
    
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        cropped = img.crop((x, y, x + w, y + h))
    else:
        cropped = img

    # Fit into 500x700 canvas maintaining aspect ratio
    target_w, target_h = 500, 700
    ratio = min(target_w / cropped.width, target_h / cropped.height)
    new_w = int(cropped.width * ratio)
    new_h = int(cropped.height * ratio)
    
    # Use LANCZOS for high-quality downsampling
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    offset_x = (target_w - new_w) // 2
    offset_y = target_h - new_h # Bottom-aligned (접지면 기준)
    
    canvas.paste(resized, (offset_x, offset_y), resized)
    
    # 3. Edge-Purify: Refine edges
    np_canvas = np.array(canvas)
    alpha_channel = np_canvas[:, :, 3]
    
    # Erode 1px to remove white halos
    kernel = np.ones((3, 3), np.uint8)
    eroded_alpha = cv2.erode(alpha_channel, kernel, iterations=1)
    
    # Gaussian Blur for anti-aliasing
    blurred_alpha = cv2.GaussianBlur(eroded_alpha, (3, 3), 0)
    
    np_canvas[:, :, 3] = blurred_alpha
    final_img = Image.fromarray(np_canvas)
    
    return final_img

@app.post("/api/process-frames")
async def process_frames(
    char_name: str = Form(...),
    motion_name: str = Form(...),
    files: list[UploadFile] = File(...)
):
    """
    Receives extracted frames from the frontend, processes them in parallel (or sequentially),
    and returns a ZIP file containing the transparent PNG sequence.
    """
    zip_buffer = io.BytesIO()
    
    # Create ZIP file in memory
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for idx, file in enumerate(files):
            image_bytes = await file.read()
            
            # Process the image
            processed_img = process_image(image_bytes)
            
            # Save to byte array
            img_byte_arr = io.BytesIO()
            processed_img.save(img_byte_arr, format="PNG", optimize=True)
            
            # Naming rule: {char_name}/{motion_name}/{char_name}_{motion_name}_{index:03d}.png
            # Using 1-based indexing (001~0xx)
            filename = f"{char_name}/{motion_name}/{char_name}_{motion_name}_{idx+1:03d}.png"
            zip_file.writestr(filename, img_byte_arr.getvalue())
            
    zip_buffer.seek(0)
    
    # Return as a downloadable ZIP file
    return StreamingResponse(
        zip_buffer, 
        media_type="application/zip", 
        headers={
            "Content-Disposition": f"attachment; filename={char_name}_{motion_name}.zip",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

import json

@app.post("/api/process-batch")
async def process_batch(
    char_name: str = Form(...),
    segments_json: str = Form(...),
    files: list[UploadFile] = File(...)
):
    """
    Receives a batch of frames for multiple segments, processes them,
    and returns a single ZIP file organized by segment name.
    segments_json format: [{"name": "motion_a", "count": 10}, {"name": "motion_b", "count": 15}]
    """
    segments = json.loads(segments_json)
    zip_buffer = io.BytesIO()
    
    file_idx = 0
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for segment in segments:
            motion_name = segment["name"]
            count = segment["count"]
            
            for i in range(count):
                if file_idx >= len(files):
                    break
                    
                file = files[file_idx]
                image_bytes = await file.read()
                
                # Process the image
                processed_img = process_image(image_bytes)
                
                # Save to byte array
                img_byte_arr = io.BytesIO()
                processed_img.save(img_byte_arr, format="PNG", optimize=True)
                
                # Naming rule: {char_name}/{motion_name}/{char_name}_{motion_name}_{index:03d}.png
                filename = f"{char_name}/{motion_name}/{char_name}_{motion_name}_{i+1:03d}.png"
                zip_file.writestr(filename, img_byte_arr.getvalue())
                
                file_idx += 1
                
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer, 
        media_type="application/zip", 
        headers={
            "Content-Disposition": f"attachment; filename={char_name}_batch.zip",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
