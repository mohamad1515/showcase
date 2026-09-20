import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Request } from "express";
import { SessionService } from "../auth/session.service";
import { CreateCommentInput } from "./comment.input";
import {
  Comment,
  CommentStatus,
  ProductReviews,
  VoteType,
} from "./comment.model";
import { CommentsService } from "./comments.service";

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly session: SessionService,
  ) {}

  @Query(() => ProductReviews)
  async productReviews(
    @Args("productSlug") productSlug: string,
    @Context("req") req: Request,
  ) {
    const viewer = await this.session.optionalUser(req);
    return this.commentsService.findByProduct(productSlug, viewer?.id ?? null);
  }

  @Query(() => [Comment])
  async adminComments(
    @Args("status", { type: () => CommentStatus, nullable: true })
    status: CommentStatus | undefined,
    @Context("req") req: Request,
  ) {
    const admin = await this.session.requireAdmin(req);
    return this.commentsService.findAllForAdmin(admin.id, status);
  }

  @Mutation(() => Comment)
  async createComment(
    @Args("input") input: CreateCommentInput,
    @Context("req") req: Request,
  ) {
    const user = await this.session.requireUser(req);
    return this.commentsService.create(user.id, input);
  }

  @Mutation(() => Comment)
  async voteComment(
    @Args("commentId") commentId: number,
    @Args("type", { type: () => VoteType }) type: VoteType,
    @Context("req") req: Request,
  ) {
    const user = await this.session.requireUser(req);
    return this.commentsService.vote(user.id, commentId, type);
  }

  @Mutation(() => Comment)
  async replyToComment(
    @Args("commentId") commentId: number,
    @Args("content") content: string,
    @Context("req") req: Request,
  ) {
    const admin = await this.session.requireAdmin(req);
    return this.commentsService.reply(admin.id, commentId, content);
  }

  @Mutation(() => Comment)
  async updateComment(
    @Args("commentId") commentId: number,
    @Args("content") content: string,
    @Context("req") req: Request,
  ) {
    const admin = await this.session.requireAdmin(req);
    return this.commentsService.update(admin.id, commentId, content);
  }

  @Mutation(() => Comment)
  async removeComment(
    @Args("commentId") commentId: number,
    @Context("req") req: Request,
  ) {
    const admin = await this.session.requireAdmin(req);
    return this.commentsService.remove(admin.id, commentId);
  }
}
