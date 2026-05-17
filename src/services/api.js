import { getAuthHeaders } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

async function request(path, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}${path}`, options);
    return res.json();
  } catch (error) {
    return { error: error.message };
  }
}

async function uploadRequest(path, formData) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: formData,
    });
    return res.json();
  } catch (error) {
    return { error: error.message };
  }
}

// Auth
export const register = (data) => request("/register", "POST", data);
export const login = (data) => request("/login", "POST", data);
export const resetPassword = (data) => request("/reset-password", "POST", data);

// Company — MOU
export const createMOURequest = (formData) => uploadRequest("/mou-requests", formData);
export const getMyMOU = () => request("/mou-requests/my");

// Company — Internships
export const createInternship = (data) => request("/internships", "POST", data);
export const updateInternship = (id, data) => request(`/internships/${id}`, "PUT", data);
export const deleteInternship = (id) => request(`/internships/${id}`, "DELETE");
export const getMyInternships = () => request("/internships/my");

// Company — Applications
export const getApplicationsForInternship = (internshipId) =>
  request(`/internships/${internshipId}/applications`);

export const updateApplicationStatus = (applicationId, status) =>
  request(`/applications/${applicationId}/status`, "PUT", { status });

// Student — Internships
export const getApprovedInternships = () =>
  request("/internships/approved");

// Student — Applications
export const applyForInternship = (internshipId, formData) =>
  uploadRequest(`/internships/${internshipId}/apply`, formData);

export const getMyApplications = () =>
  request("/applications/my");

// Student — Profile
export const getMyProfile = () =>
  request("/profile/my");

export const deleteMyApplication = (id) =>
  request(`/applications/${id}`, "DELETE");

export const confirmApplication = (id) =>
  request(`/applications/${id}/confirm`, "PUT");

// Staff — MOU
export const getAllMOURequests = () => request("/mou-requests");

export const updateMOUStatus = (
  mouId,
  status,
  rejectionReason = ""
) =>
  request(`/mou-requests/${mouId}/status`, "PUT", {
    status,
    rejectionReason,
  });

// Staff — Internships
export const getPendingInternships = () =>
  request("/internships/pending");

export const updateInternshipStatus = (
  internshipId,
  status,
  rejectionReason = ""
) =>
  request(`/internships/${internshipId}/status`, "PUT", {
    status,
    rejectionReason,
  });

// Staff — Applications
export const getAllApplications = () =>
  request("/applications");

export async function getMyNotifications() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications/my`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  return await res.json();
}

export const markNotificationRead = (id) =>
  request(`/notifications/${id}/read`, "PUT");

