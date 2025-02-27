CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(40) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    title VARCHAR(100) NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    comment TEXT NOT NULL,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);