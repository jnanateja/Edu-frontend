import { useEffect, useState } from "react";
import { getStudentCourses, getStudentSchedules, getStudentNotifications, markNotificationRead } from "../../api/api";
import { useNavigate } from "react-router-dom";

interface Course {
  id: number;
  title: string;
  description: string;
  exam_target: "jee" | "neet" | "eamcet";
  student_class: "11" | "12";
  sections: any[];
}

interface Schedule {
  id: number;
  course: number;
  course_title?: string;
  title: string;
  start_at: string;
  end_at?: string | null;
  live_link?: string | null;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  course?: number | null;
  course_title?: string;
  url?: string;
}

const StudentDashboard = () => {
  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Authentication required");
      const data = await getStudentCourses(token);
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchExtras = async () => {
    if (!token) return;
    try {
      const [sched, notifs] = await Promise.all([
        getStudentSchedules(token),
        getStudentNotifications(token),
      ]);
      setSchedules(Array.isArray(sched) ? sched : []);
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (e) {
      console.error("Failed to load schedules/notifications", e);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchExtras();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              My Learning
            </h1>
            <p className="text-gray-600 mt-1">
              Your unlocked courses from subscribed packages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {courses.length} Courses
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600">{error}</span>
            <button
              onClick={fetchCourses}
              className="ml-auto text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Upcoming schedules + notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Upcoming Classes</h2>
            <button
              onClick={fetchExtras}
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
          {schedules.length === 0 ? (
            <div className="text-sm text-gray-500">No schedules yet.</div>
          ) : (
            <div className="space-y-3">
              {schedules.slice(0, 5).map((s) => (
                <div key={s.id} className="border rounded-lg p-3">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-gray-600">
                    {s.course_title ? `${s.course_title} • ` : ""}
                    {new Date(s.start_at).toLocaleString()}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => navigate(`/student/courses/${s.course}`)}
                      className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                    >
                      View Course
                    </button>
                    {s.live_link ? (
                      <a
                        href={s.live_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Join Live
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Notifications</h2>
            <button
              onClick={async () => {
                if (!token) return;
                await markNotificationRead(token);
                await fetchExtras();
              }}
              className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            >
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <div className="text-sm text-gray-500">No notifications.</div>
          ) : (
            <div className="space-y-3">
              {notifications
                .slice()
                .sort((a, b) => Number(a.is_read) - Number(b.is_read))
                .slice(0, 6)
                .map((n) => (
                  <div
                    key={n.id}
                    className={`border rounded-lg p-3 ${n.is_read ? "opacity-80" : "bg-yellow-50"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{n.title}</div>
                        <div className="text-sm text-gray-600">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!n.is_read ? (
                          <button
                            onClick={async () => {
                              if (!token) return;
                              await markNotificationRead(token, n.id);
                              await fetchExtras();
                            }}
                            className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                          >
                            Mark read
                          </button>
                        ) : null}
                        {n.course ? (
                          <button
                            onClick={() => navigate(`/student/courses/${n.course}`)}
                            className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                          >
                            Open
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No unlocked courses yet
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Enroll in a learning path to unlock full course content and quizzes.
          </p>
          <button
            onClick={() => navigate("/learning-paths")}
            className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Browse Learning Paths
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-3 mt-3">
                  {course.description || "No description provided"}
                </p>

                <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {course.exam_target.toUpperCase()}
                  </span>
                  <span>Class {course.student_class}</span>
                </div>

                <div className="text-sm text-gray-600 mt-4">
                  <span className="font-medium">Sections:</span>{" "}
                  {course.sections?.length || 0}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t">
                <button
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                  View Course
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
