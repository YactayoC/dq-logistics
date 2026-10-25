import { relations } from "drizzle-orm";
import { roles } from "./roles";
import { users } from "./users";

export const rolesRelations = relations(roles, ({ many }) => ({
    users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
    role: one(roles, {
        fields: [users.roleId],
        references: [roles.id],
    }),
}));