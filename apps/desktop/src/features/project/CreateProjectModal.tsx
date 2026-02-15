import { useState } from 'react';
import { useWorkspaceStore } from '../../stores/workspace-store';
import { Modal } from '../../components/Modal';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { createProject, selectedWorkspace } = useWorkspaceStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedWorkspace) return;

    try {
      setIsLoading(true);
      setError('');
      await createProject(selectedWorkspace.id, name, description);
      onClose();
      // Reset form
      setName('');
      setDescription('');
    } catch (err) {
      setError('Failed to create project');
      void err; // Log suppressed for lint
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedWorkspace) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create Project in ${selectedWorkspace.name}`}
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
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="proj-name">Project Name</label>
          <input
            id="proj-name"
            type="text"
            className="form-input"
            placeholder="e.g. Q4 Roadmap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="proj-desc">Description (Optional)</label>
          <textarea
            id="proj-desc"
            className="form-textarea"
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}
