import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateProductInput, UpdateProductInput } from "./product.input";
import { Product } from "./product.model";
import { ProductsService } from "./products.service";

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query(() => [Product])
  products(@Args("category", { nullable: true }) category?: string) {
    return this.productsService.findAll(category);
  }

  @Query(() => Product)
  product(@Args("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Mutation(() => Product)
  createProduct(@Args("input") input: CreateProductInput) {
    return this.productsService.create(input);
  }

  @Mutation(() => Product)
  updateProduct(@Args("slug") slug: string, @Args("input") input: UpdateProductInput) {
    return this.productsService.update(slug, input);
  }

  @Mutation(() => Product)
  removeProduct(@Args("slug") slug: string) {
    return this.productsService.remove(slug);
  }
}
