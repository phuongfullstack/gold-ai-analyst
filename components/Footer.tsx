import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-20 border-t border-slate-700/50 bg-slate-900/40 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* App Slogan */}
          <div className="text-center">
            <p className="text-yellow-500 text-lg font-bold tracking-wide">
              Phân tích thông minh - Quyết định chính xác
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Gold Market Analyst - Công nghệ AI hỗ trợ đầu tư vàng
            </p>
          </div>
          
          {/* Divider */}
          <div className="w-full max-w-md h-px bg-slate-700/30"></div>
          
          {/* Copyright and AnyTex Slogan */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Bản quyền thuộc về{' '}
              <a 
                href="https://anytex.vn" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
              >
                AnyTex
              </a>
            </div>
            <div className="hidden md:block text-slate-600">|</div>
            <div className="text-slate-500 text-sm font-medium italic">
              We build you grow
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
