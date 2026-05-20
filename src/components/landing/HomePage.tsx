import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFeaturedPackages, getPublicPackages, formatPrice } from "../../api/api";
import BrandMark from "../common/BrandMark";
import LegalLinks from "../common/LegalLinks";


import {
  Menu,
  X,
  ArrowRight,
  Clock,
  BookOpen,
  Users,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  rating: number | null;
  total_enrollments: number;
  estimated_duration: string | null;
  featured: boolean;
  student_class: string;
}

interface Package {
  id: number;
  title: string;
  description: string;
  featured: boolean;
  is_free: boolean;
  price: number;
  discounted_price: number | null;
  cover_image?: string | null;
  courses: Course[];
}

const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredPackages, setFeaturedPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPackages();
  }, []);

  const fetchFeaturedPackages = async () => {
    try {
      setLoading(true);

      const featured = await getFeaturedPackages();

      // ✅ If no featured packages, show latest published packages instead
      if (Array.isArray(featured) && featured.length > 0) {
        setFeaturedPackages(featured);
        return;
      }

      const published = await getPublicPackages();
      setFeaturedPackages(Array.isArray(published) ? published.slice(0, 6) : []);
    } catch (err) {
      console.error("Failed to fetch featured packages:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleViewPackage = (packageId: number, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/learning-paths/${packageId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* ================= NAVIGATION ================= */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BrandMark logoClassName="h-10 w-10" nameClassName="text-2xl font-bold text-[#0B2E69]" />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600">
                Features
              </a>
              <a href="#courses" className="text-gray-700 hover:text-blue-600">
                Learning Paths
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600">
                Testimonials
              </a>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </Link>
              <Link to="/login" className="text-blue-600 font-medium">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg"
              >
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="pt-24 pb-16 px-4 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ace Your
          </span>
          <br />
          Competitive Exams
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Online learning paths for JEE, NEET, and EAMCET preparation.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/learning-paths")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl flex items-center gap-2"
          >
            Explore Learning Paths <ArrowRight />
          </button>
        </div>
      </section>

      {/* ================= FEATURED PACKAGES (MARKETING) ================= */}
      <section id="courses" className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-4xl font-bold text-center">Featured Learning Paths</h2>
            <p className="text-gray-600 mt-3 text-center max-w-2xl">
              Structured course bundles for exam preparation.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading packages...</div>
          ) : featuredPackages.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No featured packages yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPackages.map((pkg) => {
                const hasDiscount =
                  !pkg.is_free &&
                  pkg.discounted_price != null &&
                  pkg.discounted_price > 0 &&
                  pkg.discounted_price < pkg.price;

                const discountPct = hasDiscount
                  ? Math.round(
                      ((pkg.price - (pkg.discounted_price as number)) /
                        pkg.price) *
                        100
                    )
                  : 0;

                return (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden relative"
                  >
                    <div className="aspect-[16/9] bg-gradient-to-r from-blue-100 to-purple-100 overflow-hidden">
                      {pkg.cover_image ? (
                        <img src={pkg.cover_image} alt={pkg.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                          Learning Path Cover
                        </div>
                      )}
                    </div>
                    {/* Featured ribbon */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                          {(pkg.courses?.length || 0)} Courses
                        </span>

                        <div className="flex items-center text-gray-600">
                          <BookOpen className="w-4 h-4" />
                          <span className="ml-1 text-sm">Bundle</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2">{pkg.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {pkg.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Self-paced
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Full Access
                        </span>
                      </div>

                      {/* Price + discount */}
                      <div className="mb-5">
                        {pkg.is_free ? (
                          <div className="text-2xl font-bold text-green-600">
                            Free
                          </div>
                        ) : (
                          <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold">
                              {formatPrice(
                                hasDiscount
                                  ? (pkg.discounted_price as number)
                                  : pkg.price
                              )}
                            </div>

                            {hasDiscount && (
                              <>
                                <div className="text-sm text-gray-500 line-through">
                                  {formatPrice(pkg.price)}
                                </div>
                                <div className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {discountPct}% OFF
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Instant access after subscription</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleViewPackage(pkg.id, e)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-95 transition"
                      >
                        View Learning Path
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} K3 Rankers adda. All rights reserved.
          </p>
          <LegalLinks theme="dark" className="mt-4" />
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
