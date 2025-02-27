import React from "react";
import { Route, Routes, Link, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";
import AdminUsers from "./pages/AdminUsers";

const App = () => {
  const isAuthenticated = () => {
    return localStorage.getItem("token") !== null;
  };

  const isAdmin = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;
      
      const decoded = jwtDecode(token);
      return decoded.role === "admin";
    } catch (error) {
      return false;
    }
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Admin route component
  const AdminRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }
    if (!isAdmin()) {
      return <Navigate to="/dashboard" />;
    }
    return children;
  };

  return (
    <div style={styles.app}>
      <nav style={styles.navbar}>
        <div style={styles.logo}>Recipe System</div>
        <div style={styles.navLinks}>
          {isAuthenticated() ? (
            <>
              <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
              {isAdmin() && <Link to="/admin/users" style={styles.navLink}>User Management</Link>}
              <Link 
                to="/login" 
                style={styles.navLink}
                onClick={() => localStorage.removeItem("token")}
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>Login</Link>
              <Link to="/register" style={styles.navLink}>Register</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/create-recipe" 
          element={
            <ProtectedRoute>
              <CreateRecipe />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/edit-recipe/:id" 
          element={
            <ProtectedRoute>
              <EditRecipe />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } 
        />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

const styles = {
  app: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#333",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: "20px",
  },
  navLink: {
    color: "#fff",
    textDecoration: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    transition: "background-color 0.3s",
  },
};

export default App;