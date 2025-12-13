import './DeleteConfirmationDialog.css';

interface DeleteConfirmationDialogProps {
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationDialog = ({
  habitName,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) => {
  return (
    <div className="delete-confirmation-overlay" onClick={onCancel}>
      <div className="delete-confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-confirmation-header">
          <h2>Delete Habit</h2>
        </div>
        <div className="delete-confirmation-content">
          <p className="delete-confirmation-message">
            Are you sure you want to delete <strong>"{habitName}"</strong>?
          </p>
          <p className="delete-confirmation-warning">
            This action cannot be undone. All associated logs will also be deleted.
          </p>
        </div>
        <div className="delete-confirmation-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;

