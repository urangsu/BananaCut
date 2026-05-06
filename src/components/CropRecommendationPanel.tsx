import React from 'react';
import { Crop, Loader2 } from 'lucide-react';

interface CropRecommendationPanelProps {
  isDark: boolean;
  lang: 'KR' | 'EN' | 'JP';
  panelClass: string;
  isExtracting: boolean;
  isAnalyzingCrop: boolean;
  cropAnalysisProgress: { current: number; total: number };
  cropSettings: any;
  setCropSettings: any;
  handleAnalyzeCrop: () => Promise<void>;
  framesLength: number;
}

export function CropRecommendationPanel({
    isDark, lang, panelClass, isExtracting, isAnalyzingCrop, cropAnalysisProgress, cropSettings, setCropSettings, handleAnalyzeCrop, framesLength
}: CropRecommendationPanelProps) {
    const accentIconClass = isDark ? "text-blue-400" : "text-blue-600";
    const descClass = `text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`;

    return (
        <div className={`order-3 ${panelClass} ${isExtracting ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className={`text-lg font-medium mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Crop className={accentIconClass} />
              3. Smart Crop <span className="text-sm font-normal opacity-60">{lang === 'KR' ? '(스마트 크롭)' : lang === 'EN' ? '(Smart Crop)' : '(スマートクロップ)'}</span>
            </h2>
            <div className="space-y-4">
              <p className={descClass}>
                {lang === 'KR' ? '모든 프레임에 대한 여백을 분석하여 최적의 크기를 추천받습니다.' : lang === 'EN' ? 'Analyze margins for all frames to get the optimal crop recommendation.' : 'すべてのフレームの余白を分析し、最適なクロップサイズを推奨します。'}
              </p>
              
              <button 
                onClick={handleAnalyzeCrop}
                disabled={isAnalyzingCrop || framesLength === 0}
                className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'} disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {isAnalyzingCrop && <Loader2 className="w-4 h-4 animate-spin" />}
                {lang === 'KR' ? '여백 분석 (Analyze Margins)' : lang === 'EN' ? 'Analyze Margins' : '余白の分析'}
              </button>

              {cropAnalysisProgress.total > 0 && isAnalyzingCrop && (
                 <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                   <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(cropAnalysisProgress.current / cropAnalysisProgress.total) * 100}%` }}></div>
                 </div>
              )}

              {cropSettings.box && !isAnalyzingCrop && (
                <div className={`p-3 rounded-lg border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>{lang === 'KR' ? '추천 캔버스 크기' : lang === 'EN' ? 'Recommended Size' : '推奨サイズ'}</span>
                    <span className="text-sm font-mono font-medium">{cropSettings.recommendedCanvas?.width} x {cropSettings.recommendedCanvas?.height}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setCropSettings((prev: any) => ({ ...prev, isPreviewing: false }))}
                      className={`w-full py-1 text-xs font-bold rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {lang === 'KR' ? '미리보기 종료 (Exit Preview)' : lang === 'EN' ? 'Exit Preview' : 'プレビューを終了'}
                    </button>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={cropSettings.isPreviewing}
                        onChange={e => setCropSettings((prev: any) => ({ ...prev, isPreviewing: e.target.checked }))}
                        className="rounded border-gray-300 w-4 h-4"
                      />
                      {lang === 'KR' ? '미리보기 가이드 표시 (Preview Box)' : lang === 'EN' ? 'Preview Box' : 'プレビューの表示'}
                    </label>

                    <label className="flex flex-col gap-2 cursor-pointer">
                      <div className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          checked={cropSettings.enabledForExport}
                          onChange={e => setCropSettings((prev: any) => ({ ...prev, enabledForExport: e.target.checked }))}
                          className="rounded border-gray-300 w-4 h-4"
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {lang === 'KR' ? '다운로드 시 크롭 적용' : lang === 'EN' ? 'Use for Export' : 'エクスポートに適用'}
                        </span>
                      </div>
                      {cropSettings.enabledForExport && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                            {lang === 'KR' ? '추천 크롭이 다운로드 시 적용됩니다.' : lang === 'EN' ? 'Recommended crop will be applied when exporting.' : 'エクスポート時に推奨クロップが適用されます。'}
                          </p>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
    );
}
