import { Field, InputType, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateBrandInput {
  @Field()
  name!: string;
}

@InputType()
export class UpdateBrandInput extends PartialType(CreateBrandInput) {}
