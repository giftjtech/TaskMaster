# API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-backend-url.com/api`

## Authentication

All protected endpoints require a JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success message",
  "statusCode": 200
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Authentication Endpoints

### Register

**POST** `/auth/register`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response: `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "accessToken": "jwt_token"
}
```

### Login

**POST** `/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "accessToken": "jwt_token"
}
```

### Refresh Token

**POST** `/auth/refresh`

Response: `200 OK`
```json
{
  "accessToken": "new_jwt_token"
}
```

### Logout

**POST** `/auth/logout`

Response: `200 OK`

### Forgot Password

**POST** `/auth/forgot-password`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response: `200 OK`

### Reset Password

**POST** `/auth/reset-password`

Request body:
```json
{
  "token": "reset_token",
  "password": "new_password123"
}
```

Response: `200 OK`

## User Endpoints

### Get All Users (Admin Only)

**GET** `/users`

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response: `200 OK`

### Get User by ID

**GET** `/users/:id`

Response: `200 OK`

### Create User (Admin Only)

**POST** `/users`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

Response: `201 Created`

### Update User

**PUT** `/users/:id`

Request body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com"
}
```

Response: `200 OK`

### Delete User (Admin Only)

**DELETE** `/users/:id`

Response: `200 OK`

### Update Notification Preferences

**PUT** `/users/:id/notifications`

Request body:
```json
{
  "emailNotifications": true,
  "taskAssignments": true,
  "taskUpdates": false,
  "projectUpdates": true,
  "comments": false
}
```

Response: `200 OK`

## Task Endpoints

### Get All Tasks

**GET** `/tasks`

Query parameters:
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status (todo, in_progress, in_review, done)
- `priority`: Filter by priority (low, medium, high, urgent)
- `assigneeId`: Filter by assignee
- `projectId`: Filter by project
- `search`: Search in title and description

Response: `200 OK`

### Get Task by ID

**GET** `/tasks/:id`

Response: `200 OK`

### Create Task

**POST** `/tasks`

Request body:
```json
{
  "title": "Task title",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2024-12-31",
  "assigneeId": "user_uuid",
  "projectId": "project_uuid"
}
```

Response: `201 Created`

### Update Task

**PUT** `/tasks/:id`

Request body:
```json
{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "high"
}
```

Response: `200 OK`

### Delete Task

**DELETE** `/tasks/:id`

Response: `200 OK`

## Project Endpoints

### Get All Projects

**GET** `/projects`

Query parameters:
- `page`: Page number
- `limit`: Items per page

Response: `200 OK`

### Get Project by ID

**GET** `/projects/:id`

Response: `200 OK`

### Create Project

**POST** `/projects`

Request body:
```json
{
  "name": "Project name",
  "description": "Project description",
  "color": "#ec4899"
}
```

Response: `201 Created`

### Update Project

**PUT** `/projects/:id`

Request body:
```json
{
  "name": "Updated name",
  "description": "Updated description"
}
```

Response: `200 OK`

### Delete Project

**DELETE** `/projects/:id`

Response: `200 OK`

## Comment Endpoints

### Get Comments for Task

**GET** `/comments/task/:taskId`

Response: `200 OK`

### Create Comment

**POST** `/comments`

Request body:
```json
{
  "content": "Comment text",
  "taskId": "task_uuid"
}
```

Response: `201 Created`

### Update Comment

**PUT** `/comments/:id`

Request body:
```json
{
  "content": "Updated comment"
}
```

Response: `200 OK`

### Delete Comment

**DELETE** `/comments/:id`

Response: `200 OK`

## Notification Endpoints

### Get Notifications

**GET** `/notifications`

Query parameters:
- `page`: Page number
- `limit`: Items per page
- `read`: Filter by read status (true/false)

Response: `200 OK`

### Mark Notification as Read

**PUT** `/notifications/:id/read`

Response: `200 OK`

### Delete Notification

**DELETE** `/notifications/:id`

Response: `200 OK`

## Analytics Endpoints

### Get Task Statistics

**GET** `/analytics/stats`

Response: `200 OK`
```json
{
  "data": {
    "total": 100,
    "todo": 20,
    "inProgress": 30,
    "inReview": 10,
    "done": 40,
    "overdue": 5
  }
}
```

### Get Tasks by Priority

**GET** `/analytics/priority`

Response: `200 OK`
```json
{
  "data": {
    "low": 25,
    "medium": 40,
    "high": 25,
    "urgent": 10
  }
}
```

## WebSocket Events

### Connection

Connect to WebSocket server:
```
ws://localhost:3000 (development)
wss://your-backend-url.com (production)
```

### Events

#### Client → Server

- `join:room` - Join a room (e.g., `task:taskId`)

#### Server → Client

- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `comment:created` - New comment added
- `notification:new` - New notification

### Event Payloads

**task:created**
```json
{
  "task": {
    "id": "uuid",
    "title": "Task title",
    ...
  }
}
```

**notification:new**
```json
{
  "notification": {
    "id": "uuid",
    "type": "task_assigned",
    "message": "You have been assigned a task",
    ...
  }
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- Rate limit headers included in response:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Interactive API Documentation

In development, Swagger UI is available at:
```
http://localhost:3000/api/docs
```

This provides:
- Interactive API testing
- Request/response schemas
- Authentication testing
- Example requests

