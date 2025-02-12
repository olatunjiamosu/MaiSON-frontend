# 🏡 MaiSON Property Platform

MaiSON is an AI-powered property marketplace designed to connect buyers and sellers directly, optimizing the real estate process.

## 📋 Table of Contents
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Development](#-development)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME.git
cd REPO_NAME

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

## 🏗 Project Structure
```
src/
├── pages/               # All page components
│   ├── LandingPage.tsx
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard components
│   └── property/       # Property-related pages
├── components/         # Reusable UI components
│   ├── layout/        # Layout components
│   ├── property/      # Property components
│   └── chat/          # Chat components
├── routes/            # Routing configuration
├── config/           # App configuration
├── hooks/            # Custom React hooks
├── services/         # API services
├── utils/            # Helper functions
├── types/            # TypeScript types
└── assets/           # Static assets
```

## 📜 Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🛠 Development

### Environment Variables
Required environment variables:
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
```

### Features
- 🔐 Authentication & Authorization
- 🏠 Property Listings
- 💬 Real-time Chat
- 🗺 Interactive Maps
- 📊 Property Analytics
- 📱 Responsive Design

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t maison-frontend .

# Run container
docker run -p 80:80 maison-frontend
```

### CI/CD Pipeline
- Automated testing
- Docker image building
- Deployment to Azure Container Apps

## 🧪 Testing
- Unit tests with Jest
- Component testing with React Testing Library
- Integration tests
- E2E tests (coming soon)

## 👥 Contributing

1. Fork the repository
2. Create your feature branch
```bash
git checkout -b feature/amazing-feature
```
3. Commit your changes
```bash
git commit -m 'Add amazing feature'
```
4. Push to the branch
```bash
git push origin feature/amazing-feature
```
5. Open a Pull Request

## ❓ Troubleshooting

### Common Issues
- Port conflicts: Use `npm run dev -- --port 3000`
- Node modules issues: 
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 License
This project is licensed under the MIT License.

---

Built with ❤️ by the MaiSON team

