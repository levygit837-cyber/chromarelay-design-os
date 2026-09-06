/** SessionSidebar (SC-6): project groups + session items + new-session. */
import type { Project, Session } from '../model';

export function SessionSidebar({
  projects,
  sessions,
  activeSessionId,
  collapsed,
  onSwitch,
  onToggleProject,
  onNewSession,
}: {
  projects: Project[];
  sessions: Record<string, Session>;
  activeSessionId: string | null;
  collapsed: string[];
  onSwitch: (id: string) => void;
  onToggleProject: (id: string) => void;
  onNewSession: (projectId: string) => void;
}) {
  return (
    <div className="sidebar-body">
      {projects.map((p) => {
        const isCollapsed = collapsed.includes(p.id);
        const autoOpen = p.sessionIds.includes(activeSessionId ?? '');
        const showItems = !isCollapsed || autoOpen;
        return (
          <section key={p.id} className="project-group" aria-label={`Project ${p.name}`}>
            <button
              type="button"
              className="project-heading"
              aria-expanded={showItems}
              onClick={() => onToggleProject(p.id)}
            >
              {p.name}{' '}
              <span className="project-count">
                {p.sessionIds.length} session{p.sessionIds.length === 1 ? '' : 's'}
              </span>
            </button>
            {showItems ? (
              p.sessionIds.length === 0 ? (
                <div className="sidebar-empty" role="group" aria-label={`Project ${p.name} has no sessions`}>
                  <p>No sessions yet.</p>
                  <button type="button" className="btn btn-secondary" onClick={() => onNewSession(p.id)}>
                    Start first session
                  </button>
                </div>
              ) : (
                <ul className="session-list">
                  {p.sessionIds.map((sid) => {
                    const s = sessions[sid];
                    if (!s) return null;
                    const active = sid === activeSessionId;
                    return (
                      <li key={sid}>
                        <button
                          type="button"
                          className={`session-item${active ? ' is-active' : ''}`}
                          aria-current={active ? 'true' : undefined}
                          onClick={() => onSwitch(sid)}
                        >
                          <span className="session-title">{s.title}</span>
                          <span className="session-meta">
                            {s.turns.length} turn{s.turns.length === 1 ? '' : 's'} · {s.updatedAt}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : null}
          </section>
        );
      })}
      <button type="button" className="btn btn-secondary new-session" onClick={() => onNewSession(projects[0]?.id ?? 'p-atlas')}>
        New session
      </button>
    </div>
  );
}
