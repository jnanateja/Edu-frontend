import { useEffect, useState } from "react";
import {
  addQuizQuestion,
  createQuiz,
  deleteQuiz,
  getCourseQuizzes,
  getTeacherQuizSubmissions,
  gradeQuizSubmission,
  updateQuiz,
} from "../../api/api";
import { Plus, Trash2, CheckCircle, X, HelpCircle, Users, FileText, Download } from "lucide-react";

type Choice = { id: number; text: string; is_correct?: boolean };
type Question = { id: number; prompt: string; order: number; choices: Choice[] };
type Quiz = {
  id: number;
  title: string;
  description: string;
  quiz_type?: "mcq" | "pdf";
  question_pdf?: string | null;
  answer_key_pdf?: string | null;
  due_at?: string | null;
  time_limit_minutes?: number | null;
  max_attempts?: number;
  allow_retakes?: boolean;
  questions: Question[];
};

type SubmissionRow = {
  id: number;
  student: { id: number; email: string; full_name: string; role: string; is_staff: boolean };
  score: number;
  total: number;
  feedback?: string;
  submission_file?: string | null;
  attempt_number?: number;
  time_taken_seconds?: number;
  created_at: string;
  graded_at?: string | null;
};

export default function TeacherQuizManager({ courseId }: { courseId: number }) {
  const token = localStorage.getItem("access");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) || null;

  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionRow | null>(null);

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getCourseQuizzes(token, courseId);
      setQuizzes(Array.isArray(data) ? data : []);
      if (!activeQuizId && Array.isArray(data) && data[0]?.id) setActiveQuizId(data[0].id);
    } catch (e: any) {
      setError(e?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [courseId]);

  const loadSubmissions = async (quizId: number) => {
    if (!token) return;
    setSubLoading(true);
    try {
      const rows = await getTeacherQuizSubmissions(token, quizId);
      setSubmissions(Array.isArray(rows) ? rows : []);
    } catch {
      setSubmissions([]);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    if (activeQuizId) loadSubmissions(activeQuizId);
    else setSubmissions([]);
  }, [activeQuizId]);

  const remove = async (q: Quiz) => {
    if (!token) return;
    if (!confirm("Delete this quiz?")) return;
    try {
      await deleteQuiz(token, q.id);
      setQuizzes((prev) => prev.filter((x) => x.id !== q.id));
      if (activeQuizId === q.id) setActiveQuizId(null);
    } catch (e: any) {
      alert(e?.message || "Failed to delete quiz");
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create MCQ quizzes or PDF quiz assignments. PDF quizzes support due dates, optional answer keys, student uploads, and manual grading.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Quiz
        </button>
      </div>

      {loading && <div className="mt-6 text-gray-700">Loading…</div>}
      {!loading && error && <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}
      {!loading && !error && quizzes.length === 0 && <div className="mt-6 text-sm text-gray-600">No quizzes yet.</div>}

      {!loading && !error && quizzes.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((q) => (
            <button
              key={q.id}
              onClick={() => setActiveQuizId(q.id)}
              className={`text-left border rounded-xl p-4 hover:shadow-sm transition-shadow ${activeQuizId === q.id ? "ring-2 ring-blue-500" : "bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{q.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-2 mt-1">{q.description || "—"}</div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                  {q.quiz_type === "pdf" ? "PDF quiz" : "MCQ"}
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                {q.quiz_type === "pdf" ? "Manual grading" : `${q.questions?.length || 0} questions`}
              </div>
            </button>
          ))}
        </div>
      )}

      {activeQuiz && (
        <div className="mt-6 border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
            <div>
              <div className="font-semibold text-gray-900">{activeQuiz.title}</div>
              <div className="text-xs text-gray-500 mt-1">{activeQuiz.quiz_type === "pdf" ? "PDF quiz / assignment" : "MCQ quiz"}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => remove(activeQuiz)} className="px-3 py-1.5 rounded-lg text-xs font-medium border text-red-700 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 inline mr-1" /> Delete
              </button>
              <button onClick={() => setActiveQuizId(null)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <QuizSettings
                quiz={activeQuiz}
                onUpdated={(updated) => setQuizzes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
              />

              {activeQuiz.quiz_type !== "pdf" ? (
                <>
                  <AddQuestionForm
                    quizId={activeQuiz.id}
                    onAdded={async () => {
                      await refresh();
                      await loadSubmissions(activeQuiz.id);
                    }}
                  />
                  <div className="mt-5 space-y-3">
                    {(activeQuiz.questions || []).length === 0 ? (
                      <div className="text-sm text-gray-600">No questions yet.</div>
                    ) : (
                      (activeQuiz.questions || []).slice().sort((a, b) => a.order - b.order).map((qq) => (
                        <div key={qq.id} className="border rounded-xl p-4">
                          <div className="flex items-start gap-2">
                            <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="min-w-0 w-full">
                              <div className="font-medium text-gray-900">{qq.order}. {qq.prompt}</div>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {(qq.choices || []).map((c) => (
                                  <div key={c.id} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                                    <span className="text-gray-800 truncate">{c.text}</span>
                                    {c.is_correct ? <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle className="w-4 h-4" /> Correct</span> : <span className="text-xs text-gray-400">—</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-4 border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-2 text-gray-900 font-medium"><FileText className="w-4 h-4" /> PDF quiz files</div>
                  <div className="mt-3 space-y-2 text-sm">
                    {activeQuiz.question_pdf ? (
                      <a href={activeQuiz.question_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-700 hover:underline">
                        <Download className="w-4 h-4" /> Download questions PDF
                      </a>
                    ) : <div className="text-gray-500">No question PDF uploaded.</div>}
                    {activeQuiz.answer_key_pdf ? (
                      <a href={activeQuiz.answer_key_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-700 hover:underline">
                        <Download className="w-4 h-4" /> Download answer key PDF
                      </a>
                    ) : <div className="text-gray-500">No answer key uploaded.</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2"><Users className="w-5 h-5 text-gray-700" /><div className="font-medium text-gray-900">Submissions</div></div>
              <div className="text-xs text-gray-500 mt-1">{activeQuiz.quiz_type === "pdf" ? "Students can upload files. You can assign manual grades." : "Latest 2000 submissions (instant-graded)."}</div>

              {subLoading ? <div className="mt-4 text-sm text-gray-600">Loading submissions…</div> : submissions.length === 0 ? <div className="mt-4 text-sm text-gray-600">No submissions yet.</div> : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-3">Student</th>
                        <th className="py-2 pr-3">Score</th>
                        <th className="py-2 pr-3">File</th>
                        <th className="py-2 pr-3">Submitted</th>
                        <th className="py-2 pr-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {submissions.map((s) => (
                        <tr key={s.id}>
                          <td className="py-2 pr-3">
                            <div className="font-medium text-gray-900">{s.student.full_name}</div>
                            <div className="text-xs text-gray-500">{s.student.email}</div>
                          </td>
                          <td className="py-2 pr-3"><span className="font-semibold text-gray-900">{s.score}/{s.total}</span>{s.graded_at ? <div className="text-xs text-green-700 mt-1">Graded</div> : activeQuiz.quiz_type === "pdf" ? <div className="text-xs text-amber-700 mt-1">Pending</div> : null}</td>
                          <td className="py-2 pr-3 text-gray-600">{s.submission_file ? <a href={s.submission_file} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">Open file</a> : "—"}</td>
                          <td className="py-2 pr-3 text-gray-600">{new Date(s.created_at).toLocaleString()}</td>
                          <td className="py-2 pr-3 text-right">{activeQuiz.quiz_type === "pdf" ? <button onClick={() => setGradingSubmission(s)} className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-50">Grade</button> : null}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {createOpen && <CreateQuizModal courseId={courseId} onClose={() => setCreateOpen(false)} onCreated={async () => { setCreateOpen(false); await refresh(); }} />}
      {gradingSubmission && activeQuiz && (
        <GradeSubmissionModal
          submission={gradingSubmission}
          quiz={activeQuiz}
          onClose={() => setGradingSubmission(null)}
          onSaved={async () => {
            setGradingSubmission(null);
            await loadSubmissions(activeQuiz.id);
          }}
        />
      )}
    </div>
  );
}

function toDatetimeLocalValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function QuizSettings({ quiz, onUpdated }: { quiz: Quiz; onUpdated: (updated: Quiz) => void }) {
  const token = localStorage.getItem("access");
  const [dueAt, setDueAt] = useState(toDatetimeLocalValue(quiz.due_at));
  const [timeLimit, setTimeLimit] = useState<string>(quiz.time_limit_minutes ? String(quiz.time_limit_minutes) : "");
  const [maxAttempts, setMaxAttempts] = useState<string>(quiz.max_attempts !== undefined && quiz.max_attempts !== null ? String(quiz.max_attempts) : "1");
  const [allowRetakes, setAllowRetakes] = useState<boolean>(quiz.allow_retakes ?? true);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDueAt(toDatetimeLocalValue(quiz.due_at));
    setTimeLimit(quiz.time_limit_minutes ? String(quiz.time_limit_minutes) : "");
    setMaxAttempts(quiz.max_attempts !== undefined && quiz.max_attempts !== null ? String(quiz.max_attempts) : "1");
    setAllowRetakes(quiz.allow_retakes ?? true);
    setQuestionFile(null);
    setAnswerKeyFile(null);
  }, [quiz.id]);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload: any = {
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        time_limit_minutes: quiz.quiz_type === "pdf" ? null : timeLimit ? Number(timeLimit) : null,
        max_attempts: quiz.quiz_type === "pdf" ? 1 : maxAttempts ? Number(maxAttempts) : 1,
        allow_retakes: quiz.quiz_type === "pdf" ? false : allowRetakes,
      };
      if (questionFile) payload.question_pdf = questionFile;
      if (answerKeyFile) payload.answer_key_pdf = answerKeyFile;
      const updated = await updateQuiz(token, quiz.id, payload);
      onUpdated(updated);
    } catch (e: any) {
      alert(e?.message || "Failed to save quiz settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white mb-4">
      <div className="font-medium text-gray-900">Quiz settings</div>
      <div className="text-xs text-gray-500 mt-1">{quiz.quiz_type === "pdf" ? "PDF quizzes use a due date, uploaded question PDF, optional answer key, and manual grading." : "Set due date, time limit, and attempt rules."}</div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">Due date (optional)</label>
          <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        {quiz.quiz_type !== "pdf" ? (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700">Time limit (minutes)</label>
              <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Max attempts</label>
              <input type="number" min={0} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={allowRetakes} onChange={(e) => setAllowRetakes(e.target.checked)} /> Allow retakes</label>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700">Replace question PDF</label>
              <input type="file" accept="application/pdf" onChange={(e) => setQuestionFile(e.target.files?.[0] || null)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Replace answer key PDF</label>
              <input type="file" accept="application/pdf" onChange={(e) => setAnswerKeyFile(e.target.files?.[0] || null)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">{saving ? "Saving…" : "Save settings"}</button>
      </div>
    </div>
  );
}

function CreateQuizModal({ courseId, onClose, onCreated }: { courseId: number; onClose: () => void; onCreated: () => void; }) {
  const token = localStorage.getItem("access");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizType, setQuizType] = useState<"mcq" | "pdf">("mcq");
  const [dueAt, setDueAt] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [allowRetakes, setAllowRetakes] = useState(true);
  const [questionPdf, setQuestionPdf] = useState<File | null>(null);
  const [answerKeyPdf, setAnswerKeyPdf] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!token) return;
    setError("");
    if (!title.trim()) return setError("Title is required");
    if (quizType === "pdf" && !questionPdf) return setError("Please upload the question PDF");
    setSaving(true);
    try {
      await createQuiz(token, courseId, {
        title: title.trim(),
        description: description.trim(),
        quiz_type: quizType,
        is_published: true,
        question_pdf: questionPdf,
        answer_key_pdf: answerKeyPdf,
        due_at: dueAt ? new Date(dueAt).toISOString() : null,
        time_limit_minutes: quizType === "mcq" && timeLimit ? Number(timeLimit) : null,
        max_attempts: quizType === "mcq" ? (maxAttempts ? Number(maxAttempts) : 1) : 1,
        allow_retakes: quizType === "mcq" ? allowRetakes : false,
      });
      onCreated();
    } catch (e: any) {
      setError(e?.message || "Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div><h3 className="text-lg font-semibold text-gray-900">Create Quiz</h3><p className="text-xs text-gray-600">Choose MCQ or PDF quiz format.</p></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="e.g., Week 1 Quiz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Format</label>
              <select value={quizType} onChange={(e) => setQuizType(e.target.value as any)} className="mt-1 w-full border rounded-lg px-3 py-2">
                <option value="mcq">MCQ quiz</option>
                <option value="pdf">PDF quiz</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Optional instructions" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Due date (optional)</label>
              <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            {quizType === "mcq" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time limit (minutes)</label>
                  <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="e.g., 20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max attempts</label>
                  <input type="number" min={0} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={allowRetakes} onChange={(e) => setAllowRetakes(e.target.checked)} /> Allow retakes</label>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Questions PDF</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setQuestionPdf(e.target.files?.[0] || null)} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Answer key PDF (optional)</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setAnswerKeyPdf(e.target.files?.[0] || null)} className="mt-1 w-full border rounded-lg px-3 py-2" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">{saving ? "Creating…" : "Create"}</button>
        </div>
      </div>
    </div>
  );
}

function AddQuestionForm({ quizId, onAdded }: { quizId: number; onAdded: () => void }) {
  const token = localStorage.getItem("access");
  const [prompt, setPrompt] = useState("");
  const [order, setOrder] = useState("1");
  const [choices, setChoices] = useState([{ text: "", is_correct: true }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!token) return;
    setError("");
    const o = Number(order);
    if (!prompt.trim()) return setError("Question prompt is required");
    if (!o || o <= 0) return setError("Order must be a positive number");
    if (choices.some((c) => !c.text.trim())) return setError("All choices must have text");
    setSaving(true);
    try {
      await addQuizQuestion(token, quizId, { prompt: prompt.trim(), order: o, choices: choices.map((c) => ({ text: c.text.trim(), is_correct: c.is_correct })) });
      setPrompt("");
      setOrder(String(o + 1));
      setChoices([{ text: "", is_correct: true }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }]);
      onAdded();
    } catch (e: any) {
      setError(e?.message || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-white mb-4">
      <div className="font-medium text-gray-900">Add question</div>
      <div className="text-xs text-gray-500 mt-1">For MCQ quizzes only.</div>
      {error && <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
      <div className="mt-4 space-y-3">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Question prompt" />
        <input type="number" min={1} value={order} onChange={(e) => setOrder(e.target.value)} className="w-40 border rounded-lg px-3 py-2 text-sm" placeholder="Order" />
        <div className="grid grid-cols-1 gap-2">
          {choices.map((choice, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="radio" name={`correct-${quizId}`} checked={choice.is_correct} onChange={() => setChoices((prev) => prev.map((c, i) => ({ ...c, is_correct: i === idx })))} />
              <input value={choice.text} onChange={(e) => setChoices((prev) => prev.map((c, i) => i === idx ? { ...c, text: e.target.value } : c))} className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder={`Choice ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">{saving ? "Adding…" : "Add question"}</button>
      </div>
    </div>
  );
}

function GradeSubmissionModal({ quiz, submission, onClose, onSaved }: { quiz: Quiz; submission: SubmissionRow; onClose: () => void; onSaved: () => void; }) {
  const token = localStorage.getItem("access");
  const [score, setScore] = useState(String(submission.score ?? 0));
  const [total, setTotal] = useState(String(submission.total ?? 100));
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await gradeQuizSubmission(token, submission.id, { score: Number(score), total: Number(total), feedback });
      onSaved();
    } catch (e: any) {
      alert(e?.message || "Failed to grade submission");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Grade submission</h3>
            <p className="text-xs text-gray-600">{submission.student.full_name} • {quiz.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          {submission.submission_file ? <a href={submission.submission_file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-700 hover:underline"><Download className="w-4 h-4" /> Open student file</a> : null}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Score</label>
              <input type="number" min={0} value={score} onChange={(e) => setScore(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total</label>
              <input type="number" min={1} value={total} onChange={(e) => setTotal(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Feedback</label>
            <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2" placeholder="Optional notes for the student" />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">{saving ? "Saving…" : "Save grade"}</button>
        </div>
      </div>
    </div>
  );
}
