Project: Recipe System
Overview

The Recipe Sharing System is a full-stack web application that allows users to create, view, and interact with recipes. This project represents my first complete backend-driven application and marks my transition from theoretical knowledge to practical programming.

The goal of this project was to understand how real-world applications are structured, including API development, database design, and user authentication.

Purpose of the Project
This project was built to:

Practice backend development using JavaScript
Understand how APIs work in a real application
Learn how to connect a server with a database
Implement user authentication and data relationships

It serves as the foundation of my journey into software development.

Features:
User registration and login (authentication system)
Secure password hashing using bcrypt
JWT-based authentication for protected routes
Create, read, update, and delete recipes (CRUD)
Add and manage comments on recipes
Role-based access control (admin vs user)
RESTful API structure

Technologies Used:
Backend: Node.js, Express.js
Database: MySQL
Authentication: JSON Web Tokens (JWT), bcrypt
API Testing: Postman

Architecture / How It Works
The application is structured as a RESTful API:

Routes: Define endpoints for users, recipes, and comments
Controllers: Handle request logic and responses
Database Layer: MySQL with structured tables and relationships

The system uses middleware for:

Authentication verification
Authorization (admin/user roles)
Database Design

The application uses three main tables:
users
Stores user credentials and roles
recipes
Stores recipe data (title, description, etc.)
comments
Linked to recipes and users

Relationships:
One user → many recipes
One recipe → many comments

Authentication & Security
Passwords are hashed using bcrypt before being stored
JWT tokens are used for secure authentication
Protected routes require a valid token
Middleware ensures only authorized users can perform certain actions
