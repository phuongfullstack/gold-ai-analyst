import React from 'react';
import ChatWidget from '../components/ChatWidget';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen pb-20 bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-yellow-600 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4 py-6 md:py-10">
        {children}
      </div>

      <div id="chat-widget-container">
        <ChatWidget />
      </div>
    </div>
  );
};

export default MainLayout;
