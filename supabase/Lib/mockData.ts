// supabase/Lib/mockData.ts
import { DBPostRow } from "@/app/component/General/Announcement/Utils/types";
import { FeedPost, PLCHighlight } from "./Feeds/types";
import { Post as LostAndFoundPost } from "@/app/component/General/LostandFound/LostandFoundcontent";
import { User } from "./General/user";

export const MOCK_CURRENT_USER: User = {
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

export const MOCK_ANNOUNCEMENTS: DBPostRow[] = [
  {
    id: "ann-1",
    title: "CIT-U Innovation Summit 2025: Empowering Tech Wildcats",
    description:
      "Join us for the annual CIT University Innovation Summit! Featuring keynote speeches from industry leaders, startup showcases, interactive coding workshops, and project exhibitions at the GLE Hall.",
    images: ["/Cit Logo.svg"],
    tags: ["Summit", "Tech", "Event", "CIT"],
    type: "announcement",
    author_id: "usr_mock_wildcat_01",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    visibility: "Global",
  },
  {
    id: "ann-2",
    title: "Midterm Examination Schedule & Guidelines Released",
    description:
      "Please be advised that Midterm Examinations for the 2nd Semester will commence next week. Check your student portals for room assignments and ensure all permit requirements are cleared in advance.",
    images: [],
    tags: ["Academics", "Exam", "Notice"],
    type: "announcement",
    author_id: "usr_mock_wildcat_01",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    visibility: "Global",
  },
  {
    id: "ann-3",
    title: "Peer Learning Center (PLC) Open for Tutorial Booking",
    description:
      "Struggling with Data Structures, Discrete Math, or Calculus? Peer Learning Center tutors are available Monday through Friday at the 4th Floor Study Hub. Book your slot through the PLC tab.",
    images: [],
    tags: ["PLC", "Tutoring", "CCS", "Study"],
    type: "announcement",
    author_id: "usr_mock_wildcat_01",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    visibility: "ccs",
  },
  {
    id: "high-1",
    title: "Teknoy Developers Hackathon: 1st Place Winners!",
    description:
      "Huge congratulations to Team 'NullPointer' from CIT-U College of Computer Studies for clinching 1st place in the Regional Inter-Collegiate Hackathon! Their project Katipunan Hub unified campus services seamlessly.",
    images: ["/Cit Logo.svg"],
    tags: ["Highlight", "Hackathon", "Achievement", "CCS"],
    type: "highlight",
    author_id: "usr_mock_wildcat_01",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    visibility: "Global",
  },
  {
    id: "high-2",
    title: "CCS Dean's Lister Recognition & Awards Night",
    description:
      "Celebrating academic excellence and hard work! Honoring all outstanding students on the Dean's Honor Roll for their stellar performance throughout the academic year.",
    images: [],
    tags: ["Highlight", "Academic", "Recognition"],
    type: "highlight",
    author_id: "usr_mock_wildcat_01",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    visibility: "Global",
  },
];

export const MOCK_FEEDS: FeedPost[] = [
  {
    id: "feed-1",
    content:
      "Good luck to everyone preparing for the programming practicals this week! Remember to review pointers, recursion, and dynamic memory allocation. You got this Wildcats! 🐾💻",
    images: [],
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    author: {
      id: "usr_alex_02",
      fullName: "Alex Rivera",
      avatarURL: "/Cit Logo.svg",
      role: "Student",
    },
  },
  {
    id: "feed-2",
    content:
      "PLC tutorial session for Data Structures was super helpful today! Big thanks to the peer tutors for explaining binary search trees and heap algorithms so clearly.",
    images: [],
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    author: {
      id: "usr_maria_03",
      fullName: "Maria Santos",
      avatarURL: "/Cit Logo.svg",
      role: "Tutor",
    },
  },
  {
    id: "feed-3",
    content:
      "Anyone down for a group study session at the Library 3rd floor discussion rooms later around 3 PM? Working on the Web Dev capstone project!",
    images: [],
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    author: {
      id: "usr_david_04",
      fullName: "David Lim",
      avatarURL: "/Cit Logo.svg",
      role: "Student",
    },
  },
];

export const MOCK_PLC_HIGHLIGHTS: PLCHighlight[] = [
  {
    id: "plc-h-1",
    tutorId: "usr_maria_03",
    tutorName: "Maria Santos",
    tutorAvatar: "/Cit Logo.svg",
    studentName: "Juan Dela Cruz",
    rating: 5,
    review:
      "Maria explained Graph traversal and Dijkstra's algorithm step by step. Made difficult concepts feel intuitive!",
    subject: "CS211 - Data Structures & Algorithms",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "plc-h-2",
    tutorId: "usr_alex_02",
    tutorName: "Alex Rivera",
    tutorAvatar: "/Cit Logo.svg",
    studentName: "Kaye Villanueva",
    rating: 5,
    review:
      "Very patient and knowledgeable tutor. Helped me debug my React and Next.js project easily.",
    subject: "IT312 - Web Systems & Technologies",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const MOCK_LOST_AND_FOUND: LostAndFoundPost[] = [
  {
    id: "laf-1",
    userId: "usr_alex_02",
    type: "Found",
    status: "Open",
    imageUrl: "/found.svg",
    title: "Scientific Calculator (Casio fx-991EX)",
    postedBy: "Alex Rivera",
    lostOn: "Yesterday, 2:30 PM",
    location: "GLE Building 3rd Floor Room 304",
    description:
      "Found a black Casio scientific calculator left on the back desk after Math 101 class. Surrendered to CCS Department Office.",
    category: "Electronics",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    inquiries: [],
  },
  {
    id: "laf-2",
    userId: "usr_david_04",
    type: "Lost",
    status: "Open",
    imageUrl: "/lost.svg",
    title: "Black Leather ID Holder with Lanyard",
    postedBy: "David Lim",
    lostOn: "This Morning, 9:00 AM",
    location: "Main Canteen / Quadrangle",
    description:
      "Lost my CIT-U Student ID holder with red lanyard near the canteen food stalls. Please message me if found!",
    category: "Wallets",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    inquiries: [],
  },
  {
    id: "laf-3",
    userId: "usr_maria_03",
    type: "Found",
    status: "Resolved",
    imageUrl: "/found.svg",
    title: "Data Structures & Algorithm in Java (Book)",
    postedBy: "Maria Santos",
    lostOn: "3 days ago",
    location: "University Library 2nd Floor",
    description:
      "Hardcover reference textbook found on table 12. Claimed by owner.",
    category: "Books",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    inquiries: [],
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Welcome to Katipunan Hub!",
    message:
      "Your all-in-one student portal is ready. Explore announcements, PLC tutoring, and campus feeds.",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    read: false,
    type: "system",
  },
  {
    id: "notif-2",
    title: "New Announcement Posted",
    message: "CIT-U Innovation Summit 2025 details have been published.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    type: "announcement",
  },
  {
    id: "notif-3",
    title: "PLC Session Reminder",
    message:
      "You have an upcoming peer tutoring session scheduled tomorrow at 10:00 AM.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    type: "plc",
  },
];
