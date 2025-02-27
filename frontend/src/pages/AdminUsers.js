import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch users. " + (error.response?.data?.error || ""));
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/users",
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and fetch updated users
      resetForm();
      setShowAddForm(false);
      fetchUsers();
    } catch (error) {
      setError("Failed to add user. " + (error.response?.data?.error || ""));
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/users/${editUserId}`,
        { name, email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and fetch updated users
      resetForm();
      setEditUserId(null);
      fetchUsers();
    } catch (error) {
      setError("Failed to update user. " + (error.response?.data?.error || ""));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch updated users
      fetchUsers();
    } catch (error) {
      setError("Failed to delete user. " + (error.response?.data?.error || ""));
    }
  };

  const startEditUser = (user) => {
    setName(user.name);
    setEmail(user.email);
    setPassword(""); // Don't set password, require new one
    setRole(user.role);
    setEditUserId(user.id);
    setShowAddForm(false);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
  };

  const cancelAction = () => {
    resetForm();
    setShowAddForm(false);
    setEditUserId(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>User Management</h2>
      
      {error && <p style={styles.errorMessage}>{error}</p>}
      
      <div style={styles.actionBar}>
        <button 
          style={styles.addButton} 
          onClick={() => {
            resetForm();
            setShowAddForm(true);
            setEditUserId(null);
          }}
        >
          Add New User
        </button>
        <button 
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
      
      {showAddForm && (
        <div style={styles.formContainer}>
          <h3 style={styles.formHeading}>Add New User</h3>
          <form onSubmit={handleAddUser} style={styles.form}>
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            
            <div style={styles.formButtons}>
              <button type="submit" style={styles.submitButton}>Add User</button>
              <button 
                type="button" 
                style={styles.cancelButton}
                onClick={cancelAction}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {editUserId && (
        <div style={styles.formContainer}>
          <h3 style={styles.formHeading}>Edit User</h3>
          <form onSubmit={handleUpdateUser} style={styles.form}>
            <input
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            
            <div style={styles.formButtons}>
              <button type="submit" style={styles.submitButton}>Update User</button>
              <button 
                type="button" 
                style={styles.cancelButton}
                onClick={cancelAction}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div style={styles.usersTable}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>ID</th>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Role</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{user.id}</td>
                  <td style={styles.tableCell}>{user.name}</td>
                  <td style={styles.tableCell}>{user.email}</td>
                  <td style={styles.tableCell}>
                    <span style={user.role === 'admin' ? styles.adminBadge : styles.userBadge}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.editButton}
                        onClick={() => startEditUser(user)}
                      >
                        Edit
                      </button>
                      <button 
                        style={styles.deleteButton}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "900px",
    margin: "20px auto",
    padding: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: "8px",
  },
  heading: {
    color: "#333",
    marginBottom: "20px",
  },
  errorMessage: {
    color: "#f44336",
    backgroundColor: "#ffebee",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  backButton: {
    backgroundColor: "#607d8b",
    color: "#fff",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  formContainer: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #ddd",
  },
  formHeading: {
    color: "#333",
    marginTop: "0",
    marginBottom: "15px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },
  select: {
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
    backgroundColor: "#fff",
  },
  formButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    flexGrow: 1,
    marginRight: "10px",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    flexGrow: 1,
    marginLeft: "10px",
  },
  usersTable: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  tableHeader: {
    backgroundColor: "#f2f2f2",
    padding: "12px",
    textAlign: "left",
    borderBottom: "2px solid #ddd",
  },
  tableRow: {
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    padding: "12px",
  },
  actionButtons: {
    display: "flex",
    gap: "5px",
  },
  editButton: {
    backgroundColor: "#2196F3",
    color: "#fff",
    padding: "6px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    padding: "6px 10px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  adminBadge: {
    backgroundColor: "#ff9800",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  userBadge: {
    backgroundColor: "#2196F3",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
};

export default AdminUsers;