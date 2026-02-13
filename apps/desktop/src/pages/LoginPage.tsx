// ============================================
// Login Page
// ============================================
import { useNavigate } from '@tanstack/react-router';
import { AuthScreen } from '../components/AuthScreen';
import { useAuthStore } from '../stores/auth-store';
import type { AuthUser } from '../api';

export function LoginPage() {
  const navigate = useNavigate();

  const handleAuthenticated = (user: AuthUser) => {
    useAuthStore.setState({ user, isAuthenticated: true });
    navigate({ to: '/dashboard' });
  };

  return <AuthScreen onAuthenticated={handleAuthenticated} />;
}
