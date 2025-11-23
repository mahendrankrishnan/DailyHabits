// src/controllers/habits.controller.ts
import * as habitsDb from "../lib-dal/habits.db.js";
import * as habitLogsDb from "../lib-dal/habitLogs.db.js";
import * as predefinedHabitsDb from "../lib-dal/predefinedHabits.db.js";

export async function getAllHabits(search?: string) {
  return habitsDb.getAllHabits(search);
}

export async function getHabitById(id: number) {
  return habitsDb.getHabitById(id);
}

export async function createHabit(data: {
  name: string;
  description?: string | null;
  color?: string;
}) {
  return habitsDb.createHabit({
    name: data.name.trim(),
    description: data.description ? data.description.trim() : null,
    color: data.color || "#3b82f6",
  });
}

export async function updateHabit(id: number, data: {
  name?: string;
  description?: string | null;
  color?: string;
}) {
  const updateData: {
    name?: string;
    description?: string | null;
    color?: string;
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name.trim();
  }
  if (data.description !== undefined) {
    updateData.description = data.description ? data.description.trim() : null;
  }
  if (data.color !== undefined) {
    updateData.color = data.color;
  }

  return habitsDb.updateHabit(id, updateData);
}

export async function deleteHabit(id: number) {
  return habitsDb.deleteHabit(id);
}

export async function getHabitLogs(habitId: number) {
  return habitLogsDb.getHabitLogsByHabitId(habitId);
}

export async function createOrUpdateHabitLog(
  habitId: number,
  data: {
    date: string;
    completed: boolean;
    notes?: string | null;
  }
) {
  const existing = await habitLogsDb.getHabitLogByHabitIdAndDate(habitId, data.date);

  if (existing) {
    const updated = await habitLogsDb.updateHabitLog(existing.id, {
      completed: data.completed,
      notes: data.notes ?? null,
    });
    return { log: updated, created: false };
  } else {
    const created = await habitLogsDb.createHabitLog({
      habitId,
      date: data.date,
      completed: data.completed,
      notes: data.notes ?? null,
    });
    return { log: created, created: true };
  }
}

export async function getAllLogs(startDate?: string, endDate?: string) {
  return habitLogsDb.getAllHabitLogs(startDate, endDate);
}

export async function getAllPredefinedHabits() {
  return predefinedHabitsDb.getAllPredefinedHabits();
}

export async function getAllHabitsAndLogs() {
  return habitLogsDb.getAllHabitsAndLogs();
}

