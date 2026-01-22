import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Users,
  Clock,
  BookOpen,
  Target,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  ArrowLeft,
  Bookmark,
  Eye,
  Download,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  category: "JEE" | "NEET" | "EAMCET";
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  students: number;
  rating: number;
  teacher: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  isFeatured?: boolean;
  thumbnail?: string;
}

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "JEE Main & Advanced Complete Course 2024",
      description: "Comprehensive preparation covering Physics, Chemistry, and Mathematics with 1000+ practice questions, mock tests, and doubt sessions.",
      category: "JEE",
      level: "Advanced",
      duration: "12 months",
      students: 2500,
      rating: 4.9,
      teacher: "Dr. Rajesh Kumar (IIT Delhi)",
      price: 19999,
      originalPrice: 24999,
      discount: 20,
      isFeatured: true,
    },
    {
      id: 2,
      title: "NEET UG Biology Mastery",
      description: "Master biology concepts with animated videos, detailed diagrams, practice tests, and live doubt clearing sessions.",
      category: "NEET",
      level: "Intermediate",
      duration: "10 months",
      students: 1800,
      rating: 4.8,
      teacher: "Dr. Priya Sharma (AIIMS)",
      price: 17999,
      originalPrice: 22999,
      discount: 22,
      isFeatured: true,
    },
    {
      id: 3,
      title: "EAMCET Engineering Complete Package",
      description: "Specialized course focusing on Physics, Chemistry, and Mathematics with state-specific syllabus coverage.",
      category: "EAMCET",
      level: "Intermediate",
      duration: "8 months",
      students: 900,
      rating: 4.7,
      teacher: "Prof. Satish Reddy",
      price: 14999,
      originalPrice: 18999,
      discount: 21,
    },
    {
      id: 4,
      title: "JEE Physics Crash Course",
      description: "Intensive course focusing on Physics with problem-solving techniques and shortcut methods.",
      category: "JEE",
      level: "Advanced",
      duration: "3 months",
      students: 1200,
      rating: 4.8,
      teacher: "Dr. Amit Verma (IIT Bombay)",
      price: 8999,
      originalPrice: 11999,
      discount: 25,
    },
    {
      id: 5,
      title: "NEET Chemistry Simplified",
      description: "Complete organic, inorganic, and physical chemistry with memory techniques and practice papers.",
      category: "NEET",
      level: "Beginner",
      duration: "6 months",
      students: 1500,
      rating: 4.7,
      teacher: "Dr. Sunita Patel",
      price: 12999,
      originalPrice: 16999,
      discount: 24,
    },
    {
      id: 6,
      title: "EAMCET Mathematics Special",
      description: "Focus on complex mathematical concepts with step-by-step solutions and shortcut tricks.",
      category: "EAMCET",
      level: "Advanced",
      duration: "4 months",
      students: 600,
      rating: 4.6,
      teacher: "Prof. Ravi Teja",
      price: 7999,
      originalPrice: 9999,
      discount: 20,
    },
    {
      id: 7,
      title: "JEE Chemistry Advanced",
      description: "Advanced chemistry concepts with focus on organic chemistry mechanisms and inorganic chemistry.",
      category: "JEE",
      level: "Advanced",
      duration: "5 months",
      students: 1100,
      rating: 4.7,
      teacher: "Dr. Anil Kapoor (IIT Madras)",
      price: 10999,
      originalPrice: 13999,
      discount: 21,
    },
    {
      id: 8,
      title: "NEET Physics Concept Builder",
      description: "Build strong physics fundamentals with visual learning and interactive simulations.",
      category: "NEET",
      level: "Beginner",
      duration: "7 months",
      students: 1300,
      rating: 4.6,
      teacher: "Dr. Vikram Singh",
      price: 11999,
      originalPrice: 14999,
      discount: 20,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["All", "JEE", "NEET", "EAMCET"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];
  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "students", label: "Most Students" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "JEE": return <Target className="w-5 h-5" />;
      case "NEET": return <GraduationCap className="w-5 h-5" />;
      case "EAMCET": return <TrendingUp className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "JEE": return "bg-blue-100 text-blue-700";
      case "NEET": return "bg-green-100 text-green-700";
      case "EAMCET": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-700";
      case "Intermediate": return "bg-yellow-100 text-yellow-700";
      case "Advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "students":
        return b.students - a.students;
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default: // popular
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating;
    }
  });

  const handleEnrollClick = (courseId: number) => {
    // Check if user is logged in
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login", { state: { returnTo: `/courses/${courseId}` } });
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/")}
                className="flex items-center text-white/90 hover:text-white mb-4 md:mb-0"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </button>
              <h1 className="text-3xl md:text-4xl font-bold mt-2">Explore Courses</h1>
              <p className="text-white/90 mt-2 max-w-2xl">
                Choose from our expertly designed courses to achieve your competitive exam goals
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses by title, description, or teacher..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Sort and Filter */}
            <div className="flex items-center gap-4">
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 border rounded-xl flex items-center gap-2 ${
                  showFilters ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300"
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? "bg-blue-600 text-white"
                            : "bg-white border text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {levels.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedLevel === level
                            ? "bg-blue-600 text-white"
                            : "bg-white border text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedLevel("All");
                  }}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(selectedCategory !== "All" || selectedLevel !== "All") && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCategory !== "All" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className="ml-2 text-blue-700 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedLevel !== "All" && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {selectedLevel}
                  <button
                    onClick={() => setSelectedLevel("All")}
                    className="ml-2 text-green-700 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {sortedCourses.length} Course{sortedCourses.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="text-sm text-gray-600">
            Showing 1-{sortedCourses.length} of {courses.length} courses
          </div>
        </div>

        {sortedCourses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedLevel("All");
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedCourses.map(course => (
              <div
                key={course.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
                  course.isFeatured ? "border-2 border-blue-500" : "border"
                }`}
              >
                {course.isFeatured && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium px-4 py-2">
                    ⭐ Featured Course
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(course.category)}`}>
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(course.category)}
                            {course.category}
                          </span>
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {course.students.toLocaleString()} students
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {course.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="flex items-center mr-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(course.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-medium">{course.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Teacher: <span className="font-medium">{course.teacher}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{course.price.toLocaleString()}
                        </span>
                        {course.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ₹{course.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {course.discount && (
                        <span className="text-sm font-medium text-green-600">
                          {course.discount}% off
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEnrollClick(course.id)}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        Enroll Now
                      </button>
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We're constantly adding new courses. Contact us if you have specific requirements or need a custom learning path.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
            >
              Request Custom Course
            </button>
            <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
              Contact Support
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">EduTeach</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">© {new Date().getFullYear()} EduTeach. All rights reserved.</p>
              <div className="flex justify-center md:justify-end space-x-6 mt-2">
                <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CoursesPage;