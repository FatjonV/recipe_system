const express = require('express');
const db = require('./db'); // Import MySQL connection
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const verifyToken = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin')


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// **Test Route**
app.get('/', (req, res) => {
    res.send('Hello, Express with MySQL!');
});


// **User Authentication**
app.post('/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const userRole = role || 'user'; // Default to "user"

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';

        db.query(sql, [name, email, hashedPassword, userRole], (err, result) => {
            if (err) {
                console.error('Error registering user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


// **User Login**
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ message: 'Login successful', token, role: user.role });
    });
});


// **Protected: Get All Users**
app.get('/users', verifyToken, (req, res) => {
    const sql = 'SELECT id, name, email, role FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});


// Get all users (admin only)
app.get('/users', verifyToken, isAdmin, (req, res) => {
    const sql = 'SELECT id, name, email, role FROM users';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// **Protected: Get Single User by ID**
app.get('/users/:id', verifyToken, isAdmin, (req, res) => {
    const userId = req.params.id;
    const sql = 'SELECT id, name, email FROM users WHERE id = ?';

    db.query(sql, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});


// **Protected: Create User**
app.post('/users', verifyToken, isAdmin, async (req, res) => {
    const { name, email, password, role} = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const userRole = role || 'user';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        
        db.query(sql, [name, email, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('Error adding user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User added successfully', userId: result.insertId });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// **Protected: Update User**
app.put('/users/:id', verifyToken, isAdmin, async (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
        
        db.query(sql, [name, email, hashedPassword, userId], (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User updated successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


app.delete('/users/:id', verifyToken, isAdmin, (req, res) => {
    const userId = req.params.id;
    const sql = 'DELETE FROM users WHERE id = ?';

    db.query(sql, [userId], (err, result) => {
        if (err || result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});



app.post('/recipes', verifyToken, (req, res) => {
    const { title, ingredients, instructions } = req.body;
    const userId = req.user.userId; // Get user ID from the token

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO recipes (title, ingredients, instructions, user_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [title, ingredients, instructions, userId], (err, result) => {
        if (err) {
            console.error('Error adding recipe:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Recipe added successfully', recipeId: result.insertId });
    });
});

app.get('/recipes', verifyToken, (req, res) => {
    const sql = 'SELECT recipes.id, title, ingredients, instructions, users.name AS author FROM recipes JOIN users ON recipes.user_id = users.id';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});


app.get('/recipes/:id', verifyToken, (req, res) => {
    const recipeId = req.params.id;
    const sql = 'SELECT recipes.id, title, ingredients, instructions, users.name AS author FROM recipes JOIN users ON recipes.user_id = users.id WHERE recipes.id = ?';

    db.query(sql, [recipeId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(results[0]);
    });
});


app.put('/recipes/:id', verifyToken, (req, res) => {
    const recipeId = req.params.id;
    const { title, ingredients, instructions } = req.body;
    const userId = req.user.userId; // Get user ID from the token

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'UPDATE recipes SET title = ?, ingredients = ?, instructions = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [title, ingredients, instructions, recipeId, userId], (err, result) => {
        if (err || result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recipe not found or you do not have permission to update it' });
        }
        res.json({ message: 'Recipe updated successfully' });
    });
});


app.delete('/recipes/:id', verifyToken, (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let sql;
    let params;

    if (userRole === 'admin') {
        sql = 'DELETE FROM recipes WHERE id = ?';
        params = [recipeId];
    } else {
        sql = 'DELETE FROM recipes WHERE id = ? AND user_id = ?';
        params = [recipeId, userId];
    }

    db.query(sql, params, (err, result) => {
        if (err || result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recipe not found or you do not have permission' });
        }
        res.json({ message: 'Recipe deleted successfully' });
    });
});


app.post('/comments', verifyToken, (req, res) => {
    const { comment, recipe_id } = req.body;
    const user_id = req.user.userId; // Get user ID from the token

    if (!comment || !recipe_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO comments (comment, user_id, recipe_id) VALUES (?, ?, ?)';
    db.query(sql, [comment, user_id, recipe_id], (err, result) => {
        if (err) {
            console.error('Error adding comment:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Comment added successfully', commentId: result.insertId });
    });
});


app.get('/comments', verifyToken, (req, res) => {
    const sql = `
        SELECT comments.id, comments.comment, users.name AS author, recipes.title AS recipe 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        JOIN recipes ON comments.recipe_id = recipes.id`;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});



app.get('/comments/recipe/:recipe_id', verifyToken, (req, res) => {
    const recipeId = req.params.recipe_id;
    const sql = `
        SELECT comments.id, comments.comment, users.name AS author 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.recipe_id = ?`;

    db.query(sql, [recipeId], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});



app.put('/comments/:id', verifyToken, (req, res) => {
    const commentId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.userId; // Get user ID from token

    if (!comment) {
        return res.status(400).json({ error: 'Comment text is required' });
    }

    const sql = 'UPDATE comments SET comment = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [comment, commentId, userId], (err, result) => {
        if (err || result.affectedRows === 0) {
            return res.status(404).json({ error: 'Comment not found or you do not have permission to update it' });
        }
        res.json({ message: 'Comment updated successfully' });
    });
});


app.delete('/comments/:id', verifyToken, (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    let sql;
    let params;

    if (userRole === 'admin') {
        sql = 'DELETE FROM comments WHERE id = ?';
        params = [commentId];
    } else {
        sql = 'DELETE FROM comments WHERE id = ? AND user_id = ?';
        params = [commentId, userId];
    }

    db.query(sql, params, (err, result) => {
        if (err || result.affectedRows === 0) {
            return res.status(404).json({ error: 'Comment not found or you do not have permission' });
        }
        res.json({ message: 'Comment deleted successfully' });
    });
});



// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

