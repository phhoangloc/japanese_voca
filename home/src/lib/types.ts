/** Shapes returned by the backend API (subset the library site reads). */

export interface FileRecord {
  id: number;
  name: string;
  detail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  name: string;
  imageId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: number;
  number: number;
  name: string;
  imageId: number | null;
  courseId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Word {
  id: number;
  word: string;
  explain: string | null;
  imageId: number | null;
  soundId: number | null;
  readExplainId: number | null;
  chapterId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  error: string;
  details?: Record<string, string>;
}
