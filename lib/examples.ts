import type { Report } from "./types";

// Example reports on the live site are written by one special account with this handle
// (see supabase/example-reports.sql). The app uses it to label them "Example".
export const EXAMPLE_HANDLE = "urbanvoice_examples";
export const isExample = (r: Report) => r.author.handle === EXAMPLE_HANDLE;
