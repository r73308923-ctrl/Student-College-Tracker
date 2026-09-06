import { Router, type IRouter, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  Analytics,
  CreateAttendanceBody,
  CreateExamBody,
  CreateStudySessionBody,
  CreateSubjectBody,
  CreateTaskBody,
  GetAnalyticsResponse,
  GetAttendanceResponse,
  GetDashboardResponse,
  GetExamsResponse,
  GetRecommendationResponse,
  GetStudySessionsResponse,
  GetSubjectsResponse,
  GetTasksResponse,
  LoginBody,
  LoginResponse,
  SignupBody,
  SignupResponse,
  UpdateProfileBody,
  UpdateSubjectBody,
  UpdateTaskBody,
} from "@workspace/api-zod";
import { sqlite, type StudentRow } from "../lib/sqlite";

const router: IRouter = Router();
const SESSION_COOKIE = "student_session";
const SESSION_DAYS = 30;
router.use(cookieParser());

type RequestWithStudent = Request & { studentId?: number };

function publicStudent(row: StudentRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    college: row.college,
    course: row.course,
    year: row.year,
    avatarColor: row.avatar_color,
  };
}

function passwordHash(password: string, salt = randomBytes(16).toString("hex")) {
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

function passwordMatches(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const expected = Buffer.from(digest, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function createSession(studentId: number, res: Response) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  sqlite.prepare("INSERT INTO sessions (token_hash, student_id, expires_at) VALUES (?, ?, ?)").run(tokenHash, studentId, expiresAt);
  res.cookie(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function currentStudent(req: RequestWithStudent) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const session = sqlite.prepare("SELECT student_id, expires_at FROM sessions WHERE token_hash = ?").get(tokenHash) as { student_id: number; expires_at: number } | undefined;
  if (!session || session.expires_at < Date.now()) {
    if (session) sqlite.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
    return null;
  }
  req.studentId = session.student_id;
  return sqlite.prepare("SELECT * FROM students WHERE id = ?").get(session.student_id) as StudentRow | undefined;
}

function requireStudent(req: RequestWithStudent, res: Response) {
  const student = currentStudent(req);
  if (!student) {
    res.status(401).json({ error: "Please sign in to continue." });
    return null;
  }
  return student;
}

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function dateOnly(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function subjectForStudent(studentId: number, id: number) {
  return sqlite.prepare("SELECT * FROM subjects WHERE id = ? AND student_id = ?").get(id, studentId) as Record<string, unknown> | undefined;
}

function serializeSubject(row: Record<string, unknown>) {
  const attended = Number(row.attended ?? 0);
  const total = Number(row.total ?? 0);
  return {
    id: Number(row.id),
    name: String(row.name),
    code: String(row.code),
    color: String(row.color),
    attended,
    total,
    percentage: total ? Math.round((attended / total) * 1000) / 10 : 100,
  };
}

router.post("/auth/signup", (req, res) => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please enter a valid name, email, and password of at least 8 characters." });
  const input = parsed.data;
  const existing = sqlite.prepare("SELECT id FROM students WHERE email = ?").get(input.email) as { id: number } | undefined;
  if (existing) return res.status(409).json({ error: "An account with that email already exists." });
  const result = sqlite.prepare("INSERT INTO students (name, email, password_hash, college, course, year, avatar_color) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    input.name.trim(),
    input.email.toLowerCase().trim(),
    passwordHash(input.password),
    input.college?.trim() || null,
    input.course?.trim() || null,
    input.year ?? null,
    ["#2f6fed", "#7967d9", "#e07b5f", "#2d9d78"][Number(BigInt(Date.now()) % 4n)],
  );
  const student = sqlite.prepare("SELECT * FROM students WHERE id = ?").get(Number(result.lastInsertRowid)) as StudentRow;
  createSession(student.id, res);
  res.status(201).json(SignupResponse.parse({ student: publicStudent(student) }));
  return;
});

router.post("/auth/login", (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter your email and password." });
  const student = sqlite.prepare("SELECT * FROM students WHERE email = ?").get(parsed.data.email.toLowerCase().trim()) as StudentRow | undefined;
  if (!student || !passwordMatches(parsed.data.password, student.password_hash)) return res.status(401).json({ error: "That email and password do not match." });
  createSession(student.id, res);
  res.json(LoginResponse.parse({ student: publicStudent(student) }));
  return;
});

router.post("/auth/logout", (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    sqlite.prepare("DELETE FROM sessions WHERE token_hash = ?").run(createHash("sha256").update(token).digest("hex"));
  }
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  res.status(204).send();
});

router.get("/auth/me", (req: RequestWithStudent, res) => {
  const student = currentStudent(req);
  res.json(student ? publicStudent(student) : null);
});

router.patch("/profile", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please check your profile details." });
  const input = parsed.data;
  const next = {
    name: input.name ?? student.name,
    college: input.college ?? student.college,
    course: input.course ?? student.course,
    year: input.year ?? student.year,
  };
  sqlite.prepare("UPDATE students SET name = ?, college = ?, course = ?, year = ? WHERE id = ?").run(next.name, next.college || null, next.course || null, next.year ?? null, student.id);
  const updated = sqlite.prepare("SELECT * FROM students WHERE id = ?").get(student.id) as StudentRow;
  res.json(publicStudent(updated));
  return;
});

router.get("/subjects", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const rows = sqlite.prepare("SELECT * FROM subjects WHERE student_id = ? ORDER BY name").all(student.id) as Record<string, unknown>[];
  res.json(GetSubjectsResponse.parse(rows.map(serializeSubject)));
});

