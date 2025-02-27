import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await axios.post("http://localhost:5000/auth/register", {
        name,
        email,
        password,
      });
      setMessage("✅ Registration successful! You can now log in.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      if (error.response) {
        setMessage(`❌ Error: ${error.response.data.message || "Registration failed"}`);
      } else {
        setMessage("❌ Server error. Try again later.");
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Register</h2>
      {message && <p style={styles.message}>{message}</p>}
      <form onSubmit={handleRegister} style={styles.form}>
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
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    backgroundColor: "#fff",
  },
  heading: {
    color: "#333",
  },
  message: {
    color: "#4CAF50",
    fontWeight: "bold",
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
  button: {
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Register;
