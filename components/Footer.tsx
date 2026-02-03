import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 mt-24 border-t border-slate-800/50 bg-[#020617] py-12">
      <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">

        <div className="flex flex-col gap-1 text-center md:text-left">
           <h4 className="text-white font-black uppercase tracking-[0.2em] text-xs">Gold Market Analyst</h4>
           <p className="text-slate-500 text-[10px] font-mono">Advanced AI-Powered Financial Intelligence</p>
        </div>

        <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           <a href="#" className="hover:text-white transition-colors">Privacy</a>
           <a href="#" className="hover:text-white transition-colors">Terms</a>
           <a href="#" className="hover:text-white transition-colors">Data Sources</a>
        </div>

        <div className="text-right">
           <p className="text-slate-500 text-[10px]">
              © {new Date().getFullYear()} <span className="text-slate-300 font-bold">AnyTex</span>. All rights reserved.
           </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
