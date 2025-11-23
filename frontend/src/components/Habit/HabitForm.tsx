import { useState, useEffect } from 'react';
import { Habit } from '../../types';
import { getPredefinedHabits } from '../../services/apiServices';
import './HabitForm.css';

interface HabitFormProps {
  habit?: Habit | null;
  onSubmit: (data: { name: string; description?: string; color?: string }) => Promise<void>;
  onCancel: () => void;
}

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

interface PredefinedHabit {
  id: number;
  name: string;
  description: string | null;
  color: string;
  displayOrder: number;
}

function HabitForm({ habit, onSubmit, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [description, setDescription] = useState(habit?.description || '');
  const [color, setColor] = useState(habit?.color || COLOR_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPredefined, setSelectedPredefined] = useState('');
  const [predefinedHabits, setPredefinedHabits] = useState<PredefinedHabit[]>([]);
  const [loadingPredefined, setLoadingPredefined] = useState(false);

  useEffect(() => {
    // Only load predefined habits when creating a new habit (not editing)
    if (!habit) {
      loadPredefinedHabits();
    }
  }, [habit]);

  const loadPredefinedHabits = async () => {
    try {
      setLoadingPredefined(true);
      const data = await getPredefinedHabits();
      setPredefinedHabits(data.habits || []);
    } catch (error) {
      console.error('Failed to load predefined habits:', error);
      // Continue with empty array if fetch fails
      setPredefinedHabits([]);
    } finally {
      setLoadingPredefined(false);
    }
  };

  const handlePredefinedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPredefined(value);
    
    if (value) {
      const predefined = predefinedHabits.find(h => h.name === value);
      if (predefined) {
        setName(predefined.name);
        setDescription(predefined.description || '');
        setColor(predefined.color);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
    } catch (error) {
      console.error('Failed to submit habit:', error);
      alert('Failed to save habit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="habit-form-container">
      <h2>{habit ? 'Edit Habit' : 'Create New Habit'}</h2>
      <form onSubmit={handleSubmit} className="habit-form">
        {!habit && (
          <div className="form-group">
            <label htmlFor="predefined">Quick Add (Optional)</label>
            <select
              id="predefined"
              value={selectedPredefined}
              onChange={handlePredefinedChange}
              className="predefined-select"
              disabled={submitting || loadingPredefined}
            >
              <option value="">{loadingPredefined ? 'Loading habits...' : '-- Choose a common habit --'}</option>
              {predefinedHabits.map((habit) => (
                <option key={habit.id} value={habit.name}>
                  {habit.name}
                </option>
              ))}
            </select>
            <p className="form-hint">Select a habit to quickly fill in the form, or type your own below</p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Habit Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              // Clear predefined selection if user manually types
              if (selectedPredefined && e.target.value !== predefinedHabits.find(h => h.name === selectedPredefined)?.name) {
                setSelectedPredefined('');
              }
            }}
            placeholder="e.g., Exercise, Read, Meditate"
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description or motivation for this habit..."
            rows={3}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-option ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                disabled={submitting}
              />
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || !name.trim()}>
            {submitting ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default HabitForm;

