import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../db/database.module";
import { CommentsResolver } from "./comments.resolver";
import { CommentsService } from "./comments.service";

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [CommentsResolver, CommentsService],
})
export class CommentsModule {}
