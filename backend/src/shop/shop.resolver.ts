import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Request } from "express";
import { SessionService } from "../auth/session.service";
import { AddCartItemInput, UpdateCartItemInput } from "./shop.input";
import { Cart, Order } from "./shop.model";
import { ShopService } from "./shop.service";

@Resolver()
export class ShopResolver {
  constructor(
    private readonly shopService: ShopService,
    private readonly session: SessionService,
  ) {}

  @Query(() => Cart)
  async myCart(@Context("req") req: Request) {
    const user = await this.session.requireUser(req);
    return this.shopService.getCart(user.id);
  }

  @Mutation(() => Cart)
  async addCartItem(
    @Args("input") input: AddCartItemInput,
    @Context("req") req: Request,
  ) {
    const user = await this.session.requireUser(req);
    return this.shopService.addCartItem(
      user.id,
      input.productSlug,
      input.quantity,
    );
  }

  @Mutation(() => Cart)
  async updateCartItem(
    @Args("input") input: UpdateCartItemInput,
    @Context("req") req: Request,
  ) {
    const user = await this.session.requireUser(req);
    return this.shopService.updateCartItem(user.id, input.itemId, input.quantity);
  }

  @Mutation(() => Cart)
  async removeCartItem(
    @Args("itemId") itemId: number,
    @Context("req") req: Request,
  ) {
    const user = await this.session.requireUser(req);
    return this.shopService.removeCartItem(user.id, itemId);
  }

  @Mutation(() => Cart)
  async clearCart(@Context("req") req: Request) {
    const user = await this.session.requireUser(req);
    return this.shopService.clearCart(user.id);
  }

  @Mutation(() => Order)
  async createOrderFromCart(@Context("req") req: Request) {
    const user = await this.session.requireUser(req);
    return this.shopService.createOrderFromCart(user.id);
  }

  @Query(() => [Order])
  async myOrders(@Context("req") req: Request) {
    const user = await this.session.requireUser(req);
    return this.shopService.getOrders(user.id);
  }
}
