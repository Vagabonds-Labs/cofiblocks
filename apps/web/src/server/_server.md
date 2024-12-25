# Server

This folder contains server-side logic and configurations for the application. It includes authentication, database connections, and API routes.

## Files and Folders

### `auth.ts`

This file sets up the authentication configuration for the application, including session management and credential validation.

### `db.ts`

This file sets up the database connection for the application.

### `api/`

This folder contains API route handlers and related logic.

- **`root.ts`**
This file sets up the root API handler.

- **`trpc.ts`**
This file sets up the tRPC configuration for the application.

### `routers/`

This folder contains route handlers for various API endpoints.

- **`mockProducts.ts`**

This file sets up mock product data for testing purposes.

- **`products.ts`**
This file sets up the product API routes.

- **`user.ts`**

This file sets up the user API routes.