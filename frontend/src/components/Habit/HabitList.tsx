import { Habit } from '../../types';
import HabitCard from './HabitCard';
import './HabitList.css';

interface HabitListProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
  onDelete: (id: number, name: string) => void;
  onUpdate: () => void;
}

function HabitList({ habits, onEdit, onDelete, onUpdate }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="empty-state">
        <p>No habits yet. Create your first habit to get started! 🎯</p>
      </div>
    );
  }

  return (
    <div className="habit-list">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

export default HabitList;

