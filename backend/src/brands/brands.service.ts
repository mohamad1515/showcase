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

  async findAll() {
    return this.database.db.select().from(brands);
  }

  async create(input: CreateBrandInput) {
    const name = input.name.trim();
    if (!name) throw new BadRequestException("نام برند الزامی است.");
    const now = new Date().toISOString();
    const [brand] = await this.database.db
      .insert(brands)
      .values({ name, createdAt: now, updatedAt: now })
      .returning();
    return brand;
  }

  async update(id: number, input: UpdateBrandInput) {
    await this.findById(id);
    const name = input.name?.trim();
    if (!name) throw new BadRequestException("نام برند الزامی است.");
    const [brand] = await this.database.db
      .update(brands)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(brands.id, id))
      .returning();
    return brand;
  }

  async remove(id: number) {
    const brand = await this.findById(id);
    await this.database.db.delete(brands).where(eq(brands.id, id));
    return brand;
  }

  private async findById(id: number) {
    const brand = await this.database.db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .then((rows) => rows[0]);
    if (!brand) throw new NotFoundException("برند پیدا نشد.");
    return brand;
  }
}
