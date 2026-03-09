import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudentQuizStatus, startStudentQuiz, submitPdfQuiz, submitQuizAttempt } from "../../api/api";
import { ArrowLeft, CheckCircle, Download, FileText, UploadCloud, XCircle } from "lucide-react";

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
  questions: Array<{ id: number; prompt: string; order: number; choices: Array<{ id: number; text: string }> }>;
};

export default function StudentTakeQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [attemptsInfo, setAttemptsInfo] = useState<any>(null);
  const [nowTick, setNowTick] = useState(Date.now());
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Login required");
      const status = await getStudentQuizStatus(token, Number(quizId));
      setAttemptsInfo(status);
      const start = await startStudentQuiz(token, Number(quizId));
      setAttemptId(start?.attempt_id || null);
      setExpiresAt(start?.expires_at || null);
      setQuiz(start?.quiz || null);
      if (start?.submission) setResult({ submission: start.submission, manual_grading_pending: true });
    } catch (e: any) {
      setError(e?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [quizId]);
  useEffect(() => {
    if (!expiresAt || result) return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt, result]);

  const remainingSeconds = useMemo(() => {
    if (!expiresAt) return null;
    const ms = new Date(expiresAt).getTime() - nowTick;
    return Math.max(0, Math.floor(ms / 1000));
  }, [expiresAt, nowTick]);
  const formatRemaining = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const total = useMemo(() => quiz?.questions?.length || 0, [quiz]);

  const submitMcq = async () => {
    if (!token || !quiz || !attemptId) return;
    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(token, quiz.id, attemptId, answers);
      setResult(res);
    } catch (e: any) {
      alert(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPdf = async () => {
    if (!token || !quiz || !submissionFile) return;
    setSubmitting(true);
    try {
      const res = await submitPdfQuiz(token, quiz.id, submissionFile);
      setResult(res);
    } catch (e: any) {
      alert(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (quiz?.quiz_type !== "mcq" || result) return;
    if (remainingSeconds === null || remainingSeconds > 0) return;
    if (!submitting && quiz && attemptId) submitMcq();
  }, [remainingSeconds]);

  if (loading) return <div className="p-6 text-gray-700">Loading…</div>;
  if (error || !quiz) {
    return <div className="p-6"><button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-700"><ArrowLeft className="w-4 h-4" /> Back</button><div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error || "Quiz not found"}</div></div>;
  }

  const isPdf = quiz.quiz_type === "pdf";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-700"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="mt-4 bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{quiz.description || "—"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="px-2 py-1 rounded-full border bg-gray-50">{isPdf ? "PDF quiz" : "MCQ quiz"}</span>
              {attemptsInfo?.due_at ? <span className="px-2 py-1 rounded-full border bg-gray-50">Due: {new Date(attemptsInfo.due_at).toLocaleString()}</span> : null}
              {!isPdf && attemptsInfo ? <>
                <span className="px-2 py-1 rounded-full border bg-gray-50">Attempts used: {attemptsInfo.attempts_used}</span>
                {attemptsInfo.unlimited_attempts ? <span className="px-2 py-1 rounded-full border bg-gray-50">Unlimited retakes</span> : <span className="px-2 py-1 rounded-full border bg-gray-50">Attempts left: {attemptsInfo.attempts_left}</span>}
              </> : null}
            </div>
          </div>
          {!isPdf && result?.score !== undefined ? <div className="text-right"><div className="text-sm text-gray-600">Score</div><div className="text-2xl font-bold text-gray-900">{result.score}/{result.total}</div><div className="text-sm text-gray-600">{result.percent}%</div></div> : null}
        </div>

        {isPdf ? (
          <div className="mt-6 space-y-4">
            <div className="border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-2 font-medium text-gray-900"><FileText className="w-4 h-4" /> Instructions</div>
              <p className="mt-2 text-sm text-gray-600">Download the question PDF, complete your answers, then upload your response file before the due time.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {quiz.question_pdf ? <a href={quiz.question_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-white"><Download className="w-4 h-4" /> Download questions PDF</a> : null}
                {result?.submission?.quiz?.answer_key_pdf || quiz.answer_key_pdf ? <a href={quiz.answer_key_pdf || result?.submission?.quiz?.answer_key_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-white"><Download className="w-4 h-4" /> Download answer key</a> : null}
              </div>
            </div>
            {result?.submission ? (
              <div className="border rounded-xl p-4 bg-green-50 border-green-200">
                <div className="font-medium text-green-900">Submitted successfully</div>
                <p className="mt-1 text-sm text-green-800">Your teacher will review this PDF quiz and add a manual grade.</p>
                {result.submission.feedback ? <div className="mt-3 text-sm text-gray-700">Feedback: {result.submission.feedback}</div> : null}
              </div>
            ) : (
              <div className="border rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700">Upload your answer PDF/file</label>
                <input type="file" accept="application/pdf,.pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} className="mt-2 w-full border rounded-lg px-3 py-2 text-sm" />
                <div className="mt-4 flex justify-end">
                  <button onClick={submitPdf} disabled={submitting || !submissionFile} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"><UploadCloud className="w-4 h-4" /> {submitting ? "Submitting…" : "Submit PDF Quiz"}</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {!result && expiresAt && <div className="mt-4 flex items-center justify-between gap-3 border rounded-xl p-3 bg-gray-50"><div className="text-sm text-gray-700">Time remaining: <span className="font-semibold">{formatRemaining(remainingSeconds ?? 0)}</span></div><div className="text-xs text-gray-500">Ends at: {new Date(expiresAt).toLocaleTimeString()}</div></div>}
            <div className="mt-6 space-y-5">
              {quiz.questions.slice().sort((a, b) => a.order - b.order).map((q) => {
                const qRes = result?.results?.find((r: any) => r.question_id === q.id);
                const selected = answers[String(q.id)];
                return (
                  <div key={q.id} className="border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium text-gray-900">{q.order}. {q.prompt}</div>
                      {result && qRes ? <div className="shrink-0">{qRes.is_correct ? <span className="inline-flex items-center gap-1 text-green-700 text-sm"><CheckCircle className="w-5 h-5" /> Correct</span> : <span className="inline-flex items-center gap-1 text-red-700 text-sm"><XCircle className="w-5 h-5" /> Wrong</span>}</div> : null}
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.choices.map((c) => {
                        const isSelected = selected === c.id;
                        const isCorrect = result && qRes && qRes.correct_choice_id === c.id;
                        const isSelectedWrong = result && qRes && isSelected && !qRes.is_correct;
                        return (
                          <button key={c.id} disabled={!!result} onClick={() => setAnswers((prev) => ({ ...prev, [String(q.id)]: c.id }))} className={`text-left border rounded-lg px-3 py-2 text-sm transition-colors ${isSelected ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"} ${result && isCorrect ? "border-green-500 bg-green-50" : ""} ${result && isSelectedWrong ? "border-red-500 bg-red-50" : ""}`}>
                            {c.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {!result && <div className="mt-6 flex items-center justify-end gap-3"><div className="text-sm text-gray-600">Answered {Object.keys(answers).length}/{total}</div><button onClick={submitMcq} disabled={submitting || total === 0} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">{submitting ? "Submitting…" : "Submit & Get Score"}</button></div>}
          </>
        )}
      </div>
    </div>
  );
}
