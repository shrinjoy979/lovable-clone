"use client";

import { MessageSquarePlus, Star, Trash2 } from "lucide-react";
import type { ChatSession } from "../../types/chat";

const GITHUB_REPO_URL = "https://github.com/shrinjoy979/lovable-clone";

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default function Sidebar({
  sessions,
  activeId,
  onCreate,
  onSelect,
  onDelete,
}: SidebarProps) {
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-top">
        <div className="chat-brand">
          <span className="chat-brand-mark">L</span>
          <span>Lovable</span>
        </div>

        <button
          type="button"
          className="chat-new-btn"
          onClick={onCreate}
        >
          <MessageSquarePlus size={16} />
          New chat
        </button>
      </div>

      <div className="chat-sidebar-label">Recent</div>

      <div className="chat-sidebar-list">
        {sorted.map((session) => {
          const isActive = session.id === activeId;

          return (
            <div
              key={session.id}
              className={`chat-history-item ${isActive ? "is-active" : ""}`}
            >
              <button
                type="button"
                className="chat-history-main"
                onClick={() => onSelect(session.id)}
              >
                <span className="chat-history-title">{session.title}</span>
                <span className="chat-history-time">
                  {formatTime(session.updatedAt)}
                </span>
              </button>

              <button
                type="button"
                className="chat-history-delete"
                aria-label={`Delete ${session.title}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(session.id);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="chat-sidebar-footer">
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-github-btn"
        >
          <Star size={15} />
          Star on GitHub
        </a>
      </div>
    </aside>
  );
}
