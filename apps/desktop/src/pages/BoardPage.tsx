// ============================================
// Board Page — Kanban board with drag-and-drop
// ============================================
import { useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { KanbanSquare } from 'lucide-react';
import { useBoardStore } from '../stores/board-store';
import { useWorkspaceStore } from '../stores/workspace-store';
import { KanbanBoard } from '../features/board/KanbanBoard';
import '../styles/board.css';

export function BoardPage() {
  const { projectId } = useParams({ strict: false });
  const selectedProject = useWorkspaceStore((s) => s.selectedProject);
  const { isLoading, fetchBoard } = useBoardStore();

  useEffect(() => {
    if (projectId) {
      fetchBoard(projectId);
    }
  }, [projectId, fetchBoard]);

  if (isLoading) {
    return (
      <div className="board-loading">
        <div className="loading-spinner" />
        <p>Loading board…</p>
      </div>
    );
  }

  return (
    <div className="board-page">
      <header className="board-header">
        <KanbanSquare size={24} />
        <h2>{selectedProject?.name ?? 'Board'}</h2>
      </header>
      <KanbanBoard />
    </div>
  );
}
