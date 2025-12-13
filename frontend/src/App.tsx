import { ChangeEvent, FormEvent, useEffect, useState, useCallback } from 'react';
import HabitList from './components/Habit/HabitList';
import HabitForm from './components/Habit/HabitForm';
import AIChat from './components/OpenAI/AIChat';
import WeeklyView from './components/Weekly-Views/WeeklyView';
import Logo from './components/Logo';
import Footer from './components/Footer/Footer';
import SessionTimeoutModal from './components/SessionTimeout/SessionTimeoutModal';
import DeleteConfirmationDialog from './components/Habit/DeleteConfirmationDialog';
import { Habit } from './types';
import { getHabits, createHabit, updateHabit, deleteHabit } from './services/apiServices';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import './App.css';

const loginConfig = {
  username: (import.meta.env.VITE_LOGIN_USERNAME ?? '').trim(),
  password: import.meta.env.VITE_LOGIN_PASSWORD ?? '',
  phone: (import.meta.env.VITE_LOGIN_PHONE ?? '').trim(),
};

const isLoginConfigured =
  Boolean(loginConfig.username) &&
  Boolean(loginConfig.password) &&
  Boolean(loginConfig.phone);

const initialLoginState = { username: '', password: '', phone: '' };

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'weekly'>('list');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [loginError, setLoginError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ habitId: number; habitName: string } | null>(null);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('loggedInUser');
    setIsLoggedIn(false);
    setCurrentUser('');
  }, []);

  // I want Session timeout configuration: 25 minutes warning, 30 minutes total
  const sessionTimeout = useSessionTimeout({
    warningTime: 25 * 60 * 1000, // 25 minutes in milliseconds
    logoutTime: 30 * 60 * 1000, // 30 minutes in milliseconds
    onLogout: handleLogout,
    enabled: isLoggedIn,
  });

  const loadHabits = async (search?: string) => {
    try {
      setLoading(true);
      const data = await getHabits(search);
      setHabits(data.habits);
    } catch (error) {
      console.error('Failed to load habits, look at the logs for more details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    loadHabits(searchQuery);
  }, [searchQuery, isLoggedIn]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(storedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const handleCreateHabit = async (habitData: { name: string; description?: string; color?: string }) => {
    try {
      await createHabit(habitData);
      await loadHabits(searchQuery);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create habit:', error);
      throw error;
    }
  };

  const handleUpdateHabit = async (id: number, habitData: { name?: string; description?: string; color?: string }) => {
    try {
      await updateHabit(id, habitData);
      await loadHabits(searchQuery);
      setEditingHabit(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update habit:', error);
      throw error;
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteDialog({ habitId: id, habitName: name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog) return;
    
    try {
      await deleteHabit(deleteDialog.habitId);
      await loadHabits(searchQuery);
      setDeleteDialog(null);
    } catch (error) {
      console.error('Failed to delete habit:', error);
      setDeleteDialog(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(null);
  };

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoginConfigured) {
      setLoginError('Login is not configured. Please set credentials in the .env file.');
      return;
    }

    const normalizedUsername = loginForm.username.trim();
    const normalizedPhone = loginForm.phone.trim();

    if (
      normalizedUsername === loginConfig.username &&
      loginForm.password === loginConfig.password &&
      normalizedPhone === loginConfig.phone
    ) {
      sessionStorage.setItem('loggedInUser', normalizedUsername);
      setCurrentUser(normalizedUsername);
      setIsLoggedIn(true);
      setLoginError('');
      setLoginForm(initialLoginState);
      return;
    }

    setLoginError('Invalid username, password, or phone number.');
  };


  if (!isLoggedIn) {
    return (
      <div className="app login-page">
        <Logo />
        <div className="login-card">
          <h2>DHA Tracker Secure Login</h2>
          <p className="login-subtitle">
            Enter the username, password, and phone to securely access the application. 
          </p>
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label className="input-group">
              <span>Username</span>
              <input
                autoFocus
                name="username"
                type="text"
                value={loginForm.username}
                onChange={handleLoginChange}
                placeholder="Username"
                required
              />
            </label>
            <label className="input-group">
              <span>Password</span>
              <input
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder="••••••••"
                required
              />
            </label>
            <label className="input-group">
              <span>Phone Number</span>
              <input
                name="phone"
                type="tel"
                value={loginForm.phone}
                onChange={handleLoginChange}
                placeholder="e.g. 555-0123"
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Sign in
            </button>
          </form>
          {loginError && <p className="login-error">{loginError}</p>}
          {!isLoginConfigured && (
            <p className="login-config-warning">
              Please contact the administrator for help to set the login credentials before signing in.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {sessionTimeout.showWarning && (
        <SessionTimeoutModal
          timeRemaining={sessionTimeout.timeRemaining}
          onStaySignedIn={sessionTimeout.handleStaySignedIn}
          onSignOut={sessionTimeout.handleSignOut}
        />
      )}
      {deleteDialog && (
        <DeleteConfirmationDialog
          habitName={deleteDialog.habitName}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
      <header className="app-header">
        <div className="header-row">
          <h1>📅 DHA Tracker</h1>
          <div className="header-divider"></div>
          <div className="welcome-section">
            <span>Welcome {currentUser}</span>
            <div className="header-divider"></div>
            <button type="button" className="btn btn-primary btn-small" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <p className="header-description">This Daily Habits & Activities Tracker Application help you to build daily habits and activities consistency, one at a time. Focus on what matters most.</p>
      </header>

      <div className="app-content">
        {showForm ? (
          <HabitForm
            habit={editingHabit}
            onSubmit={editingHabit ? (data) => handleUpdateHabit(editingHabit.id, data) : handleCreateHabit}
            onCancel={handleCancel}
          />
        ) : viewMode === 'weekly' ? (
          <WeeklyView onBack={() => setViewMode('list')} />
        ) : (
          <>
            <div className="app-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="🔍 Search habits by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="action-buttons">
                <button className="btn btn-secondary" onClick={() => setViewMode('weekly')}>
                  📅 Weekly View
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAIChat(!showAIChat)}>
                  {showAIChat ? '❌ Close AI' : '🤖 Ask AI'}
                </button>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  + Add New Habit
                </button>
              </div>
            </div>

            {showAIChat && <AIChat onClose={() => setShowAIChat(false)} />}

            {loading ? (
              <div className="loading">Loading habits...</div>
            ) : (
              <HabitList
                habits={habits}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onUpdate={() => loadHabits(searchQuery)}
              />
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;

