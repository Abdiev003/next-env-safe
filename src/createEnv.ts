import { z } from "zod";
import { EnvConfigError, EnvValidationError } from "./errors";
import type {
  CreateEnvConfig,
  CreateEnvResult,
  InferFromSchemaMap,
  SchemaMap,
} from "./types";

const DEFAULT_PREFIX = "NEXT_PUBLIC_" as const;

function isError<T>(r: any): r is { success: false; error: z.ZodError<T> } {
  return r && r.success === false;
}

function makeObjectSchema(
  map: SchemaMap
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [k, v] of Object.entries(map)) {
    shape[k] = v;
  }
  return z.object(shape);
}

function prefixOk(key: string, prefix: string): boolean {
  return key.startsWith(prefix);
}

export function createEnv<Server extends SchemaMap, Client extends SchemaMap>(
  config: CreateEnvConfig<Server, Client>
): CreateEnvResult<InferFromSchemaMap<Server>, InferFromSchemaMap<Client>> {
  const {
    server,
    client,
    runtimeEnv,
    clientPrefix = DEFAULT_PREFIX,
    verbose,
  } = config;

  for (const key of Object.keys(server)) {
    if (prefixOk(key, clientPrefix)) {
      throw new EnvConfigError(
        `Server key "${key}" must NOT start with client prefix "${clientPrefix}".`
      );
    }
  }

  for (const key of Object.keys(client)) {
    if (!prefixOk(key, clientPrefix)) {
      throw new EnvConfigError(
        `Client key "${key}" must start with client prefix "${clientPrefix}".`
      );
    }
  }

  const serverSchema = makeObjectSchema(server);
  const clientSchema = makeObjectSchema(client);

  const isServer = typeof window === "undefined";

  const serverValues = isServer
    ? serverSchema.safeParse(runtimeEnv)
    : { success: true, data: {} as InferFromSchemaMap<Server> };

  const clientValues = clientSchema.safeParse(runtimeEnv);

  if (isError(serverValues)) {
    const issues = serverValues.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");

    throw new EnvValidationError(
      `Invalid SERVER env:\n${issues}\n\nHint: Ensure required server variables exist in your runtime.`
    );
  }

  if (isError(clientValues)) {
    const issues = clientValues.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");

    throw new EnvValidationError(
      `Invalid CLIENT env:\n${issues}\n\nHint: All client variables must be prefixed with '${clientPrefix}'.`
    );
  }

  const serverData = serverValues.success
    ? (serverValues.data as InferFromSchemaMap<Server>)
    : ({} as InferFromSchemaMap<Server>);

  const clientData = clientValues.data as InferFromSchemaMap<Client>;

  const target = {
    ...(isServer ? serverData : ({} as InferFromSchemaMap<Server>)),
    ...clientData,
    client: clientData,
  };

  if (verbose && isServer) {
    const missingServer = Object.keys(server).filter(
      (k) => target[k] === undefined
    );
    const missingClient = Object.keys(client).filter(
      (k) => target[k] === undefined
    );
    if (missingServer.length || missingClient.length) {
      console.warn("[next-env-safe] Missing keys", {
        missingServer,
        missingClient,
      });
    }
  }

  const frozenTarget = Object.freeze(target);

  const guarded = new Proxy(frozenTarget as any, {
    get(target, prop, receiver) {
      if (!isServer && typeof prop === "string" && prop in server) {
        throw new EnvConfigError(
          `Attempted to access server env key "${String(
            prop
          )}" from the client. Use env.client instead.`
        );
      }
      return Reflect.get(target, prop, receiver);
    },
  });

  return guarded as CreateEnvResult<
    InferFromSchemaMap<Server>,
    InferFromSchemaMap<Client>
  >;
}
