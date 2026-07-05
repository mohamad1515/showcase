import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { User } from "./user.entity";
import { CreateUserInput, UpdateUserInput } from "./user.input";
import { UserService } from "./user.service";

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  users() {
    return this.userService.findAll();
  }

  @Query(() => User)
  user(@Args("id") id: number) {
    return this.userService.findById(id);
  }

  @Mutation(() => User)
  createUser(@Args("input") input: CreateUserInput) {
    return this.userService.create({
      ...input,
      providerId: input.email,
    });
  }

  @Mutation(() => User)
  updateUser(@Args("id") id: number, @Args("input") input: UpdateUserInput) {
    return this.userService.update(id, input);
  }

  @Mutation(() => User)
  setUserActive(@Args("id") id: number, @Args("isActive") isActive: boolean) {
    return this.userService.setActive(id, isActive);
  }
}
