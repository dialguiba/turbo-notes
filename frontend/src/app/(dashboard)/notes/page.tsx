import type { Metadata } from "next";
import { NotesPageClient } from "./notes-page-client";

export const metadata: Metadata = {
  title: "Notes",
  description: "Manage your notes in Turbo Notes",
};

export default function NotesPage() {
  return <NotesPageClient />;
}
