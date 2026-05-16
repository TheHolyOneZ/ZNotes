import { useEffect, useState } from "react";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import appIcon from "../../assets/base.png";

const appWindow = getCurrentWindow();

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    appWindow.isMaximized().then(setIsMaximized);
    const unlistenPromise = appWindow.onResized(() => {
      appWindow.isMaximized().then((v) => setIsMaximized((prev) => prev === v ? prev : v));
    });
    return () => { unlistenPromise.then((f) => f()); };
  }, []);

  return (


    <div
      data-tauri-drag-region
      className="glass-topbar flex items-center justify-between h-10 px-4 flex-shrink-0 select-none"
    >
      <div className="flex items-center gap-2.5" data-tauri-drag-region>
        <img src={appIcon} alt="ZNotes" className="w-6 h-6 rounded-lg object-cover" style={{ boxShadow: "0 0 10px rgba(var(--accent-rgb),0.35)" }} />
        <span className="text-[13px] font-semibold tracking-wide" style={{ color: "var(--text-primary)" }}>
          ZNotes
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => appWindow.minimize()}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group"
          title="Minimize"
        >
          <Minus size={12} className="group-hover:text-white transition-colors" style={{ color: "var(--text-muted)" }} />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors group"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized
            ? <Maximize2 size={10} className="group-hover:text-white transition-colors" style={{ color: "var(--accent)" }} />
            : <Square size={11} className="group-hover:text-white transition-colors" style={{ color: "var(--text-muted)" }} />
          }
        </button>
        <button
          onClick={() => appWindow.close()}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-500/30 transition-colors group"
          title="Close"
        >
          <X size={13} className="group-hover:text-rose-400 transition-colors" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
    </div>
  );
}
