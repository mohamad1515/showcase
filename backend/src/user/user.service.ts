import { Injectable, NotFoundException } from "@nestjs/common";
import { desc, eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { users } from "../db/schema";

/**
 * Consumers of this service (auth.resolver.ts, session.service.ts,
 * user.entity.ts) expect the legacy snake_case row shape
 * (`provider_id`, `is_active`, `created_at`, ...), so every row coming out
 * of Drizzle (which uses the camelCase JS property names from schema.ts) is
 * mapped back to that shape here. This keeps the GraphQL `User` type and its
 * resolvers unchanged while the storage layer itself goes through Drizzle's
 * query builder instead of raw SQL.
 */
function toLegacyRow(row: typeof users.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    provider_id: row.providerId,
    password: row.password,
    role: row.role,
    is_active: row.isActive,
    access_token: row.accessToken,
    refresh_token: row.refreshToken,
    created_at: row.createdAt,
  };
}

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async findByEmail(email: string) {
    const row = await this.db.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0]);
    return row ? toLegacyRow(row) : null;
  }

  async findByProviderId(providerId: string) {
    const row = await this.db.db
      .select()
      .from(users)
      .where(eq(users.providerId, providerId))
      .then((rows) => rows[0]);
    return row ? toLegacyRow(row) : null;
  }

  async create(input: {
    name: string;
    email: string;
    providerId: string;
    password?: string;
  }) {
    const now = new Date().toISOString();
    await this.db.db.insert(users).values({
      name: input.name,
      email: input.email,
      providerId: input.providerId,
      password: input.password || null,
      role: "USER",
      isActive: true,
      createdAt: now,
    });
    return this.findByEmail(input.email);
  }

  async findAll() {
    const rows = await this.db.db
      .select()
      .from(users)
      .orderBy(desc(users.id));
    return rows.map(toLegacyRow);
  }

  async findById(id: number) {
    const row = await this.db.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .then((rows) => rows[0]);
    if (!row) throw new NotFoundException("User not found");
    return toLegacyRow(row);
  }

  async update(
    id: number,
    input: { name?: string; email?: string; password?: string },
  ) {
    const current = await this.findById(id);
    await this.db.db
      .update(users)
      .set({
        name: input.name ?? current.name,
        email: input.email ?? current.email,
        password: input.password ?? current.password,
      })
      .where(eq(users.id, id));
    return this.findById(id);
  }

  async setActive(id: number, isActive: boolean) {
    await this.findById(id);
    await this.db.db
      .update(users)
      .set({ isActive })
      .where(eq(users.id, id));
    return this.findById(id);
  }

  async findOrCreate(
    profile: any,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    let user = await this.findByProviderId(profile.id);

    if (!user) {
      const now = new Date().toISOString();
      await this.db.db.insert(users).values({
        name: profile.displayName || profile.name,
        email: profile.emails?.[0].value,
        providerId: profile.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        createdAt: now,
      });
      user = await this.findByProviderId(profile.id);
    } else {
      await this.db.db
        .update(users)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        })
        .where(eq(users.providerId, profile.id));
      user = await this.findByProviderId(profile.id);
    }

    return user;
  }
}
