  import React from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { Toaster } from 'react-hot-toast';
  import { AuthProvider, useAuth } from './contexts/AuthContext';
  import { TaskProvider } from './contexts/TaskContext'; // Add this import
  import Navbar from './components/Navbar';
  import Register from './components/Register';
  import Login from './components/Login';
  import Dashboard from './components/Dashboard';
  import Tasks from './components/Tasks'; // Add this import
  import ProfilePage from './components/Profilepage'; // Add this import
  import SettingsPage from './components/Settingspage';

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  // Public Route Component (redirect if already logged in)
  const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    if (user) {
      return <Navigate to="/dashboard" />;
    }
    
    return children;
  };

  function AppContent() {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={
            <PublicRoute>
              <Navigate to="/login" />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Add Tasks Route */}
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } />

          {/* Add Profile Route */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </>
    );
  }

  function App() {
    return (
      <Router>
        <AuthProvider>
          <TaskProvider> {/* Wrap with TaskProvider */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '0.5rem',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
            <AppContent />
          </TaskProvider>
        </AuthProvider>
      </Router>
    );
  }

  export default App;