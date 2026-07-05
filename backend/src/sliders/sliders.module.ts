import { Module } from "@nestjs/common";
import { DatabaseModule } from "../db/database.module";
import { SlidersResolver } from "./sliders.resolver";
import { SlidersService } from "./sliders.service";

@Module({
  imports: [DatabaseModule],
  providers: [SlidersResolver, SlidersService],
})
export class SlidersModule {}
