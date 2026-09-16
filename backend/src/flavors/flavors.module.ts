import { Module } from "@nestjs/common";
import { DatabaseModule } from "../db/database.module";
import { FlavorsResolver } from "./flavors.resolver";
import { FlavorsService } from "./flavors.service";

@Module({
  imports: [DatabaseModule],
  providers: [FlavorsResolver, FlavorsService],
})
export class FlavorsModule {}
