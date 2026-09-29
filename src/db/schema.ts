import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["USER", "OWNER"]);
// Only "OWNER" accounts are created by the app today — the catalog is public
// and has no consumer accounts. "USER" is kept in the enum for forward
// compatibility (e.g. adding staff accounts later) but nothing creates one.

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  category: varchar("category", { length: 80 }).notNull(),
  sku: varchar("sku", { length: 60 }).notNull().unique(),
  supplier: varchar("supplier", { length: 200 }).notNull().default(""),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  unitsSold: integer("units_sold").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const activityActionEnum = pgEnum("activity_action", [
  "PRODUCT_ADDED",
  "PRODUCT_EDITED",
  "PRODUCT_REMOVED",
  "PRICE_CHANGED",
  "COST_CHANGED",
  "INVENTORY_CHANGED",
]);

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  productId: integer("product_id"),
  productName: varchar("product_name", { length: 200 }).notNull(),
  action: activityActionEnum("action").notNull(),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));
