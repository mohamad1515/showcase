import { Field, InputType, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateCategoryInput {
  @Field()
  slug!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {}
