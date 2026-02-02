import React, { useState, useEffect } from 'react';
import { OpenRouterProvider } from '../services/ai/providers/openRouterProvider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [providerType, setProviderType] = useState<'gemini' | 'openrouter'>('gemini');

  const [geminiKey, setGeminiKey] = useState('');

  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const [vnAppMobKey, setVnAppMobKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProviderType((localStorage.getItem('SELECTED_AI_PROVIDER') as 'gemini' | 'openrouter') || 'gemini');
      setGeminiKey(localStorage.getItem('GEMINI_API_KEY') || '');
      setOpenRouterKey(localStorage.getItem('OPENROUTER_API_KEY') || '');
      setOpenRouterModel(localStorage.getItem('OPENROUTER_MODEL') || 'openai/gpt-4o');
      setVnAppMobKey(localStorage.getItem('VNAPPMOB_API_KEY') || '');
    }
  }, [isOpen]);

  const handleFetchModels = async () => {
    if (!openRouterKey) return;
    setIsLoadingModels(true);
    try {
      const provider = new OpenRouterProvider(openRouterKey);
      const models = await provider.getModels();
      setAvailableModels(models);
      // If current model is not in list, select the first one (or keep if default)
      if (models.length > 0 && !models.includes(openRouterModel)) {
         setOpenRouterModel(models[0]);
      }
    } catch (e) {
      console.error("Error fetching models", e);
      setAvailableModels(["openai/gpt-4o", "anthropic/claude-3.5-sonnet"]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('SELECTED_AI_PROVIDER', providerType);

    if (geminiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', geminiKey.trim());
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
    }

    if (openRouterKey.trim()) {
      localStorage.setItem('OPENROUTER_API_KEY', openRouterKey.trim());
    } else {
      localStorage.removeItem('OPENROUTER_API_KEY');
    }

    if (openRouterModel.trim()) {
      localStorage.setItem('OPENROUTER_MODEL', openRouterModel.trim());
    }

    if (vnAppMobKey.trim()) {
        localStorage.setItem('VNAPPMOB_API_KEY', vnAppMobKey.trim());
    } else {
        localStorage.removeItem('VNAPPMOB_API_KEY');
    }

    if (onSave) onSave();
    onClose();
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
        <div className="p-6 space-y-6">

          {/* Provider Selection */}
          <div className="space-y-3">
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
               Chọn Nhà cung cấp AI
             </label>
             <div className="flex gap-2">
               <button
                 onClick={() => setProviderType('gemini')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                   providerType === 'gemini'
                   ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                   : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                 }`}
               >
                 Google Gemini
               </button>
               <button
                 onClick={() => setProviderType('openrouter')}
                 className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                   providerType === 'openrouter'
                   ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                   : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                 }`}
               >
                 OpenRouter
               </button>
             </div>
          </div>

          {/* Gemini Settings */}
          {providerType === 'gemini' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Nhập Google Gemini API Key..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">
                Miễn phí & Mạnh mẽ. Có khả năng tìm kiếm Internet.
              </p>
            </div>
          )}

          {/* OpenRouter Settings */}
          {providerType === 'openrouter' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    OpenRouter API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={openRouterKey}
                      onChange={(e) => setOpenRouterKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm"
                    />
                    <button
                      onClick={handleFetchModels}
                      disabled={!openRouterKey || isLoadingModels}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {isLoadingModels ? '...' : 'Load'}
                    </button>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Chọn Model
                  </label>
                  <select
                    value={openRouterModel}
                    onChange={(e) => setOpenRouterModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-sm appearance-none"
                  >
                    <option value="" disabled>-- Chọn Model --</option>
                    {availableModels.length > 0 ? (
                      availableModels.map(m => <option key={m} value={m}>{m}</option>)
                    ) : (
                      <>
                        <option value="openai/gpt-4o">openai/gpt-4o</option>
                        <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet</option>
                        <option value="google/gemini-pro-1.5">google/gemini-pro-1.5</option>
                      </>
                    )}
                  </select>
               </div>
            </div>
          )}

          <div className="border-t border-slate-800 pt-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              VNAppMob API Key (Optional)
            </label>
            <input
              type="password"
              value={vnAppMobKey}
              onChange={(e) => setVnAppMobKey(e.target.value)}
              placeholder="Nhập VNAppMob API Key..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
            />
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
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${
              providerType === 'openrouter'
              ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
              : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
            } text-white`}
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
