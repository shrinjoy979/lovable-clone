"use client";

import { useEffect, useMemo, useState } from "react";
import { Code2, Eye, RefreshCw } from "lucide-react";
import type { ProjectFiles } from "../../types/chat";
import { downloadCodebase } from "../../lib/download-codebase";
import FileExplorer from "./FileExplorer";
import CodeViewer from "./CodeViewer";
import LivePreview from "./LivePreview";

interface WorkspacePanelProps {
  files: ProjectFiles;
  isUpdating?: boolean;
  onFileChange: (path: string, content: string) => void;
  onSyncFromChat?: () => number | void;
}

export default function WorkspacePanel({
  files,
  isUpdating = false,
  onFileChange,
  onSyncFromChat,
}: WorkspacePanelProps) {
  const paths = useMemo(
    () => Object.keys(files).sort((a, b) => a.localeCompare(b)),
    [files]
  );
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeFile && files[activeFile] !== undefined) return;

    setActiveFile(
      paths.includes("index.html") ? "index.html" : paths[0] ?? null
    );
  }, [files, activeFile, paths]);

  function handleSync() {
    if (!onSyncFromChat) return;
    const count = onSyncFromChat() ?? 0;
    setSyncMessage(
      count > 0
        ? `Updated ${count} file${count === 1 ? "" : "s"} from chat`
        : "No code blocks found in the latest reply"
    );
    window.setTimeout(() => setSyncMessage(null), 2500);
  }

  return (
    <section className="workspace-panel">
      <div className="workspace-tabs">
        <button
          type="button"
          className={`workspace-tab ${tab === "preview" ? "is-active" : ""}`}
          onClick={() => setTab("preview")}
        >
          <Eye size={14} />
          Preview
        </button>
        <button
          type="button"
          className={`workspace-tab ${tab === "code" ? "is-active" : ""}`}
          onClick={() => setTab("code")}
        >
          <Code2 size={14} />
          Code
        </button>

        {onSyncFromChat ? (
          <button
            type="button"
            className="workspace-tab workspace-sync"
            onClick={handleSync}
            title="Apply code from the latest chat reply to preview"
          >
            <RefreshCw size={14} />
            Sync
          </button>
        ) : null}
      </div>

      {syncMessage ? (
        <div className="workspace-sync-message">{syncMessage}</div>
      ) : null}

      {tab === "preview" ? (
        <LivePreview files={files} isUpdating={isUpdating} />
      ) : (
        <div className="workspace-code">
          <FileExplorer
            files={files}
            activeFile={activeFile}
            onSelect={setActiveFile}
            onDownloadCodebase={() => {
              downloadCodebase(files);
              setSyncMessage("Downloaded codebase.zip");
              window.setTimeout(() => setSyncMessage(null), 2500);
            }}
          />
          <CodeViewer
            path={activeFile}
            content={activeFile ? (files[activeFile] ?? "") : ""}
            onChange={onFileChange}
          />
        </div>
      )}
    </section>
  );
}
