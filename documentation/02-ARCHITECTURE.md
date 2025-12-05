# System Architecture

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── comments/       # Comment-related components
│   ├── dashboard/     # Dashboard layout components
│   ├── layout/         # Header, Sidebar layout components
│   ├── notifications/  # Notification components
│   ├── tags/           # Tag input/display components
│   ├── tasks/          # Task-related components
│   └── ui/             # Base UI components (Button, Input, etc.)
├── context/            # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   ├── ThemeContext.tsx     # Theme management
│   └── WebSocketContext.tsx # WebSocket connection
├── hooks/              # Custom React hooks
│   ├── auth/           # Authentication hooks
│   └── [various].ts   # Domain-specific hooks
├── pages/              # Page components (routes)
│   ├── Dashboard.tsx
│   ├── Tasks.tsx
│   ├── Projects.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   └── [auth pages]
├── routes/             # Routing configuration
│   ├── AppRoutes.tsx
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
├── services/           # API service layer
│   ├── api.ts          # Axios instance configuration
│   ├── auth.service.ts
│   ├── task.service.ts
│   ├── project.service.ts
│   └── [other services]
├── store/              # Redux store
│   ├── index.ts
│   ├── authSlice.ts
│   ├── taskSlice.ts
│   └── [other slices]
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

### Component Architecture

#### Component Hierarchy

```
App
├── ThemeContextProvider
│   ├── AuthContextProvider
│   │   ├── WebSocketContextProvider
│   │   │   └── AppRoutes
│   │   │       ├── PublicRoute (Login, Register, etc.)
│   │   │       └── ProtectedRoute
│   │   │           └── DashboardLayout
│   │   │               ├── Sidebar
│   │   │               ├── Header
│   │   │               └── [Page Components]
```

#### State Management

- **React Context**: Authentication, theme, WebSocket
- **Redux Toolkit**: Global application state (tasks, projects, UI)
- **Local State**: Component-specific state with useState

### Frontend Patterns

1. **Service Layer Pattern**: All API calls abstracted into service files
2. **Custom Hooks**: Reusable logic extracted into hooks
3. **Component Composition**: Small, focused components
4. **Error Boundaries**: Graceful error handling
5. **Route Protection**: Protected and public route wrappers

## Backend Architecture

### Directory Structure

```
backend/src/
├── analytics/          # Analytics module
├── auth/               # Authentication module
│   ├── decorators/     # Custom decorators
│   ├── dto/            # Data Transfer Objects
│   ├── guards/         # Route guards
│   └── strategies/     # Passport strategies
├── cache/              # Caching module
├── comments/           # Comments module
├── common/              # Shared utilities
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/             # Configuration files
├── database/            # Database configuration
│   └── migrations/     # Database migrations
├── email/              # Email service (password reset, notifications)
├── notifications/       # Notifications module
├── projects/           # Projects module
├── tags/               # Tags module
├── tasks/              # Tasks module
└── users/              # Users module
```

### Module Structure

Each feature module follows NestJS conventions:

```
module-name/
├── module-name.controller.ts  # HTTP endpoints
├── module-name.service.ts     # Business logic
├── module-name.module.ts      # Module definition
├── dto/                       # Data Transfer Objects
│   ├── create-module.dto.ts
│   └── update-module.dto.ts
└── entities/                  # TypeORM entities
    └── module.entity.ts
```

### Backend Patterns

1. **Module Pattern**: Feature-based modules with clear boundaries
2. **Service Layer**: Business logic separated from controllers
3. **DTO Pattern**: Data validation and transformation
4. **Repository Pattern**: TypeORM repositories for data access
5. **Guard Pattern**: Route protection and authorization
6. **Interceptor Pattern**: Request/response transformation
7. **Filter Pattern**: Exception handling

## Database Architecture

### Entity Relationships

```
User (1) ──< (N) Task
User (1) ──< (N) Project
User (1) ──< (N) Comment
Project (1) ──< (N) Task
Task (1) ──< (N) Comment
Task (N) >──< (N) Tag
```

### Database Schema

#### Users Table
- `id`: Primary key (UUID)
- `email`: Unique email address
- `password`: Hashed password
- `firstName`, `lastName`: User information
- `role`: User role (admin, user)
- `refreshToken`: JWT refresh token
- `resetToken`, `resetTokenExpiry`: Password reset tokens
- `notificationPreferences`: JSON preferences
- `createdAt`, `updatedAt`: Timestamps

