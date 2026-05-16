import { openUrl as tauriOpenUrl } from "@tauri-apps/plugin-opener";
import { isTauri } from "@tauri-apps/api/core";

export async function openUrl(url: string): Promise<void> {
  if (isTauri()) {
    await tauriOpenUrl(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
