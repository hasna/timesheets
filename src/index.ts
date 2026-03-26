// Database
export { getDatabase, closeDatabase } from "./db/database.js";

// Migrations
export { MIGRATIONS } from "./db/migrations.js";
export type { MigrationEntry } from "./db/migrations.js";

// Projects
export {
  createProject,
  getProject,
  listProjects,
  updateProject,
  deleteProject,
} from "./db/timesheets.js";
export type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsOptions,
} from "./db/timesheets.js";

// Time Entries
export {
  logTime,
  getEntry,
  listEntries,
  updateEntry,
  deleteEntry,
} from "./db/timesheets.js";
export type {
  TimeEntry,
  LogTimeInput,
  UpdateEntryInput,
  ListEntriesOptions,
} from "./db/timesheets.js";

// Summaries
export {
  getProjectSummary,
  getWeeklySummary,
  getClientSummary,
} from "./db/timesheets.js";
export type {
  ProjectSummary,
  WeeklySummary,
  ClientSummary,
} from "./db/timesheets.js";

// Locale
export {
  COUNTRY_DEFAULTS,
  getCountryDefaults,
  listSupportedCountries,
  getSetting,
  setSetting,
  getAllSettings,
  formatCurrency,
  checkOvertimeStatus,
} from "./db/locale.js";
export type { CountryDefaults } from "./db/locale.js";
