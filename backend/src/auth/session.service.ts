import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Request } from "express";
import { UserService } from "../user/user.service";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: number;
}

const DEV_SECRET = "showcase-insecure-development-secret";
const DEFAULT_EXPIRY = "24h";
const UNIT_MS = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;

function parseDuration(value: string) {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(
      `Invalid JWT_EXPIRY "${value}". Use a number followed by s, m, h or d (for example 24h).`,
    );
  }
  return Number(match[1]) * UNIT_MS[match[2] as keyof typeof UNIT_MS];
}

/**
 * Signs and verifies login tokens and resolves the signed-in user for a request.
 * Every resolver that needs the current user or an admin check goes through here.
 * Roles are read from the database on each call, never from the token.
 */
@Injectable()
export class SessionService {
  private readonly secret: string;
  private readonly ttlMs: number;

  constructor(private readonly users: UserService) {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set when NODE_ENV=production.");
    }
    if (!secret) {
      new Logger(SessionService.name).warn(
        "JWT_SECRET is not set; using an insecure development secret.",
      );
    }
    this.secret = secret || DEV_SECRET;
    this.ttlMs = parseDuration(process.env.JWT_EXPIRY ?? DEFAULT_EXPIRY);
  }

  signToken(userId: number) {
    const payload = Buffer.from(
      JSON.stringify({ sub: userId, exp: Date.now() + this.ttlMs }),
    ).toString("base64url");
    return `${payload}.${this.sign(payload)}`;
  }

  /** Signed-in, active user. Throws 401 when the request has no valid session. */
  async requireUser(req: Pick<Request, "headers">): Promise<SessionUser> {
    const token = this.readToken(req);
    if (!token) throw new UnauthorizedException("Please sign in first.");

    const userId = this.verifyToken(token);
    if (userId === null) throw new UnauthorizedException("Invalid session.");

    const user = await this.findUser(userId);
    if (!user) throw new UnauthorizedException("Invalid session.");
    if (!user.isActive) {
      throw new UnauthorizedException("Your account is disabled.");
    }
    return user;
  }

  /** Signed-in admin. 401 without a valid session, 403 for non-admins. */
  async requireAdmin(req: Pick<Request, "headers">): Promise<SessionUser> {
    const user = await this.requireUser(req);
    if (user.role !== "ADMIN") {
      throw new ForbiddenException("Admin access required.");
    }
    return user;
  }

  /** The user when the request has a valid session, otherwise null. */
  async optionalUser(req: Pick<Request, "headers">): Promise<SessionUser | null> {
    try {
      return await this.requireUser(req);
    } catch (error) {
      if (error instanceof UnauthorizedException) return null;
      throw error;
    }
  }

  private readToken(req: Pick<Request, "headers">) {
    const header = req.headers.authorization;
    return header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : undefined;
  }

  private sign(payload: string) {
    return createHmac("sha256", this.secret).update(payload).digest("base64url");
  }

  private verifyToken(token: string): number | null {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra !== undefined) return null;

    const expected = Buffer.from(this.sign(payload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }

    try {
      const { sub, exp } = JSON.parse(
        Buffer.from(payload, "base64url").toString("utf8"),
      );
      if (!Number.isInteger(sub) || sub < 1) return null;
      if (typeof exp !== "number" || exp <= Date.now()) return null;
      return sub;
    } catch {
      return null;
    }
  }

  private async findUser(id: number): Promise<SessionUser | null> {
    try {
      const row = (await this.users.findById(id)) as UserRow;
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        isActive: Boolean(row.is_active),
      };
    } catch (error) {
      if (error instanceof NotFoundException) return null;
      throw error;
    }
  }
}
