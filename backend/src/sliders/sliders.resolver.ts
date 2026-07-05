import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateSliderInput, UpdateSliderInput } from "./slider.input";
import { Slider } from "./slider.model";
import { SlidersService } from "./sliders.service";

@Resolver(() => Slider)
export class SlidersResolver {
  constructor(private readonly slidersService: SlidersService) {}

  @Query(() => [Slider])
  sliders() {
    return this.slidersService.findAll();
  }

  @Query(() => Slider)
  slider(@Args("id") id: number) {
    return this.slidersService.findById(id);
  }

  @Mutation(() => Slider)
  createSlider(@Args("input") input: CreateSliderInput) {
    return this.slidersService.create(input);
  }

  @Mutation(() => Slider)
  updateSlider(
    @Args("id") id: number,
    @Args("input") input: UpdateSliderInput,
  ) {
    return this.slidersService.update(id, input);
  }

  @Mutation(() => Slider)
  removeSlider(@Args("id") id: number) {
    return this.slidersService.remove(id);
  }
}
