import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { flavors } from "../db/schema";
import { CreateFlavorInput, UpdateFlavorInput } from "./flavor.input";

@Injectable()
export class FlavorsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db.select().from(flavors);
  }

  async create(input: CreateFlavorInput) {
    const name = input.name.trim();
    if (!name) throw new BadRequestException("نام طعم الزامی است.");
    const now = new Date().toISOString();
    const [flavor] = await this.database.db
      .insert(flavors)
      .values({ name, createdAt: now, updatedAt: now })
      .returning();
    return flavor;
  }

  async update(id: number, input: UpdateFlavorInput) {
    await this.findById(id);
    const name = input.name?.trim();
    if (!name) throw new BadRequestException("نام طعم الزامی است.");
    const [flavor] = await this.database.db
      .update(flavors)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(flavors.id, id))
      .returning();
    return flavor;
  }

  async remove(id: number) {
    const flavor = await this.findById(id);
    await this.database.db.delete(flavors).where(eq(flavors.id, id));
    return flavor;
  }

  private async findById(id: number) {
    const flavor = await this.database.db
      .select()
      .from(flavors)
      .where(eq(flavors.id, id))
      .then((rows) => rows[0]);
    if (!flavor) throw new NotFoundException("طعم پیدا نشد.");
    return flavor;
  }
}
