# Task Management Application

## Overview

This is a full-stack Task Management application built with Node.js, Express, MongoDB, and React. It allows users to register, log in, manage tasks, and more. The backend is implemented in Node.js and Express, while the frontend is developed using React.

## Features

- User registration and authentication
- Task CRUD operations (Create, Read, Update, Delete)
- Secure API endpoints with authentication and authorization
- Validation of inputs for user and task operations
- Rate limiting and CSRF protection for enhanced security

## Technologies

- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React
- **Testing:** Jest, Supertest
- **Security:** Helmet, CSRF Protection, Rate Limiting

## Getting Started

### Prerequisites

- Node.js and npm installed
- MongoDB installed or use a MongoDB cloud service

### Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/SahityaVatturi/Task-Management.git
   cd task-management-app
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.development` file (development/production) in the root directory and add the following variables:

   ```
   PORT = 8050
   MONGO_URI = your_mongodb_url
   JWT_SECRET = your_jwt_secret
   ```

4. **Run the Application:**
   Start the backend server:

   ```bash
   npm start
   ```

5. **Frontend Setup:**
   Navigate to the `frontend` directory and set up the React application:
   ```bash
   git clone https://github.com/SahityaVatturi/Task-Management-FE.git
   cd task-management-fe
   npm install
   npm start
   ```

### API Endpoints

#### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Log in and receive a JWT token
- **POST /api/auth/logout** - Log out the user
- **POST /api/auth/refresh-token** - Refresh JWT token
- **POST /api/auth/forgot-password** - Send password reset link
- **POST /api/auth/reset-password** - Reset the password
- **GET /api/auth/profile** - Get the authenticated user’s profile
- **PUT /api/auth/profile** - Update the authenticated user’s profile

#### Tasks

- **POST /api/tasks** - Create a new task
- **GET /api/tasks** - Get all tasks for the authenticated user
- **PUT /api/tasks/:id** - Update a task by ID
- **DELETE /api/tasks/:id** - Delete a task by ID

#### User

- **GET /api/users/profile** - Get the authenticated user’s profile
- **PUT /api/users/profile** - Update the authenticated user’s profile

## Testing

Run tests using Jest:

```bash
npm test
```

## Security

- **Rate Limiting:** Applied to authentication routes to prevent abuse.
- **CSRF Protection:** Enabled to safeguard against cross-site request forgery.
- **Helmet:** Added for setting various HTTP headers to enhance security.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the ISC License.
