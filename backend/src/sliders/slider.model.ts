import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Slider {
  @Field(() => ID)
  id!: number;

  @Field()
  title!: string;

  @Field()
  subtitle!: string;

  @Field()
  image!: string;

  @Field()
  link!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
