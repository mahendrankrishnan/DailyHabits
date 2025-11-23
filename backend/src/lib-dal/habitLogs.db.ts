// src/lib-dal/habitLogs.db.ts
import { db } from "../db/index.js";
import { habits, habitLogs } from "../db/schema.js";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export async function getHabitLogsByHabitId(habitId: number) {
  return db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.habitId, habitId))
    .orderBy(desc(habitLogs.date));
}

export async function getHabitLogByHabitIdAndDate(habitId: number, date: string) {
  const [log] = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        eq(habitLogs.date, date)
      )
    )
    .limit(1);

  return log ?? null;
}

export async function createHabitLog(data: {
  habitId: number;
  date: string;
  completed: boolean;
  notes?: string | null;
}) {
  const [log] = await db
    .insert(habitLogs)
    .values({
      habitId: data.habitId,
      date: data.date,
      completed: data.completed,
      notes: data.notes ?? null,
    })
    .returning();

  return log;
}

export async function updateHabitLog(id: number, data: {
  completed?: boolean;
  notes?: string | null;
}) {
  const [log] = await db
    .update(habitLogs)
    .set(data)
    .where(eq(habitLogs.id, id))
    .returning();

  return log ?? null;
}

export async function getAllHabitLogs(startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return db
      .select()
      .from(habitLogs)
      .where(
        and(
          gte(habitLogs.date, startDate),
          lte(habitLogs.date, endDate)
        )
      )
      .orderBy(desc(habitLogs.date));
  }

  return db
    .select()
    .from(habitLogs)
    .orderBy(desc(habitLogs.date));
}

export async function getAllHabitsAndLogs() {
  const allHabits = await db.select().from(habits);
  const allLogs = await db.select().from(habitLogs);
  return { habits: allHabits, logs: allLogs };
}

