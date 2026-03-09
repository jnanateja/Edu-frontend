import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicCourses, formatPrice } from "../../api/api";
import {
  Search,
  Filter,
  Star,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
  estimated_duration: string | null;
  rating: number | null;
  total_enrollments: number;
  is_free: boolean;
  price: number;
  discounted_price: number | null;
}

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    exam_target: "",
    student_class: "",
    price_type: "",
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const data = await getPublicCourses({
        exam_target: filters.exam_target || undefined,
        class: filters.student_class || undefined,
        price_type: (filters.price_type as any) || undefined,
      });

      setCourses(data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = (courseId: number) => {
    const token = localStorage.getItem("access");
    navigate(token ? `/courses/${courseId}` : `/login?redirect=/courses/${courseId}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ exam_target: "", student_class: "", price_type: "" });
    setSearchQuery("");
  };

  const filteredCourses = courses.filter((course) => {
    const title = course.title?.toLowerCase() || "";
    const desc = course.description?.toLowerCase() || "";
    return (
      title.includes(searchQuery.toLowerCase()) ||
      desc.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white shadow-sm py-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Browse All Courses</h1>
        <p className="text-gray-600">
          Discover courses tailored for JEE, NEET, and EAMCET preparation
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* SEARCH + FILTER BUTTON */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 border rounded-lg flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6 grid md:grid-cols-3 gap-6">
            <select
              className="border rounded-lg px-4 py-2"
              value={filters.exam_target}
              onChange={(e) => handleFilterChange("exam_target", e.target.value)}
            >
              <option value="">All Exams</option>
              <option value="jee">JEE</option>
              <option value="neet">NEET</option>
              <option value="eamcet">EAMCET</option>
            </select>

            <select
              className="border rounded-lg px-4 py-2"
              value={filters.student_class}
              onChange={(e) => handleFilterChange("student_class", e.target.value)}
            >
              <option value="">All Classes</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>

            <select
              className="border rounded-lg px-4 py-2"
              value={filters.price_type}
              onChange={(e) => handleFilterChange("price_type", e.target.value)}
            >
              <option value="">All Courses</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        )}

        {/* COURSES GRID */}
        {loading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            No courses found
            <div>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between mb-3">
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                    {course.exam_target.toUpperCase()}
                  </span>
                  {false && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                <div className="text-sm text-gray-500 mb-4 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {course.estimated_duration || "Self-paced"} • Class {course.student_class}
                </div>

                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1">{course.rating?.toFixed(1) ?? "4.5"}</span>
                    <Users className="w-4 h-4 ml-3 mr-1 text-gray-400" />
                    {course.total_enrollments}
                  </div>

                  {course.is_free ? (
                    <span className="text-lg font-bold text-green-600">Free</span>
                  ) : (
                    <span className="text-lg font-bold">
                      {formatPrice(course.discounted_price ?? course.price)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleEnrollClick(course.id)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  {course.is_free ? "Enroll for Free" : "Enroll Now"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
