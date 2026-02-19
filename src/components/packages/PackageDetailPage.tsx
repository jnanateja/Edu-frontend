import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPublicPackageDetail,
  purchasePackage,
  getStudentPurchases,
  formatPrice,
} from "../../api/api";
import { CheckCircle, Lock, ShoppingCart } from "lucide-react";

type Course = {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
};

type Package = {
  id: number;
  title: string;
  description: string;
  price: number;
  discounted_price: number | null;
  discount_percentage: number | null;
  courses: Course[];
};

export default function PackageDetailPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("access");
  const role = localStorage.getItem("user_role");

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [owned, setOwned] = useState(false);
  const [error, setError] = useState("");

  const idNum = useMemo(() => Number(packageId), [packageId]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPublicPackageDetail(idNum);
        setPkg(data);

        // check owned if student logged in
        if (token && role === "student") {
          const purchases = await getStudentPurchases(token);
          const isOwned = Array.isArray(purchases)
            ? purchases.some((p: any) => p?.package?.id === idNum)
            : false;
          setOwned(isOwned);
        } else {
          setOwned(false);
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load package");
        setPkg(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [idNum]);

  const priceToShow = useMemo(() => {
    if (!pkg) return "";
    if (pkg.is_free) return "Free";
    const best = pkg.discounted_price ?? pkg.price;
    return formatPrice(best);
  }, [pkg]);

  const handleBuy = async () => {
    setError("");
    if (!token) {
      navigate(`/login?redirect=/packages/${idNum}`);
      return;
    }
    if (role !== "student") {
      setError("Only students can purchase packages.");
      return;
    }

    try {
      setBuying(true);
      await purchasePackage(token, idNum);
      setOwned(true);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Purchase failed");
    } finally {
      setBuying(false);
    }
  };

  const openCourse = (courseId: number) => {
    if (!token) {
      navigate(`/login?redirect=/student/courses/${courseId}`);
      return;
    }
    if (role !== "student") {
      // teachers/admins: for now just block or redirect
      navigate(`/teacher/courses/${courseId}`);
      return;
    }
    navigate(`/student/courses/${courseId}`);
  };

  if (loading) return <div className="p-10 text-center">Loading package...</div>;
  if (!pkg) return <div className="p-10 text-center text-red-600">{error || "Package not found"}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pkg.title}</h1>
              <p className="text-gray-600">{pkg.description}</p>

              <div className="mt-4 text-sm text-gray-500">
                Includes <span className="font-semibold">{pkg.courses?.length || 0}</span> courses
              </div>
            </div>

            <div className="min-w-[260px] bg-gray-50 border rounded-xl p-5">
              <div className="text-sm text-gray-600 mb-1">One-time unlock</div>
              <div className="text-2xl font-bold mb-3">{priceToShow}</div>

              {!!pkg.discount_percentage && pkg.discount_percentage > 0 && !pkg.is_free && (
                <div className="text-xs mb-3 inline-block bg-green-100 text-green-700 px-2 py-1 rounded">
                  {Math.round(pkg.discount_percentage)}% OFF
                </div>
              )}

              {owned ? (
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Owned
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 ${
                    buying ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-purple-600"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {buying ? "Unlocking..." : pkg.is_free ? "Unlock Free" : "Buy & Unlock"}
                </button>
              )}

              {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

              {!token && (
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Sign in to unlock
                </div>
              )}
            </div>
          </div>

          {/* Courses in this package */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Courses included</h2>

            <div className="space-y-3">
              {pkg.courses?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCourse(c.id)}
                  className="w-full text-left bg-gray-50 hover:bg-gray-100 border rounded-xl p-4 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{c.description}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {c.exam_target?.toUpperCase()} • Class {c.student_class}
                      </div>
                    </div>

                    <div className="text-xs px-2 py-1 rounded bg-white border text-gray-700">
                      {owned || c.is_free ? "Open" : "Locked"}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {(!pkg.courses || pkg.courses.length === 0) && (
              <div className="text-sm text-gray-600">No courses added to this package yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
