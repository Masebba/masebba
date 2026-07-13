import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
// Layouts & Protection
import { PublicLayout } from './components/layouts/PublicLayout';
import { AdminLayout } from './components/layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
// Public Pages

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })));
const Portfolio = lazy(() => import('./pages/Portfolio').then((module) => ({ default: module.Portfolio })));
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail').then((module) => ({ default: module.PortfolioDetail })));
const Blog = lazy(() => import('./pages/Blog').then((module) => ({ default: module.Blog })));
const BlogPost = lazy(() => import('./pages/BlogPost').then((module) => ({ default: module.BlogPost })));
const Contact = lazy(() => import('./pages/Contact').then((module) => ({ default: module.Contact })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then((module) => ({ default: module.Dashboard })));
const SiteSettings = lazy(() => import('./pages/admin/SiteSettings').then((module) => ({ default: module.SiteSettings })));
const Projects = lazy(() => import('./pages/admin/Projects').then((module) => ({ default: module.Projects })));
const BlogPosts = lazy(() => import('./pages/admin/BlogPosts').then((module) => ({ default: module.BlogPosts })));
const BlogPostEditor = lazy(() => import('./pages/admin/BlogPostEditor').then((module) => ({ default: module.BlogPostEditor })));
const Messages = lazy(() => import('./pages/admin/Messages').then((module) => ({ default: module.Messages })));
const AdminServices = lazy(() => import('./pages/admin/Services').then((module) => ({ default: module.AdminServices })));

function PageFallback() {
  return <div className="flex min-h-[50vh] items-center justify-center text-muted" role="status">Loading page…</div>;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div className="max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">The app hit a startup error</h1>
            <p className="mt-3 text-sm text-gray-600">
              Check your Firebase environment variables and refresh the page. The console will show the exact missing value.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />

              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:id" element={<PortfolioDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
              <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
              
              <Route index element={<Dashboard />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="projects" element={<Projects />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="blog" element={<BlogPosts />} />
              <Route path="blog/new" element={<BlogPostEditor />} />
              <Route path="blog/edit/:id" element={<BlogPostEditor />} />
              <Route path="messages" element={<Messages />} />
            </Route>
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>);

}
