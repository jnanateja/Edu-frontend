import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, FileText, XCircle } from "lucide-react";
import { getStudentQuizSubmissionDetail } from "../../api/api";

type Choice = { id: number; text: string; is_correct: boolean };
type Question = { id: number; prompt: string; order: number; selected_choice_id: number | null; choices: Choice[] };
type ReviewPayload = {
  id: number;
  score: number;
  total: number;
  attempt_number: number;
  status: string;
  created_at: string;
  submission_file?: string | null;
  feedback?: string;
  graded_at?: string | null;
  quiz: {
    id: number;
    title: string;
    description: string;
    quiz_type?: "mcq" | "pdf";
    question_pdf?: string | null;
    answer_key_pdf?: string | null;
    course: { id: number; title: string };
    questions: Question[];
  };
};

export default function StudentQuizReview() {
  const navigate = useNavigate();
  const { submissionId } = useParams();
  const token = localStorage.getItem("access");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ReviewPayload | null>(null);
  const idNum = useMemo(() => Number(submissionId || 0), [submissionId]);

  useEffect(() => {
    const run = async () => {
      if (!token || !idNum) return;
      setLoading(true);
      setError("");
      try {
        const res = await getStudentQuizSubmissionDetail(token, idNum);
        setData(res);
      } catch (e: any) {
        setError(e?.message || "Failed to load review");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [token, idNum]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-700"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="mt-4 bg-white border rounded-2xl shadow-sm p-6">
        {loading && <div className="text-gray-700">Loading…</div>}
        {!loading && error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}
        {!loading && !error && data && (
          <>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-600">{data.quiz.course.title}</div>
              <h1 className="text-2xl font-bold text-gray-900">{data.quiz.title}</h1>
              <p className="text-sm text-gray-600">{data.quiz.description || "—"}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">Score: <span className="font-semibold">{data.score}/{data.total}</span></span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">{data.quiz.quiz_type === "pdf" ? "PDF quiz" : `Attempt #${data.attempt_number}`}</span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800">{new Date(data.created_at).toLocaleString()}</span>
              </div>
            </div>

            {data.quiz.quiz_type === "pdf" ? (
              <div className="mt-6 space-y-4">
                <div className="border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-2 font-medium text-gray-900"><FileText className="w-4 h-4" /> PDF quiz review</div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    {data.quiz.question_pdf ? <a href={data.quiz.question_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-white"><Download className="w-4 h-4" /> Questions PDF</a> : null}
                    {data.submission_file ? <a href={data.submission_file} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-white"><Download className="w-4 h-4" /> Your submission</a> : null}
                    {data.quiz.answer_key_pdf ? <a href={data.quiz.answer_key_pdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-white"><Download className="w-4 h-4" /> Answer key</a> : <div className="text-sm text-gray-600">Answer key will be available only after the due time has passed and the teacher has graded this quiz.</div>}
                  </div>
                </div>
                {data.feedback ? <div className="border rounded-xl p-4"><div className="font-medium text-gray-900">Teacher feedback</div><div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{data.feedback}</div></div> : <div className="text-sm text-gray-600">No feedback added yet.</div>}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {data.quiz.questions.slice().sort((a, b) => a.order - b.order).map((q, idx) => {
                  const selected = q.selected_choice_id;
                  const correctChoice = q.choices.find((c) => c.is_correct);
                  const isCorrect = selected != null && correctChoice && selected === correctChoice.id;
                  return (
                    <div key={q.id} className="border rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div><div className="text-xs text-gray-500">Question {idx + 1}</div><div className="font-semibold text-gray-900 mt-1">{q.prompt}</div></div>
                        {isCorrect ? <div className="inline-flex items-center gap-1 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4" /> Correct</div> : <div className="inline-flex items-center gap-1 text-red-700 text-sm"><XCircle className="w-4 h-4" /> Incorrect</div>}
                      </div>
                      <div className="mt-3 space-y-2">
                        {q.choices.map((c) => {
                          const isSelected = selected === c.id;
                          const isCorrectChoice = c.is_correct;
                          let cls = "border rounded-lg px-3 py-2 text-sm";
                          if (isCorrectChoice) cls += " border-green-300 bg-green-50"; else cls += " border-gray-200";
                          if (isSelected && !isCorrectChoice) cls += " bg-red-50 border-red-300";
                          return <div key={c.id} className={cls}><div className="flex items-center justify-between gap-3"><div className="text-gray-900">{c.text}</div><div className="text-xs text-gray-600">{isCorrectChoice ? "Correct answer" : ""}{isSelected ? (isCorrectChoice ? " • Your choice" : "Your choice") : ""}</div></div></div>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
