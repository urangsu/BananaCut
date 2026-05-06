import React from 'react';
import { Modal } from './Modal';
import { Download } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'KR' | 'EN' | 'JP';
  onDownload: (type: 'withRaw' | 'resultOnly' | 'gif', exportSizeMode: 'original' | 'recommendedStableCrop' | 'custom') => void;
  isDark: boolean;
}

export function DownloadModal({ isOpen, onClose, lang, onDownload, isDark }: DownloadModalProps) {
  const [exportSizeMode, setExportSizeMode] = React.useState<'original' | 'recommendedStableCrop' | 'custom'>('original');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === 'KR' ? '다운로드 옵션' : lang === 'EN' ? 'Download Options' : 'ダウンロードオプション'}
      icon={Download}
      lang={lang}
      setLang={() => {}}
      maxWidthClass="max-w-[300px]"
    >
      <div className="flex flex-col gap-3 py-4">
        <div className="flex flex-col gap-1 text-sm pt-2">
            <label className={`font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
                {lang === 'KR' ? '내보내기 크기 모드' : lang === 'EN' ? 'Export Size Mode' : 'エクスポートサイズモード'}
            </label>
            <select
                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                value={exportSizeMode}
                onChange={(e) => setExportSizeMode(e.target.value as any)}
            >
                <option value="original">{lang === 'KR' ? '원본 캔버스' : lang === 'EN' ? 'Original Canvas' : 'オリジナルキャンバス'}</option>
                <option value="recommendedStableCrop">{lang === 'KR' ? '추천 안정 크롭' : lang === 'EN' ? 'Recommended Stable Crop' : '推奨安定クロップ'}</option>
                <option value="custom" disabled>{lang === 'KR' ? '사용자 지정' : lang === 'EN' ? 'Custom Canvas (Coming soon)' : 'カスタム (Coming soon)'}</option>
            </select>
        </div>
        <button
          onClick={() => onDownload('withRaw', exportSizeMode)}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
        >
          <span>{lang === 'KR' ? 'RAW 포함 (ZIP)' : lang === 'EN' ? 'With RAW (ZIP)' : 'RAW 含む (ZIP)'}</span>
        </button>
        <button
          onClick={() => onDownload('resultOnly', exportSizeMode)}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
        >
          <span>{lang === 'KR' ? 'RAW 미포함 (ZIP)' : lang === 'EN' ? 'Result Only (ZIP)' : 'RAW 除外 (ZIP)'}</span>
        </button>
        <button
          onClick={() => onDownload('gif', exportSizeMode)}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
        >
          <span>{lang === 'KR' ? 'GIF 저장' : lang === 'EN' ? 'Save as GIF' : 'GIF 保存'}</span>
        </button>
      </div>
    </Modal>
  );
}
