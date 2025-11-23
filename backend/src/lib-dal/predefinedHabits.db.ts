// src/lib-dal/predefinedHabits.db.ts
import { db } from "../db/index.js";
import { predefinedHabits } from "../db/schema.js";
import { asc } from "drizzle-orm";

export async function getAllPredefinedHabits() {
  return db
    .select()
    .from(predefinedHabits)
    .orderBy(asc(predefinedHabits.displayOrder), asc(predefinedHabits.name));
}

