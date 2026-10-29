import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Request } from "express";
import { SessionService } from "../auth/session.service";
import { User } from "./user.entity";
import { CreateUserInput, UpdateUserInput } from "./user.input";
import { UserService } from "./user.service";

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService, private readonly session: SessionService) {}

  @Query(() => User)
  async myProfile(@Context("req") req: Request) {
    const user = await this.session.requireUser(req);
    return this.userService.findById(user.id);
  }

  @Mutation(() => User)
  async updateMyProfile(@Args("name") name: string, @Context("req") req: Request) {
    const user = await this.session.requireUser(req);
    return this.userService.update(user.id, { name });
  }

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
