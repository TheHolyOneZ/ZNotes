import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Background } from "./components/ui/Background";
import { TitleBar } from "./components/layout/TitleBar";
import { Sidebar } from "./components/layout/Sidebar";
import { Dashboard } from "./components/dashboard/Dashboard";
import { NotesList } from "./components/notes/NotesList";
import { ChecklistsList } from "./components/checklists/ChecklistsList";
import { DayPlanner } from "./components/planner/DayPlanner";
import { Settings } from "./components/settings/Settings";
import { ReminderToastContainer } from "./components/ui/ReminderToast";
import { useNotesStore } from "./store/notes";
import { useChecklistsStore } from "./store/checklists";
import { useSettingsStore } from "./store/settings";
import { initNotifications } from "./lib/notifications";
import type { View } from "./types";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const loadNotes = useNotesStore((s) => s.load);
  const loadChecklists = useChecklistsStore((s) => s.load);
  const { load: loadSettings, settings } = useSettingsStore();

  useEffect(() => {
    loadSettings().then(() => {
      Promise.all([loadNotes(), loadChecklists()]);
    });


    initNotifications();
  }, []);

  useEffect(() => {
    if (settings.default_view !== "dashboard") setView(settings.default_view as View);
  }, [settings.default_view]);

  const handleReminderNavigate = (kind: string, id: string) => {
    if (kind === "note") setView("notes");
    else setView("checklists");

    void id;
  };

  const views = useMemo<Record<View, React.ReactNode>>(() => ({
    dashboard: <Dashboard onNavigate={setView} />,
    notes: <NotesList />,
    checklists: <ChecklistsList />,
    planner: <DayPlanner />,
    settings: <Settings />,
  }), []);

  return (
    <div className="flex flex-col h-screen overflow-hidden rounded-xl">
      <Background />
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar view={view} onView={setView} />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              {views[view]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>


      <ReminderToastContainer onNavigate={handleReminderNavigate} />
    </div>
  );
}
