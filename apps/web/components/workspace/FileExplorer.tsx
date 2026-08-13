"use client";

import { FileCode2 } from "lucide-react";
import type { ProjectFiles } from "../../types/chat";

interface FileExplorerProps {
  files: ProjectFiles;
  activeFile: string | null;
  onSelect: (path: string) => void;
}

export default function FileExplorer({
  files,
  activeFile,
  onSelect,
}: FileExplorerProps) {
  const paths = Object.keys(files).sort((a, b) => a.localeCompare(b));

  return (
    <div className="file-explorer">
      <div className="file-explorer-label">Files</div>
      <div className="file-explorer-list">
        {paths.map((path) => (
          <button
            key={path}
            type="button"
            className={`file-explorer-item ${
              activeFile === path ? "is-active" : ""
            }`}
            onClick={() => onSelect(path)}
          >
            <FileCode2 size={14} />
            <span>{path}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
