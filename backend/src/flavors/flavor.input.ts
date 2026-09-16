import { Field, InputType, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateFlavorInput {
  @Field()
  name!: string;
}

@InputType()
export class UpdateFlavorInput extends PartialType(CreateFlavorInput) {}
