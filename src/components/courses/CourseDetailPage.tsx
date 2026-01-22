import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Download,
  Bookmark,
  Share2,
  Check,
  FileText,
  Video,
  MessageSquare,
  Award,
  Calendar,
  Target,
  GraduationCap,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Mock course data - In real app, fetch from API based on courseId
  const course = {
    id: parseInt(courseId || "1"),
    title: "JEE Main & Advanced Complete Course 2024",
    description: "Comprehensive preparation covering Physics, Chemistry, and Mathematics with 1000+ practice questions, mock tests, and doubt sessions.",
    longDescription: `This comprehensive course is designed to help you crack both JEE Main and Advanced exams with confidence. Our expert faculty from IITs have designed this course to cover every aspect of the syllabus in depth.

Key Highlights:
• Complete coverage of Class 11 & 12 Physics, Chemistry, and Mathematics
• 1000+ practice questions with video solutions
• 50+ full-length mock tests
• Weekly doubt clearing sessions
• Personal mentor support
• Performance analytics and progress tracking

The course includes animated video lectures, detailed study material, and regular assessments to ensure you're exam-ready.`,
    category: "JEE",
    level: "Advanced",
    duration: "12 months",
    totalLectures: 300,
    totalHours: 500,
    students: 2500,
    rating: 4.9,
    reviews: 1247,
    teacher: {
      name: "Dr. Rajesh Kumar",
      qualification: "Ph.D. in Physics, IIT Delhi",
      experience: "15+ years teaching experience",
      students: "5000+",
      rating: 4.9,
    },
    price: 19999,
    originalPrice: 24999,
    discount: 20,
    isFeatured: true,
    syllabus: [
      {
        module: "Physics",
        topics: [
          "Mechanics",
          "Thermodynamics",
          "Electromagnetism",
          "Optics",
          "Modern Physics",
        ],
        lectures: 120,
        hours: 200,
      },
      {
        module: "Chemistry",
        topics: [
          "Physical Chemistry",
          "Organic Chemistry",
          "Inorganic Chemistry",
          "Coordination Compounds",
          "Biomolecules",
        ],
        lectures: 100,
        hours: 180,
      },
      {
        module: "Mathematics",
        topics: [
          "Algebra",
          "Calculus",
          "Coordinate Geometry",
          "Trigonometry",
          "Probability",
        ],
        lectures: 80,
        hours: 120,
      },
    ],
    features: [
      "HD Video Lectures",
      "Downloadable Study Material",
      "Practice Questions with Solutions",
      "Mock Test Series",
      "Doubt Clearing Sessions",
      "Performance Analytics",
      "Certificate of Completion",
      "Personal Mentor Support",
    ],
    requirements: [
      "Basic knowledge of Class 10 Science and Mathematics",
      "Dedication to study 3-4 hours daily",
      "Regular attendance in live sessions",
      "Active participation in practice sessions",
    ],
  };

  const getCategoryIcon = () => {
    switch (course.category) {
      case "JEE": return <Target className="w-6 h-6" />;
      case "NEET": return <GraduationCap className="w-6 h-6" />;
      case "EAMCET": return <TrendingUp className="w-6 h-6" />;
      default: return <BookOpen className="w-6 h-6" />;
    }
  };

  const handleEnroll = () => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login", { state: { returnTo: `/courses/${courseId}` } });
    } else {
      // Call enrollment API
      setIsEnrolled(true);
      alert("Successfully enrolled in the course!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/courses")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Courses
            </button>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="text-gray-600 hover:text-gray-900">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                  {getCategoryIcon()}
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  {course.level}
                </span>
                {course.isFeatured && (
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>

              <p className="text-gray-600 mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {course.duration}
                </div>
                <div className="flex items-center">
                  <Play className="w-4 h-4 mr-2" />
                  {course.totalLectures} lectures
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {course.totalHours} hours
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {course.students.toLocaleString()} students
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                  {course.rating} ({course.reviews} reviews)
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg mb-6">
              <div className="border-b">
                <div className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-4 font-medium ${
                      activeTab === "overview"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("syllabus")}
                    className={`py-4 font-medium ${
                      activeTab === "syllabus"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Syllabus
                  </button>
                  <button
                    onClick={() => setActiveTab("instructor")}
                    className={`py-4 font-medium ${
                      activeTab === "instructor"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Instructor
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className={`py-4 font-medium ${
                      activeTab === "reviews"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Reviews
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Course Description</h3>
                    <p className="text-gray-600 whitespace-pre-line">
                      {course.longDescription}
                    </p>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">What You'll Learn</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h4>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "syllabus" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900">Course Content</h3>
                    {course.syllabus.map((module, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-gray-900">{module.module}</h4>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <span className="mr-4">{module.lectures} lectures</span>
                              <span>{module.hours} hours</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {module.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "instructor" && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {course.teacher.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{course.teacher.name}</h3>
                        <p className="text-gray-600">{course.teacher.qualification}</p>
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="font-medium">{course.teacher.rating}</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-600">{course.teacher.students} students</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">About the Instructor</h4>
                      <p className="text-gray-600">
                        {course.teacher.name} has {course.teacher.experience}. He has helped thousands of students achieve their dream of getting into top engineering colleges. His teaching methodology focuses on concept clarity and problem-solving skills.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {course.teacher.rating}
                        </div>
                        <div className="text-sm text-gray-600">Instructor Rating</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {course.teacher.students}
                        </div>
                        <div className="text-sm text-gray-600">Students Taught</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Student Reviews</h3>
                    <div className="space-y-6">
                      {/* Sample reviews */}
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                              <div>
                                <h4 className="font-semibold">Student {review}</h4>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">2 weeks ago</span>
                          </div>
                          <p className="text-gray-600">
                            Excellent course! The concepts are explained very clearly. The practice questions are very helpful.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{course.price.toLocaleString()}
                    </span>
                    {course.originalPrice && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        ₹{course.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {course.discount && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {course.discount}% OFF
                    </span>
                  )}
                </div>

                {isEnrolled ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => navigate(`/student/courses/${courseId}`)}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg"
                    >
                      Go to Course
                    </button>
                    <p className="text-center text-green-600 font-medium">
                      ✓ You are enrolled in this course
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleEnroll}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg"
                    >
                      Enroll Now
                    </button>
                    <button className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50">
                      Start 7-Day Free Trial
                    </button>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">This course includes:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Play className="w-5 h-5 mr-3 text-blue-500" />
                      {course.totalHours} hours of video content
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FileText className="w-5 h-5 mr-3 text-green-500" />
                      Downloadable resources
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MessageSquare className="w-5 h-5 mr-3 text-purple-500" />
                      Live doubt sessions
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Award className="w-5 h-5 mr-3 text-yellow-500" />
                      Certificate of completion
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-3 text-red-500" />
                      Full lifetime access
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-4">Share this course:</h4>
                  <div className="flex space-x-3">
                    <button className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                      Facebook
                    </button>
                    <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      Twitter
                    </button>
                    <button className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Need help choosing?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Our education counselors are here to help you choose the right course.
                </p>
                <button className="w-full py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                  Talk to Counselor
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetailPage;