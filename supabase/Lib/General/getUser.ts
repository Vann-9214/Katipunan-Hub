import type { User } from "./user";

export const MOCK_USER: User = {
  id: "usr_mock_wildcat_01",
  email: "student@cit.edu",
  fullName: "Teknoy Student",
  avatarURL: "/Cit Logo.svg",
  coverURL: "",
  bio: "BS Computer Science student at CIT University. Building tools for the Teknoy community!",
  location: "Cebu Institute of Technology - University",
  role: "Student, Announcements Moderator",
  course: "BS Computer Science",
  studentID: "22-1234-567",
  year: "3rd Year",
};

export async function getCurrentUserDetails(): Promise<User | null> {
  return MOCK_USER;
}