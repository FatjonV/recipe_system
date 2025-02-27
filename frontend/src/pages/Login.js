import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      setMessage("✅ Login successful!");
      setEmail("");
      setPassword("");

      navigate("/dashboard"); // Redirect to dashboard after login
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || "Login failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Login</h2>
      {message && <p style={styles.message}>{message}</p>}
      <form onSubmit={handleLogin} style={styles.form}>
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
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: "400px", margin: "50px auto", padding: "20px", textAlign: "center", backgroundColor: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px" },
  heading: { color: "#333" },
  message: { color: "#4CAF50", fontWeight: "bold" },
  form: { display: "flex", flexDirection: "column" },
  input: { padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px" },
  button: { backgroundColor: "#4CAF50", color: "#fff", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" },
};

export default Login;
