import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { OAuth2Strategy } from "./strategies/oauth2.strategy";
import { AuthResolver } from "./auth.resolver";
import { UserService } from "../user/user.service";
import { UserResolver } from "../user/user.resolver";
import { DatabaseModule } from "../db/database.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "oauth2" }),
    DatabaseModule,
  ],
  providers: [OAuth2Strategy, AuthResolver, UserResolver, UserService],
  exports: [PassportModule],
})
export class AuthModule {}
