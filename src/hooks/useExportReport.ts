import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { MarketData, AnalysisReport } from '../types';

export const useExportReport = (marketData: MarketData | null, report: AnalysisReport | null) => {
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isPngGenerating, setIsPngGenerating] = useState(false);

  const toggleChartPlaceholder = (show: boolean) => {
    const container = document.getElementById('tradingview_widget_xauusd');
    if (!container) return;

    if (show && report && marketData) {
      const placeholder = document.createElement('div');
      placeholder.id = 'export-chart-placeholder';
      placeholder.style.width = '100%';
      placeholder.style.height = '100%';
      placeholder.style.backgroundColor = '#0f172a';
      placeholder.style.display = 'flex';
      placeholder.style.flexDirection = 'column';
      placeholder.style.alignItems = 'center';
      placeholder.style.justifyContent = 'center';
      placeholder.style.position = 'absolute';
      placeholder.style.top = '0';
      placeholder.style.left = '0';
      placeholder.style.zIndex = '50';
      placeholder.style.padding = '20px';

      const sigs = report.technicalSignals;
      const sentiment = sigs.rsi > 60 ? 'BULLISH' : sigs.rsi < 40 ? 'BEARISH' : 'NEUTRAL';
      const sentimentColor = sentiment === 'BULLISH' ? '#10b981' : sentiment === 'BEARISH' ? '#f43f5e' : '#eab308';

      placeholder.innerHTML = `
        <div style="border: 1px solid #334155; border-radius: 24px; padding: 40px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); width: 95%; height: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); font-family: 'Inter', sans-serif; color: white; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
              <div>
                <div style="color: #eab308; font-size: 28px; font-weight: 900; letter-spacing: 2px;">MARKET SNAPSHOT</div>
                <div style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Technical Confluence Report</div>
              </div>
              <div style="background: ${sentimentColor}20; border: 1px solid ${sentimentColor}50; padding: 10px 20px; border-radius: 12px; text-align: right;">
                <div style="color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase;">SENTIMENT</div>
                <div style="color: ${sentimentColor}; font-size: 24px; font-weight: 900;">${sentiment}</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px;">
              <div style="background: #0f172a; padding: 20px; border-radius: 16px; border-left: 4px solid #3b82f6;">
                <div style="color: #475569; font-size: 10px; font-weight: 900; text-transform: uppercase;">CHỈ SỐ SỨC MẠNH (RSI)</div>
                <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
                   <div style="font-size: 32px; font-weight: 900;">${sigs.rsi}</div>
                   <div style="flex: 1; height: 6px; background: #1e293b; border-radius: 3px; position: relative;">
                      <div style="position: absolute; left: ${sigs.rsi}%; width: 12px; height: 12px; background: white; border-radius: 50%; top: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 10px white;"></div>
                   </div>
                </div>
              </div>
              <div style="background: #0f172a; padding: 20px; border-radius: 16px; border-left: 4px solid #8b5cf6;">
                <div style="color: #475569; font-size: 10px; font-weight: 900; text-transform: uppercase;">XU HƯỚNG TRUNG HẠN (MA)</div>
                <div style="margin-top: 10px; font-size: 18px; font-weight: 800; color: ${sigs.ma50 === 'ABOVE' ? '#10b981' : '#f43f5e'}">
                  ${sigs.ma50 === 'ABOVE' ? '▲ GIÁ TRÊN MA50' : '▼ GIÁ DƯỚI MA50'}
                </div>
                <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Cấu trúc thị trường hiện tại</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
               <div style="background: rgba(16, 185, 129, 0.05); padding: 20px; border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.1);">
                  <div style="color: #10b981; font-size: 10px; font-weight: 900; text-transform: uppercase;">HỖ TRỢ CHIẾN LƯỢC</div>
                  <div style="font-size: 28px; font-weight: 900; margin-top: 5px; color: #10b981;">$${sigs.support}</div>
               </div>
               <div style="background: rgba(244, 63, 94, 0.05); padding: 20px; border-radius: 16px; border: 1px solid rgba(244, 63, 94, 0.1);">
                  <div style="color: #f43f5e; font-size: 10px; font-weight: 900; text-transform: uppercase;">KHÁNG CỰ CHIẾN LƯỢC</div>
                  <div style="font-size: 28px; font-weight: 900; margin-top: 5px; color: #f43f5e;">$${sigs.resistance}</div>
               </div>
            </div>
          </div>

          <div style="border-top: 1px solid #334155; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div style="max-width: 60%;">
               <div style="color: #64748b; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">TÓM TẮT HÀNH ĐỘNG</div>
               <div style="color: #fff; font-size: 14px; font-weight: 600; line-height: 1.5;">${report.technicalSummary.substring(0, 150)}...</div>
            </div>
            <div style="text-align: right;">
               <div style="color: #475569; font-size: 9px; font-weight: 900; font-family: monospace;">AIA TERMINAL PROTOCOL // ${new Date().toISOString()}</div>
            </div>
          </div>
        </div>
      `;

      const prevPosition = container.style.position;
      container.style.position = 'relative';
      container.dataset.prevPosition = prevPosition;
      container.appendChild(placeholder);
    } else {
      const placeholder = document.getElementById('export-chart-placeholder');
      if (placeholder) placeholder.remove();
      if (container.dataset.prevPosition) {
         container.style.position = container.dataset.prevPosition;
      }
    }
  };

  const prepareForExport = () => {
    const chatWidget = document.getElementById('chat-widget-container');
    if (chatWidget) chatWidget.style.display = 'none';
    toggleChartPlaceholder(true);
    document.body.classList.add('exporting');
  };

  const cleanupExport = () => {
    const chatWidget = document.getElementById('chat-widget-container');
    if (chatWidget) chatWidget.style.display = 'block';
    toggleChartPlaceholder(false);
    document.body.classList.remove('exporting');
  };

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      prepareForExport();
      const element = document.body;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
        windowWidth: 1600,
      });
      cleanupExport();

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'l' : 'p',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Gold_AI_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      cleanupExport();
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadPng = async () => {
    setIsPngGenerating(true);
    try {
      prepareForExport();
      const element = document.body;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        logging: false,
        windowWidth: 1600,
      });
      cleanupExport();
      const link = document.createElement('a');
      link.download = `Gold_AI_Report_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      cleanupExport();
    } finally {
      setIsPngGenerating(false);
    }
  };

  return {
    isPdfGenerating,
    isPngGenerating,
    handleDownloadPdf,
    handleDownloadPng
  };
};
