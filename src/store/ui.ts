import { create } from "zustand";

type PlannerJump =
  | { type: "day"; date: string }
  | { type: "overdue" }
  | null;

interface UiState {
  plannerJump: PlannerJump;
  setPlannerJump: (jump: PlannerJump) => void;
  clearPlannerJump: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  plannerJump: null,
  setPlannerJump: (plannerJump) => set({ plannerJump }),
  clearPlannerJump: () => set({ plannerJump: null }),
}));
