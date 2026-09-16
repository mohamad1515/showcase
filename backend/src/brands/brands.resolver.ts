import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateBrandInput, UpdateBrandInput } from "./brand.input";
import { Brand } from "./brand.model";
import { BrandsService } from "./brands.service";

@Resolver(() => Brand)
export class BrandsResolver {
  constructor(private readonly brandsService: BrandsService) {}
  @Query(() => [Brand]) brands() {
    return this.brandsService.findAll();
  }
  @Mutation(() => Brand) createBrand(@Args("input") input: CreateBrandInput) {
    return this.brandsService.create(input);
  }
  @Mutation(() => Brand) updateBrand(
    @Args("id") id: number,
    @Args("input") input: UpdateBrandInput,
  ) {
    return this.brandsService.update(id, input);
  }
  @Mutation(() => Brand) removeBrand(@Args("id") id: number) {
    return this.brandsService.remove(id);
  }
}
