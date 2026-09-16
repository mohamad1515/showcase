import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { brands } from "../db/schema";
import { CreateBrandInput, UpdateBrandInput } from "./brand.input";

@Injectable()
export class BrandsService {
  constructor(private readonly database: DatabaseService) {}

  findAll() {
    return this.database.db.select().from(brands).all();
  }

  create(input: CreateBrandInput) {
    const name = input.name.trim();
    if (!name) throw new BadRequestException("نام برند الزامی است.");
    const now = new Date().toISOString();
    return this.database.db
      .insert(brands)
      .values({ name, createdAt: now, updatedAt: now })
      .returning()
      .get();
  }

  update(id: number, input: UpdateBrandInput) {
    this.findById(id);
    const name = input.name?.trim();
    if (!name) throw new BadRequestException("نام برند الزامی است.");
    return this.database.db
      .update(brands)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(brands.id, id))
      .returning()
      .get();
  }

  remove(id: number) {
    const brand = this.findById(id);
    this.database.db.delete(brands).where(eq(brands.id, id)).run();
    return brand;
  }

  private findById(id: number) {
    const brand = this.database.db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .get();
    if (!brand) throw new NotFoundException("برند پیدا نشد.");
    return brand;
  }
}
