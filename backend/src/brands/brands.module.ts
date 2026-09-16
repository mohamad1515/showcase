import { Module } from "@nestjs/common";
import { DatabaseModule } from "../db/database.module";
import { BrandsResolver } from "./brands.resolver";
import { BrandsService } from "./brands.service";

@Module({
  imports: [DatabaseModule],
  providers: [BrandsResolver, BrandsService],
})
export class BrandsModule {}
