# Frontend Documentation

## Overview

The frontend is built with React 18, TypeScript, and Vite, providing a fast, type-safe, and maintainable codebase. The application follows modern React patterns with hooks, context API, and functional components.

## Technology Stack

- **React 18.2.0**: UI library
- **TypeScript 5.2.2**: Type safety
- **Vite 5.0.8**: Build tool and dev server
- **Tailwind CSS 3.3.6**: Styling
- **React Router 6.20.0**: Routing
- **Redux Toolkit 2.0.1**: State management
- **Socket.io Client 4.7.2**: WebSocket communication
- **ApexCharts 5.3.6**: Data visualization
- **React Hook Form 7.48.2**: Form handling
- **Zod 3.22.4**: Schema validation
- **Axios 1.6.2**: HTTP client

## Project Structure

### Pages

#### Authentication Pages
- **Login** (`pages/Login.tsx`): User login with email and password
- **Register** (`pages/Register.tsx`): New user registration
- **ForgotPassword** (`pages/ForgotPassword.tsx`): Password reset request
- **ResetPassword** (`pages/ResetPassword.tsx`): Password reset with token

#### Application Pages
- **Dashboard** (`pages/Dashboard.tsx`): 
  - Overview with comprehensive task statistics (total, by status, overdue)
  - Priority distribution charts (Low, Medium, High, Urgent)
  - Task completion rate tracking
  - 30-day activity timeline with bar charts
  - Recent tasks display
  - Project overview cards
  - Visual data visualization with ApexCharts

- **Tasks** (`pages/Tasks.tsx`): 
  - Task management with full CRUD operations
  - Kanban board view with drag-and-drop status updates
  - Advanced filtering: by status, priority, assignee, tags, project, search query
  - Task search by title, description, or tags
  - Task details modal with comments
  - Tag management (create, assign, filter)
  - Task assignment to team members
  - Due date management
  - Priority assignment

- **Projects** (`pages/Projects.tsx`): 
  - Project management with CRUD operations
  - 8 custom project color options
  - Project descriptions
  - Project search functionality
  - Project-based task filtering
  - Project ownership management

- **Profile** (`pages/Profile.tsx`): 
  - User profile with personal statistics
  - Task metrics: completed, in progress, overdue tasks
  - Completion rate calculation
  - Recent completed tasks
  - 30-day activity timeline chart
  - User achievements system (Task Master, Speed Demon, Consistency King, Team Player)
  - Visual charts and data visualization

- **Settings** (`pages/Settings.tsx`): 
  - Profile settings: update first name, last name, email
  - Password change with current password verification
  - Theme toggle: dark/light mode
  - Notification preferences: email notifications, task assignments, task updates, project updates, comments
  - Admin panel: user management (create, update, delete users) - admin only
  - User list view for administrators

- **NotFound** (`pages/NotFound.tsx`): 404 error page with navigation options

### Components

#### Layout Components
- **DashboardLayout** (`components/dashboard/DashboardLayout.tsx`): Main application layout wrapper with responsive design
- **Header** (`components/layout/Header.tsx`): 
  - Top navigation bar with universal search (tasks and projects)
  - Real-time search results as you type
  - User profile menu with logout
  - Theme toggle button
  - Notification bell with unread count
- **Sidebar** (`components/layout/Sidebar.tsx`): Side navigation with menu items and responsive mobile menu

#### Task Components
- **KanbanBoard** (`components/tasks/KanbanBoard.tsx`): Drag-and-drop Kanban board
- **TaskCard** (`components/tasks/TaskCard.tsx`): Individual task card display
- **TaskDetailsModal** (`components/tasks/TaskDetailsModal.tsx`): Task detail view modal

#### Comment Components
- **CommentList** (`components/comments/CommentList.tsx`): List of comments
- **CommentInput** (`components/comments/CommentInput.tsx`): Comment input form

#### Notification Components
- **NotificationBell** (`components/notifications/NotificationBell.tsx`): Notification icon with badge
- **NotificationDropdown** (`components/notifications/NotificationDropdown.tsx`): Notification dropdown menu
- **NotificationItem** (`components/notifications/NotificationItem.tsx`): Individual notification item

#### Tag Components
- **TagInput** (`components/tags/TagInput.tsx`): Tag input with autocomplete
- **TagDisplay** (`components/tags/TagDisplay.tsx`): Tag display component

#### UI Components
Base UI components in `components/ui/`:
- **Button**: Primary, secondary, and variant buttons
- **Input**: Text input with validation
- **Textarea**: Multi-line text input
- **Select**: Dropdown select
- **Dropdown**: Custom dropdown menu
- **Modal**: Modal dialog
- **Card**: Card container
- **Badge**: Status badges
- **Avatar**: User avatar
- **DatePicker**: Date selection
- **Checkbox**: Checkbox input
- **Radio**: Radio button
- **Switch**: Toggle switch
- **Tabs**: Tab navigation
- **Tooltip**: Tooltip component
- **Progress**: Progress bar
- **Loading**: Loading spinner
- **Skeleton**: Loading skeleton
- **Alert**: Alert message

