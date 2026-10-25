import { sql } from "drizzle-orm";
import {
    boolean,
    integer,
    pgTable,
    smallint,
    timestamp,
    uniqueIndex,
    varchar,
} from "drizzle-orm/pg-core";
import { roles } from "./roles";

export const users = pgTable(
    "users",
    {
        id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
        fullName: varchar("full_name", { length: 120 }).notNull(),
        email: varchar("email", { length: 160 }).notNull(),
        passwordHash: varchar("password_hash", { length: 255 }).notNull(),
        roleId: integer("role_id")
            .notNull()
            .references(() => roles.id),
        isActive: boolean("is_active").notNull().default(true),
        failedAttempts: smallint("failed_attempts").notNull().default(0),
        lockedUntil: timestamp("locked_until", { withTimezone: true }),
        lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [uniqueIndex("users_email_key").on(sql`lower(${table.email})`)],
);