import { useEffect, useMemo, useState } from "react";
import {
  createPackage,
  deletePackage,
  getAdminPackages,
  getCourses,
  updatePackage,
} from "../../api/api";
import { CheckCircle, Edit3, Plus, Trash2, X, Sparkles } from "lucide-react";

type Course = {
  id: number;
  title: string;
  is_published: boolean;
};

type PackageType = {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
  featured: boolean;
  is_free: boolean;
  price: number;
  discounted_price: number | null;
  courses: Array<{ id: number; title: string }>;
  created_at: string;
};

export default function AdminPackagesPanel() {
  const token = localStorage.getItem("access");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editPkg, setEditPkg] = useState<PackageType | null>(null);

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [pkgs, allCourses] = await Promise.all([
        getAdminPackages(token),
        getCourses(token),
      ]);
      setPackages(Array.isArray(pkgs) ? pkgs : []);
      setCourses(Array.isArray(allCourses) ? allCourses : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load packages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const publishedCourses = useMemo(
    () => courses.filter((c) => c.is_published),
    [courses]
  );

  const patchPkg = async (pkgId: number, patch: any) => {
    if (!token) return null;
    const updated = await updatePackage(token, pkgId, patch);
    setPackages((prev) => prev.map((p) => (p.id === pkgId ? updated : p)));
    return updated;
  };

  const remove = async (pkg: PackageType) => {
    if (!token) return;
    if (!confirm("Delete this package? This cannot be undone.")) return;
    try {
      await deletePackage(token, pkg.id);
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id));
    } catch (e: any) {
      alert(e?.message || "Failed to delete package");
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Packages</h2>
          <p className="text-sm text-gray-600 mt-1">
            Packages are your products. Price & publish packages (courses are content-only).
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          New Package
        </button>
      </div>

      {loading && <div className="mt-6 text-gray-700">Loading…</div>}

      {!loading && error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {!loading && !error && packages.length === 0 && (
        <div className="mt-6 text-sm text-gray-600">No packages yet.</div>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 pr-4">Package</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Courses</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Featured</th>
                <th className="py-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="text-gray-800 align-top">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{pkg.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {pkg.description || "—"}
                    </div>
                  </td>

                  <td className="py-3 pr-4">
                    {pkg.is_free ? (
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                        Free
                      </span>
                    ) : (
                      <div className="text-sm">
                        ₹{pkg.discounted_price ?? pkg.price}
                        {pkg.discounted_price ? (
                          <span className="ml-2 text-xs text-gray-500 line-through">
                            ₹{pkg.price}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </td>

                  <td className="py-3 pr-4">
                    <div className="text-sm">{pkg.courses?.length || 0}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {(pkg.courses || []).slice(0, 2).map((c) => c.title).join(", ")}
                      {(pkg.courses || []).length > 2 ? "…" : ""}
                    </div>
                  </td>

                  <td className="py-3 pr-4">
                    <button
                      onClick={async () => {
                        try {
                          await patchPkg(pkg.id, { is_published: !pkg.is_published });
                        } catch (e: any) {
                          alert(e?.message || "Failed to update");
                        }
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        pkg.is_published
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {pkg.is_published ? "Published" : "Draft"}
                    </button>
                  </td>

                  <td className="py-3 pr-4">
                    <button
                      onClick={async () => {
                        try {
                          await patchPkg(pkg.id, { featured: !pkg.featured });
                        } catch (e: any) {
                          alert(e?.message || "Failed to update");
                        }
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        pkg.featured
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {pkg.featured ? "Yes" : "No"}
                    </button>
                  </td>

                  <td className="py-3 pr-2 text-right">
                    <button
                      onClick={() => setEditPkg(pkg)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-50 mr-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Manage
                    </button>
                    <button
                      onClick={() => remove(pkg)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-red-50 text-red-700 border-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <PackageModal
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSaved={async () => {
            setCreateOpen(false);
            await refresh();
          }}
          token={token}
          courses={publishedCourses}
        />
      )}

      {editPkg && (
        <PackageModal
          mode="edit"
          token={token}
          courses={publishedCourses}
          existing={editPkg}
          onClose={() => setEditPkg(null)}
          onSaved={async (updated) => {
            setEditPkg(null);
            if (updated) {
              setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            } else {
              await refresh();
            }
          }}
        />
      )}
    </div>
  );
}

function PackageModal({
  mode,
  token,
  courses,
  existing,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  token: string | null;
  courses: Course[];
  existing?: any;
  onClose: () => void;
  onSaved: (updated?: any) => void;
}) {
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [isFree, setIsFree] = useState(!!existing?.is_free || false);
  const [price, setPrice] = useState(existing ? String(existing.price || "") : "");
  const [discountedPrice, setDiscountedPrice] = useState(
    existing?.discounted_price != null ? String(existing.discounted_price) : ""
  );
  const [courseIds, setCourseIds] = useState<number[]>(
    existing?.courses ? existing.courses.map((c: any) => c.id) : []
  );
  const [featured, setFeatured] = useState(!!existing?.featured || false);
  const [publishNow, setPublishNow] = useState(existing ? !!existing.is_published : true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleCourse = (id: number) => {
    setCourseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const validate = () => {
    if (!title.trim()) return "Title is required";
    if (!isFree) {
      const p = Number(price);
      if (!p || p <= 0) return "Price must be > 0 for paid packages";
      if (discountedPrice.trim()) {
        const d = Number(discountedPrice);
        if (!d || d <= 0) return "Discounted price must be > 0";
        if (d >= p) return "Discounted price must be < price";
      }
    }
    if (courseIds.length === 0) return "Select at least 1 course";
    return "";
  };

  const submit = async () => {
    if (!token) return;
    setError("");
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        is_free: isFree,
        price: isFree ? 0 : Number(price),
        discounted_price: isFree ? 0 : discountedPrice.trim() ? Number(discountedPrice) : null,
        course_ids: courseIds,
        featured,
        is_published: publishNow,
      };

      if (mode === "create") {
        const { createPackage } = await import("../../api/api");
        await createPackage(token, payload);
        onSaved();
      } else {
        const { updatePackage } = await import("../../api/api");
        const updated = await updatePackage(token, existing.id, payload);
        onSaved(updated);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === "create" ? "Create Package" : "Edit Package"}
            </h3>
            <p className="text-xs text-gray-600">
              Pick published courses, set price, publish, and feature on the homepage.
            </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="e.g., JEE 12th Complete Crash Course"
              />
            </div>

            <div className="flex items-center gap-4 mt-6 md:mt-0">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
                Published
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="What will students get inside this package?"
            />
          </div>

          <div className="border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900">Pricing</div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
                Free package
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Price (INR)</label>
                <input
                  disabled={isFree}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                  placeholder="999"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Discounted price (optional)</label>
                <input
                  disabled={isFree}
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
                  placeholder="799"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Courses in this package</div>
            {courses.length === 0 ? (
              <div className="text-sm text-gray-600">No published courses found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
                {courses.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={courseIds.includes(c.id)}
                      onChange={() => toggleCourse(c.id)}
                    />
                    <span className="truncate">{c.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "create" ? "Create Package" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
