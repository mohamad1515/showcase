import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../db/database.service";

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async findByEmail(email: string) {
    // Using better-sqlite3 direct queries
    const stmt = this.db["sqlite"].prepare(
      "SELECT * FROM users WHERE email = ?",
    );
    return stmt.get(email) || null;
  }

  async findByProviderId(providerId: string) {
    const stmt = this.db["sqlite"].prepare(
      "SELECT * FROM users WHERE provider_id = ?",
    );
    return stmt.get(providerId) || null;
  }

  async create(input: {
    name: string;
    email: string;
    providerId: string;
    password?: string;
  }) {
    const now = new Date().toISOString();
    const stmt = this.db["sqlite"].prepare(`
      INSERT INTO users (name, email, provider_id, password, role, is_active, created_at)
      VALUES (?, ?, ?, ?, 'USER', 1, ?)
    `);
    stmt.run(
      input.name,
      input.email,
      input.providerId,
      input.password || null,
      now,
    );
    return this.findByEmail(input.email);
  }

  async findAll() {
    return this.db["sqlite"].prepare("SELECT * FROM users ORDER BY id DESC").all();
  }

  async findById(id: number) {
    const user = this.db["sqlite"].prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async update(id: number, input: { name?: string; email?: string; password?: string }) {
    this.findById(id);
    const current = this.findById(id) as any;
    this.db["sqlite"]
      .prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?")
      .run(input.name ?? current.name, input.email ?? current.email, input.password ?? current.password, id);
    return this.findById(id);
  }

  async setActive(id: number, isActive: boolean) {
    this.findById(id);
    this.db["sqlite"]
      .prepare("UPDATE users SET is_active = ? WHERE id = ?")
      .run(isActive ? 1 : 0, id);
    return this.findById(id);
  }

  async findOrCreate(
    profile: any,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    let user = await this.findByProviderId(profile.id);

    if (!user) {
      const now = new Date().toISOString();
      const stmt = this.db["sqlite"].prepare(`
        INSERT INTO users (name, email, provider_id, access_token, refresh_token, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        profile.displayName || profile.name,
        profile.emails?.[0].value,
        profile.id,
        tokens.accessToken,
        tokens.refreshToken,
        now,
      );
      user = await this.findByProviderId(profile.id);
    } else {
      const stmt = this.db["sqlite"].prepare(`
        UPDATE users SET access_token = ?, refresh_token = ? WHERE provider_id = ?
      `);
      stmt.run(tokens.accessToken, tokens.refreshToken, profile.id);
      user = await this.findByProviderId(profile.id);
    }

    return user;
  }
}
