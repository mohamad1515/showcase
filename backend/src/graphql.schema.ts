import { registerEnumType } from "@nestjs/graphql";

export enum Roles {
  USER = "USER",
  ADMIN = "ADMIN",
}

registerEnumType(Roles, {
  name: "Roles",
  description: "User roles",
  valuesMap: {
    USER: { description: "Regular user" },
    ADMIN: { description: "Administrator" },
  },
});
