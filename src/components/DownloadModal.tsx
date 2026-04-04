import React from 'react';
import { Modal } from './Modal';
import { Download } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'KR' | 'EN' | 'JP';
  onDownload: (type: 'withRaw' | 'resultOnly' | 'gif') => void;
  isDark: boolean;
}

export function DownloadModal({ isOpen, onClose, lang, onDownload, isDark }: DownloadModalProps) {
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
        <button
          onClick={() => onDownload('withRaw')}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
        >
          <span>{lang === 'KR' ? 'RAW 포함 (ZIP)' : lang === 'EN' ? 'With RAW (ZIP)' : 'RAW 含む (ZIP)'}</span>
        </button>
        <button
          onClick={() => onDownload('resultOnly')}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
        >
          <span>{lang === 'KR' ? 'RAW 미포함 (ZIP)' : lang === 'EN' ? 'Result Only (ZIP)' : 'RAW 除外 (ZIP)'}</span>
        </button>
        <button
          onClick={() => onDownload('gif')}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
        >
          <span>{lang === 'KR' ? 'GIF 저장' : lang === 'EN' ? 'Save as GIF' : 'GIF 保存'}</span>
        </button>
      </div>
    </Modal>
  );
}
