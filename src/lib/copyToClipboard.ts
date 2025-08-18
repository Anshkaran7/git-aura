// src/lib/copyToClipboard.ts
export async function copyToClipboard(text: string): Promise<boolean>  {
  try {
    // Preferred: modern async clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback: create a temporary <textarea>, select + execCommand("copy")
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // avoid scrolling to bottom
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);

    return successful;
  } catch (err) {
    console.error("copyToClipboard failed:", err);
    return false;
  }
}
