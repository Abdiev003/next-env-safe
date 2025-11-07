import type { z } from "zod";

export type SchemaMap = Record<string, z.ZodTypeAny>;

export type CreateEnvConfig<
  Server extends SchemaMap,
  Client extends SchemaMap
> = {
  /** Server-only variables (MUST NOT start with clientPrefix) */
  server: Server;
  /** Client-exposed variables (MUST start with clientPrefix, default: NEXT_PUBLIC_) */
  client: Client;
  /** Typically pass `process.env` here */
  runtimeEnv: Record<string, string | undefined>;
  /** Prefix for client-visible envs (defaults to NEXT_PUBLIC_) */
  clientPrefix?: string;
  /** Enable verbose logs in development */
  verbose?: boolean;
};

export type InferFromSchemaMap<M extends SchemaMap> = {
  [K in keyof M]: z.infer<M[K]>;
};

export type CreateEnvResult<ServerOut, ClientOut> = Readonly<
  ServerOut & ClientOut
> & {
  /** Safe subset for importing in Client Components */
  client: Readonly<ClientOut>;
};
