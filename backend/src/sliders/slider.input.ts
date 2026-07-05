import { Field, InputType, PartialType } from "@nestjs/graphql";

@InputType()
export class CreateSliderInput {
  @Field()
  title!: string;

  @Field()
  subtitle!: string;

  @Field()
  image!: string;

  @Field({ nullable: true })
  link?: string;
}

@InputType()
export class UpdateSliderInput extends PartialType(CreateSliderInput) {}
