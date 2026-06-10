# 🎯 Udaan - Credit Scoring & Lending Platform

A modern, AI-powered credit scoring and lending platform with explainable AI, fraud detection, and psychometric analysis. Built with Next.js frontend and Python backend.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- **Credit Scoring Engine** - Advanced credit assessment with multiple scoring models
- **Explainability Panel** - AI-powered explanations for credit decisions
- **Fraud Detection** - Real-time fraud intelligence and risk assessment
- **Psychometric Analysis** - Behavioral analysis through interactive modal
- **Consent Management** - Secure data consent and vault system
- **Nano Loan Ladder** - Progressive micro-lending feature
- **Journey Tracking** - User progress and application flow

### Admin Features
- **Dashboard** - Real-time metrics and insights
- **Simulator** - Test scoring models with different scenarios
- **Data Management** - Borrower and lender profiles
- **Feature Engineering** - Custom feature generation

## 🛠 Tech Stack

### Frontend
- **Next.js 14+** - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **React Components** - Reusable UI components

### Backend
- **Python 3.x** - Core backend language
- **FastAPI** - Web framework for API routes
- **Prototype scoring** - Rule-based credit scoring and fraud logic
- **In-memory persistence** - Demo data stored in memory for hackathon prototype

### DevOps
- **Render** - Cloud deployment (via render.yaml)
- **Git** - Version control

## 📁 Project Structure

```
uddanscore/
├── Udaan/                          # Frontend (Next.js)
│   ├── app/                        # Next.js app directory
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── dashboard/              # Dashboard page
│   │   ├── consent/                # Consent management
│   │   ├── journey/                # User journey
│   │   └── simulator/              # Simulator tool
│   ├── components/                 # React components
│   │   ├── Navbar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ScoreGauge.tsx
│   │   ├── ExplainabilityPanel.tsx
│   │   ├── FraudIntelCard.tsx
│   │   ├── PsychometricModal.tsx
│   │   └── ...
│   ├── lib/
│   │   └── api.ts                  # API client
│   ├── public/                     # Static assets
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── udaanscore - backend/           # Backend (Python)
    ├── main.py                     # Entry point
    ├── routes/                     # API routes
    │   ├── borrowers.py
    │   ├── lenders.py
    │   ├── score.py                # Credit scoring
    │   ├── fraud.py                # Fraud detection
    │   ├── explainability.py       # XAI features
    │   └── ...
    ├── services/                   # Business logic
    │   ├── score_engine.py
    │   ├── fraud_detection.py
    │   ├── explainability.py
    │   ├── consent_vault.py
    │   ├── simulator.py
    │   └── ...
    ├── models/                     # Data models
    │   └── borrower.py
    ├── requirements.txt
    └── render.yaml                 # Deployment config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- npm or yarn

### Frontend Setup

```bash
cd Udaan
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup

```bash
cd "udaanscore - backend"
pip install -r requirements.txt
python main.py
```

Backend typically runs on `http://localhost:5000`

## 💻 Development

### Frontend Development

```bash
cd Udaan

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Backend Development

```bash
cd "udaanscore - backend"

# Install dependencies
pip install -r requirements.txt

# Run development server
python main.py

# Install a new package
pip install <package-name>
pip freeze > requirements.txt
```

## 📚 API Documentation

### Backend Routes

#### Borrowers
- `GET /borrowers/` - List all borrowers
- `GET /borrowers/{name}` - Get borrower profile by name
- `POST /borrowers/repay-loan` - Record a loan repayment and boost borrower score

#### Scoring
- `POST /score/calculate` - Calculate a Trust Score from input signals

#### Features
- `GET /features/nano-ladder/{borrower_name}` - Get nano loan ladder status for a borrower
- `GET /features/credit-builder/{borrower_name}` - Get credit builder journey tasks
- `POST /features/simulate-score` - Simulate score impact from action changes

#### Consent Vault
- `GET /vault/consent/{borrower_name}` - View borrower consent status
- `POST /vault/consent/update` - Update consent permissions for a borrower
- `DELETE /vault/consent/revoke/{borrower_name}` - Revoke all borrower consent

#### Explainability
- `GET /vault/explain/{borrower_name}` - Explain borrower score details

#### Fraud Detection
- `GET /vault/fraud-check/{borrower_name}` - Run fraud detection for a borrower

#### Lender Reports
- `GET /lender/report/{borrower_name}` - Get lender-facing borrower report
- `GET /lender/eligible-borrowers?min_score=<value>` - Filter eligible borrowers by score threshold

#### Demo
- `GET /demo/raju-story` - Get the hackathon demo story for the sample borrower
- `GET /demo/all-endpoints` - Get a live list of all backend endpoints

## 🌐 Deployment

### Frontend (Vercel/Render)

```bash
# Build
npm run build

# Deploy to Vercel
vercel

# Or use Render.yaml for integrated deployment
```

### Backend (Render)

The project includes `render.yaml` for easy Render deployment:

```bash
# Deploy via Render dashboard or CLI
# Set environment variables:
# - DATABASE_URL
# - API_KEY
# - etc.
```

See [Render Documentation](https://render.com/docs)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for financial inclusion**
