import { Resolver, Query, Context, Mutation, Args } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { AuthResponse, SignupResponse } from "./auth.output";
import { SignupInput, LoginInput } from "./auth.input";
import { UserService } from "../user/user.service";
import { User } from "../user/user.entity";

interface AuthenticatedRequest extends Request {
  user: any;
}

interface UserRecord {
  id?: number | string;
  name?: string;
  email?: string;
  provider_id?: string;
  password?: string;
  role?: string;
  is_active?: number | boolean;
  [key: string]: any;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly userService: UserService) {}

  // Simple JWT-like token generation (in production, use a proper JWT library)
  private generateToken(userId: string | number): string {
    return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
  }

  @Mutation(() => SignupResponse)
  async signup(@Args("input") input: SignupInput) {
    // Check if user exists
    const existing = await this.userService.findByEmail(input.email);
    if (existing) {
      throw new Error("User already exists");
    }

    // Create new user (in production, hash the password!)
    const user = await this.userService.create({
      name: input.name,
      email: input.email,
      providerId: input.email, // Use email as provider ID for local auth
      password: input.password, // This should be hashed!
    });

    if (!user) throw new Error("Failed to create user");

    return {
      id: String((user as UserRecord).id),
      name: (user as UserRecord).name!,
      email: (user as UserRecord).email!,
      role: (user as UserRecord).role || "USER",
    };
  }

  @Mutation(() => AuthResponse)
  async login(@Args("input") input: LoginInput) {
    // Find user by email
    const user = await this.userService.findByEmail(input.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    if (!(user as UserRecord).is_active) {
      throw new Error("User is disabled");
    }

    // In production, compare hashed passwords
    if ((user as UserRecord).password !== input.password) {
      throw new Error("Invalid credentials");
    }

    const userRec = user as UserRecord;
    const token = this.generateToken(userRec.id || "");

    // Convert to User object for response
    const userResponse: User = {
      id: String(userRec.id),
      name: userRec.name!,
      email: userRec.email!,
      provider_id: userRec.provider_id!,
      created_at: userRec.created_at,
      role: userRec.role || "USER",
      is_active: Boolean(userRec.is_active),
      password: userRec.password,
    };

    return {
      token,
      user: userResponse,
    };
  }

  @Query(() => String)
  @UseGuards(AuthGuard("oauth2"))
  async olderLoginOAuth(@Context() ctx: { req: AuthenticatedRequest }) {
    return "Login successful";
  }

  @Query(() => User)
  @UseGuards(AuthGuard("oauth2"))
  async profile(@Context() ctx: { req: AuthenticatedRequest }) {
    return ctx.req.user;
  }
}
