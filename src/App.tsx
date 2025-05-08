import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext'; // Commenting out as it might be removed later
// import { ProtectedRoute } from './components/ProtectedRoute'; // Commenting out as it might be removed later
// import { Login } from './pages/Login'; // Commenting out as it might be removed later
// import { useAuth } from './context/AuthContext'; // Commenting out as it might be removed later

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome to the Protected Website</h1>
    </div>
  );
}

// Wrapper for the login route that redirects to home if already authenticated
// function LoginWrapper() {  // Removing this function
//   const { isAuthenticated } = useAuth();
//  
//   if (isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }
//  
//   return <Login />;
// }

function App() {
  return (
    // <AuthProvider> // Commenting out as it might be removed later
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
        </Routes>
      </Router>
    // </AuthProvider> // Commenting out as it might be removed later
  );
}

export default App; 