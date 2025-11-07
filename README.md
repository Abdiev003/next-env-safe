# next-env-safe

A lightweight, type-safe environment manager for **Next.js**, built on top of **Zod**.  
Designed to keep server secrets secure while providing fully-typed client and server environment variables with excellent Developer Experience.

---

<p align="center">
  <img src="https://img.shields.io/npm/v/next-env-safe?color=blue" />
  <img src="https://img.shields.io/npm/dm/next-env-safe" />
  <img src="https://img.shields.io/npm/l/next-env-safe" />
  <img src="https://img.shields.io/bundlephobia/minzip/next-env-safe" />
</p>

---

## 🚀 Features

- ✅ Strong TypeScript inference using **Zod**
- ✅ Prevents accidental **server → client** secret leakage
- ✅ Throws **build-time errors** for missing/invalid env variables
- ✅ Works with **Next.js App Router** and **Pages Router**
- ✅ Simple, minimal, predictable API
- ✅ No runtime bloat → extremely small & tree-shakeable

---

## 📦 Installation

```bash
npm install next-env-safe zod
```

or

```bash
pnpm add next-env-safe zod
```

---

## 🧩 Quick Start

Create a file called:

```
env.ts
```

Then define your environment schema:

```ts
import { z } from "zod";
import { createEnv } from "next-env-safe";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SECRET_KEY: z.string().min(32),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: process.env, // usually just process.env
});
```

---

## ✅ Usage

### ✅ Server Components, Server Actions, or API Routes

```ts
import { env } from "@/env";

console.log(env.DATABASE_URL);
```

### ✅ Client Components

```tsx
import { env } from "@/env";

export default function Page() {
  return <div>{env.client.NEXT_PUBLIC_API_URL}</div>;
}
```

---

## 🔒 Security

If you attempt to access a **server-only** environment variable on the **client**,  
you will get a clear runtime error:

> ❌ Attempted to access server environment key "SECRET_KEY" from the client.

This ensures sensitive secrets **never leak** into the browser bundle.

---

## ⚙️ API

```ts
createEnv({
  server: {
    // Zod schemas for server-only variables
  },
  client: {
    // Zod schemas for client-side variables starting with NEXT_PUBLIC_
  },
  runtimeEnv: process.env, // or custom env object
  clientPrefix: string, // default: "NEXT_PUBLIC_"
  verbose: boolean, // log warnings
});
```

### Return Value:

- **Server environment values** (only available on server)
- **Client environment values** (available everywhere)
- `env.client` — a safe subset for client components

---

## ✅ Rules

### Server Schema

- Server env keys **must NOT** start with the client prefix  
  (default: `NEXT_PUBLIC_`)

### Client Schema

- Client env keys **must** start with `NEXT_PUBLIC_`  
  (or your custom prefix)

### Validation

- On the server → both server and client schemas are validated
- On the client → only the client schema is used
- Server values are completely removed from browser bundles

---

## 🧠 Type Inference Example

```ts
const env = createEnv({
  server: { FOO: z.number().int() },
  client: { NEXT_PUBLIC_BAR: z.string() },
  runtimeEnv: process.env,
});

// env.FOO → number
// env.client.NEXT_PUBLIC_BAR → string
```

---

## ❓ FAQ

### ✅ Can I change the client prefix?

Yes:

```ts
createEnv({
  clientPrefix: "PUBLIC_",
  ...
})
```

All client-visible variables must then start with `PUBLIC_`.

---

### ✅ Will server secrets ever appear in the browser?

❌ No.  
Server variables are **never** included in the client-side bundle.  
Accessing them in client code throws an error.

---

### ✅ Do I need separate env files for client and server?

No.  
A single unified `env.ts` works everywhere.

---

## 📄 License

MIT © Ali
