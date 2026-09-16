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

  findAll() {
    return this.database.db.select().from(flavors).all();
  }

  create(input: CreateFlavorInput) {
    const name = input.name.trim();
    if (!name) throw new BadRequestException("نام طعم الزامی است.");
    const now = new Date().toISOString();
    return this.database.db
      .insert(flavors)
      .values({ name, createdAt: now, updatedAt: now })
      .returning()
      .get();
  }

  update(id: number, input: UpdateFlavorInput) {
    this.findById(id);
    const name = input.name?.trim();
    if (!name) throw new BadRequestException("نام طعم الزامی است.");
    return this.database.db
      .update(flavors)
      .set({ name, updatedAt: new Date().toISOString() })
      .where(eq(flavors.id, id))
      .returning()
      .get();
  }

  remove(id: number) {
    const flavor = this.findById(id);
    this.database.db.delete(flavors).where(eq(flavors.id, id)).run();
    return flavor;
  }

  private findById(id: number) {
    const flavor = this.database.db
      .select()
      .from(flavors)
      .where(eq(flavors.id, id))
      .get();
    if (!flavor) throw new NotFoundException("طعم پیدا نشد.");
    return flavor;
  }
}