router.post("/subjects", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Subject name and code are required." });
  const input = parsed.data;
  const result = sqlite.prepare("INSERT INTO subjects (student_id, name, code, color, attended, total) VALUES (?, ?, ?, ?, ?, ?)").run(student.id, input.name.trim(), input.code.trim(), input.color, input.attended ?? 0, input.total ?? 0);
  const row = sqlite.prepare("SELECT * FROM subjects WHERE id = ?").get(Number(result.lastInsertRowid)) as Record<string, unknown>;
  res.status(201).json(serializeSubject(row));
  return;
});

router.patch("/subjects/:id", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const subjectId = Number(req.params.id);
  const subject = subjectForStudent(student.id, subjectId);
  if (!subject) return res.status(404).json({ error: "Subject not found." });
  const parsed = UpdateSubjectBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please check the subject details." });
  const input = parsed.data;
  sqlite.prepare("UPDATE subjects SET name = ?, code = ?, color = ?, attended = ?, total = ? WHERE id = ? AND student_id = ?").run(
    input.name ?? subject.name,
    input.code ?? subject.code,
    input.color ?? subject.color,
    input.attended ?? subject.attended,
    input.total ?? subject.total,
    subjectId,
    student.id,
  );
  const updated = sqlite.prepare("SELECT * FROM subjects WHERE id = ?").get(subjectId) as Record<string, unknown>;
  res.json(serializeSubject(updated));
  return;
});

router.delete("/subjects/:id", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  sqlite.prepare("DELETE FROM subjects WHERE id = ? AND student_id = ?").run(Number(req.params.id), student.id);
  res.status(204).send();
});

router.get("/attendance", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const rows = sqlite.prepare("SELECT a.id, a.subject_id, a.date, a.present, s.name AS subject_name FROM attendance a JOIN subjects s ON s.id = a.subject_id WHERE a.student_id = ? ORDER BY a.date DESC LIMIT 100").all(student.id) as Record<string, unknown>[];
  res.json(GetAttendanceResponse.parse(rows.map((row) => ({ id: Number(row.id), subjectId: Number(row.subject_id), subjectName: String(row.subject_name), date: String(row.date), present: Boolean(row.present) }))));
});

router.post("/attendance", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const parsed = CreateAttendanceBody.safeParse(req.body);
  if (!parsed.success || !subjectForStudent(student.id, parsed.data.subjectId)) return res.status(400).json({ error: "Choose a valid subject and date." });
  const input = parsed.data;
  sqlite.prepare("INSERT INTO attendance (student_id, subject_id, date, present) VALUES (?, ?, ?, ?)").run(student.id, input.subjectId, dateOnly(input.date), input.present ? 1 : 0);
  const inserted = sqlite.prepare("SELECT last_insert_rowid() AS id").get() as { id: number };
  const row = sqlite.prepare("SELECT a.id, a.subject_id, a.date, a.present, s.name AS subject_name FROM attendance a JOIN subjects s ON s.id = a.subject_id WHERE a.id = ?").get(Number(inserted.id)) as Record<string, unknown>;
  res.status(201).json({ id: Number(row.id), subjectId: Number(row.subject_id), subjectName: String(row.subject_name), date: String(row.date), present: Boolean(row.present) });
  return;
});

