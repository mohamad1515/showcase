import { Module } from "@nestjs/common";
import { DatabaseModule } from "../db/database.module";
import { ShopResolver } from "./shop.resolver";
import { ShopService } from "./shop.service";

@Module({
  imports: [DatabaseModule],
  providers: [ShopResolver, ShopService],
})
export class ShopModule {}
