import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentQuizSubmissions } from "../../api/api";
import { ArrowLeft, Trophy } from "lucide-react";

type Submission = {
  id: number;
  score: number;
  total: number;
  created_at: string;
  attempt_number?: number;
  status?: string;
  quiz: {
    id: number;
    title: string;
    description: string;
    course: { id: number; title: string };
  };
};

export default function StudentGrades() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subs, setSubs] = useState<Submission[]>([]);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await getStudentQuizSubmissions(token);
      setSubs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Submission[]>();
    for (const s of subs) {
      const key = s.quiz?.course?.title || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [subs]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mt-4 bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
            <p className="text-sm text-gray-600 mt-1">All your quiz submissions with instant scores.</p>
          </div>
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>

        {loading && <div className="mt-6 text-gray-700">Loading…</div>}
        {!loading && error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
        )}

        {!loading && !error && subs.length === 0 && (
          <div className="mt-6 text-sm text-gray-600">No quiz submissions yet.</div>
        )}

        {!loading && !error && subs.length > 0 && (
          <div className="mt-6 space-y-6">
            {grouped.map(([courseTitle, items]) => (
              <div key={courseTitle} className="border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <div className="font-semibold text-gray-900">{courseTitle}</div>
                  <div className="text-xs text-gray-500">{items.length} submissions</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 px-4">Quiz</th>
                        <th className="py-2 px-4">Score</th>
                        <th className="py-2 px-4">Attempt</th>
                        <th className="py-2 px-4">Submitted</th>
                        <th className="py-2 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((s) => {
                        const percent = s.total ? Math.round((s.score / s.total) * 100) : 0;
                        return (
                          <tr key={s.id}>
                            <td className="py-2 px-4">
                              <div className="font-medium text-gray-900">{s.quiz.title}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{s.quiz.description || "—"}</div>
                            </td>
                            <td className="py-2 px-4">
                              <span className="font-semibold text-gray-900">
                                {s.score}/{s.total}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">({percent}%)</span>
                            </td>
                            <td className="py-2 px-4 text-gray-700">
                              #{s.attempt_number ?? 1}
                              {s.status ? <span className="ml-2 text-xs text-gray-500">({s.status})</span> : null}
                            </td>
                            <td className="py-2 px-4 text-gray-600">{new Date(s.created_at).toLocaleString()}</td>
                            <td className="py-2 px-4 text-right">
                              <button
                                onClick={() => navigate(`/student/grades/${s.id}`)}
                                className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-50"
                              >
                                Review answers
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