router.get("/tasks", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const rows = sqlite.prepare("SELECT t.*, s.name AS subject_name FROM tasks t LEFT JOIN subjects s ON s.id = t.subject_id WHERE t.student_id = ? ORDER BY CASE t.status WHEN 'todo' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, t.due_date IS NULL, t.due_date").all(student.id) as Record<string, unknown>[];
  res.json(GetTasksResponse.parse(rows.map((row) => ({ id: Number(row.id), title: String(row.title), description: row.description ? String(row.description) : null, status: String(row.status), priority: String(row.priority), dueDate: row.due_date ? String(row.due_date) : null, subjectId: row.subject_id == null ? null : Number(row.subject_id), subjectName: row.subject_name ? String(row.subject_name) : null }))));
});

router.post("/tasks", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "A task title and priority are required." });
  const input = parsed.data;
  const result = sqlite.prepare("INSERT INTO tasks (student_id, title, description, status, priority, due_date, subject_id) VALUES (?, ?, ?, ?, ?, ?, ?)").run(student.id, input.title.trim(), input.description || null, input.status ?? "todo", input.priority, input.dueDate ? dateOnly(input.dueDate) : null, input.subjectId ?? null);
  const row = sqlite.prepare("SELECT t.*, s.name AS subject_name FROM tasks t LEFT JOIN subjects s ON s.id = t.subject_id WHERE t.id = ?").get(Number(result.lastInsertRowid)) as Record<string, unknown>;
  res.status(201).json({ id: Number(row.id), title: String(row.title), description: row.description ? String(row.description) : null, status: String(row.status), priority: String(row.priority), dueDate: row.due_date ? String(row.due_date) : null, subjectId: row.subject_id == null ? null : Number(row.subject_id), subjectName: row.subject_name ? String(row.subject_name) : null });
  return;
});

function taskResponse(row: Record<string, unknown>) {
  return { id: Number(row.id), title: String(row.title), description: row.description ? String(row.description) : null, status: String(row.status), priority: String(row.priority), dueDate: row.due_date ? String(row.due_date) : null, subjectId: row.subject_id == null ? null : Number(row.subject_id), subjectName: row.subject_name ? String(row.subject_name) : null };
}

router.patch("/tasks/:id", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const taskId = Number(req.params.id);
  const task = sqlite.prepare("SELECT * FROM tasks WHERE id = ? AND student_id = ?").get(taskId, student.id) as Record<string, unknown> | undefined;
  if (!task) return res.status(404).json({ error: "Task not found." });
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please check the task details." });
  const input = parsed.data;
  sqlite.prepare("UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ?, subject_id = ? WHERE id = ? AND student_id = ?").run(input.title ?? task.title, input.description ?? task.description ?? null, input.status ?? task.status, input.priority ?? task.priority, input.dueDate ? dateOnly(input.dueDate) : task.due_date ?? null, input.subjectId ?? task.subject_id ?? null, taskId, student.id);
  const updated = sqlite.prepare("SELECT t.*, s.name AS subject_name FROM tasks t LEFT JOIN subjects s ON s.id = t.subject_id WHERE t.id = ?").get(taskId) as Record<string, unknown>;
  res.json(taskResponse(updated));
  return;
});

router.delete("/tasks/:id", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  sqlite.prepare("DELETE FROM tasks WHERE id = ? AND student_id = ?").run(Number(req.params.id), student.id);
  res.status(204).send();
});

function examResponse(row: Record<string, unknown>) {
  const date = String(row.date);
  return { id: Number(row.id), title: String(row.title), date, time: row.time ? String(row.time) : null, room: row.room ? String(row.room) : null, notes: row.notes ? String(row.notes) : null, subjectId: row.subject_id == null ? null : Number(row.subject_id), subjectName: row.subject_name ? String(row.subject_name) : null, status: date >= new Date().toISOString().slice(0, 10) ? "upcoming" : "completed" };
}

router.get("/exams", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const rows = sqlite.prepare("SELECT e.*, s.name AS subject_name FROM exams e LEFT JOIN subjects s ON s.id = e.subject_id WHERE e.student_id = ? ORDER BY e.date, e.time").all(student.id) as Record<string, unknown>[];
  res.json(GetExamsResponse.parse(rows.map(examResponse)));
});

router.post("/exams", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const parsed = CreateExamBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "An exam title and date are required." });
  const input = parsed.data;
  const result = sqlite.prepare("INSERT INTO exams (student_id, title, date, time, room, notes, subject_id) VALUES (?, ?, ?, ?, ?, ?, ?)").run(student.id, input.title.trim(), dateOnly(input.date), input.time || null, input.room || null, input.notes || null, input.subjectId ?? null);
  const row = sqlite.prepare("SELECT e.*, s.name AS subject_name FROM exams e LEFT JOIN subjects s ON s.id = e.subject_id WHERE e.id = ?").get(Number(result.lastInsertRowid)) as Record<string, unknown>;
  res.status(201).json(examResponse(row));
  return;
});

