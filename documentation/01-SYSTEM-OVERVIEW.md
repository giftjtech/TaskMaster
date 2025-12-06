# System Overview

## Introduction

TaskMaster is a professional, production-ready task management platform designed for teams and individuals to efficiently manage projects, tasks, and collaborate in real-time. The application features enterprise-level architecture, robust security, and a modern, responsive user interface.

## Key Features

### Core Functionality

#### Task Management
- **CRUD Operations**: Create, read, update, and delete tasks
- **Status Management**: Four statuses - Todo, In Progress, In Review, Done
- **Priority Levels**: Low, Medium, High, Urgent
- **Task Assignment**: Assign tasks to team members
- **Due Dates**: Set and track task due dates with overdue identification
- **Kanban Board**: Visual drag-and-drop interface for task status management
- **Advanced Filtering**: Filter by status, priority, assignee, tags, project, or search query
- **Search Functionality**: Search tasks by title, description, or tags
- **Task Details**: Comprehensive task details modal with all information
- **Tag System**: Create, assign, and filter tasks by tags (auto-created with color assignment)

#### Project Management
- **CRUD Operations**: Create, read, update, and delete projects
- **Custom Colors**: 8 color options (Pink, Purple, Blue, Green, Amber, Red, Violet, Cyan)
- **Project Descriptions**: Add detailed project descriptions
- **Project Ownership**: Assign project owners with permissions
- **Task Organization**: Organize tasks by project
- **Project Filtering**: Filter tasks by project
- **Project Search**: Search projects by name or description

#### Collaboration & Communication
- **Comments System**: Create, update, and delete comments on tasks
- **User Mentions**: Mention users in comments
- **Real-time Updates**: WebSocket-based real-time comment synchronization
- **Activity Tracking**: Track task and project activity history

#### Analytics & Insights
- **Task Statistics**: Total tasks, tasks by status, overdue tasks count
- **Priority Distribution**: Visual charts showing task distribution by priority
- **Completion Rate**: Track task completion rate over configurable time periods
- **30-Day Timeline**: Bar chart showing task completion activity over last 30 days
- **Project Statistics**: Total projects, projects with tasks, average tasks per project
- **Recent Activity**: Feed of last 10 recent activities with assignee and project information
- **User Achievements**: Achievement system with badges (Task Master, Speed Demon, Consistency King, Team Player)
- **Profile Metrics**: Personal task metrics, completion rates, and achievement tracking
- **Data Visualization**: ApexCharts integration for interactive charts

#### Notifications
- **Real-time Notifications**: WebSocket-based instant notification delivery
- **Notification Bell**: Visual indicator with unread count
- **Notification Management**: Mark as read, mark all as read, delete notifications
- **Notification Preferences**: Granular control over notification types (email, task assignments, task updates, project updates, comments)
- **Notification Types**: Task assignments, task updates, comments, project updates

#### Search & Discovery
- **Universal Search**: Search across both tasks and projects simultaneously
- **Real-time Results**: Search results update as you type (debounced)
- **Multi-field Search**: Search by title, description, tags, or project name
- **Quick Navigation**: Direct navigation to search results
- **Contextual Results**: Search results show relevant context (status, project name)

#### User Management
- **Role-based Access Control**: Admin and User roles with different permissions
- **Profile Management**: Update first name, last name, and email
- **Password Management**: Change password with current password verification
- **Admin Features**: Create, update, and delete users (admin only)
- **User List**: View all users in the system (admin only)
- **Role Assignment**: Assign admin or user roles to users

#### Settings & Preferences
- **Profile Settings**: Update personal information
- **Password Change**: Secure password change with verification
- **Theme Toggle**: Switch between dark and light mode (persisted in localStorage)
- **Notification Preferences**: Configure which notifications to receive
- **Admin Panel**: User management interface for administrators

### Technical Features
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Password Reset**: Email-based password reset functionality with secure token links (expires in 1 hour)
- **Email Service**: Nodemailer-based email service for password reset and notifications
- **Dark/Light Theme**: User preference-based theme switching
- **Responsive Design**: Mobile-first design that works on all devices
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: Protection against abuse with configurable rate limits

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Redux Toolkit**: State management
- **Socket.io Client**: Real-time WebSocket communication
- **ApexCharts**: Data visualization
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe development
- **PostgreSQL**: Relational database
- **TypeORM**: Object-Relational Mapping
- **JWT**: JSON Web Tokens for authentication
- **Socket.io**: WebSocket server for real-time features
- **Redis**: Caching layer (optional, falls back to in-memory)
- **Nodemailer**: Email service for notifications and password reset
- **Helmet**: Security headers
- **Swagger**: API documentation

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **GitHub Actions**: CI/CD pipeline
- **Vercel**: Frontend deployment platform
- **Railway/Render**: Backend deployment platforms

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React/Vite)  │
└────────┬────────┘
         │ HTTP/REST
         │ WebSocket
         ▼
┌─────────────────┐
│   Backend      │
│   (NestJS)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
    ▼        ▼
┌────────┐ ┌────────┐
│Postgres│ │ Redis  │
│   DB   │ │ Cache  │
└────────┘ └────────┘
```

### Request Flow

1. **Authentication Flow**:
   - User logs in → Backend validates credentials → JWT tokens issued
   - Access token stored in memory, refresh token in http Only cookie
   - Subsequent requests include access token in Authorization header

2. **Data Flow**:
   - Frontend makes API request → Backend validates token → Processes request
   - Response cached in Redis (if configured) → Returns to frontend
   - Real-time updates via WebSocket for collaborative features

3. **Real-time Flow**:
   - User action triggers event → Backend processes → Emits via WebSocket
   - Connected clients receive update → UI updates automatically

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: Throttling to prevent abuse
- **Input Validation**: Class-validator for all inputs
- **SQL Injection Protection**: TypeORM parameterized queries
- **XSS Prevention**: Helmet security headers
- **Secure Headers**: Content Security Policy, X-Frame-Options, etc.
- **Environment-based Secrets**: Production secret validation

## Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Caching**: Redis caching for frequently accessed data
- **Database Indexing**: Optimized queries with proper indexes
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Optimized asset delivery
- **Lazy Loading**: Components loaded on demand

## Scalability Considerations

- **Stateless Backend**: JWT tokens enable horizontal scaling
- **Database Connection Pooling**: Efficient database connections
- **Caching Layer**: Redis reduces database load
- **WebSocket Scaling**: Socket.io supports multiple server instances
- **CDN Ready**: Frontend assets can be served via CDN

