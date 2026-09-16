import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateFlavorInput, UpdateFlavorInput } from "./flavor.input";
import { Flavor } from "./flavor.model";
import { FlavorsService } from "./flavors.service";

@Resolver(() => Flavor)
export class FlavorsResolver {
  constructor(private readonly flavorsService: FlavorsService) {}

  @Query(() => [Flavor])
  flavors() {
    return this.flavorsService.findAll();
  }

  @Mutation(() => Flavor)
  createFlavor(@Args("input") input: CreateFlavorInput) {
    return this.flavorsService.create(input);
  }

  @Mutation(() => Flavor)
  updateFlavor(
    @Args("id") id: number,
    @Args("input") input: UpdateFlavorInput,
  ) {
    return this.flavorsService.update(id, input);
  }

  @Mutation(() => Flavor)
  removeFlavor(@Args("id") id: number) {
    return this.flavorsService.remove(id);
  }
}
