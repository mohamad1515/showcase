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

  findAll() {
    return this.database.db.select().from(sliders).all();
  }

  findById(id: number) {
    const slider = this.database.db
      .select()
      .from(sliders)
      .where(eq(sliders.id, id))
      .get();
    if (!slider) throw new NotFoundException("Slide not found");
    return slider;
  }

  create(input: CreateSliderInput) {
    const now = new Date().toISOString();
    return this.database.db
      .insert(sliders)
      .values({
        title: input.title.trim(),
        subtitle: input.subtitle.trim(),
        image: input.image.trim(),
        link: input.link?.trim() || "/products",
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();
  }

  update(id: number, input: UpdateSliderInput) {
    this.findById(id);
    const values: Partial<NewSliderRow> = {
      ...(input.title ? { title: input.title.trim() } : {}),
      ...(input.subtitle ? { subtitle: input.subtitle.trim() } : {}),
      ...(input.image ? { image: input.image.trim() } : {}),
      ...(input.link ? { link: input.link.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };
    return this.database.db
      .update(sliders)
      .set(values)
      .where(eq(sliders.id, id))
      .returning()
      .get();
  }

  remove(id: number) {
    const count = this.database.db.select().from(sliders).all().length;
    if (count <= 1) {
      throw new BadRequestException("At least one slide is required");
    }
    const slider = this.findById(id);
    this.database.db.delete(sliders).where(eq(sliders.id, id)).run();
    return slider;
  }
}
