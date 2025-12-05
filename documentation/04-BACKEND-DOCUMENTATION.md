# Backend Documentation

## Overview

The backend is built with NestJS, a progressive Node.js framework that provides a scalable, maintainable architecture. It follows enterprise-level patterns with dependency injection, modular design, and comprehensive security features.

## Technology Stack

- **NestJS 10.3.0**: Framework
- **TypeScript 5.3.3**: Type safety
- **PostgreSQL**: Relational database
- **TypeORM 0.3.17**: ORM
- **JWT**: Authentication
- **Socket.io 4.7.2**: WebSocket server
- **Redis (ioredis 5.8.2)**: Caching (optional)
- **Nodemailer 7.0.11**: Email service
- **Helmet 8.1.0**: Security headers
- **Swagger 7.1.17**: API documentation

## Project Structure

### Modules

#### Core Modules

**AppModule** (`app.module.ts`)
- Root module that imports all feature modules
- Global configuration
- Guards and interceptors

**DatabaseModule** (`database/database.module.ts`)
- Database connection configuration
- TypeORM setup
- Migration management

**CacheModule** (`cache/cache.module.ts`)
- Redis caching configuration
- In-memory fallback
- Cache service

#### Feature Modules

**AuthModule** (`auth/`)
- Authentication and authorization
- JWT token generation and validation
- Password hashing and validation
- Login, register, password reset

**UsersModule** (`users/`)
- User CRUD operations
- User management
- Profile updates
- Notification preferences

**TasksModule** (`tasks/`)
- Task CRUD operations
- Task filtering and search
- Task assignment
- Status management

**ProjectsModule** (`projects/`)
- Project CRUD operations
- Project ownership
- Project tasks

**CommentsModule** (`comments/`)
- Comment CRUD operations
- Task comments
- Comment notifications

**NotificationsModule** (`notifications/`)
- Notification management (create, read, update, delete)
- WebSocket gateway for real-time delivery
- Real-time notifications via Socket.io
- Unread notification tracking
- Mark all as read functionality
- Notification types: task assignments, task updates, comments, project updates

**TagsModule** (`tags/`)
- Tag management (CRUD operations)
- Auto-creation of tags with color assignment
- Tag retrieval by IDs
- Task tagging functionality

**AnalyticsModule** (`analytics/`)
- Task statistics (total, by status, overdue)
- Priority distribution (Low, Medium, High, Urgent)
- Task completion rate tracking
- Project statistics
- Recent activity feed

**EmailModule** (`email/`)
- Email service
- Password reset emails
- Notification emails

### Module Structure

Each module follows NestJS conventions:

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

## Controllers

Controllers handle HTTP requests and responses:

