import { Field, InputType, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateProductInput {
  @Field()
  persianName!: string;

  @Field()
  englishName!: string;

  @Field()
  brand!: string;

  @Field(() => [String], { nullable: true })
  brands?: string[];

  @Field({ defaultValue: "active" })
  status!: string;

  @Field({ nullable: true })
  flavor?: string;

  @Field(() => [String], { nullable: true })
  flavors?: string[];

  @Field()
  productType!: string;

  @Field()
  category!: string;

  @Field(() => [String])
  features!: string[];

  @Field()
  summary!: string;

  @Field()
  description!: string;

  @Field()
  price!: string;

  @Field()
  weight!: string;

  @Field({ nullable: true })
  compareAtPrice?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  stock?: number;

  @Field({ nullable: true })
  mainImage?: string;

  @Field(() => [String], { nullable: true })
  galleryImages?: string[];
}

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {}
