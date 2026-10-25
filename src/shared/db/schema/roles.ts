import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
    id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
    code: varchar("code", { length: 30 }).notNull().unique(),
    name: varchar("name", { length: 80 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});