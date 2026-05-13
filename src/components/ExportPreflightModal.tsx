import React from 'react';
import { Modal } from './Modal';
import { ExportPreflightResult } from '../types/exportPreflight';

type ExportPreflightModalProps = {
  isOpen: boolean;
  result: ExportPreflightResult | null;
  lang: 'KR' | 'EN' | 'JP';
  isDark: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ExportPreflightModal: React.FC<ExportPreflightModalProps> = ({ 
    isOpen, result, lang, isDark, onCancel, onConfirm 
}) => {
    if (!result) return null;

    const t = (kr: string, en: string, jp: string) => lang === 'KR' ? kr : lang === 'EN' ? en : jp;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onCancel} 
            title={t("내보내기 전 확인", "Preflight Check", "書き出し前確認")}
            lang={lang}
            setLang={() => {}}
        >
            <div className="flex flex-col gap-4 text-sm">
                <div className={`${isDark ? 'bg-white/5' : 'bg-gray-100'} p-3 rounded-lg`}>
                    <p>{t(`총 프레임: ${result.totalFrames}`, `Total Frames: ${result.totalFrames}`, `合計フレーム: ${result.totalFrames}`)}</p>
                    <p>{t(`처리 완료: ${result.processedFrames}`, `Processed: ${result.processedFrames}`, `処理完了: ${result.processedFrames}`)}</p>
                </div>
                {result.issues.map((issue, idx) => (
                    <div key={idx} className={`p-2 rounded ${issue.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {issue.message}
                    </div>
                ))}
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onCancel} className={`px-4 py-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'} rounded`}>{t("취소", "Cancel", "キャンセル")}</button>
                    <button 
                        onClick={onConfirm} 
                        disabled={result.issues.some(i => i.severity === 'error')}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {t("계속 진행", "Continue Export", "書き出しを続行")}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
