import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuiz, submitQuiz } from "../../api/api";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

type Quiz = {
  id: number;
  title: string;
  description: string;
  questions: Array<{
    id: number;
    prompt: string;
    order: number;
    choices: Array<{ id: number; text: string }>;
  }>;
};

export default function StudentTakeQuiz() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Login required");
      const data = await getQuiz(token, Number(quizId));
      setQuiz(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [quizId]);

  const total = useMemo(() => quiz?.questions?.length || 0, [quiz]);

  const submit = async () => {
    if (!token || !quiz) return;
    setSubmitting(true);
    try {
      const res = await submitQuiz(token, quiz.id, answers);
      setResult(res);
    } catch (e: any) {
      alert(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-700">Loading…</div>;
  }

  if (error || !quiz) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error || "Quiz not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mt-4 bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-600 mt-1">{quiz.description || "—"}</p>
          </div>
          {result && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-2xl font-bold text-gray-900">
                {result.score}/{result.total}
              </div>
              <div className="text-sm text-gray-600">{result.percent}%</div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-5">
          {quiz.questions
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((q) => {
              const qRes = result?.results?.find((r: any) => r.question_id === q.id);
              const selected = answers[String(q.id)];
              return (
                <div key={q.id} className="border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-medium text-gray-900">
                      {q.order}. {q.prompt}
                    </div>
                    {result && qRes && (
                      <div className="shrink-0">
                        {qRes.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                            <CheckCircle className="w-5 h-5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 text-sm">
                            <XCircle className="w-5 h-5" /> Wrong
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.choices.map((c) => {
                      const isSelected = selected === c.id;
                      const isCorrect = result && qRes && qRes.correct_choice_id === c.id;
                      const isSelectedWrong = result && qRes && isSelected && !qRes.is_correct;
                      return (
                        <button
                          key={c.id}
                          disabled={!!result}
                          onClick={() => setAnswers((prev) => ({ ...prev, [String(q.id)]: c.id }))}
                          className={`text-left border rounded-lg px-3 py-2 text-sm transition-colors ${
                            isSelected ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                          } ${result && isCorrect ? "border-green-500 bg-green-50" : ""} ${
                            result && isSelectedWrong ? "border-red-500 bg-red-50" : ""
                          }`}
                        >
                          {c.text}
                        </button>
                      );
                    })}
                  </div>

                  {result && qRes && !qRes.is_correct && (
                    <div className="mt-3 text-sm text-gray-700">
                      Correct answer highlighted in <span className="font-medium text-green-700">green</span>.
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {!result && (
          <div className="mt-6 flex items-center justify-end gap-3">
            <div className="text-sm text-gray-600">
              Answered {Object.keys(answers).length}/{total}
            </div>
            <button
              onClick={submit}
              disabled={submitting || total === 0}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit & Get Score"}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate("/student/packages")}
              className="px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-gray-50"
            >
              Go to My Packages
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
