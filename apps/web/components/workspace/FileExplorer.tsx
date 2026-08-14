"use client";

import { Download, FileCode2 } from "lucide-react";
import type { ProjectFiles } from "../../types/chat";

interface FileExplorerProps {
  files: ProjectFiles;
  activeFile: string | null;
  onSelect: (path: string) => void;
  onDownloadCodebase?: () => void;
}

export default function FileExplorer({
  files,
  activeFile,
  onSelect,
  onDownloadCodebase,
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

      {onDownloadCodebase ? (
        <div className="file-explorer-footer">
          <button
            type="button"
            className="file-explorer-download"
            onClick={onDownloadCodebase}
          >
            <Download size={14} />
            Download codebase
          </button>
        </div>
      ) : null}
    </div>
  );
}
