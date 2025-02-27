import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Dashboard = () => { 
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      navigate("/login");
    }

    // Fetch recipes
    fetchRecipes();
  }, [navigate]);

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/recipes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch comments for each recipe
      const recipesWithComments = await Promise.all(
        response.data.map(async (recipe) => {
          const commentsResponse = await axios.get(
            `http://localhost:5000/comments/recipe/${recipe.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return { ...recipe, comments: commentsResponse.data };
        })
      );
      
      setRecipes(recipesWithComments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      // Refresh recipes to update comments
      fetchRecipes();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim() || !activeRecipeId) return;
    
    try {
      await axios.post(
        "http://localhost:5000/comments",
        { comment: newComment, recipe_id: activeRecipeId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setNewComment("");
      setActiveRecipeId(null);
      
      // Refresh recipes to show new comment
      fetchRecipes();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await axios.delete(`http://localhost:5000/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      // Update the recipes state to remove the deleted recipe
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId));
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Recipe System</h1>
        <div style={styles.userInfo}>
          <p>Hello, {user ? user.name : "User"}!</p>
          <p>Role: {user?.role}</p>
          <button style={styles.logoutButton} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={styles.actionButtons}>
        {user && (
          <button 
            style={styles.createButton} 
            onClick={() => navigate("/create-recipe")}
          >
            Create New Recipe
          </button>
        )}
        
        {user?.role === "admin" && (
          <button 
            style={styles.adminButton} 
            onClick={() => navigate("/admin/users")}
          >
            Manage Users
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p>No recipes found</p>
      ) : (
        <div style={styles.recipeList}>
          {recipes.map((recipe) => (
            <div key={recipe.id} style={styles.recipeCard}>
              <h3 style={styles.recipeTitle}>{recipe.title}</h3>
              <p><strong>Author:</strong> {recipe.author}</p>
              
              <div style={styles.recipeContent}>
                <div style={styles.section}>
                  <h4>Ingredients</h4>
                  <p style={styles.recipeText}>{recipe.ingredients}</p>
                </div>
                
                <div style={styles.section}>
                  <h4>Instructions</h4>
                  <p style={styles.recipeText}>{recipe.instructions}</p>
                </div>
              </div>
              
              {(user?.role === "admin" || user?.userId === recipe.user_id) && (
                <div style={styles.actionButtons}>
                  <button 
                    style={styles.editButton} 
                    onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                  >
                    Edit
                  </button>
                  <button 
                    style={styles.deleteButton} 
                    onClick={() => handleDeleteRecipe(recipe.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
              
              <div style={styles.commentsSection}>
                <h4>Comments</h4>
                {recipe.comments && recipe.comments.length > 0 ? (
                  <div style={styles.commentsList}>
                    {recipe.comments.map((comment) => (
                      <div key={comment.id} style={styles.comment}>
                        <p>
                          <strong>{comment.author}:</strong> {comment.comment}
                        </p>
                        {(user?.role === "admin" || user?.userId === comment.user_id) && (
                          <button 
                            style={styles.deleteCommentButton}
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No comments yet</p>
                )}
                
                <div style={styles.addCommentSection}>
                  {activeRecipeId === recipe.id ? (
                    <div style={styles.commentForm}>
                      <textarea
                        style={styles.commentInput}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                      />
                      <div style={styles.commentFormButtons}>
                        <button 
                          style={styles.submitCommentButton} 
                          onClick={handleAddComment}
                        >
                          Submit
                        </button>
                        <button 
                          style={styles.cancelButton}
                          onClick={() => {
                            setActiveRecipeId(null);
                            setNewComment("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      style={styles.addCommentButton}
                      onClick={() => setActiveRecipeId(recipe.id)}
                    >
                      Add Comment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  },
  title: {
    color: "#333",
    margin: "0",
  },
  userInfo: {
    textAlign: "right",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  actionButtons: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },
  createButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  adminButton: {
    backgroundColor: "#FF9800",
    color: "#fff",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  recipeList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  recipeCard: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  recipeTitle: {
    margin: "0 0 10px 0",
    color: "#333",
  },
  recipeContent: {
    marginTop: "15px",
    marginBottom: "15px",
  },
  section: {
    marginBottom: "15px",
  },
  recipeText: {
    whiteSpace: "pre-wrap",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  editButton: {
    backgroundColor: "#2196F3",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  commentsSection: {
    marginTop: "20px",
    paddingTop: "15px",
    borderTop: "1px solid #eee",
  },
  commentsList: {
    marginBottom: "15px",
  },
  comment: {
    padding: "10px 15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteCommentButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    padding: "5px 8px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  addCommentSection: {
    marginTop: "15px",
  },
  addCommentButton: {
    backgroundColor: "#2196F3",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  commentForm: {
    marginTop: "10px",
  },
  commentInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    minHeight: "80px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  commentFormButtons: {
    display: "flex",
    gap: "10px",
  },
  submitCommentButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#9e9e9e",
    color: "#fff",
    padding: "8px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
  
export default Dashboard;