import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeaturedPackages, getPublicPackages, formatPrice } from "../../api/api";
import { Star, ChevronRight } from "lucide-react";

type Package = {
  id: number;
  title: string;
  description: string;
  is_free: boolean;
  price: number;
  discounted_price: number | null;
  discount_percentage: number | null;
  featured: boolean;
  courses: any[];
};

export default function PackagesPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const featured = await getFeaturedPackages();
        if (Array.isArray(featured) && featured.length > 0) {
          setPackages(featured);
        } else {
          const all = await getPublicPackages();
          setPackages(Array.isArray(all) ? all : []);
        }
      } catch (e) {
        console.error(e);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const priceLabel = (p: Package) => {
    if (p.is_free) return "Free";
    const best = p.discounted_price ?? p.price;
    return formatPrice(best);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm py-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Packages</h1>
        <p className="text-gray-600">One-time purchase • Unlock all included courses</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No packages available.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    {p.featured ? "Featured" : "Package"}
                  </span>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>Value</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{p.description}</p>

                <div className="text-sm text-gray-500 mb-4">
                  Includes <span className="font-semibold">{p.courses?.length || 0}</span> courses
                </div>

                <div className="flex items-center justify-between mb-5">
                  <div className="text-lg font-bold">{priceLabel(p)}</div>
                  {!!p.discount_percentage && p.discount_percentage > 0 && !p.is_free && (
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">
                      {Math.round(p.discount_percentage)}% OFF
                    </span>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/packages/${p.id}`)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  View Package <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
