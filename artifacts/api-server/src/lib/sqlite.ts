import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const filePath = resolve(process.env.SQLITE_PATH ?? "data/student-tracker.sqlite");
mkdirSync(dirname(filePath), { recursive: true });

export const sqlite = new Database(filePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    college TEXT,
    course TEXT,
    year INTEGER,
    avatar_color TEXT NOT NULL DEFAULT '#2f6fed',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS password_reset_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    used_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#2f6fed',
    attended INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    present INTEGER NOT NULL CHECK (present IN (0, 1))
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    room TEXT,
    notes TEXT,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    focus TEXT NOT NULL,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_student_idx ON sessions(student_id);
  CREATE INDEX IF NOT EXISTS password_reset_email_idx ON password_reset_challenges(email);
  CREATE INDEX IF NOT EXISTS subjects_student_idx ON subjects(student_id);
  CREATE INDEX IF NOT EXISTS tasks_student_idx ON tasks(student_id);
  CREATE INDEX IF NOT EXISTS exams_student_idx ON exams(student_id);
  CREATE INDEX IF NOT EXISTS study_student_idx ON study_sessions(student_id);
`);

export type StudentRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  college: string | null;
  course: string | null;
  year: number | null;
  avatar_color: string;
};