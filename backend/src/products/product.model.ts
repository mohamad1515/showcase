import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Product {
  @Field(() => ID)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field()
  tagline!: string;

  @Field()
  summary!: string;

  @Field()
  description!: string;

  @Field(() => [String])
  features!: string[];

  @Field()
  category!: string;

  @Field()
  productType!: string;

  @Field()
  price!: string;

  @Field()
  weight!: string;

  @Field()
  quantity!: string;

  @Field(() => [String])
  tags!: string[];

  @Field()
  stock!: number;

  @Field(() => [String])
  images!: string[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
