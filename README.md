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
- [Property Listings API Integration](#-property-listings-api-integration)

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
- Deployment to Azure Static Web Apps

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

## Property Listings API Integration

The application now integrates with the Property Listings API to display real property data. The integration includes:

### API Configuration
- Environment variables for API endpoints in `.env`
- TypeScript interfaces for property data structures

### Core Features
- Fetching and displaying property listings
- Filtering properties by various criteria
- Viewing detailed property information
- Support for property creation, updating, and deletion

### Implementation Details
- `PropertyService`: Service for handling API calls to property endpoints
- Updated components to use real data from the API
- Fallback to mock data when API is unavailable
- Loading states and error handling

### Usage
To use the property listings API:

1. Ensure the API is running at the URL specified in `.env` (default: http://localhost:8000)
2. The frontend will automatically connect to the API endpoints
3. Property listings will be displayed on the listings page
4. Property details can be viewed by clicking on a property

### API Endpoints
The following endpoints are used:

- `GET /api/properties`: Get all properties with optional filters
- `GET /api/properties/{id}`: Get details of a specific property
- `GET /api/properties/user/{user_id}`: Get all properties for a specific user
- `POST /api/properties`: Create a new property listing
- `PUT /api/properties/{id}`: Update an existing property
- `DELETE /api/properties/{id}`: Delete a property