### AuthController
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### UsersController
- `GET /api/users` - List users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id/notifications` - Update notification preferences

### TasksController
- `GET /api/tasks` - List tasks with filters
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### ProjectsController
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### CommentsController
- `GET /api/comments/task/:taskId` - Get comments for task
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### NotificationsController
- `GET /api/notifications` - Get all notifications for current user
- `GET /api/notifications/unread` - Get unread notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### AnalyticsController
- `GET /api/analytics/task-stats` - Get task statistics (total, by status, overdue)
- `GET /api/analytics/completion-rate` - Get task completion rate (with optional days parameter)
- `GET /api/analytics/tasks-by-priority` - Get tasks grouped by priority
- `GET /api/analytics/project-stats` - Get project statistics
- `GET /api/analytics/recent-activity` - Get recent activity (with optional limit parameter)

### TagsController
- `GET /api/tags` - Get all tags

### AnalyticsController
- `GET /api/analytics/stats` - Get task statistics
- `GET /api/analytics/priority` - Get priority distribution

## Services

Services contain business logic:

### AuthService
- User authentication
- JWT token generation
- Password hashing and validation
- Token refresh
- Password reset

### UsersService
- User CRUD operations
- User profile management
- Notification preferences
- User role management

### TasksService
- Task CRUD operations
- Task filtering and search
- Task assignment
- Status transitions

### ProjectsService
- Project CRUD operations
- Project ownership management
- Project task relationships

### CommentsService
- Comment CRUD operations
- Comment notifications

### NotificationsService
- Notification creation
- Notification management
- WebSocket event emission

### CacheService
- Redis caching operations
- Cache key management
- TTL management
- Cache invalidation

### EmailService
- Email sending
- Password reset emails
- Notification emails

## Entities

TypeORM entities represent database tables:

### User Entity
- `id`: UUID primary key
- `email`: Unique email
- `password`: Hashed password
- `firstName`, `lastName`: User name
- `role`: User role (admin, user)
- `refreshToken`: JWT refresh token
- `resetToken`, `resetTokenExpiry`: Password reset
- `notificationPreferences`: JSON preferences
- Relationships: tasks, projects, comments

### Task Entity
- `id`: UUID primary key
- `title`, `description`: Task details
- `status`: Task status enum
- `priority`: Priority enum
- `dueDate`: Optional due date
- `assigneeId`: Foreign key to User
- `projectId`: Foreign key to Project
- Relationships: assignee, project, comments, tags

### Project Entity
- `id`: UUID primary key
- `name`, `description`: Project details
- `color`: Project color
- `ownerId`: Foreign key to User
- Relationships: owner, tasks

### Comment Entity
- `id`: UUID primary key
- `content`: Comment text
- `taskId`: Foreign key to Task
- `userId`: Foreign key to User
- Relationships: task, user

### Tag Entity
- `id`: UUID primary key
- `name`: Unique tag name
- `color`: Tag color
- Many-to-many relationship with tasks

### Notification Entity
- `id`: UUID primary key
- `userId`: Foreign key to User
- `type`: Notification type
- `message`: Notification message
- `read`: Boolean flag
- Relationship: user

## Data Transfer Objects (DTOs)

DTOs validate and transform incoming data:

### Auth DTOs
- `RegisterDto`: User registration
- `LoginDto`: User login
- `RefreshTokenDto`: Token refresh
- `ForgotPasswordDto`: Password reset request
- `ResetPasswordDto`: Password reset

### Task DTOs
- `CreateTaskDto`: Task creation
- `UpdateTaskDto`: Task update
- `FilterTaskDto`: Task filtering

### Project DTOs
- `CreateProjectDto`: Project creation
- `UpdateProjectDto`: Project update

### Comment DTOs
- `CreateCommentDto`: Comment creation
- `UpdateCommentDto`: Comment update

### User DTOs
- `CreateUserDto`: User creation (admin)
- `UpdateUserDto`: User update

## Guards

### JwtAuthGuard
- Validates JWT access tokens
- Extracts user from token
- Attaches user to request

### RolesGuard
- Role-based authorization
- Checks user roles
- Protects admin endpoints

### LocalAuthGuard
- Validates local credentials
- Used for login endpoint

### ThrottlerGuard
- Rate limiting
- Prevents abuse
- Configurable limits

## Interceptors

### TransformInterceptor
- Transforms response data
- Standardizes response format
- Adds metadata

### LoggingInterceptor
- Request/response logging
- Performance monitoring
- Error tracking

## Filters

### HttpExceptionFilter
- Global exception handler
- Standardized error responses
- Error logging

### AllExceptionsFilter
- Catches all exceptions
- Fallback error handling

## Pipes

### ValidationPipe
- Global validation
- DTO validation
- Error transformation

## WebSocket Gateway

### NotificationsGateway
- Real-time event emission
- Client connection management
- Room-based messaging

### Events
- `task:created`
- `task:updated`
- `task:deleted`
- `comment:created`
- `notification:new`

## Database

### Migrations

TypeORM migrations manage database schema:

**Initial Migration**: `1735000000000-InitialSchema.ts`
- Creates complete database schema from scratch
- Includes all tables: users, projects, tasks, tags, comments, notifications
- Sets up foreign key relationships and indexes
- Includes password reset functionality (resetToken, resetTokenExpires fields in users table)

**Migration Commands**:
- `npm run migration:run` - Apply all pending migrations
- `npm run migration:revert` - Revert the last migration
- `npm run migration:generate -- -n MigrationName` - Generate new migration for schema changes

### Seeding

**Seed Users Script** (`seed-users.ts`):
- Creates both admin and regular user accounts
- Requires: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `USER_EMAIL`, `USER_PASSWORD`
- Command: `npm run seed:users`

**Seed Admin Script** (`seed-admin.ts`):
- Creates only admin user account
- Requires: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Command: `npm run seed:admin`

Both scripts:
- Hash passwords using bcrypt (10 rounds)
- Set users as active and email verified
- Skip creation if users already exist
- Update role if user exists with different role

## Configuration

### Environment Variables

See `env.template` for all required variables:
- Database configuration
- JWT secrets
- Email configuration
- Redis configuration
- CORS settings

### Config Files

- `config/app.config.ts`: Application configuration
- `config/database.config.ts`: Database configuration
- `config/jwt.config.ts`: JWT configuration with validation

## Security

### Authentication
- JWT access tokens (short-lived)
- JWT refresh tokens (long-lived)
- Token rotation on refresh
- Secure token storage

### Authorization
- Role-based access control
- Resource-based authorization
- Route guards

### Data Protection
- Password hashing (bcrypt)
- Input validation
- SQL injection prevention (TypeORM)
- XSS prevention (Helmet)

### Security Headers
- Helmet middleware
- CORS configuration
- Content Security Policy
- Rate limiting

## Caching

### Redis Integration
- Optional Redis caching
- Automatic fallback to in-memory
- Cache key strategies
- TTL management

### Cache Usage
- Task lists
- Project lists
- User data
- Analytics data

## API Documentation

### Swagger/OpenAPI

Available at `/api/docs` in development:
- Interactive API documentation
- Request/response schemas
- Authentication testing
- Endpoint testing

## Testing

### Test Setup
- Jest test framework
- E2E testing support
- Test coverage reporting

### Test Scripts
- `npm test`: Unit tests
- `npm run test:watch`: Watch mode
- `npm run test:cov`: Coverage report
- `npm run test:e2e`: E2E tests

## Scripts

### Development
- `npm run start:dev`: Development server with watch
- `npm run start:debug`: Debug mode

### Production
- `npm run build`: Build for production
- `npm run start:prod`: Production server

### Database
- `npm run migration:generate`: Generate migration
- `npm run migration:run`: Run migrations
- `npm run migration:revert`: Revert migration
- `npm run seed:users`: Seed both admin and regular user
- `npm run seed:admin`: Seed admin user only

## Best Practices

1. **Modular Design**: Feature-based modules
2. **Dependency Injection**: NestJS DI container
3. **Type Safety**: TypeScript throughout
4. **Validation**: DTO validation
5. **Error Handling**: Comprehensive exception handling
6. **Security**: Multiple layers of security
7. **Testing**: Unit and E2E tests
8. **Documentation**: Swagger API docs

