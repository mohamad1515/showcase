import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Product {
  @Field(() => ID)
  id!: number;

  @Field()
  slug!: string;

  @Field()
  persianName!: string;

  @Field()
  englishName!: string;

  @Field()
  brand!: string;

  @Field(() => [String])
  brands!: string[];

  @Field()
  status!: string;

  @Field()
  rating!: number;

  @Field()
  flavor!: string;

  @Field(() => [String])
  flavors!: string[];

  @Field()
  productType!: string;

  @Field()
  summary!: string;

  @Field()
  description!: string;

  @Field({ nullable: true })
  ingredients?: string;

  @Field({ nullable: true })
  nutritionFacts?: string;

  @Field({ nullable: true })
  usageInstructions?: string;

  @Field({ nullable: true })
  warnings?: string;

  @Field({ nullable: true }) manufacturer?: string;
  @Field({ nullable: true }) countryOfOrigin?: string;
  @Field({ nullable: true }) servingSize?: string;
  @Field({ nullable: true }) servingsPerContainer?: string;
  @Field({ nullable: true }) traceabilityCode?: string;
  @Field({ nullable: true }) expiryInfo?: string;

  @Field(() => [String])
  features!: string[];

  @Field()
  category!: string;

  @Field({ nullable: true })
  categoryName?: string;

  @Field()
  price!: string;

  @Field({ nullable: true })
  compareAtPrice?: string;

  @Field()
  weight!: string;

  @Field()
  reviewCount!: number;

  @Field({ nullable: true })
  salesCount?: number;

  @Field()
  stock!: number;

  @Field()
  mainImage!: string;

  @Field(() => [String])
  galleryImages!: string[];

  @Field(() => [String])
  tags!: string[];

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  tagline?: string;

  @Field({ nullable: true })
  quantity?: string;

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
