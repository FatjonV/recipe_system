import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditRecipe = () => {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`http://localhost:5000/recipes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const recipe = response.data;
        setTitle(recipe.title);
        setIngredients(recipe.ingredients);
        setInstructions(recipe.instructions);
        setLoading(false);
      } catch (error) {
        setMessage(`❌ Error loading recipe: ${error.response?.data?.error || "Recipe not found"}`);
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    if (!title || !ingredients || !instructions) {
      setMessage("❌ All fields are required");
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:5000/recipes/${id}`,
        { title, ingredients, instructions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Recipe updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.error || "Failed to update recipe"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading recipe...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Edit Recipe</h2>
      {message && <p style={styles.message}>{message}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Recipe Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Ingredients (one per line)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
          style={styles.textarea}
        />
        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
          style={styles.textarea}
        />
        <div style={styles.buttonContainer}>
          <button type="submit" style={styles.submitButton} disabled={submitting}>
            {submitting ? "Updating..." : "Update Recipe"}
          </button>
          <button
            type="button"
            style={styles.cancelButton}
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: "8px",
  },
  heading: {
    color: "#333",
    marginBottom: "20px",
  },
  message: {
    fontWeight: "bold",
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
  textarea: {
    padding: "10px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
    minHeight: "120px",
    resize: "vertical",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  submitButton: {
    backgroundColor: "#2196F3",
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
};

export default EditRecipe;