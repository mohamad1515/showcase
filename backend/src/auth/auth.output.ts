import { ObjectType, Field } from "@nestjs/graphql";
import { User } from "../user/user.entity";

@ObjectType()
export class AuthResponse {
  @Field()
  token!: string;

  @Field(() => User)
  user!: User;
}

@ObjectType()
export class SignupResponse {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  role!: string;
}
