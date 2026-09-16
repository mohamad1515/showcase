import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Brand {
  @Field(() => ID)
  id!: number;

  @Field()
  name!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
