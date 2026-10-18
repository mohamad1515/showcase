import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../db/database.service";
import { NewSliderRow, sliders } from "../db/schema";
import { CreateSliderInput, UpdateSliderInput } from "./slider.input";

@Injectable()
export class SlidersService {
  constructor(private readonly database: DatabaseService) {}

  async findAll() {
    return this.database.db.select().from(sliders);
  }

  async findById(id: number) {
    const slider = await this.database.db
      .select()
      .from(sliders)
      .where(eq(sliders.id, id))
      .then((rows) => rows[0]);
    if (!slider) throw new NotFoundException("Slide not found");
    return slider;
  }

  async create(input: CreateSliderInput) {
    const now = new Date().toISOString();
    const [slider] = await this.database.db
      .insert(sliders)
      .values({
        title: input.title.trim(),
        subtitle: input.subtitle.trim(),
        image: input.image.trim(),
        link: input.link?.trim() || "/products",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return slider;
  }

  async update(id: number, input: UpdateSliderInput) {
    await this.findById(id);
    const values: Partial<NewSliderRow> = {
      ...(input.title ? { title: input.title.trim() } : {}),
      ...(input.subtitle ? { subtitle: input.subtitle.trim() } : {}),
      ...(input.image ? { image: input.image.trim() } : {}),
      ...(input.link ? { link: input.link.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };
    const [slider] = await this.database.db
      .update(sliders)
      .set(values)
      .where(eq(sliders.id, id))
      .returning();
    return slider;
  }

  async remove(id: number) {
    const all = await this.database.db.select().from(sliders);
    if (all.length <= 1) {
      throw new BadRequestException("At least one slide is required");
    }
    const slider = await this.findById(id);
    await this.database.db.delete(sliders).where(eq(sliders.id, id));
    return slider;
  }
}
