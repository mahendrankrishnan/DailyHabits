import { useState, useEffect } from 'react';
import { Habit, HabitLog } from '../../types';
import { logHabit, getHabitLogs } from '../../services/apiServices';
import './HabitCard.css';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (id: number) => void;
  onUpdate: () => void;
}

function HabitCard({ habit, onEdit, onDelete, onUpdate }: HabitCardProps) {
  const [todayLog, setTodayLog] = useState<HabitLog | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

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
          <button className="btn-icon" onClick={() => onDelete(habit.id)} title="Delete">
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

