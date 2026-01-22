import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerStudent, registerTeacher } from "../../api/api";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    age: 18,
    student_class: "11" as "11" | "12",
    school: "",
    exam_target: "jee" as "jee" | "neet" | "eamcet",
    organization: "",
    qualification: "",
    experience_years: 1,
    subjects: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "age" || name === "experience_years" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      if (role === "student") {
        await registerStudent({
          email: formData.email,
          password: formData.password,
          role: "student",
          full_name: formData.full_name,
          age: formData.age,
          student_class: formData.student_class,
          school: formData.school,
          exam_target: formData.exam_target,
        });
      } else {
        await registerTeacher({
          email: formData.email,
          password: formData.password,
          role: "teacher",
          full_name: formData.full_name,
          organization: formData.organization,
          qualification: formData.qualification,
          experience_years: formData.experience_years,
          subjects: formData.subjects,
        });
      }
      
      // Redirect to login after successful registration
      alert("Registration successful! Please login with your credentials.");
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Join our learning platform</p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">I am a:</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                role === "student"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" opacity="0.5" transform="translate(0 7)" />
                </svg>
                Student
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                role === "teacher"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l-9 5m9-5v6" />
                </svg>
                Teacher
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Student Specific Fields */}
          {role === "student" && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="10"
                    max="25"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="student_class" className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    id="student_class"
                    name="student_class"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.student_class}
                    onChange={handleChange}
                  >
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                    School *
                  </label>
                  <input
                    id="school"
                    name="school"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.school}
                    onChange={handleChange}
                    placeholder="Your school name"
                  />
                </div>

                <div>
                  <label htmlFor="exam_target" className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Target *
                  </label>
                  <select
                    id="exam_target"
                    name="exam_target"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.exam_target}
                    onChange={handleChange}
                  >
                    <option value="jee">JEE</option>
                    <option value="neet">NEET</option>
                    <option value="eamcet">EAMCET</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Specific Fields */}
          {role === "teacher" && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Teacher Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization *
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="School/College name"
                  />
                </div>

                <div>
                  <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                    Qualification *
                  </label>
                  <input
                    id="qualification"
                    name="qualification"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="M.Tech, Ph.D, etc."
                  />
                </div>

                <div>
                  <label htmlFor="experience_years" className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min="0"
                    max="50"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.experience_years}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-1">
                    Subjects *
                  </label>
                  <input
                    id="subjects"
                    name="subjects"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.subjects}
                    onChange={handleChange}
                    placeholder="Physics, Chemistry, Maths"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;