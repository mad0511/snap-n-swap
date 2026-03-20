import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const itemStatusEnum = pgEnum("item_status", [
  "active",
  "sold",
  "swapped",
  "removed",
]);

export const swapStatusEnum = pgEnum("swap_status", [
  "pending",
  "accepted",
  "rejected",
  "completed",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  brand: text("brand"),
  condition: text("condition").notNull(),
  size: text("size"),
  color: text("color"),
  estimatedPrice: numeric("estimated_price", { precision: 10, scale: 2 }).notNull(),
  askingPrice: numeric("asking_price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  imageUrls: text("image_urls").array(),
  status: itemStatusEnum("status").default("active").notNull(),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const swaps = pgTable("swaps", {
  id: uuid("id").defaultRandom().primaryKey(),
  initiatorItemId: uuid("initiator_item_id")
    .references(() => items.id)
    .notNull(),
  targetItemId: uuid("target_item_id")
    .references(() => items.id)
    .notNull(),
  initiatorUserId: uuid("initiator_user_id")
    .references(() => users.id)
    .notNull(),
  targetUserId: uuid("target_user_id")
    .references(() => users.id)
    .notNull(),
  message: text("message"),
  status: swapStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .references(() => items.id)
    .notNull(),
  buyerUserId: uuid("buyer_user_id")
    .references(() => users.id)
    .notNull(),
  sellerUserId: uuid("seller_user_id")
    .references(() => users.id)
    .notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paid: boolean("paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
