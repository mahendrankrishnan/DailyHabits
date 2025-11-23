import { db } from './index.js';
import { predefinedHabits } from './schema.js';

const PREDEFINED_HABITS_DATA = [
  { name: 'Exercise', description: 'Daily physical activity to stay healthy and fit', color: '#10b981', displayOrder: 1 },
  { name: 'Read', description: 'Read books, articles, or educational content daily', color: '#3b82f6', displayOrder: 2 },
  { name: 'Meditate', description: 'Practice mindfulness and meditation for mental clarity', color: '#8b5cf6', displayOrder: 3 },
  { name: 'Drink Water', description: 'Stay hydrated by drinking enough water throughout the day', color: '#06b6d4', displayOrder: 4 },
  { name: 'Journal', description: 'Write down thoughts, gratitude, or daily reflections', color: '#f59e0b', displayOrder: 5 },
  { name: 'Eat Healthy', description: 'Make conscious choices about nutrition and meals', color: '#10b981', displayOrder: 6 },
  { name: 'Sleep Early', description: 'Maintain a consistent sleep schedule for better rest', color: '#8b5cf6', displayOrder: 7 },
  { name: 'Learn Something New', description: 'Dedicate time to learning a new skill or topic', color: '#3b82f6', displayOrder: 8 },
  { name: 'Practice Gratitude', description: 'Express gratitude for the positive things in life', color: '#ec4899', displayOrder: 9 },
  { name: 'Stretch', description: 'Do stretching exercises to improve flexibility', color: '#f97316', displayOrder: 10 },
  { name: 'Limit Screen Time', description: 'Reduce time spent on phones, tablets, or computers', color: '#ef4444', displayOrder: 11 },
  { name: 'Connect with Family', description: 'Spend quality time with family members', color: '#10b981', displayOrder: 12 },
  { name: 'Practice a Hobby', description: 'Engage in activities you enjoy and are passionate about', color: '#8b5cf6', displayOrder: 13 },
  { name: 'Take a Walk', description: 'Go for a walk to get fresh air and light exercise', color: '#06b6d4', displayOrder: 14 },
  { name: 'Plan Your Day', description: 'Organize and plan tasks for better productivity', color: '#f59e0b', displayOrder: 15 },
];

async function seedPredefinedHabits() {
  try {
    console.log('Seeding predefined habits...');
    
    // Check if data already exists
    const existing = await db.select().from(predefinedHabits).limit(1);
    if (existing.length > 0) {
      console.log('Predefined habits already exist. Skipping seed.');
      return;
    }

    // Insert predefined habits
    for (const habit of PREDEFINED_HABITS_DATA) {
      try {
        await db.insert(predefinedHabits).values(habit);
        console.log(`✓ Inserted: ${habit.name}`);
      } catch (error: any) {
        // Skip if duplicate (unique constraint)
        if (error.code === '23505') {
          console.log(`⊘ Skipped (already exists): ${habit.name}`);
        } else {
          throw error;
        }
      }
    }

    console.log('Predefined habits seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedPredefinedHabits();

