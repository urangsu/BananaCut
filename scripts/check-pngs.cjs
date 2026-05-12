const fs=require('fs'); 
const files=['public/images/og-image.png','public/images/twitter-image.png','public/images/examples/sample-before.png','public/images/examples/sample-after.png','public/images/examples/sample-sprite-sheet.png'].filter(fs.existsSync); 
for (const f of files) { 
  const b=fs.readFileSync(f); 
  console.log(f, [...b.slice(0,8)].map(x=>x.toString(16).padStart(2,'0')).join(' ')); 
}
