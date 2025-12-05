# TaskMaster

A professional, production-ready task management platform designed for teams and individuals to efficiently manage projects, tasks, and collaborate in real-time. TaskMaster features enterprise-level architecture, robust security, and a modern, responsive user interface.

## 🚀 Features

### Core Functionality
- **Task Management**: Create, update, and organize tasks with status tracking (Todo, In Progress, In Review, Done)
- **Kanban Board**: Visual drag-and-drop interface for intuitive task management
- **Project Management**: Organize tasks by projects with custom colors and descriptions
- **Real-time Collaboration**: WebSocket-based real-time updates for comments and notifications
- **Advanced Filtering**: Filter tasks by status, priority, assignee, tags, or project
- **Search**: Universal search across tasks and projects
- **Analytics & Insights**: Comprehensive dashboards with charts and statistics
- **User Management**: Role-based access control (Admin/User) with profile management
- **Notifications**: Real-time notifications with customizable preferences
- **Comments System**: Collaborative commenting with user mentions

### Technical Highlights
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Email Password Reset**: Email-based password reset with secure token links (expires in 1 hour) - requires SMTP configuration
- **Dark/Light Theme**: User preference-based theme switching
- **Responsive Design**: Mobile-first design that works on all devices
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: Protection against abuse

## 📁 Project Structure

This project is organized into three main components:

```
TaskMaster/
├── frontend/          # React + TypeScript + Vite frontend application
├── backend/           # NestJS + TypeScript backend API
└── documentation/     # Comprehensive project documentation
```

### Frontend
The frontend is a modern React application built with:
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Socket.io Client** for real-time features
- **ApexCharts** for data visualization

See [`frontend/README.md`](./frontend/README.md) for frontend-specific setup instructions.

### Backend
The backend is a robust NestJS API featuring:
- **NestJS** framework with TypeScript
- **PostgreSQL** database with TypeORM
- **JWT** authentication
- **Socket.io** for WebSocket support
- **Redis** caching (optional)
- **Nodemailer** for email services (password reset and notifications)
- **Swagger** API documentation

### Documentation
Comprehensive documentation is available in the [`documentation/`](./documentation/) folder:

- **[System Overview](./documentation/01-SYSTEM-OVERVIEW.md)**: Complete feature list and system architecture
- **[Architecture](./documentation/02-ARCHITECTURE.md)**: Detailed technical architecture
- **[Frontend Documentation](./documentation/03-FRONTEND-DOCUMENTATION.md)**: Frontend-specific guides
- **[Backend Documentation](./documentation/04-BACKEND-DOCUMENTATION.md)**: Backend API and services
- **[Setup & Installation](./documentation/05-SETUP-INSTALLATION.md)**: Detailed setup instructions
- **[Deployment](./documentation/06-DEPLOYMENT.md)**: Deployment guides
- **[API Documentation](./documentation/07-API-DOCUMENTATION.md)**: API endpoints reference
- **[Configuration](./documentation/08-CONFIGURATION.md)**: Configuration options
- **[Setup Checklist](./documentation/SETUP-CHECKLIST.md)**: Quick setup checklist

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+ (or Docker)
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
node setup-env.js

# Edit .env file with your database credentials and secrets
# Generate JWT secrets: node scripts/generate-secrets.js

# Create database
# psql -U postgres
# CREATE DATABASE taskmaster;

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

Backend will be available at `http://localhost:3000`
API documentation at `http://localhost:3000/api/docs`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file (if .env.example exists)
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Email Configuration (Optional)

For password reset functionality, configure SMTP settings in the backend `.env` file:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-email@gmail.com
```

> **Note**: Email configuration is optional. The application will run without it, but password reset functionality will not work. See [Setup & Installation](./documentation/05-SETUP-INSTALLATION.md#26-optional-configure-email-for-password-reset) for detailed email setup instructions.

### Docker Setup (Alternative)

```bash
# Start all services (PostgreSQL, Redis, Backend)
docker-compose up -d
```

## 🏗️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Socket.io Client
- ApexCharts
- React Hook Form + Zod

### Backend
- NestJS + TypeScript
- PostgreSQL + TypeORM
- JWT Authentication
- Socket.io
- Redis (optional)
- Nodemailer
- Swagger/OpenAPI

### Infrastructure
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Vercel (Frontend deployment)
- Railway/Render (Backend deployment)

## 📚 Documentation

For detailed information, please refer to the comprehensive documentation:

- **Getting Started**: See [Setup Checklist](./documentation/SETUP-CHECKLIST.md) for a quick start guide
- **Full Setup Guide**: See [Setup & Installation](./documentation/05-SETUP-INSTALLATION.md)
- **System Overview**: See [System Overview](./documentation/01-SYSTEM-OVERVIEW.md) for complete feature list
- **API Reference**: See [API Documentation](./documentation/07-API-DOCUMENTATION.md) or visit `/api/docs` when backend is running
- **Deployment**: See [Deployment Guide](./documentation/06-DEPLOYMENT.md)

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection protection
- XSS prevention with Helmet
- Secure headers and environment-based secrets

## 📝 License

This project is private and unlicensed.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the project maintainers.

Email: giftjtech@gmail.com
Phone: (+265) 888347480

---

**Built with ❤️ for Outple using modern web technologies**
