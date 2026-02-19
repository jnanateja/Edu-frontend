import { useEffect, useState } from "react";
import {
  addQuizQuestion,
  createQuiz,
  deleteQuiz,
  getCourseQuizzes,
  getTeacherQuizSubmissions,
  updateQuiz,
} from "../../api/api";
import { Plus, Trash2, CheckCircle, X, HelpCircle, Users } from "lucide-react";

type Choice = { id: number; text: string; is_correct?: boolean };
type Question = { id: number; prompt: string; order: number; choices: Choice[] };
type Quiz = {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
  questions: Question[];
};

type SubmissionRow = {
  id: number;
  student: { id: number; email: string; full_name: string; role: string; is_staff: boolean };
  score: number;
  total: number;
  created_at: string;
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

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getCourseQuizzes(token, courseId);
      setQuizzes(Array.isArray(data) ? data : []);
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

  const togglePublish = async (q: Quiz) => {
    if (!token) return;
    try {
      const updated = await updateQuiz(token, q.id, { is_published: !q.is_published });
      setQuizzes((prev) => prev.map((x) => (x.id === q.id ? updated : x)));
    } catch (e: any) {
      alert(e?.message || "Failed to update quiz");
    }
  };

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
    <div className="bg-white rounded-xl border shadow-sm p-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create quizzes for this course. Students see only published quizzes and get instant grading.
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
      {!loading && error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {!loading && !error && quizzes.length === 0 && (
        <div className="mt-6 text-sm text-gray-600">No quizzes yet.</div>
      )}

      {!loading && !error && quizzes.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((q) => (
            <button
              key={q.id}
              onClick={() => setActiveQuizId(q.id)}
              className={`text-left border rounded-xl p-4 hover:shadow-sm transition-shadow ${
                activeQuizId === q.id ? "ring-2 ring-blue-500" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{q.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {q.description || "—"}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    q.is_published
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  {q.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">{q.questions?.length || 0} questions</div>
            </button>
          ))}
        </div>
      )}

      {activeQuiz && (
        <div className="mt-6 border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50">
            <div className="font-semibold text-gray-900">{activeQuiz.title}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePublish(activeQuiz)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  activeQuiz.is_published
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {activeQuiz.is_published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={() => remove(activeQuiz)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
              <button onClick={() => setActiveQuizId(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
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
                  (activeQuiz.questions || [])
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((qq) => (
                      <div key={qq.id} className="border rounded-xl p-4">
                        <div className="flex items-start gap-2">
                          <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900">
                              {qq.order}. {qq.prompt}
                            </div>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(qq.choices || []).map((c) => (
                                <div
                                  key={c.id}
                                  className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm"
                                >
                                  <span className="text-gray-800 truncate">{c.text}</span>
                                  {c.is_correct ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                      <CheckCircle className="w-4 h-4" /> Correct
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">—</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-700" />
                <div className="font-medium text-gray-900">Submissions</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Latest 2000 submissions (instant-graded).
              </div>

              {subLoading ? (
                <div className="mt-4 text-sm text-gray-600">Loading submissions…</div>
              ) : submissions.length === 0 ? (
                <div className="mt-4 text-sm text-gray-600">No submissions yet.</div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-3">Student</th>
                        <th className="py-2 pr-3">Score</th>
                        <th className="py-2 pr-3">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {submissions.map((s) => (
                        <tr key={s.id}>
                          <td className="py-2 pr-3">
                            <div className="font-medium text-gray-900">{s.student.full_name}</div>
                            <div className="text-xs text-gray-500">{s.student.email}</div>
                          </td>
                          <td className="py-2 pr-3">
                            <span className="font-semibold text-gray-900">
                              {s.score}/{s.total}
                            </span>
                          </td>
                          <td className="py-2 pr-3 text-gray-600">
                            {new Date(s.created_at).toLocaleString()}
                          </td>
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

      {createOpen && (
        <CreateQuizModal
          courseId={courseId}
          onClose={() => setCreateOpen(false)}
          onCreated={async () => {
            setCreateOpen(false);
            await refresh();
          }}
        />
      )}
    </div>
  );
}

function CreateQuizModal({
  courseId,
  onClose,
  onCreated,
}: {
  courseId: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const token = localStorage.getItem("access");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!token) return;
    setError("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    try {
      await createQuiz(token, courseId, {
        title: title.trim(),
        description: description.trim(),
        is_published: publishNow,
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
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create Quiz</h3>
            <p className="text-xs text-gray-600">Add questions after creating.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="e.g., Week 1 Quiz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="Optional instructions"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
            Publish now
          </label>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddQuestionForm({ quizId, onAdded }: { quizId: number; onAdded: () => void }) {
  const token = localStorage.getItem("access");
  const [prompt, setPrompt] = useState("");
  const [order, setOrder] = useState("1");
  const [choices, setChoices] = useState([
    { text: "", is_correct: true },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setChoiceText = (idx: number, val: string) => {
    setChoices((prev) => prev.map((c, i) => (i === idx ? { ...c, text: val } : c)));
  };

  const setCorrect = (idx: number) => {
    setChoices((prev) => prev.map((c, i) => ({ ...c, is_correct: i === idx })));
  };

  const submit = async () => {
    if (!token) return;
    setError("");
    if (!prompt.trim()) {
      setError("Question prompt is required");
      return;
    }
    const o = Number(order);
    if (!o || o <= 0) {
      setError("Order must be a positive number");
      return;
    }
    if (choices.some((c) => !c.text.trim())) {
      setError("All choices must have text");
      return;
    }

    setSaving(true);
    try {
      await addQuizQuestion(token, quizId, {
        prompt: prompt.trim(),
        order: o,
        choices: choices.map((c) => ({ text: c.text.trim(), is_correct: c.is_correct })),
      });
      setPrompt("");
      setOrder(String(o + 1));
      setChoices([
        { text: "", is_correct: true },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ]);
      onAdded();
    } catch (e: any) {
      setError(e?.message || "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-xl p-4">
      <div className="font-medium text-gray-900">Add Question</div>
      {error && <div className="mt-2 text-sm text-red-700">{error}</div>}

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600">Prompt</label>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="Question text"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Order</label>
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="1"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {choices.map((c, idx) => (
          <div key={idx} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-600">Choice {idx + 1}</div>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                <input type="radio" checked={c.is_correct} onChange={() => setCorrect(idx)} />
                Correct
              </label>
            </div>
            <input
              value={c.text}
              onChange={(e) => setChoiceText(idx, e.target.value)}
              className="mt-2 w-full border rounded-lg px-3 py-2"
              placeholder="Choice text"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={submit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          {saving ? "Adding…" : "Add Question"}
        </button>
      </div>
    </div>
  );
}
