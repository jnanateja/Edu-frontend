import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getStudentPurchases } from "../../api/api";
import { BookOpen, ChevronRight, Package } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
  sections_count?: number;
  subsections_count?: number;
};

type PackageType = {
  id: number;
  title: string;
  description: string;
  courses: Course[];
};

type Purchase = {
  id: number;
  status: string;
  created_at: string;
  package: PackageType;
};

export default function StudentPackageDetail() {
  const navigate = useNavigate();
  const { packageId } = useParams<{ packageId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchase, setPurchase] = useState<Purchase | null>(null);

  const pkgId = useMemo(() => Number(packageId), [packageId]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("access");
        if (!token) {
          navigate("/login?redirect=" + encodeURIComponent(`/student/packages/${pkgId}`));
          return;
        }
        const data = await getStudentPurchases(token);
        const list: Purchase[] = Array.isArray(data) ? data : [];
        const found = list.find((p) => p.package?.id === pkgId) || null;
        setPurchase(found);
        if (!found) {
          setError("You don't have access to this package (or it may have expired).");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load package.");
      } finally {
        setLoading(false);
      }
    };
    if (Number.isFinite(pkgId) && pkgId > 0) run();
  }, [navigate, pkgId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border p-6">Loading package…</div>
      </div>
    );
  }

  if (!purchase || error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Package className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Package unavailable</h2>
          <p className="mt-1 text-sm text-gray-600">{error || "Not found."}</p>
          <Link
            to="/student/packages"
            className="mt-5 inline-flex items-center px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
          >
            Back to My Packages
          </Link>
        </div>
      </div>
    );
  }

  const pkg = purchase.package;

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/student/packages" className="text-sm text-green-700 hover:underline">
            ← My Packages
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{pkg.title}</h1>
          <p className="text-gray-600 text-sm mt-1">{pkg.description || "No description provided."}</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 rounded-full bg-gray-100">{purchase.status}</span>
            <span>Purchased {new Date(purchase.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <Link
          to="/packages"
          className="inline-flex items-center px-4 py-2 rounded-lg border bg-white text-sm font-medium hover:bg-gray-50"
        >
          Browse Packages
        </Link>
      </div>

      <div className="mt-6 bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Courses in this package</h2>
          </div>
          <div className="text-sm text-gray-600">{pkg.courses?.length || 0} courses</div>
        </div>

        <div className="divide-y">
          {(pkg.courses || []).map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/student/courses/${c.id}`)}
              className="w-full text-left px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-gray-900">{c.title}</div>
                <div className="text-sm text-gray-600 line-clamp-1">
                  {c.description || "No description provided."}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {c.exam_target?.toUpperCase()} • Class {c.student_class}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