#### Tasks Table
- `id`: Primary key (UUID)
- `title`, `description`: Task details
- `status`: Task status (todo, in_progress, in_review, done)
- `priority`: Priority level (low, medium, high, urgent)
- `dueDate`: Due date
- `assigneeId`: Foreign key to User
- `projectId`: Foreign key to Project
- `createdAt`, `updatedAt`: Timestamps

#### Projects Table
- `id`: Primary key (UUID)
- `name`, `description`: Project details
- `color`: Project color identifier
- `ownerId`: Foreign key to User
- `createdAt`, `updatedAt`: Timestamps

#### Comments Table
- `id`: Primary key (UUID)
- `content`: Comment text
- `taskId`: Foreign key to Task
- `userId`: Foreign key to User
- `createdAt`, `updatedAt`: Timestamps

#### Tags Table
- `id`: Primary key (UUID)
- `name`: Tag name (unique)
- `color`: Tag color
- `createdAt`, `updatedAt`: Timestamps

#### Notifications Table
- `id`: Primary key (UUID)
- `userId`: Foreign key to User
- `type`: Notification type
- `message`: Notification message
- `read`: Boolean flag
- `createdAt`: Timestamp

## API Architecture

### RESTful Endpoints

All API endpoints follow REST conventions:

- `GET /api/resource` - List resources
- `GET /api/resource/:id` - Get single resource
- `POST /api/resource` - Create resource
- `PUT /api/resource/:id` - Update resource
- `PATCH /api/resource/:id` - Partial update
- `DELETE /api/resource/:id` - Delete resource

### WebSocket Events

Real-time events for collaborative features:

- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `comment:created` - New comment added
- `notification:new` - New notification

## Security Architecture

### Authentication Flow

1. User submits credentials
2. Backend validates credentials
3. JWT access token and refresh token generated
4. Access token returned in response
5. Refresh token stored in httpOnly cookie
6. Client stores access token in memory
7. Subsequent requests include access token in header

### Password Reset Flow

1. User requests password reset via `/auth/forgot-password` with email
2. Backend generates secure JWT reset token (expires in 1 hour)
3. Reset token stored in user record with expiration timestamp
4. Email service sends password reset email with secure link
5. User clicks link in email → Frontend `/reset-password?token=...`
6. User submits new password with token
7. Backend validates token and expiration
8. Password is hashed and updated
9. Reset token is cleared from user record
10. User can now login with new password

**Note**: Email service (SMTP) must be configured for password reset to work. Without SMTP configuration, password reset requests will fail silently.

### Authorization

- **Role-based Access Control (RBAC)**: Admin and User roles
- **Resource-based Authorization**: Users can only access their own resources
- **Route Guards**: Protect endpoints based on authentication and roles

### Data Validation

- **DTO Validation**: Class-validator decorators
- **Type Safety**: TypeScript compile-time checks
- **Input Sanitization**: Automatic by NestJS ValidationPipe

## Caching Architecture

### Cache Strategy

- **Redis Cache**: Primary caching layer (optional)
- **In-Memory Fallback**: Automatic fallback if Redis unavailable
- **Cache Keys**: Structured key naming (`cache:resource:id`)
- **TTL Management**: Configurable time-to-live

### Cache Usage

- Task lists and details
- Project lists
- User data
- Analytics data
- Frequently accessed queries

## Error Handling

### Frontend Error Handling

- **Error Boundaries**: Catch React component errors
- **Service Layer Errors**: Centralized error handling in services
- **Toast Notifications**: User-friendly error messages
- **Network Error Handling**: Retry logic and fallbacks

### Backend Error Handling

- **Exception Filters**: Global and specific exception handlers
- **HTTP Exceptions**: Standardized error responses
- **Validation Errors**: Detailed validation error messages
- **Logging**: Comprehensive error logging

## Deployment Architecture

### Development Environment

- Frontend: Vite dev server (port 5173)
- Backend: NestJS dev server (port 3000)
- Database: PostgreSQL (port 5432)
- Cache: Redis (port 6379) or in-memory

### Production Environment

- Frontend: Static files served via CDN (Vercel)
- Backend: Node.js process (Railway/Render)
- Database: Managed PostgreSQL
- Cache: Managed Redis (optional)

