import { NewProductRow } from "./schema";

const now = new Date().toISOString();

export const seedProducts: NewProductRow[] = [
  {
    slug: "whey-protein-gold",
    name: "Whey Protein Gold",
    tagline: "Fast protein support for recovery and lean muscle goals",
    summary: "A training-friendly whey protein for daily shakes and post-workout recovery.",
    description:
      "Whey Protein Gold is designed for athletes who want a practical protein source after training. It fits well beside a balanced nutrition plan and regular strength work.",
    features: ["24g protein per serving", "Easy mixing", "Good for lean bulking"],
    category: "popular",
    price: "2,450,000 Toman",
    weight: "2 kg",
    createdAt: now,
    updatedAt: now,
  },
  {
    slug: "creatine-monohydrate",
    name: "Creatine Monohydrate",
    tagline: "Strength and power support for heavy sets",
    summary: "A simple creatine formula for strength training and repeated high-effort movement.",
    description:
      "Creatine Monohydrate is one of the most common sports supplements for supporting training output. Use it with enough water and a consistent plan.",
    features: ["Pure formula", "Unflavored", "Good for strength cycles"],
    category: "best-selling",
    price: "890,000 Toman",
    weight: "300 g",
    createdAt: now,
    updatedAt: now,
  },
  {
    slug: "bcaa-aminos",
    name: "BCAA Aminos",
    tagline: "Amino support for long training sessions",
    summary: "A branched-chain amino blend for before, during, or after demanding workouts.",
    description:
      "BCAA Aminos is suitable for athletes with long sessions or reduced-calorie diets who want an easy flavored drink around training.",
    features: ["2:1:1 ratio", "Light fruit taste", "Good for cutting phases"],
    category: "popular",
    price: "1,120,000 Toman",
    weight: "400 g",
    createdAt: now,
    updatedAt: now,
  },
];
