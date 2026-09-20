import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateCommentInput {
  @Field()
  productSlug!: string;

  @Field(() => Int)
  rating!: number;

  @Field()
  content!: string;
}
