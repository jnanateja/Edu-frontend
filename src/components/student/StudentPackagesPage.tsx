import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStudentPurchases } from "../../api/api";
import { Package, Receipt } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
  is_free: boolean;
  price: number;
  discounted_price: number | null;
  sections_count?: number;
  subsections_count?: number;
};

type PackageType = {
  id: number;
  title: string;
  description: string;
  is_free: boolean;
  price: number;
  discounted_price: number | null;
  featured: boolean;
  cover_image?: string | null;
  courses: Course[];
};

type Purchase = {
  id: number;
  status: string;
  created_at: string;
  package: PackageType;
};

export default function StudentPackagesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("access");
        if (!token) {
          navigate("/login?redirect=" + encodeURIComponent("/student/learning-paths"));
          return;
        }
        const data = await getStudentPurchases(token);
        setPurchases(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load your learning paths.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning Paths</h1>
          <p className="text-gray-600 text-sm mt-1">
            Your enrollments. Open a learning path to see its courses and continue learning.
          </p>
        </div>
        <Link
          to="/learning-paths"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
        >
          Browse Learning Paths
        </Link>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border p-6 text-gray-700">Loading your learning paths…</div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {!loading && !error && purchases.length === 0 && (
        <div className="bg-white rounded-xl border p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No learning paths yet</h2>
          <p className="mt-1 text-sm text-gray-600">
            Enroll in a learning path to unlock all included courses and quizzes.
          </p>
          <Link
            to="/learning-paths"
            className="mt-5 inline-flex items-center px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
          >
            Explore Learning Paths
          </Link>
        </div>
      )}

      {!loading && !error && purchases.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <button
              key={purchase.id}
              onClick={() => navigate(`/student/learning-paths/${purchase.package.id}`)}
              className="text-left bg-white rounded-xl border hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-[16/9] bg-gradient-to-r from-green-100 to-emerald-100">
                {purchase.package.cover_image ? (
                  <img
                    src={purchase.package.cover_image}
                    alt={purchase.package.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                    Learning Path Cover
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {purchase.package.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {purchase.package.description || "No description provided."}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                  <span className="font-medium">{purchase.package.courses?.length || 0} courses</span>
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                    {purchase.status}
                  </span>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Purchased: {new Date(purchase.created_at).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
