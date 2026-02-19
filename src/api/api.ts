// src/api/api.ts

const API_BASE =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_BASE_URL || ""
    : "http://127.0.0.1:8000";

class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const data = isJson
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (isJson && (data as any)?.detail) ||
      (isJson && (data as any)?.message) ||
      (typeof data === "string" && data) ||
      res.statusText ||
      "API Error";

    throw new ApiError(res.status, msg, data);
  }

  return data;
}

async function authFetch(
  url: string,
  token: string | null,
  options: RequestInit = {}
) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  return handleResponse(res);
}

// ===========================================================
// PUBLIC COURSES
// ===========================================================

export async function getFeaturedCourses() {
  const res = await fetch(`${API_BASE}/api/courses/featured/`);
  return handleResponse(res);
}

export async function getPublicCourses(filters?: {
  exam_target?: string;
  class?: string;
  price_type?: "free" | "paid";
}) {
  let url = "/api/courses/public/";

  if (filters) {
    const params = new URLSearchParams();
    if (filters.exam_target) params.append("exam_target", filters.exam_target);
    if (filters.class) params.append("class", filters.class);
    if (filters.price_type) params.append("price_type", filters.price_type);
    if (params.toString()) url += `?${params.toString()}`;
  }

  const res = await fetch(`${API_BASE}${url}`);
  return handleResponse(res);
}

// ===========================================================
// PUBLIC PACKAGES (only if backend supports these endpoints)
// ===========================================================

export async function getFeaturedPackages() {
  const res = await fetch(`${API_BASE}/api/packages/featured/`);
  return handleResponse(res);
}

export async function getPublicPackages() {
  const res = await fetch(`${API_BASE}/api/packages/public/`);
  return handleResponse(res);
}

export async function getPublicPackageDetail(packageId: number) {
  const res = await fetch(`${API_BASE}/api/packages/public/${packageId}/`);
  return handleResponse(res);
}

// ===========================================================
// AUTH
// ===========================================================

export async function registerStudent(data: {
  email: string;
  password: string;
  role: "student";
  full_name: string;
  age: number;
  student_class: "11" | "12";
  school: string;
  exam_target: "jee" | "neet" | "eamcet";
}) {
  const res = await fetch(`${API_BASE}/api/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function registerTeacher(data: {
  email: string;
  password: string;
  role: "teacher";
  full_name: string;
  organization: string;
  qualification: string;
  experience_years: number;
  subjects: string;
}) {
  const res = await fetch(`${API_BASE}/api/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data: any = await handleResponse(res);

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user || {}));
  localStorage.setItem("is_admin", String(Boolean(data.user?.is_admin)));

  if (data.user?.role) localStorage.setItem("user_role", data.user.role);
  else localStorage.removeItem("user_role");

  if (data.user?.email) localStorage.setItem("user_email", data.user.email);
  else localStorage.removeItem("user_email");

  return data;
}

export function logoutUser() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_email");
  localStorage.removeItem("is_admin");
}

// ===========================================================
// TEACHER ASSIGNMENT & COURSE ACCESS
// ===========================================================

export async function getAssignedCourses(token: string) {
  return authFetch("/api/teacher/courses/", token);
}

export async function getAssignedCourseDetail(token: string, courseId: number) {
  return authFetch(`/api/teacher/courses/${courseId}/`, token);
}

export async function assignTeacherToCourse(
  token: string,
  courseId: number,
  teacherId: number
) {
  return authFetch(`/api/courses/${courseId}/assign-teacher/`, token, {
    method: "POST",
    body: JSON.stringify({ teacher_id: teacherId }),
  });
}

export async function removeTeacherFromCourse(
  token: string,
  courseId: number,
  teacherId: number
) {
  return authFetch(`/api/courses/${courseId}/remove-teacher/`, token, {
    method: "DELETE",
    body: JSON.stringify({ teacher_id: teacherId }),
  });
}

export async function getAllTeachers(token: string) {
  return authFetch("/api/teachers/", token);
}

export async function getCourseTeachers(token: string, courseId: number) {
  return authFetch(`/api/courses/${courseId}/teachers/`, token);
}

export function canModifyCourse(course: any): boolean {
  const userRole = localStorage.getItem("user_role");
  const isAdmin = localStorage.getItem("is_admin") === "true";
  const userStr = localStorage.getItem("user");
  const userId = userStr ? JSON.parse(userStr).id : null;

  if (isAdmin) return true;

  if (userRole === "teacher" && userId) {
    if (course.assigned_teachers && Array.isArray(course.assigned_teachers)) {
      return course.assigned_teachers.some((t: any) => t.id === userId);
    }
    if (course.is_assigned !== undefined) {
      return Boolean(course.is_assigned);
    }
    // Only if THIS teacher created the course
    if (course.created_by?.id && course.created_by.id === userId) {
      return true;
    }
  }

  return false;
}

export function canCreateCourses(): boolean {
  return localStorage.getItem("is_admin") === "true";
}

// ===========================================================
// COURSES
// ===========================================================

export async function getCourses(token: string) {
  const userRole = localStorage.getItem("user_role");
  const isAdmin = localStorage.getItem("is_admin") === "true";

  if (isAdmin) return authFetch("/api/courses/", token);
  if (userRole === "teacher") return authFetch("/api/teacher/courses/", token);
  return authFetch("/api/courses/", token);
}

