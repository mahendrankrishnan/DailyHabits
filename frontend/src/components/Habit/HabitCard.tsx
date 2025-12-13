import { useState, useEffect } from 'react';
import { Habit, HabitLog } from '../../types';
import { logHabit, getHabitLogs } from '../../services/apiServices';
import './HabitCard.css';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (id: number, name: string) => void;
  onUpdate: () => void;
}

function HabitCard({ habit, onEdit, onDelete, onUpdate }: HabitCardProps) {
  const [todayLog, setTodayLog] = useState<HabitLog | null>(null);
  const [loading, setLoading] = useState(false);

  // Get local date in YYYY-MM-DD format (not UTC)
  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getToday();

  useEffect(() => {
    loadTodayLog();
  }, [habit.id]);

  const loadTodayLog = async () => {
    try {
      const data = await getHabitLogs(habit.id);
      const log = data.logs.find((l: HabitLog) => l.date === today);
      setTodayLog(log || null);
    } catch (error) {
      console.error('Failed to load today log:', error);
    }
  };

  const handleToggle = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const completed = !todayLog?.completed;
      await logHabit(habit.id, {
        date: today,
        completed,
      });
      await loadTodayLog();
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const completed = todayLog?.completed || false;

  return (
    <div className="habit-card" style={{ borderLeftColor: habit.color }}>
      <div className="habit-card-header">
        <div className="habit-info">
          <h3>{habit.name}</h3>
          {habit.description && <p className="habit-description">{habit.description}</p>}
        </div>
        <div className="habit-actions">
          <button className="btn-icon" onClick={() => onEdit(habit)} title="Edit">
            ✏️
          </button>
          <button className="btn-icon" onClick={() => onDelete(habit.id, habit.name)} title="Delete">
            🗑️
          </button>
        </div>
      </div>

      <div className="habit-card-footer">
        <button
          className={`habit-toggle ${completed ? 'completed' : ''}`}
          onClick={handleToggle}
          disabled={loading}
        >
          {completed ? '✓ Completed Today' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  );
}

export default HabitCard;