router.patch("/exams/:id", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const examId = Number(req.params.id);
  const exam = sqlite.prepare("SELECT * FROM exams WHERE id = ? AND student_id = ?").get(examId, student.id) as Record<string, unknown> | undefined;
  if (!exam) return res.status(404).json({ error: "Exam not found." });
  const input = CreateExamBody.partial().parse(req.body);
  sqlite.prepare("UPDATE exams SET title = ?, date = ?, time = ?, room = ?, notes = ?, subject_id = ? WHERE id = ? AND student_id = ?").run(input.title ?? exam.title, input.date ? dateOnly(input.date) : exam.date, input.time ?? exam.time ?? null, input.room ?? exam.room ?? null, input.notes ?? exam.notes ?? null, input.subjectId ?? exam.subject_id ?? null, examId, student.id);
  const updated = sqlite.prepare("SELECT e.*, s.name AS subject_name FROM exams e LEFT JOIN subjects s ON s.id = e.subject_id WHERE e.id = ?").get(examId) as Record<string, unknown>;
  res.json(examResponse(updated));
  return;
});

router.delete("/exams/:id", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  sqlite.prepare("DELETE FROM exams WHERE id = ? AND student_id = ?").run(Number(req.params.id), student.id);
  res.status(204).send();
});

function studyResponse(row: Record<string, unknown>) {
  return { id: Number(row.id), date: String(row.date), minutes: Number(row.minutes), focus: String(row.focus), subjectId: row.subject_id == null ? null : Number(row.subject_id), subjectName: row.subject_name ? String(row.subject_name) : null };
}

router.get("/study-sessions", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const rows = sqlite.prepare("SELECT s.*, sub.name AS subject_name FROM study_sessions s LEFT JOIN subjects sub ON sub.id = s.subject_id WHERE s.student_id = ? ORDER BY s.date DESC, s.id DESC LIMIT 100").all(student.id) as Record<string, unknown>[];
  res.json(GetStudySessionsResponse.parse(rows.map(studyResponse)));
});

router.post("/study-sessions", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const parsed = CreateStudySessionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Add a date, duration, and focus area." });
  const input = parsed.data;
  const subjectId = typeof input.subjectId === "number" ? input.subjectId : null;
  const result = sqlite.prepare("INSERT INTO study_sessions (student_id, date, minutes, focus, subject_id) VALUES (?, ?, ?, ?, ?)").run(student.id, dateOnly(input.date), Number(input.minutes), String(input.focus).trim(), subjectId);
  const row = sqlite.prepare("SELECT s.*, sub.name AS subject_name FROM study_sessions s LEFT JOIN subjects sub ON sub.id = s.subject_id WHERE s.id = ?").get(Number(result.lastInsertRowid)) as Record<string, unknown>;
  res.status(201).json(studyResponse(row));
  return;
});

