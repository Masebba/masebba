import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
// Layouts & Protection
import { PublicLayout } from './components/layouts/PublicLayout';
import { AdminLayout } from './components/layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Portfolio } from './pages/Portfolio';
import { PortfolioDetail } from './pages/PortfolioDetail';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { SiteSettings } from './pages/admin/SiteSettings';
import { Projects } from './pages/admin/Projects';
import { BlogPosts } from './pages/admin/BlogPosts';
import { BlogPostEditor } from './pages/admin/BlogPostEditor';
import { Messages } from './pages/admin/Messages';
import { AdminServices } from './pages/admin/Services';
export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>);

}