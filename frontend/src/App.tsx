import { AuthContextProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import { WebSocketContextProvider } from './context/WebSocketContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <ThemeContextProvider>
      <AuthContextProvider>
        <WebSocketContextProvider>
          <AppRoutes />
        </WebSocketContextProvider>
      </AuthContextProvider>
    </ThemeContextProvider>
  );
}

export default App;

