# Backend Setup Guide

## Overview

This project is a **NestJS GraphQL backend** with SQLite database and Apollo Server.

### Key Technologies

- **Framework**: NestJS 11
- **API**: GraphQL (Apollo Server 5)
- **Database**: SQLite with Drizzle ORM
- **Platform**: Express

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

Default configuration:

- **Port**: 4000
- **DATABASE_URL**: `./data/showcase.sqlite` (auto-created)
- **FRONTEND_URL**: http://localhost:3000

### 3. Build Project

```bash
npm run build
```

### 4. Start Server

```bash
# Development (with watch/hot-reload)
npm run start:dev

# Production
npm start
```

Server starts on `http://localhost:4000`

## GraphQL Access Points

### GraphQL Endpoint

- **URL**: http://localhost:4000/graphql
- **Methods**: POST (mutations, queries)

### GraphiQL Playground

- **URL**: http://localhost:4000/graphiql (interactive explorer)

### Example Query

```graphql
query {
  products(category: "popular") {
    id
    slug
    name
    price
    description
  }
}
```

## Project Structure

```
src/
├── app.module.ts          # Main app module with GraphQL config
├── main.ts                # Bootstrap server entry point
├── db/                    # Database layer
│   ├── database.module.ts # DB provider module
│   ├── database.service.ts # SQLite connection & seeding
│   ├── schema.ts          # Drizzle schema definitions
│   ├── seed-data.ts       # Initial product data
│   └── seed.ts            # Seeding script
├── products/              # Product domain
│   ├── product.model.ts   # GraphQL object type
│   ├── product.input.ts   # GraphQL input types
│   ├── products.resolver.ts # GraphQL resolvers
│   ├── products.service.ts  # Business logic
│   └── products.module.ts   # Domain module
└── auth/                  # Authentication (OAuth2)
    ├── auth.module.ts
    ├── auth.resolver.ts
    └── strategies/oauth2.strategy.ts
```

## API Features

### Products Queries

```graphql
# Get all products
query {
  products(category: "popular") {
    id
    slug
    name
    price
  }
}

# Get product by slug
query {
  product(slug: "my-product") {
    id
    name
    description
    features
  }
}
```

### Products Mutations

```graphql
# Create product
mutation {
  createProduct(
    input: { slug: "new-product", name: "New Product", price: "99.99" }
  ) {
    id
    slug
  }
}

# Update product
mutation {
  updateProduct(
    slug: "my-product"
    input: { name: "Updated Name", price: "149.99" }
  ) {
    id
  }
}

# Delete product
mutation {
  removeProduct(slug: "my-product") {
    id
  }
}
```

## Database

### SQLite Auto-Setup

- Database file: `backend/data/showcase.sqlite`
- **Auto-created on first run** with seeded product data
- Uses WAL (Write-Ahead Logging) for better concurrency

### Seeding

Manually seed database:

```bash
npm run db:seed
```

## Available Scripts

```bash
npm start       # Run production build
npm run build   # Compile TypeScript
npm run lint    # Check code style
npm run start:dev # Development with hot-reload
npm run db:seed # Seed database with initial data
```

## Integration with Frontend

### CORS Configuration

The backend allows requests from the frontend (port 3000) by default.

- **Allowed Origin**: http://localhost:3000
- **Credentials**: Enabled

### Frontend GraphQL Endpoint

Configure your frontend to use:

```
http://localhost:4000/graphql
```

See `../../frontend/lib/graphql.ts` for client setup example.

## Troubleshooting

| Issue                        | Solution                                       |
| ---------------------------- | ---------------------------------------------- |
| Port 4000 already in use     | Change `PORT` env var or kill existing process |
| Database file locked         | Ensure no other process is running the backend |
| Module not found errors      | Run `npm install` again                        |
| GraphQL schema not generated | Restart in watch mode: `npm run start:dev`     |

## Next Steps

- [ ] Implement full OAuth2 authentication strategy
- [ ] Add User entity and mutations
- [ ] Add subscription support
- [ ] Implement role-based access control
- [ ] Add rate limiting
- [ ] Add API documentation with Swagger

---

For frontend integration, see [../frontend/README.md](../../frontend/README.md)
