export type AccidentalPreference = "sharp" | "flat" | "auto";

export interface AppSettings {
  id: "app-settings";
  theme: "dark" | "light" | "system";
  accidentalPreference: AccidentalPreference;
  defaultFontSize: number;
  defaultChordSize: number;
  defaultLineSpacing: number;
  defaultAutoScrollSpeed: number;
  showNotesInPerformance: boolean;
  sectionPaginationDefault: boolean;
  fitToScreenDefault: boolean;
  schemaVersion: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  id: "app-settings",
  theme: "dark",
  accidentalPreference: "auto",
  defaultFontSize: 24,
  defaultChordSize: 14,
  defaultLineSpacing: 1.6,
  defaultAutoScrollSpeed: 40,
  showNotesInPerformance: false,
  sectionPaginationDefault: true,
  fitToScreenDefault: false,
  schemaVersion: 1,
};