export async function getCourseDetail(token: string, courseId: number) {
  return authFetch(`/api/courses/${courseId}/`, token);
}

export async function createCourse(token: string, data: any) {
  return authFetch("/api/courses/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCourse(token: string, courseId: number, data: any) {
  return authFetch(`/api/courses/${courseId}/`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(token: string, courseId: number) {
  return authFetch(`/api/courses/${courseId}/`, token, { method: "DELETE" });
}

export async function togglePublishCourse(
  token: string,
  courseId: number,
  publish: boolean
) {
  return authFetch(`/api/courses/${courseId}/`, token, {
    method: "PATCH",
    body: JSON.stringify({ is_published: publish }),
  });
}


// ===========================================================
// SECTIONS
// ===========================================================

export async function getSections(token: string) {
  return authFetch("/api/sections/", token);
}

export async function createSection(
  token: string,
  data: { course: number; title: string; order: number }
) {
  return authFetch("/api/sections/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSection(token: string, sectionId: number, data: any) {
  return authFetch(`/api/sections/${sectionId}/`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSection(token: string, sectionId: number) {
  return authFetch(`/api/sections/${sectionId}/`, token, { method: "DELETE" });
}

// ===========================================================
// SUB-SECTIONS (Uploads)
// ===========================================================

export async function getSubSections(token: string) {
  return authFetch("/api/subsections/", token);
}

export async function createSubSection(
  token: string,
  data: {
    section: number;
    title: string;
    order: number;
    content_type: "video" | "pdf";
    video_url?: string;
    pdf_file?: File;
  }
) {
  const formData = new FormData();
  formData.append("section", String(data.section));
  formData.append("title", data.title);
  formData.append("order", String(data.order));
  formData.append("content_type", data.content_type);

  if (data.content_type === "video" && data.video_url) {
    formData.append("video_url", data.video_url);
  }

  if (data.content_type === "pdf" && data.pdf_file) {
    formData.append("pdf_file", data.pdf_file);
  }

  // ✅ use the passed token, don't re-read localStorage
  const res = await fetch(`${API_BASE}/api/subsections/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return handleResponse(res);
}

export async function updateSubSection(
  token: string,
  subSectionId: number,
  data: any
) {
  return authFetch(`/api/subsections/${subSectionId}/`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSubSection(token: string, subSectionId: number) {
  return authFetch(`/api/subsections/${subSectionId}/`, token, {
    method: "DELETE",
  });
}

// ===========================================================
// STUDENT ENDPOINTS
// ===========================================================

export async function getStudentCourses(token: string) {
  return authFetch("/api/student/courses/", token);
}

export async function getStudentCourseDetail(token: string, courseId: number) {
  return authFetch(`/api/student/courses/${courseId}/`, token);
}

// Purchases (only if backend supports these endpoints)
export async function purchasePackage(token: string, packageId: number) {
  return authFetch(`/api/packages/${packageId}/purchase/`, token, {
    method: "POST",
  });
}

export async function getStudentPurchases(token: string) {
  return authFetch(`/api/student/purchases/`, token);
}

// ===========================================================
// TOKEN REFRESH
// ===========================================================

export async function refreshToken(refresh: string) {
  const res = await fetch(`${API_BASE}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data: any = await handleResponse(res);
  if (data?.access) localStorage.setItem("access", data.access);
  return data.access;
}

// ===========================================================
// UTIL
// ===========================================================

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
}


// ===========================================================
// ADMIN PACKAGES
// ===========================================================
export async function getAdminPackages(token: string) {
  return authFetch("/api/packages/", token);
}

export async function createPackage(token: string, data: any) {
  return authFetch("/api/packages/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePackage(token: string, packageId: number, data: any) {
  return authFetch(`/api/packages/${packageId}/`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deletePackage(token: string, packageId: number) {
  return authFetch(`/api/packages/${packageId}/`, token, {
    method: "DELETE",
  });
}

// ===========================================================
// QUIZZES
// ===========================================================
export async function getCourseQuizzes(token: string, courseId: number) {
  return authFetch(`/api/courses/${courseId}/quizzes/`, token);
}

export async function createQuiz(token: string, courseId: number, data: any) {
  return authFetch(`/api/courses/${courseId}/quizzes/`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuiz(token: string, quizId: number, data: any) {
  return authFetch(`/api/quizzes/${quizId}/`, token, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteQuiz(token: string, quizId: number) {
  return authFetch(`/api/quizzes/${quizId}/`, token, {
    method: "DELETE",
  });
}

export async function addQuizQuestion(token: string, quizId: number, data: any) {
  return authFetch(`/api/quizzes/${quizId}/questions/`, token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getQuiz(token: string, quizId: number) {
  return authFetch(`/api/quizzes/${quizId}/`, token);
}

export async function submitQuiz(token: string, quizId: number, answers: Record<string, number>) {
  return authFetch(`/api/student/quizzes/${quizId}/submit/`, token, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}


// ===========================================================
// QUIZ SUBMISSIONS
// ===========================================================
export async function getStudentQuizSubmissions(token: string) {
  return authFetch("/api/student/quiz-submissions/", token);
}

export async function getTeacherQuizSubmissions(token: string, quizId: number) {
  return authFetch(`/api/teacher/quizzes/${quizId}/submissions/`, token);
}
