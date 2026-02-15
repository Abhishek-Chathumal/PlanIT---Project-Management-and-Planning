// ============================================
// TanStack Router — Route definitions
// ============================================
import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { useAuthStore } from './stores/auth-store';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BoardPage } from './pages/BoardPage';
import { MembersPage } from './pages/MembersPage';

// ---- Root route ----
const rootRoute = createRootRoute({
  component: Outlet,
});

// ---- Public routes ----
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

// ---- Authenticated layout ----
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AppLayout,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

// ---- Authenticated pages ----
const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const boardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/board/$projectId',
  component: BoardPage,
});

const membersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/members',
  component: MembersPage,
});

// ---- Index redirect ----
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    throw redirect({ to: isAuthenticated ? '/dashboard' : '/login' });
  },
});

// ---- Build route tree ----
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appLayoutRoute.addChildren([dashboardRoute, boardRoute, membersRoute]),
]);

export const router = createRouter({ routeTree });

// ---- Type registration ----
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
