import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Category } from "./category.model";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.input";
import { CategoriesService } from "./categories.service";

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Query(() => [Category])
  categories() {
    return this.categoriesService.findAll();
  }

  @Query(() => Category)
  category(@Args("slug") slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Mutation(() => Category)
  createCategory(@Args("input") input: CreateCategoryInput) {
    return this.categoriesService.create(input);
  }

  @Mutation(() => Category)
  updateCategory(
    @Args("slug") slug: string,
    @Args("input") input: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(slug, input);
  }

  @Mutation(() => Category)
  removeCategory(@Args("slug") slug: string) {
    return this.categoriesService.remove(slug);
  }
}
