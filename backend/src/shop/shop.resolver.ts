import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { AddCartItemInput, UpdateCartItemInput } from "./shop.input";
import { Cart, Order } from "./shop.model";
import { ShopService } from "./shop.service";

@Resolver()
export class ShopResolver {
  constructor(private readonly shopService: ShopService) {}

  @Query(() => Cart)
  myCart(@Context("req") req: Request) {
    return this.shopService.getCart(this.currentUserId(req));
  }

  @Mutation(() => Cart)
  addCartItem(
    @Args("input") input: AddCartItemInput,
    @Context("req") req: Request,
  ) {
    return this.shopService.addCartItem(
      this.currentUserId(req),
      input.productSlug,
      input.quantity,
    );
  }

  @Mutation(() => Cart)
  updateCartItem(
    @Args("input") input: UpdateCartItemInput,
    @Context("req") req: Request,
  ) {
    return this.shopService.updateCartItem(
      this.currentUserId(req),
      input.itemId,
      input.quantity,
    );
  }

  @Mutation(() => Cart)
  removeCartItem(@Args("itemId") itemId: number, @Context("req") req: Request) {
    return this.shopService.removeCartItem(this.currentUserId(req), itemId);
  }

  @Mutation(() => Cart)
  clearCart(@Context("req") req: Request) {
    return this.shopService.clearCart(this.currentUserId(req));
  }

  @Mutation(() => Order)
  createOrderFromCart(@Context("req") req: Request) {
    return this.shopService.createOrderFromCart(this.currentUserId(req));
  }

  @Query(() => [Order])
  myOrders(@Context("req") req: Request) {
    return this.shopService.getOrders(this.currentUserId(req));
  }

  private currentUserId(req: Request) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;
    if (!token) throw new UnauthorizedException("Please sign in first.");

    const decoded = Buffer.from(token, "base64").toString("utf8");
    const userId = Number(decoded.split(":")[0]);
    if (!Number.isFinite(userId) || userId < 1) {
      throw new UnauthorizedException("Invalid session.");
    }
    return userId;
  }
}