function dashboardFor(student: StudentRow) {
  const subjectRows = sqlite.prepare("SELECT attended, total FROM subjects WHERE student_id = ?").all(student.id) as { attended: number; total: number }[];
  const attended = subjectRows.reduce((sum, row) => sum + Number(row.attended), 0);
  const total = subjectRows.reduce((sum, row) => sum + Number(row.total), 0);
  const today = new Date().toISOString().slice(0, 10);
  const taskStats = sqlite.prepare("SELECT SUM(CASE WHEN status != 'done' THEN 1 ELSE 0 END) AS open, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed, SUM(CASE WHEN due_date = ? AND status != 'done' THEN 1 ELSE 0 END) AS due_today FROM tasks WHERE student_id = ?").get(today, student.id) as { open: number | null; completed: number | null; due_today: number | null };
  const examNext = sqlite.prepare("SELECT e.*, s.name AS subject_name FROM exams e LEFT JOIN subjects s ON s.id = e.subject_id WHERE e.student_id = ? AND e.date >= ? ORDER BY e.date, e.time LIMIT 1").get(student.id, today) as Record<string, unknown> | undefined;
  const upcoming = sqlite.prepare("SELECT COUNT(*) AS count FROM exams WHERE student_id = ? AND date >= ?").get(student.id, today) as { count: number };
  const weekStart = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const study = sqlite.prepare("SELECT COALESCE(SUM(minutes), 0) AS minutes, COUNT(*) AS sessions FROM study_sessions WHERE student_id = ? AND date >= ?").get(student.id, weekStart) as { minutes: number; sessions: number };
  const productivity = Math.max(0, Math.min(100, Math.round((Number(taskStats.completed ?? 0) / Math.max(Number(taskStats.completed ?? 0) + Number(taskStats.open ?? 0), 1)) * 60 + Math.min(Number(study.minutes) / 5, 40))));
  const activity = [
    Number(taskStats.completed ?? 0) > 0 ? { label: "Tasks completed", detail: `${Number(taskStats.completed)} finished recently`, tone: "green" } : null,
    Number(study.minutes) > 0 ? { label: "Study momentum", detail: `${Number(study.minutes)} minutes this week`, tone: "violet" } : null,
    total > 0 ? { label: "Attendance check", detail: `${Math.round((attended / total) * 100)}% across subjects`, tone: attended / total >= 0.75 ? "blue" : "amber" } : null,
  ].filter(Boolean);
  return GetDashboardResponse.parse({
    student: publicStudent(student),
    attendance: { percentage: total ? Math.round((attended / total) * 1000) / 10 : 0, attended, total, classesNeeded: total && attended / total < 0.75 ? Math.ceil((0.75 * total - attended) / 0.25) : 0 },
    tasks: { open: Number(taskStats.open ?? 0), completed: Number(taskStats.completed ?? 0), dueToday: Number(taskStats.due_today ?? 0) },
    exams: { upcoming: Number(upcoming.count), next: examNext ? examResponse(examNext) : null },
    study: { minutesThisWeek: Number(study.minutes), sessionsThisWeek: Number(study.sessions) },
    productivity,
    streak: Number(study.sessions) > 0 ? Math.min(7, Number(study.sessions)) : 0,
    recentActivity: activity,
  });
}

router.get("/dashboard", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  res.json(dashboardFor(student));
});

router.get("/dashboard/recommendation", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const dash = dashboardFor(student);
  const recommendation = dash.attendance.total > 0 && dash.attendance.percentage < 75
    ? { title: "Protect your attendance", reason: `You are at ${dash.attendance.percentage}% overall. One focused week can get you back on track.`, action: "Review attendance", tone: "attendance" }
    : dash.exams.next
      ? { title: `Prepare for ${dash.exams.next.title}`, reason: `Your next exam is on ${dash.exams.next.date}. Start with a short focused review today.`, action: "Plan a study block", tone: "exam" }
      : dash.tasks.dueToday > 0
        ? { title: "Clear today's priorities", reason: `${dash.tasks.dueToday} task${dash.tasks.dueToday === 1 ? " is" : "s are"} due today.`, action: "Open tasks", tone: "task" }
        : { title: "Build study momentum", reason: "A 25-minute focused session is enough to keep your streak alive.", action: "Start a study session", tone: "study" };
  res.json(GetRecommendationResponse.parse(recommendation));
});

router.get("/analytics", (req: RequestWithStudent, res) => {
  const student = requireStudent(req, res);
  if (!student) return;
  const weeklyStudy = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000);
    const label = date.toLocaleDateString("en-US", { weekday: "short" });
    const iso = date.toISOString().slice(0, 10);
    const row = sqlite.prepare("SELECT COALESCE(SUM(minutes), 0) AS minutes FROM study_sessions WHERE student_id = ? AND date = ?").get(student.id, iso) as { minutes: number };
    return { label, minutes: Number(row.minutes) };
  });
  const completedTasks = Number((sqlite.prepare("SELECT COUNT(*) AS count FROM tasks WHERE student_id = ? AND status = 'done'").get(student.id) as { count: number }).count);
  const openTasks = Number((sqlite.prepare("SELECT COUNT(*) AS count FROM tasks WHERE student_id = ? AND status != 'done'").get(student.id) as { count: number }).count);
  const taskTotal = Math.max(completedTasks + openTasks, 1);
  const taskCompletion = [{ label: "Completed", value: Math.round((completedTasks / taskTotal) * 100) }, { label: "Open", value: Math.round((openTasks / taskTotal) * 100) }];
  const subjects = sqlite.prepare("SELECT * FROM subjects WHERE student_id = ? ORDER BY name").all(student.id) as Record<string, unknown>[];
  const attendanceBySubject = subjects.map((subject) => ({ label: String(subject.code), percentage: serializeSubject(subject).percentage }));
  const productivityByWeek = [{ label: "This week", score: dashboardFor(student).productivity }];
  res.json(GetAnalyticsResponse.parse({ weeklyStudy, taskCompletion, attendanceBySubject, productivityByWeek }));
});

export default router;