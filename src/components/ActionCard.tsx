import type { SmartAction } from '../types/domain';

interface ActionCardProps {
  action: SmartAction;
}

export function ActionCard({ action }: ActionCardProps) {
  return (
    <article className="action-card">
      <header>
        <h3>{action.title}</h3>
        <span className="chip">{action.actionType}</span>
      </header>
      <p>{action.description}</p>
      <footer>
        <small>Файл: {action.source.fileName}</small>
        <small>Група: {action.group}</small>
      </footer>
    </article>
  );
}
