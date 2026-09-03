import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class AddCartItemInput {
  @Field()
  productSlug!: string;

  @Field({ defaultValue: 1 })
  quantity!: number;
}

@InputType()
export class UpdateCartItemInput {
  @Field()
  itemId!: number;

  @Field()
  quantity!: number;
}
