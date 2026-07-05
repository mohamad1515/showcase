# Authentication System Setup

## Overview

A complete user authentication system has been implemented for the e-commerce supplement showcase application. Users can signup, login, and logout with persistent session management via JWT tokens stored in localStorage.

## System Architecture

### Frontend (Next.js 15)

- **Location:** `/app/auth/` pages with Persian language support
- **Auth Context:** `app/providers/AuthProvider.tsx` - manages global auth state
- **GraphQL Client:** `app/lib/graphql.ts` - handles authorization headers
- **Auth Functions:** `app/lib/auth.ts` - signup, login, logout mutations

### Backend (NestJS 11)

- **Auth Module:** `src/auth/auth.module.ts` - GraphQL mutations for authentication
- **Resolver:** `src/auth/auth.resolver.ts` - signup and login mutations
- **Types:** `src/auth/auth.input.ts`, `src/auth/auth.output.ts` - GraphQL input/output types
- **Database:** SQLite via better-sqlite3 with users table

### Database

- **Engine:** SQLite (showcase.sqlite)
- **Table:** `users` with columns:
  - `id` (INTEGER PRIMARY KEY)
  - `name` (TEXT)
  - `email` (TEXT UNIQUE)
  - `provider_id` (TEXT)
  - `password` (TEXT) - stored in plain text for demo only
  - `access_token` (TEXT) - for OAuth2
  - `refresh_token` (TEXT) - for OAuth2
  - `created_at` (TEXT)

## User Flow

### 1. Signup

**URL:** `http://localhost:3001/auth/register`

Frontend form collects:

- Name
- Email
- Password

GraphQL mutation:

```graphql
mutation {
  signup(
    input: {
      name: "John Doe"
      email: "john@example.com"
      password: "SecurePassword123"
    }
  ) {
    id
    name
    email
  }
}
```

Response includes user data and serves as confirmation of successful signup.

### 2. Login

**URL:** `http://localhost:3001/auth/login`

Frontend form collects:

- Email
- Password

GraphQL mutation:

```graphql
mutation {
  login(input: { email: "john@example.com", password: "SecurePassword123" }) {
    token
    user {
      id
      name
      email
    }
  }
}
```

Response includes:

- **token:** Base64-encoded JWT-like token (user_id:timestamp)
- **user:** User object with id, name, email

Token is stored in localStorage as `auth-token` and used for subsequent requests.

### 3. Session Management

- Token is automatically persisted in localStorage
- AuthProvider reads token on app load to restore session
- Authorization header is automatically added to all GraphQL requests: `Authorization: Bearer {token}`

### 4. Logout

Clears token from localStorage and resets auth state to logged out.

## Running the Application

### Start Backend Server

```bash
cd backend
PORT=5000 node dist/main.js
```

GraphQL endpoint: `http://localhost:5000/graphql`

### Start Frontend Server

```bash
cd frontend
PORT=3001 npx next start
```

Frontend: `http://localhost:3001`

## Security Notes ⚠️

This implementation is for demonstration purposes. In production, you must:

1. **Hash Passwords:** Use bcrypt or argon2 instead of storing plain text

   ```typescript
   import bcrypt from "bcrypt";
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Use Real JWT:** Replace the simple token generation with jsonwebtoken library

   ```typescript
   import jwt from "jsonwebtoken";
   const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
     expiresIn: "24h",
   });
   ```

3. **Add Email Verification:** Verify user email before allowing login

4. **Implement Refresh Tokens:** Add token expiration and refresh endpoint

5. **HTTPS Only:** Use secure cookies for tokens in production

6. **Environment Variables:** Store secrets in `.env` file, never in code

## GraphQL Queries and Mutations

### Signup Mutation

```graphql
mutation Signup($input: SignupInput!) {
  signup(input: $input) {
    id
    name
    email
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "SecurePass123"
  }
}
```

### Login Mutation

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      name
      email
    }
  }
}
```

Variables:

```json
{
  "input": {
    "email": "alice@example.com",
    "password": "SecurePass123"
  }
}
```

## Frontend Components

### AuthProvider (`app/providers/AuthProvider.tsx`)

Provides authentication context to entire app:

```typescript
const { user, token, loading, login, logout } = useAuth();
```

### Login Page (`app/auth/login/page.tsx`)

- Email and password input fields (Persian labels)
- Login button calls GraphQL mutation
- Error handling and display
- Redirects to home page on success
- OAuth2 fallback option

### Register Page (`app/auth/register/page.tsx`)

- Name, email, and password input fields (Persian labels)
- Signup button calls GraphQL mutation
- Form validation
- Error handling
- Redirects to login page on success

## Testing the API

### Direct GraphQL Testing

Using curl:

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { signup(input: {name: \"Test\", email: \"test@example.com\", password: \"pass123\"}) { id name email } }"}'
```

### With Authorization Header

```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"query":"{ profile { id name email } }"}'
```

## Frontend Build Info

The frontend includes:

- 11 total pages (homepage, products, product details, auth pages, not-found)
- Tailwind CSS v4 with RTL/Persian language support
- Server-side rendering for product pages
- Client-side GraphQL with authorization

## Files Modified/Created

### Backend

- `src/auth/auth.resolver.ts` - Authentication mutations (signup, login)
- `src/auth/auth.input.ts` - GraphQL input types
- `src/auth/auth.output.ts` - GraphQL output types
- `src/auth/auth.module.ts` - Auth module configuration
- `src/user/user.entity.ts` - User GraphQL type
- `src/user/user.service.ts` - Database access layer
- `src/db/database.service.ts` - Database initialization with users table

### Frontend

- `app/lib/auth.ts` - GraphQL auth mutations and client functions
- `app/lib/graphql.ts` - GraphQL request wrapper with auth header
- `app/auth/login/page.tsx` - Login page component
- `app/auth/register/page.tsx` - Register page component
- `app/providers/AuthProvider.tsx` - React auth context provider
- `app/layout.tsx` - Root layout with AuthProvider wrapper

## Next Steps (Optional Enhancements)

1. **Email Verification** - Send verification email on signup
2. **Password Reset** - Implement forgot password flow
3. **OAuth2 Integration** - Implement Google/GitHub login
4. **2FA** - Add two-factor authentication
5. **Profile Management** - Allow users to update profile
6. **Password Hashing** - Replace plain text storage with bcrypt
7. **Real JWT** - Replace simple tokens with proper JWT
8. **Rate Limiting** - Add rate limiting to auth endpoints
9. **Audit Logging** - Log all authentication events
10. **Protected Products** - Restrict certain products to logged-in users

## Troubleshooting

### "User already exists" error

- User with that email already exists in database
- Use a different email or reset the database

### "Invalid credentials" error

- Email or password is incorrect
- Verify email exists in database and password matches

### Token not persisting

- Check browser localStorage is enabled
- Verify `auth-token` key is being saved
- Check browser console for errors

### GraphQL errors

- Verify backend is running on port 5000
- Check GraphQL endpoint is accessible: `http://localhost:5000/graphql`
- Verify query syntax is correct

## Database Access

View users in SQLite:

```bash
sqlite3 backend/data/showcase.sqlite "SELECT id, name, email, created_at FROM users;"
```

Reset database:

```bash
rm backend/data/showcase.sqlite*
cd backend && npm start
```
