# GST Self Learning App Backend

A Node.js/Express backend for handling user registration, authentication, and GST-related logic.

## Features
- **User Registration**: Two-step registration process with simulated OTP verification.
- **Authentication**: Login with JWT tokens.
- **User Profile**: Protected route to fetch logged-in user details.
- **Password Recovery**: Simulated forgot password logic.

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB (optional, server will still run with warnings if not connected)

### Installation
1. cd into the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create/Modify `.env` file with your configuration.

### Running the server
- Development mode (with nodemon):
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  npm start
  ```

## API Endpoints

### Auth
- `POST /api/auth/login`: Authenticate user and get token.
- `POST /api/auth/forgotpassword`: Request password reset.
- `GET /api/auth/me`: Get current user (Requires Bearer Token).

### Registration
- `POST /api/registration/step1`: Initial registration step (collects user details).
- `POST /api/registration/verify-otp`: Verify email and mobile OTPs.

## Simulation Notes
- **OTPs**: In development, use `123456` for both email and mobile OTPs to simulate success.
- **TRN**: Automatically generated upon successful step 1.
