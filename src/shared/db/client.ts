import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
}

// En desarrollo, Next.js recarga el código al guardar. Guardar el pool en
// globalThis evita crear una conexión nueva en cada recarga.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
    globalForDb.pool ??
    new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : false,
    });

if (process.env.NODE_ENV !== "production") {
    globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });