import type { ProjectFiles } from "../types/chat";

function getFile(files: ProjectFiles, names: string[]) {
  for (const name of names) {
    if (files[name] !== undefined) return files[name];
  }

  const entry = Object.entries(files).find(([path]) =>
    names.some((name) => path.endsWith(name))
  );

  return entry?.[1];
}

/** Builds a single HTML document for iframe preview from project files. */
export function buildPreviewHtml(files: ProjectFiles): string {
  const html =
    getFile(files, ["index.html", "index.htm"]) ??
    `<!DOCTYPE html><html><body><h1>Add an index.html file to preview</h1></body></html>`;

  const cssFiles = Object.entries(files).filter(([path]) =>
    path.endsWith(".css")
  );
  const jsFiles = Object.entries(files).filter(([path]) =>
    path.endsWith(".js")
  );

  let documentHtml = html;

  for (const [path, content] of cssFiles) {
    const fileName = path.split("/").pop()!;
    const linkPattern = new RegExp(
      `<link[^>]*href=["'](?:\\.\\/)?${fileName}["'][^>]*>`,
      "gi"
    );
    documentHtml = documentHtml.replace(
      linkPattern,
      `<style data-file="${path}">\n${content}\n</style>`
    );
  }

  for (const [path, content] of jsFiles) {
    const fileName = path.split("/").pop()!;
    const scriptPattern = new RegExp(
      `<script[^>]*src=["'](?:\\.\\/)?${fileName}["'][^>]*><\\/script>`,
      "gi"
    );
    documentHtml = documentHtml.replace(
      scriptPattern,
      `<script data-file="${path}">\n${content}\n</script>`
    );
  }

  // If styles weren't linked, append them.
  const missingCss = cssFiles.filter(
    ([path]) => !documentHtml.includes(`data-file="${path}"`)
  );
  if (missingCss.length) {
    const styles = missingCss
      .map(([path, content]) => `<style data-file="${path}">\n${content}\n</style>`)
      .join("\n");
    documentHtml = documentHtml.includes("</head>")
      ? documentHtml.replace("</head>", `${styles}\n</head>`)
      : `${styles}\n${documentHtml}`;
  }

  // If scripts weren't linked, append them before </body>.
  const missingJs = jsFiles.filter(
    ([path]) => !documentHtml.includes(`data-file="${path}"`)
  );
  if (missingJs.length) {
    const scripts = missingJs
      .map(
        ([path, content]) =>
          `<script data-file="${path}">\n${content}\n</script>`
      )
      .join("\n");
    documentHtml = documentHtml.includes("</body>")
      ? documentHtml.replace("</body>", `${scripts}\n</body>`)
      : `${documentHtml}\n${scripts}`;
  }

  return documentHtml;
}

/** Opens the current project preview in a new browser tab. */
export function openPreviewInNewTab(files: ProjectFiles) {
  const html = buildPreviewHtml(files);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const tab = window.open(url, "_blank", "noopener,noreferrer");

  if (!tab) {
    URL.revokeObjectURL(url);
    window.alert("Pop-up blocked. Allow pop-ups to open the preview.");
    return;
  }

  // Keep the blob alive briefly, then revoke after the tab has loaded.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

