import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Category {
  @Field(() => ID)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
