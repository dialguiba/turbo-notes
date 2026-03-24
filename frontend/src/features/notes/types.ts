export interface NoteCategory {
  id: number;
  name: string;
  color: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: NoteCategory | null;
  created_at: string;
  updated_at: string;
}

export interface NotePayload {
  title?: string;
  content?: string;
  category?: number | null;
}
