import { useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspace-store';
import { Modal } from '../../components/Modal';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      await createWorkspace(name, description);
      onClose();
      // Reset form
      setName('');
      setDescription('');
    } catch (err) {
      setError('Failed to create workspace');
      void err; // Log suppressed for lint
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workspace"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Workspace'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="ws-name">Workspace Name</label>
          <input
            id="ws-name"
            type="text"
            className="form-input"
            placeholder="e.g. Engineering Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="ws-desc">Description (Optional)</label>
          <textarea
            id="ws-desc"
            className="form-textarea"
            placeholder="Brief description of this workspace..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
