import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Product } from "../products/product.model";

@ObjectType()
export class CartItem {
  @Field(() => ID)
  id!: number;

  @Field()
  quantity!: number;

  @Field()
  lineTotal!: string;

  @Field(() => Product)
  product!: Product;
}

@ObjectType()
export class Cart {
  @Field(() => ID)
  id!: number;

  @Field(() => [CartItem])
  items!: CartItem[];

  @Field()
  total!: string;

  @Field()
  itemCount!: number;
}

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  id!: number;

  @Field()
  productId!: number;

  @Field()
  productName!: string;

  @Field()
  unitPrice!: string;

  @Field()
  quantity!: number;

  @Field()
  total!: string;
}

@ObjectType()
export class Order {
  @Field(() => ID)
  id!: number;

  @Field()
  status!: string;

  @Field()
  total!: string;

  @Field()
  createdAt!: string;

  @Field(() => [OrderItem])
  items!: OrderItem[];
}
