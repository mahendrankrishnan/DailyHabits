import './SessionTimeoutModal.css';

interface SessionTimeoutModalProps {
  timeRemaining: string;
  onStaySignedIn: () => void;
  onSignOut: () => void;
}

const SessionTimeoutModal = ({
  timeRemaining,
  onStaySignedIn,
  onSignOut,
}: SessionTimeoutModalProps) => {
  return (
    <div className="session-timeout-overlay">
      <div className="session-timeout-modal">
        <div className="session-timeout-header">
          <h2>Your session is about to end</h2>
        </div>
        <div className="session-timeout-content">
          <p className="session-timeout-message">
            You have been inactive for 25 minutes
          </p>
          <p className="session-timeout-warning">
            For your security, we will automatically sign you out in approximately{' '}
            <strong className="time-remaining">{timeRemaining}</strong>
          </p>
        </div>
        <div className="session-timeout-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onStaySignedIn}
          >
            Stay signed in
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;

