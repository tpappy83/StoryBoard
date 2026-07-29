import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table using Firebase Auth UID.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'projects' table for storing narrative project state in Cloud SQL.
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  projectId: text('project_id').notNull().unique(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  userUid: text('user_uid').notNull(),
  title: text('title').notNull(),
  tagline: text('tagline').notNull().default(''),
  genre: text('genre').notNull().default('Science Fiction'),
  worldSetting: text('world_setting').notNull().default(''),
  continuityScore: integer('continuity_score').notNull().default(100),
  projectData: text('project_data').notNull(), // JSON stringified state
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  owner: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));
