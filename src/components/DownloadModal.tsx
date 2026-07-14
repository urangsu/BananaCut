import React from 'react';
import { Modal } from './Modal';
import { Download } from 'lucide-react';
import { DownloadRequest } from '../types/export';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'KR' | 'EN' | 'JP';
  onDownload: (request: DownloadRequest) => void;
  isDark: boolean;
  defaultFps: number;
  defaultSizeMode: 'original' | 'recommendedStableCrop' | 'customCanvas';
}

export function DownloadModal({ isOpen, onClose, lang, onDownload, isDark, defaultFps, defaultSizeMode }: DownloadModalProps) {
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
          data-testid="export-with-raw"
          onClick={() => onDownload({ format: 'zipWithRaw', sizeMode: defaultSizeMode, fps: defaultFps, includeRaw: true })}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
        >
          <span>{lang === 'KR' ? 'RAW 포함 (ZIP)' : lang === 'EN' ? 'With RAW (ZIP)' : 'RAW 含む (ZIP)'}</span>
        </button>
        <button
          data-testid="export-result-only"
          onClick={() => onDownload({ format: 'zipResultOnly', sizeMode: defaultSizeMode, fps: defaultFps, includeRaw: false })}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-900'}`}
        >
          <span>{lang === 'KR' ? 'RAW 미포함 (ZIP)' : lang === 'EN' ? 'Result Only (ZIP)' : 'RAW 除外 (ZIP)'}</span>
        </button>
        <button
          data-testid="export-gif"
          onClick={() => onDownload({ format: 'gifPreview', sizeMode: defaultSizeMode, fps: defaultFps })}
          className={`w-full p-4 rounded-xl font-medium transition-all text-left flex justify-between items-center ${isDark ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'}`}
        >
          <span>{lang === 'KR' ? 'GIF 저장' : lang === 'EN' ? 'Save as GIF' : 'GIF 保存'}</span>
        </button>
      </div>
    </Modal>
  );
}
