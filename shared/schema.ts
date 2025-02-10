import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Discord commands usage tracking
export const commandUsage = pgTable('command_usage', {
  id: serial('id').primaryKey(),
  commandName: varchar('command_name', { length: 50 }).notNull(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  guildId: varchar('guild_id', { length: 100 }).notNull(),
  usedAt: timestamp('used_at').defaultNow().notNull(),
});

// Bot status logging
export const botStatus = pgTable('bot_status', {
  id: serial('id').primaryKey(),
  status: varchar('status', { length: 20 }).notNull(), // 'online' or 'offline'
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  details: text('details'),
});

// Backup records
export const backupRecords = pgTable('backup_records', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  size: serial('size').notNull(), // in bytes
  status: varchar('status', { length: 20 }).notNull(), // 'success' or 'failed'
  error: text('error'),
});
