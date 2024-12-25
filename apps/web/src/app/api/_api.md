# API Endpoints

This folder contains the API endpoints for the application. These endpoints handle various server-side operations such as authentication, product management, and tRPC requests.

## Endpoints

### [auth/[...nextauth]/route.ts](apps/web/src/app/api/auth/[...nextauth]/route.ts)

This endpoint handles authentication using NextAuth. It sets up the authentication options and exports handlers for GET and POST requests.

#### Example Usage

```ts
import NextAuth from "next-auth";
import { authOptions } from "~/server/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### [product/[id]/route.ts](apps/web/src/app/api/product/[id]/route.ts)

This endpoint handles product-related operations such as fetching product details, creating new products, and updating existing products.

#### Example Usage

```tsx
import { getProduct, createProduct, updateProduct } from './product/route';

// Get product details
const product = await getProduct({ id: 1 });

// Create a new product
await createProduct({ name: 'New Product', price: 100 });

// Update an existing product
await updateProduct({ id: 1, name: 'Updated Product', price: 150 });
```

### [trpc/[trpc]/route.ts](apps/web/src/app/api/trpc/[trpc]/route.ts)

This endpoint handles tRPC requests. It sets up the tRPC context and request handler.

#### Example Usage

```tsx
import { handler as trpcHandler } from './trpc/[trpc]/route';

const response = await trpcHandler({ method: 'GET', headers: {} });
```

#### Code Example

```tsx
import { NextRequest } from 'next/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '~/server/routers/_app';
import { createTRPCContext } from '~/server/trpc';
import { env } from '~/env.mjs';

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
```