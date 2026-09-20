import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../db/database.module";
import { ShopResolver } from "./shop.resolver";
import { ShopService } from "./shop.service";

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [ShopResolver, ShopService],
})
export class ShopModule {}
