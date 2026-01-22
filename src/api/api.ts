// ===========================================================
// BASE
// ===========================================================
const API_BASE =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_BASE_URL || ""
    : "http://127.0.0.1:8000";

// ===========================================================
// HELPERS
// ===========================================================
async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail ||
        errorData.message ||
        res.statusText ||
        "API Error"
    );
  }
  return res.json();
}

async function authFetch(
  url: string,
  token: string | null,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  return handleResponse(res);
}

// ===========================================================
// AUTH – REGISTER
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

// ===========================================================
// AUTH – LOGIN / LOGOUT
// ===========================================================

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);

  // Save tokens and user info
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user || {}));
  
  // Store role separately for easy access
  if (data.user?.role) {
    localStorage.setItem("user_role", data.user.role);
  }
  
  // Store email for display
  if (data.user?.email) {
    localStorage.setItem("user_email", data.user.email);
  }

  return data;
}

export function logoutUser() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_email");
}

// ===========================================================
// COURSES (Teacher only)
// ===========================================================

export async function getCourses(token: string) {
  return authFetch("/api/courses/", token);
}

export async function getCourseDetail(token: string, courseId: number) {
  return authFetch(`/api/courses/${courseId}/`, token);
}

export async function createCourse(
  token: string,
  data: {
    title: string;
    description?: string;
    exam_target: "jee" | "neet" | "eamcet";
    student_class: "11" | "12";
    is_published?: boolean;
  }
) {
  return authFetch("/api/courses/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCourse(
  token: string,
  courseId: number,
  data: any
) {
  return authFetch(`/api/courses/${courseId}/`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(token: string, courseId: number) {
  return authFetch(`/api/courses/${courseId}/`, token, {
    method: "DELETE",
  });
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
  data: {
    course: number;
    title: string;
    order: number;
  }
) {
  return authFetch("/api/sections/", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSection(
  token: string,
  sectionId: number,
  data: any
) {
  return authFetch(`/api/sections/${sectionId}/`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSection(token: string, sectionId: number) {
  return authFetch(`/api/sections/${sectionId}/`, token, {
    method: "DELETE",
  });
}

// ===========================================================
// SUB-SECTIONS (Lectures)
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

export async function deleteSubSection(
  token: string,
  subSectionId: number
) {
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

export async function enrollInCourse(token: string, courseId: number) {
  return authFetch(`/api/student/courses/${courseId}/enroll/`, token, {
    method: "POST",
  });
}

export async function getStudentProgress(token: string, courseId: number) {
  return authFetch(`/api/student/courses/${courseId}/progress/`, token);
}

export async function updateProgress(
  token: string,
  subsectionId: number,
  completed: boolean
) {
  return authFetch(`/api/student/progress/${subsectionId}/`, token, {
    method: "POST",
    body: JSON.stringify({ completed }),
  });
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

  const data = await handleResponse(res);
  
  // Update stored access token
  localStorage.setItem("access", data.access);
  
  return data.access;
}

// ===========================================================
// PROFILE MANAGEMENT
// ===========================================================

export async function getProfile(token: string) {
  return authFetch("/api/profile/", token);
}

export async function updateProfile(token: string, data: any) {
  return authFetch("/api/profile/", token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ===========================================================
// UTILITY FUNCTIONS
// ===========================================================

// Function to check if token is valid
export function isTokenValid(): boolean {
  const token = localStorage.getItem("access");
  if (!token) return false;
  return token.length > 10;
}

// Function to get current user role
export function getUserRole(): string | null {
  return localStorage.getItem("user_role");
}

// Function to get current user info
export function getUserInfo(): any {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// Function to make authenticated requests with auto token refresh
export async function authRequest(
  url: string,
  options: RequestInit = {}
) {
  let token = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");
  
  try {
    return await authFetch(url, token, options);
  } catch (error: any) {
    // If token expired, try to refresh
    if (error.message.includes("401") || error.message.includes("token")) {
      if (refresh) {
        try {
          token = await refreshToken(refresh);
          return await authFetch(url, token, options);
        } catch (refreshError) {
          logoutUser();
          window.location.href = "/";
          throw refreshError;
        }
      }
    }
    throw error;
  }
}