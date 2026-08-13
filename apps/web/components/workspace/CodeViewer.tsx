"use client";

interface CodeViewerProps {
  path: string | null;
  content: string;
  onChange: (path: string, content: string) => void;
}

export default function CodeViewer({
  path,
  content,
  onChange,
}: CodeViewerProps) {
  if (!path) {
    return (
      <div className="code-viewer empty">
        <p>Select a file to view and edit its code.</p>
      </div>
    );
  }

  return (
    <div className="code-viewer">
      <div className="code-viewer-header">
        <span>{path}</span>
      </div>
      <textarea
        className="code-viewer-editor"
        value={content}
        spellCheck={false}
        onChange={(event) => onChange(path, event.target.value)}
      />
    </div>
  );
}
