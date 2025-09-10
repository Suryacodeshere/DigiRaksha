# 🛡️ UPI Guard - Fraud Detection App

A comprehensive React-based UPI fraud detection application that helps users stay safe from payment frauds through community-driven reporting and AI-powered assistance.

## ✨ Features

### Core Features
- **UPI ID Safety Checker** - Check if a UPI ID has been reported for fraud
- **QR Code Scanner** - Upload and scan QR codes to extract and verify UPI payment details
- **Phone Number Fraud Check** - Report and check fraudulent phone numbers
- **Payment Link Verification** - Verify the safety of payment links and UPI URLs
- **Fraud Reporting System** - Community-driven fraud reporting with severity levels
- **AI Support Chat** - 24/7 AI assistant providing fraud prevention guidance

### User Features
- **User Authentication** - Secure login/signup system
- **User Profile Management** - Track your safety checks and fraud reports
- **UPI App Integration** - Direct redirect to installed UPI apps for safe payments
- **Real-time Risk Assessment** - Dynamic safety scores based on community reports

### UI/UX Features
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Sliding Navigation** - Clean, expandable navigation system
- **Modern Glass-morphism Design** - Beautiful, professional interface
- **Color-coded Risk Indicators** - Green (Safe), Orange (Moderate), Red (Danger)
- **Real-time Feedback** - Instant validation and error messages

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern web browser

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Start the development server**
```bash
npm run dev
```

3. **Open your browser**
Navigate to `http://localhost:5173`

## 🎯 How to Use

### 1. Authentication
- **Sign Up**: Create a new account with email and password
- **Sign In**: Login to access all features (demo mode works without Firebase)
- **Profile**: View your activity stats and manage account settings

### 2. UPI ID Checking
- Enter any UPI ID (try `fraud@paytm` for demo)
- View safety score (0-100, higher is safer)
- See community report statistics
- Get risk-based recommendations
- Redirect to UPI apps for safe payments

### 3. QR Code Scanning
- Upload an image containing a QR code
- Automatically extract UPI payment details
- Verify merchant information and amounts
- Get safety assessment before payment

### 4. Phone Number Verification
- Check Indian phone numbers (try `9876543210` for demo)
- Report suspicious numbers with incident details
- View community safety statistics
- Get safety recommendations

### 5. Payment Link Checking
- Verify payment links from SMS, email, or social media
- Analyze domain reputation and community reports
- Get safety scores and recommendations
- Protect against phishing attempts

### 6. Fraud Reporting
- Report fraudulent UPI IDs, phone numbers, or links
- Provide detailed incident descriptions
- Set severity levels (1-5 scale)
- Help protect the community

### 7. AI Support
- 24/7 intelligent chat assistance
- Get fraud prevention tips
- Access emergency helpline numbers
- Learn about UPI safety best practices

## 🛡️ Safety Features

### Risk Assessment Algorithm
- **Safety Score**: 0-100 scale (higher = safer)
- **Community Reports**: Weighted by severity and frequency
- **Recency Factor**: Recent reports have higher impact
- **Pattern Recognition**: Identifies common fraud patterns

### Security Measures
- **Input Validation**: All inputs are sanitized and validated
- **Error Handling**: Graceful failure handling
- **Demo Mode**: Works without Firebase configuration
- **Data Privacy**: User data is handled securely

## 🎨 Design System

### Color Scheme
- **Safe/Success**: Green (#10B981)
- **Moderate/Warning**: Orange (#F59E0B) 
- **Danger/Error**: Red (#EF4444)
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)

## 📱 Demo Data

The app includes demo data for testing:
- `fraud@paytm` - High risk UPI ID
- `scammer@phonepe` - Medium risk UPI ID
- `9876543210` - Reported phone number
- Various sample fraud reports

## 🚧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Technology Stack
- **Frontend**: React 19, Vite
- **Styling**: CSS3, Flexbox, Grid
- **Icons**: Lucide React
- **QR Scanning**: html5-qrcode
- **Backend**: Firebase (optional)

## 📞 Emergency Contacts

The app provides quick access to:
- **Cyber Crime Helpline**: 1930
- **Banking Fraud Helpline**: 1800-425-3800
- **RBI Complaints**: 14440
- **National Cybercrime Portal**: cybercrime.gov.in

## ⚠️ Disclaimer

This app is for educational and awareness purposes. Always verify payment details independently and report actual fraud to appropriate authorities.

---

**Stay Safe, Stay Informed! 🛡️**

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
