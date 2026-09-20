import {
  Field,
  Float,
  ID,
  Int,
  ObjectType,
  registerEnumType,
} from "@nestjs/graphql";

export enum CommentStatus {
  UNANSWERED = "UNANSWERED",
  ANSWERED = "ANSWERED",
}

export enum VoteType {
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

registerEnumType(CommentStatus, { name: "CommentStatus" });
registerEnumType(VoteType, { name: "VoteType" });

@ObjectType()
export class Reply {
  @Field(() => ID)
  id!: number;

  @Field()
  content!: string;

  @Field()
  adminName!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}

@ObjectType()
export class Comment {
  @Field(() => ID)
  id!: number;

  @Field()
  userName!: string;

  @Field(() => Int)
  rating!: number;

  @Field()
  content!: string;

  @Field(() => CommentStatus)
  status!: CommentStatus;

  @Field()
  editedByAdmin!: boolean;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;

  @Field(() => Int)
  likeCount!: number;

  @Field(() => Int)
  dislikeCount!: number;

  @Field(() => VoteType, { nullable: true })
  myVote?: VoteType;

  @Field(() => Reply, { nullable: true })
  reply?: Reply;

  @Field()
  productSlug!: string;

  @Field()
  productName!: string;
}

@ObjectType()
export class ProductReviews {
  @Field(() => Float)
  average!: number;

  @Field(() => Int)
  count!: number;

  /** Number of reviews per star, index 0 = 1 star ... index 4 = 5 stars. */
  @Field(() => [Int])
  distribution!: number[];

  @Field(() => [Comment])
  comments!: Comment[];
}
