import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-oauth2";
import { Profile } from "passport";

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, "oauth2") {
  constructor() {
    super({
      authorizationURL: "YOUR_OAUTH_PROVIDER_AUTH_URL",
      tokenURL: "YOUR_OAUTH_PROVIDER_TOKEN_URL",
      clientID: "YOUR_CLIENT_ID",
      clientSecret: "YOUR_CLIENT_SECRET",
      callbackURL: "YOUR_CALLBACK_URL",
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    // Validate and return user
    return { accessToken, refreshToken, profile };
  }
}
