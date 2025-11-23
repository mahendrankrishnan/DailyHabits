// src/lib-dal/habits.db.ts
import { db } from "../db/index.js";
import { habits } from "../db/schema.js";
import { ilike, sql, desc, eq, or } from "drizzle-orm";

export async function getAllHabits(search?: string) {
  if (search && search.trim() !== '') {
    const searchTerm = `%${search.trim()}%`;

    return db
      .select()
      .from(habits)
      .where(
        or(
          ilike(habits.name, searchTerm),
          sql`${habits.description} ILIKE ${searchTerm}`
        )
      )
      .orderBy(desc(habits.createdAt));
  }

  return db.select().from(habits).orderBy(desc(habits.createdAt));
}

export async function getHabitById(id: number) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(eq(habits.id, id))
    .limit(1);

  return habit ?? null;
}

export async function createHabit(data: {
  name: string;
  description?: string | null;
  color?: string;
}) {
  const [habit] = await db
    .insert(habits)
    .values({
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? "#3b82f6",
    })
    .returning();

  return habit;
}

export async function updateHabit(id: number, data: {
  name?: string;
  description?: string | null;
  color?: string;
}) {
  const [habit] = await db
    .update(habits)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(habits.id, id))
    .returning();

  return habit ?? null;
}

export async function deleteHabit(id: number) {
  const result = await db.delete(habits).where(eq(habits.id, id)).returning();
  return result;
}