### Services

All API communication is handled through service files:

- **api.ts**: Axios instance with interceptors
- **auth.service.ts**: Authentication operations
- **task.service.ts**: Task CRUD operations
- **project.service.ts**: Project CRUD operations
- **user.service.ts**: User management
- **comment.service.ts**: Comment operations
- **notification.service.ts**: Notification operations
- **tag.service.ts**: Tag operations
- **analytics.service.ts**: Analytics data
- **websocket.service.ts**: WebSocket connection management

### Context Providers

#### AuthContext
Manages authentication state:
- User information
- Login/logout functions
- Token management
- Authentication status

#### ThemeContext
Manages theme preferences:
- Light/dark theme
- Theme persistence
- Theme toggle function

#### WebSocketContext
Manages WebSocket connection:
- Connection status
- Real-time event handling
- Automatic reconnection

### Custom Hooks

- **useAuth**: Authentication hook (wrapper for AuthContext)
- **useTheme**: Theme management hook
- **useWebSocket**: WebSocket connection hook
- **useTasks**: Task data management
- **useProjects**: Project data management
- **useNotifications**: Notification management
- **useProfileData**: User profile data
- **useTaskMetrics**: Task statistics
- **useUserAchievements**: User achievement calculations
- **useDebounce**: Debounce utility hook
- **useClickOutside**: Click outside detection
- **useLocalStorage**: Local storage management
- **useMediaQuery**: Responsive breakpoints
- **useSessionCleanup**: Session cleanup on logout

### State Management

#### Redux Store

Slices:
- **authSlice**: Authentication state
- **taskSlice**: Task state
- **projectSlice**: Project state
- **uiSlice**: UI state (modals, sidebars, etc.)

### Routing

#### Route Configuration

- `/` → Redirects to `/login`
- `/login` → Login page (PublicRoute)
- `/register` → Register page (PublicRoute)
- `/forgot-password` → Forgot password (PublicRoute)
- `/reset-password` → Reset password (PublicRoute)
- `/dashboard` → Dashboard (ProtectedRoute)
- `/tasks` → Tasks page (ProtectedRoute)
- `/projects` → Projects page (ProtectedRoute)
- `/profile` → Profile page (ProtectedRoute)
- `/settings` → Settings page (ProtectedRoute)
- `/404` → Not found page
- `*` → Redirects to `/404`

#### Route Protection

- **ProtectedRoute**: Requires authentication, redirects to login if not authenticated
- **PublicRoute**: Redirects to dashboard if already authenticated

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling with:
- Custom color palette
- Dark mode support
- Responsive breakpoints
- Utility classes

### Theme System

- Light theme: Default theme with light colors
- Dark theme: Dark mode with dark colors
- Theme persistence in localStorage
- System preference detection

## Forms

### Form Handling

- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod resolver integration

### Validation

All forms use Zod schemas for validation:
- Email format validation
- Password strength requirements
- Required field validation
- Custom validation rules

## API Integration

### Axios Configuration

Base configuration in `services/api.ts`:
- Base URL from environment variables
- Request interceptors for token injection
- Response interceptors for error handling
- Automatic token refresh on 401 errors

### Error Handling

- Centralized error handling in services
- Toast notifications for user feedback
- Error boundary for React errors
- Network error retry logic

## Real-time Features

### WebSocket Integration

- Automatic connection on authentication
- Reconnection on disconnect
- Event listeners for real-time updates
- Cleanup on logout

### Real-time Events

- Task updates
- Comment notifications
- Project updates
- User notifications

## Performance Optimizations

### Code Splitting

- Route-based code splitting
- Lazy loading of components
- Dynamic imports

### Caching

- Service-level caching
- Redux state caching
- LocalStorage for preferences

### Bundle Optimization

- Tree shaking
- Minification
- Asset optimization

## Testing

### Test Setup

- **Vitest**: Test runner
- **@testing-library/react**: Component testing
- **@testing-library/jest-dom**: DOM matchers
- **@testing-library/user-event**: User interaction testing

### Test Scripts

- `npm test`: Run tests
- `npm run test:ui`: Run tests with UI
- `npm run test:coverage`: Run tests with coverage

## Environment Variables

Required environment variables:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=TaskMaster
```

## Build and Deployment

### Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

Output: `dist/` directory with optimized production files

### Preview

```bash
npm run preview
```

## Best Practices

1. **Type Safety**: Use TypeScript for all components and functions
2. **Component Composition**: Build complex components from simple ones
3. **Custom Hooks**: Extract reusable logic into hooks
4. **Service Layer**: All API calls through service files
5. **Error Handling**: Comprehensive error handling at all levels
6. **Accessibility**: Semantic HTML and ARIA attributes
7. **Performance**: Code splitting and lazy loading
8. **Security**: No sensitive data in client code

