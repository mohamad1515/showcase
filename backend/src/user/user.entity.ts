import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  provider_id!: string;

  @Field()
  created_at!: string;

  @Field()
  role!: string;

  @Field()
  is_active!: boolean;

  @Field({ nullable: true })
  password?: string;

  access_token?: string;

  refresh_token?: string;
}
