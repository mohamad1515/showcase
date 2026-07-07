import { Field, InputType, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateProductInput {
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
  price!: string;

  @Field()
  weight!: string;

  @Field()
  quantity!: string;

  @Field(() => [String], { nullable: true })
  images?: string[];
}

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {}
