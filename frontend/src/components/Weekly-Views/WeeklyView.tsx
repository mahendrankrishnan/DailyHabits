import { useState, useEffect } from 'react';
import { Habit, HabitLog } from '../../types';
import { getHabits, logHabit, getLogsForDateRange } from '../../services/apiServices';
import './WeeklyView.css';

interface WeeklyViewProps {
  onBack: () => void;
}

function WeeklyView({ onBack }: WeeklyViewProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [toggling, setToggling] = useState<string>(''); // Track which habit+date is being toggled

  // Get the start of the week (Monday)
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // Reset time to start of day
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d);
    monday.setDate(diff);
    return monday;
  }

  // Get all days of the current week
  function getWeekDays(startDate: Date): Date[] {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  }

  // Convert Date to local date string in YYYY-MM-DD format (not UTC)
  function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const weekDays = getWeekDays(currentWeekStart);
  const weekStartStr = getLocalDateString(weekDays[0]);
  const weekEndStr = getLocalDateString(weekDays[6]);

  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [habitsData, logsData] = await Promise.all([
        getHabits(),
        getLogsForDateRange(weekStartStr, weekEndStr),
      ]);
      setHabits(habitsData.habits || []);
      setLogs(logsData.logs || []);
    } catch (error) {
      console.error('Failed to load weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogForHabitAndDate = (habitId: number, date: string): HabitLog | null => {
    return logs.find(log => log.habitId === habitId && log.date === date) || null;
  };

  const handleToggle = async (habitId: number, date: string) => {
    const log = getLogForHabitAndDate(habitId, date);
    const key = `${habitId}-${date}`;
    
    if (toggling === key) return;
    
    setToggling(key);
    try {
      const completed = !log?.completed;
      await logHabit(habitId, {
        date,
        completed,
      });
      await loadData(); // Reload to get updated logs
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    } finally {
      setToggling('');
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(getWeekStart(newDate));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="weekly-view-container">
        <div className="loading">Loading weekly view...</div>
      </div>
    );
  }

  return (
    <div className="weekly-view-container">
      <div className="weekly-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to List
        </button>
        <div className="week-navigation">
          <button className="btn-icon-small" onClick={() => navigateWeek('prev')} title="Previous Week">
            ◀
          </button>
          <div className="week-info">
            <h2>
              {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
              {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </h2>
            <button className="btn-link" onClick={goToCurrentWeek}>
              Go to Current Week
            </button>
          </div>
          <button className="btn-icon-small" onClick={() => navigateWeek('next')} title="Next Week">
            ▶
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits yet. Create your first habit to start tracking!</p>
        </div>
      ) : (
        <div className="weekly-grid">
          <div className="weekly-grid-header">
            <div className="habit-name-header">Habit</div>
            {weekDays.map((date, index) => (
              <div
                key={index}
                className={`day-header ${isToday(date) ? 'today' : ''}`}
              >
                <div className="day-name">{formatDayName(date)}</div>
                <div className="day-date">{formatDate(date)}</div>
              </div>
            ))}
          </div>

          <div className="weekly-grid-body">
            {habits.map((habit) => (
              <div key={habit.id} className="weekly-grid-row">
                <div className="habit-name-cell" style={{ borderLeftColor: habit.color }}>
                  <div className="habit-name">{habit.name}</div>
                </div>
                {weekDays.map((date, dayIndex) => {
                  const dateStr = getLocalDateString(date);
                  const log = getLogForHabitAndDate(habit.id, dateStr);
                  const completed = log?.completed || false;
                  const key = `${habit.id}-${dateStr}`;
                  const isToggling = toggling === key;

                  return (
                    <div
                      key={dayIndex}
                      className={`day-cell ${isToday(date) ? 'today' : ''} ${completed ? 'completed' : ''}`}
                    >
                      <button
                        className={`day-checkbox ${completed ? 'checked' : ''}`}
                        onClick={() => handleToggle(habit.id, dateStr)}
                        disabled={isToggling}
                        title={completed ? 'Mark as incomplete' : 'Mark as complete'}
                        style={{ borderColor: habit.color }}
                      >
                        {isToggling ? (
                          <span className="loading-spinner">⟳</span>
                        ) : completed ? (
                          <span style={{ color: habit.color }}>✓</span>
                        ) : (
                          <span>○</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyView;

