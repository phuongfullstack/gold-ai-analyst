# 📊 Gold Market Analyst

**AI-Powered Real-Time Gold Market Analysis Dashboard**  
*Bảng điều khiển phân tích thị trường vàng thời gian thực được hỗ trợ bởi AI*

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](#-overview) • [Tiếng Việt](#-tổng-quan)

</div>

---

## 🎯 Overview

**Gold Market Analyst** is a sophisticated real-time gold market analysis application powered by Google's Gemini 2.0 Flash AI. It delivers comprehensive insights into global gold prices (XAU/USD), Vietnamese local gold markets (SJC, PNJ, DOJI, BTMC), and macroeconomic indicators (DXY, USD/VND).

### ✨ Key Features

#### 📈 Market Intelligence
- **Real-time Pricing**: XAU/USD spot prices with automatic 2-minute refresh intervals
- **Local Market Coverage**: Track SJC, PNJ, DOJI, BTMC gold bars and ring gold prices
- **Macro Indicators**: US Dollar Index (DXY) and USD/VND exchange rate monitoring
- **Interactive Charts**: TradingView widget integration for professional technical analysis

#### 🤖 AI-Powered Analysis
- **Gemini 2.0 Flash Integration**: Advanced AI-driven market sentiment analysis
- **Automated Reporting**: Technical, macro, and market trend summaries
- **Smart Recommendations**: BUY/SELL/WATCH signals based on multi-dimensional analysis
- **AI Chat Assistant**: Interactive chatbot for market insights and Q&A

#### 📊 Technical Indicators
- **Momentum**: RSI (Relative Strength Index), Stochastic Oscillator
- **Trend Analysis**: MACD, Moving Averages (MA50, MA200), ADX
- **Volatility**: Bollinger Bands, ATR
- **Support/Resistance**: Pivot Points, Fibonacci Retracement Levels
- **Market Cycles**: CCI (Commodity Channel Index)

#### 🎨 Professional UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern Dark Theme**: Easy on the eyes with high contrast visualization
- **Export Capabilities**: Generate PDF reports and PNG snapshots
- **Real-time Notifications**: Toast alerts for data updates and system events
- **Auto-refresh**: Hands-free operation with configurable update intervals

### 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19.2.4, TypeScript 5.8.2, Vite 6.2.0 |
| **AI/ML** | Google Gemini 2.0 Flash API |
| **Data Sources** | Gold Price APIs, TradingView, Exchange Rate APIs |
| **Visualization** | Recharts, html2canvas, jsPDF |
| **State Management** | React Context API |

### 🚀 Quick Start

#### Prerequisites
- Node.js 16.x or higher
- npm 7.x or higher
- Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

#### Installation

```bash
# Clone the repository
git clone https://github.com/phuongfullstack/gold-ai-analyst.git
cd gold-ai-analyst

# Install dependencies
npm install

# Start development server
npm run dev
```

#### API Configuration

**Option 1: Via Application UI (Recommended)**
1. Launch the app: `npm run dev`
2. Click the ⚙️ Settings icon (top-right corner)
3. Enter your Gemini API Key
4. Click "Save" (stored securely in localStorage)

**Option 2: Via Environment File**
```bash
# Create .env.local file
echo "API_KEY=your_gemini_api_key_here" > .env.local
```

#### Production Build

```bash
npm run build
npm run preview
```

### 📖 Usage Guide

1. **Monitor Prices**: View real-time gold prices across multiple markets
2. **Analyze Trends**: Check technical indicators and chart patterns
3. **Read AI Insights**: Review detailed analysis reports and recommendations
4. **Chat with AI**: Ask questions about market conditions and strategies
5. **Export Reports**: Generate professional PDF or PNG reports
6. **Customize Settings**: Configure API keys and preferences

### 📁 Project Structure

```
gold-ai-analyst/
├── components/              # React UI components
│   ├── PriceCard.tsx       # Price display cards
│   ├── MarketChart.tsx     # TradingView chart integration
│   ├── AnalysisPanel.tsx   # AI analysis dashboard
│   ├── AdvancedTechnicals.tsx  # Technical indicators
│   ├── ChatWidget.tsx      # AI chat interface
│   └── ...
├── services/               # API integration layer
│   └── geminiService.ts    # Gemini AI service
├── utils/                  # Utility functions
│   ├── algorithms.ts       # Technical calculation algorithms
│   └── constants.ts        # Application constants
├── contexts/               # React Context providers
│   └── ToastContext.tsx    # Notification system
├── types.ts               # TypeScript type definitions
└── App.tsx                # Main application component
```

### 🔐 Security Best Practices

- API keys stored in localStorage (client-side only)
- No API keys committed to version control
- HTTPS enforced for all API communications
- Input validation and sanitization implemented
- Environment variables for sensitive configuration

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 📞 Contact

- **Author**: Phuong Full Stack
- **GitHub**: [@phuongfullstack](https://github.com/phuongfullstack)

---

## 🇻🇳 Tổng Quan

**Gold Market Analyst** là ứng dụng phân tích thị trường vàng thời gian thực chuyên nghiệp, được hỗ trợ bởi trí tuệ nhân tạo Gemini 2.0 Flash của Google. Ứng dụng cung cấp phân tích chuyên sâu về giá vàng thế giới (XAU/USD), thị trường vàng Việt Nam (SJC, PNJ, DOJI, BTMC), và các chỉ số kinh tế vĩ mô (DXY, USD/VND).

### ✨ Tính Năng Nổi Bật

#### 📈 Theo Dõi Thị Trường
- **Giá Thời Gian Thực**: XAU/USD với tự động cập nhật mỗi 2 phút
- **Thị Trường Trong Nước**: Giá vàng SJC, PNJ, DOJI, BTMC, vàng nhẫn 9999
- **Chỉ Số Vĩ Mô**: US Dollar Index (DXY), tỷ giá USD/VND
- **Biểu Đồ Chuyên Nghiệp**: Tích hợp TradingView widget

#### 🤖 Phân Tích AI
- **Gemini 2.0 Flash**: Phân tích tâm lý thị trường bằng AI tiên tiến
- **Báo Cáo Tự Động**: Tóm tắt kỹ thuật, vĩ mô và xu hướng
- **Khuyến Nghị Thông Minh**: Tín hiệu MUA/BÁN/QUAN SÁT dựa trên phân tích đa chiều
- **Trợ Lý AI**: Chatbot giải đáp thắc mắc về thị trường

#### 📊 Chỉ Báo Kỹ Thuật
- **Động Lực**: RSI, Stochastic Oscillator
- **Xu Hướng**: MACD, MA50, MA200, ADX
- **Biến Động**: Bollinger Bands, ATR
- **Hỗ Trợ/Kháng Cự**: Pivot Points, Fibonacci
- **Chu Kỳ**: CCI (Commodity Channel Index)

#### 🎨 Giao Diện & Trải Nghiệm
- **Responsive**: Tối ưu cho mọi thiết bị
- **Dark Theme**: Giao diện tối hiện đại, chuyên nghiệp
- **Xuất Báo Cáo**: PDF và PNG
- **Thông Báo**: Toast notifications thời gian thực
- **Tự Động**: Cập nhật dữ liệu liên tục

### 🚀 Hướng Dẫn Cài Đặt

#### Yêu Cầu
- Node.js phiên bản 16.x trở lên
- npm phiên bản 7.x trở lên
- Gemini API Key ([Đăng ký tại đây](https://makersuite.google.com/app/apikey))

#### Các Bước

```bash
# Clone repository
git clone https://github.com/phuongfullstack/gold-ai-analyst.git
cd gold-ai-analyst

# Cài đặt dependencies
npm install

# Chạy ứng dụng
npm run dev
```

#### Cấu Hình API Key

**Cách 1: Qua Giao Diện (Khuyến nghị)**
1. Mở ứng dụng: `npm run dev`
2. Click icon ⚙️ Settings ở góc trên bên phải
3. Nhập Gemini API Key của bạn
4. Click "Save" (lưu an toàn trong localStorage)

**Cách 2: Qua File Môi Trường**
```bash
# Tạo file .env.local
echo "API_KEY=gemini_api_key_cua_ban" > .env.local
```

#### Build Production

```bash
npm run build
npm run preview
```

### 📖 Hướng Dẫn Sử Dụng

1. **Theo Dõi Giá**: Xem giá vàng thời gian thực trên các thẻ
2. **Phân Tích Kỹ Thuật**: Kiểm tra các chỉ báo và biểu đồ
3. **Đọc Báo Cáo AI**: Xem phân tích chi tiết và khuyến nghị
4. **Chat với AI**: Đặt câu hỏi về thị trường và chiến lược
5. **Xuất Báo Cáo**: Tạo file PDF hoặc PNG chuyên nghiệp
6. **Tùy Chỉnh**: Cấu hình API key và preferences

### 🔐 Bảo Mật

- API keys được lưu trong localStorage (phía client)
- Không commit API keys vào repository
- Sử dụng HTTPS cho tất cả API calls
- Validate và sanitize user inputs
- Biến môi trường cho cấu hình nhạy cảm

### 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp! Các bước:

1. Fork repository
2. Tạo branch: `git checkout -b feature/tinh-nang-moi`
3. Commit: `git commit -m 'Thêm tính năng mới'`
4. Push: `git push origin feature/tinh-nang-moi`
5. Mở Pull Request

### 📄 Giấy Phép

Dự án sử dụng giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

### 📞 Liên Hệ

- **Tác Giả**: Phuong Full Stack
- **GitHub**: [@phuongfullstack](https://github.com/phuongfullstack)

---

<div align="center">

**Made with ❤️ by Phuong Full Stack**  
*Powered by Google Gemini AI*

</div>
