import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('GEMINI_API_KEY') || '';
      setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }
    onClose();
    // Optional: reload to apply changes if needed, but the service reads on demand now.
    // window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white tracking-wide">Cài đặt hệ thống</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Nhập API Key của bạn..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
            />
            <p className="mt-2 text-xs text-slate-500">
              API Key sẽ được lưu trữ an toàn trên trình duyệt của bạn (LocalStorage) và không bao giờ được gửi đi đâu khác ngoài Google Servers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 font-medium text-sm hover:bg-slate-700 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
