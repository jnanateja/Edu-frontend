import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getCourseDetail, 
  togglePublishCourse,
  deleteCourse 
} from "../../api/api";
import CreateSection from "./CreateSection";
import CreateSubSection from "./CreateSubSection";
import { ChevronLeft, Edit2, Eye, Download, Trash2 } from "lucide-react";

interface SubSection {
  id: number;
  title: string;
  content_type: "video" | "pdf";
  video_url?: string;
  pdf_file?: string;
  order: number;
  duration?: string;
  file_size?: string;
}

interface Section {
  id: number;
  title: string;
  order: number;
  subsections: SubSection[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  exam_target: string;
  student_class: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  sections: Section[];
}

const toEmbedUrl = (url: string): string => {
  if (!url?.trim()) return "";
  
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    
    if (url.includes("youtube.com")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      
      if (url.includes("/embed/")) {
        return url;
      }
    }
    
    return url;
  } catch {
    return url;
  }
};

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem("access");
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');

  const fetchCourseDetail = async () => {
    if (!courseId) return;
    
    setLoading(true);
    setError("");
    try {
      if (!token) throw new Error("Authentication required");
      const data = await getCourseDetail(token, parseInt(courseId));
      setCourse(data);
      
      if (data.sections) {
        setExpandedSections(data.sections.map((section: Section) => section.id));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
  }, [courseId]);

  const handleTogglePublish = async () => {
    if (!course || !token) return;
    
    try {
      await togglePublishCourse(token, course.id, !course.is_published);
      setCourse(prev => prev ? { ...prev, is_published: !prev.is_published } : null);
    } catch (err) {
      alert("Failed to update course status");
    }
  };

  const handleDeleteCourse = async () => {
    if (!course || !token) return;
    
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteCourse(token, course.id);
      navigate("/teacher/dashboard");
    } catch (err) {
      alert("Failed to delete course");
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getTotalLectures = () => {
    if (!course?.sections) return 0;
    return course.sections.reduce((acc, section) => 
      acc + (section.subsections?.length || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Course Header */}
      <div className="bg-white border-b rounded-lg mb-8">
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <button
                onClick={() => navigate("/teacher/dashboard")}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-4 group"
              >
                <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {course.title}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      course.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 max-w-3xl">
                    {course.description || "No description provided"}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                      {course.exam_target.toUpperCase()}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full">
                      Class {course.student_class}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full">
                      {course.sections?.length || 0} Sections
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full">
                      {getTotalLectures()} Lectures
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePublish}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      course.is_published
                        ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {course.is_published ? "Unpublish" : "Publish Course"}
                  </button>
                  <button
                    onClick={() => {/* Edit course functionality */}}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteCourse}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b">
            <div className="flex space-x-8">
              <button
                className={`pb-3 px-1 font-medium ${
                  activeTab === 'content'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('content')}
              >
                Course Content
              </button>
              <button
                className={`pb-3 px-1 font-medium ${
                  activeTab === 'settings'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600">{error}</span>
            <button
              onClick={fetchCourseDetail}
              className="ml-auto text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeTab === 'content' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Structure */}
          <div className="lg:col-span-2">
            {/* Create New Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Add New Section</h2>
              <CreateSection
                courseId={course.id}
                onCreated={fetchCourseDetail}
              />
            </div>

            {/* Sections List */}
            <div className="space-y-6">
              {course.sections?.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <div className="text-4xl mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No sections yet
                  </h3>
                  <p className="text-gray-600">
                    Create your first section to organize lectures
                  </p>
                </div>
              ) : (
                course.sections?.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-lg border overflow-hidden"
                  >
                    {/* Section Header */}
                    <div
                      className="p-4 border-b flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          {section.order}
                        </div>
                        <div>
                          <h3 className="font-semibold">{section.title}</h3>
                          <p className="text-sm text-gray-500">
                            {section.subsections?.length || 0} lectures
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        {expandedSections.includes(section.id) ? "−" : "+"}
                      </button>
                    </div>

                    {/* Section Content */}
                    {expandedSections.includes(section.id) && (
                      <div className="p-4">
                        {/* Create SubSection */}
                        <div className="mb-6">
                          <CreateSubSection
                            sectionId={section.id}
                            onCreated={fetchCourseDetail}
                          />
                        </div>

                        {/* Subsections List */}
                        {section.subsections?.length > 0 && (
                          <div className="space-y-3">
                            {section.subsections.map((sub) => (
                              <div
                                key={sub.id}
                                className="p-4 border rounded hover:bg-gray-50"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        sub.content_type === 'video' 
                                          ? 'bg-red-100 text-red-600' 
                                          : 'bg-blue-100 text-blue-600'
                                      }`}>
                                        {sub.content_type === 'video' ? '▶' : '📄'}
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium">{sub.title}</h4>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                          <span className="capitalize">{sub.content_type}</span>
                                          {sub.duration && <span>• {sub.duration}</span>}
                                          {sub.file_size && <span>• {sub.file_size}</span>}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Content Preview */}
                                    {sub.content_type === 'video' && sub.video_url && (
                                      <div className="mt-4">
                                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                          <iframe
                                            src={toEmbedUrl(sub.video_url)}
                                            className="absolute inset-0 w-full h-full"
                                            title={sub.title}
                                            allowFullScreen
                                          />
                                          <div 
                                            className="absolute inset-0" 
                                            onContextMenu={(e) => e.preventDefault()}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      className="p-2 text-gray-400 hover:text-blue-600"
                                      title="Preview"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                      className="p-2 text-gray-400 hover:text-green-600"
                                      title="Download"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Course Stats */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Course Overview</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className={`font-semibold ${course.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sections</p>
                  <p className="font-semibold">{course.sections?.length || 0}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Lectures</p>
                  <p className="font-semibold">{getTotalLectures()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="font-semibold">
                    {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="font-semibold">
                    {new Date(course.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    className="w-full px-4 py-2 text-left bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                    onClick={() => {/* Add preview action */}}
                  >
                    Preview Course
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
                    onClick={() => {/* Add export action */}}
                  >
                    Export Course Data
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left bg-red-50 hover:bg-red-100 text-red-700 rounded text-sm transition-colors"
                    onClick={handleDeleteCourse}
                  >
                    Delete Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Settings Tab Content */
        <div className="bg-white rounded-lg border p-6 max-w-3xl">
          <h2 className="text-xl font-semibold mb-6">Course Settings</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3">General Information</h3>
              <p className="text-gray-500">Course settings will be implemented here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;