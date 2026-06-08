export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}

export enum ProjectStatus {
  PENDING = "Pending",
  UNDER_DISCUSSION = "Under Discussion",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  REJECTED = "Rejected"
}

export enum ProjectType {
  WEBSITE = "Website",
  MOBILE_APP = "Mobile App",
  CRM = "CRM",
  ERP = "ERP",
  CUSTOM_SOFTWARE = "Custom Software"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  provider: "LOCAL" | "GOOGLE";
  createdAt: string;
}

export interface ProjectRequest {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  phone: string;
  projectType: ProjectType;
  budget: string;
  deadline: string;
  description: string;
  status: ProjectStatus;
  attachmentName?: string;
  attachmentData?: string; // base64 or description
  createdAt: string;
  aiAnalysis?: string; // Cache the Gemini estimation & milestone report
  adminNotes?: string; // Reply message chain from admin
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string | "ADMIN"; // For user ID or global admin notification
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface ChatMessage {
  sender: "user" | "ai" | "admin";
  text: string;
  createdAt: string;
}
