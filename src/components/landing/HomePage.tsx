import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronRight,
  Play,
  Award,
  Users,
  BookOpen,
  Clock,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Menu,
  X,
  ArrowRight,
  Target,
  TrendingUp,
  GraduationCap,
} from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Comprehensive Curriculum",
      description: "Structured courses covering JEE, NEET, and EAMCET with detailed syllabus alignment.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Teachers",
      description: "Learn from IIT/NIT alumni and experienced educators with proven track records.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Flexible Learning",
      description: "Study at your own pace with 24/7 access to recorded lectures and materials.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Monitor your performance with detailed analytics and personalized insights.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile App",
      description: "Learn on-the-go with our mobile app available on iOS and Android.",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Certification",
      description: "Get certified upon course completion to showcase your achievements.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "JEE Aspirant, AIR 127",
      content: "EduTeach transformed my preparation. The structured approach and expert guidance helped me crack JEE with confidence.",
      avatar: "RS",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "NEET Student, Medical College",
      content: "The biology lectures were exceptional! The interactive quizzes and doubt sessions made complex topics easy to understand.",
      avatar: "PP",
      rating: 5,
    },
    {
      name: "Ankit Verma",
      role: "Parent",
      content: "As a parent, I appreciate the regular progress reports and the dedication of teachers. My child's performance improved significantly.",
      avatar: "AV",
      rating: 4,
    },
  ];

  const coursesPreview = [
    {
      category: "JEE",
      title: "JEE Main & Advanced Complete Course",
      description: "Comprehensive preparation for both JEE Main and Advanced with 1000+ practice questions.",
      icon: <Target className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-700",
      students: "2,500+",
      rating: 4.9,
    },
    {
      category: "NEET",
      title: "NEET UG Complete Biology",
      description: "Master biology concepts with animated videos, diagrams, and practice tests.",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "bg-green-100 text-green-700",
      students: "1,800+",
      rating: 4.8,
    },
    {
      category: "EAMCET",
      title: "EAMCET Engineering Complete Package",
      description: "Specialized course focusing on Physics, Chemistry, and Mathematics for EAMCET.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-700",
      students: "900+",
      rating: 4.7,
    },
  ];

  const stats = [
    { value: "10,000+", label: "Active Students" },
    { value: "500+", label: "Expert Teachers" },
    { value: "95%", label: "Success Rate" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EduTeach
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Courses
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">
                Testimonials
              </a>
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#courses"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Courses
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Trusted by 10,000+ students across India
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ace Your
            </span>
            <br />
            <span className="text-gray-900">Competitive Exams</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            India's premier platform for JEE, NEET, and EAMCET preparation. 
            Learn from expert teachers, track your progress, and achieve your dreams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Explore Courses <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and resources for 
              effective exam preparation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                  <div className={feature.color}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Courses Section */}
      <section id="courses" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Our Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from a wide range of courses designed by experts for competitive exam success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {coursesPreview.map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${course.color}`}>
                      {course.category}
                    </span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-sm font-medium">{course.rating}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students} enrolled
                    </div>
                    <div className="flex items-center">
                      {course.icon}
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <button
                    onClick={() => navigate("/courses")}
                    className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
            >
              View All Courses
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful students who achieved their dreams with EduTeach
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Start Your Success Journey Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ students who transformed their preparation with EduTeach
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/courses")}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Browse All Courses
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Create Free Account
            </button>
          </div>
          <p className="mt-6 text-sm opacity-80">
            No credit card required • Free trial available • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">EduTeach</span>
              </div>
              <p className="text-gray-400">
                Empowering students across India to achieve their academic dreams.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#courses" className="hover:text-white">Courses</a></li>
                <li><a href="#testimonials" className="hover:text-white">Testimonials</a></li>
                <li><Link to="/courses" className="hover:text-white">All Courses</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} EduTeach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;