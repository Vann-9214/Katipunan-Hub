"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pen } from "lucide-react";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
// --- CHANGE 1: We no longer import the dumb Avatar here ---
// import Avatar from "@/app/component/ReusableComponent/Avatar";

// --- Import your user helper functions ---
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { updateUserAccount } from "../../../../../supabase/Lib/Account/updateUserAccount";

// --- Import the NEW components ---
import EditProfileModal from "./editProfileModal";
import InfoItem from "./infoItem";
// --- CHANGE 2: Import the new AvatarEditor wrapper component ---
// (I'm assuming you placed it in a 'components' folder inside 'Account')
import AvatarEditor from "./avatarEditable";

// --- Import the SHARED type ---
import { UserDetails } from "./types"; // (Your path was './types')

export default function AccountPage() {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // --- Fetch user data on page load (No Change) ---
  useEffect(() => {
    const loadUserData = async () => {
      const userDetails = await getCurrentUserDetails();
      if (!userDetails) {
        router.push("/signin");
      } else {
        setUser(userDetails);
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [router]);

  // --- Handle saving the profile (No Change) ---
  const handleSaveProfile = async (updatedData: { fullName: string }) => {
    if (!user) return;

    setIsSaving(true);
    console.log("--- DEBUGGING UPDATE ---");
    console.log("User ID being sent:", user.id);
    console.log("Full Name being sent:", updatedData.fullName);

    const { error } = await updateUserAccount(user.id, {
      fullName: updatedData.fullName,
    });

    console.log("Error object from Supabase:", error);

    if (error) {
      console.error("Failed to update profile:", error);
    } else {
      setUser((prevUser) => ({ ...prevUser, ...updatedData } as UserDetails));
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  // --- Show a loading state (No Change) ---
  if (isLoading) {
    return (
      <main className="pt-[110px] p-8 bg-gray-50 min-h-screen">
        <HomepageTab />
        <div className="max-w-4xl mx-auto">
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  // --- Render the profile page (No Change) ---
  if (!user) {
    return null;
  }

  return (
    <main className="pt-[110px] p-8 bg-gray-50 min-h-screen">
      <HomepageTab />
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-black">My Profile</h1>

        {/* --- Top Profile Card (UPDATED) --- */}
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-5">
          {/*
           *
           * --- CHANGE 3: We replace <Avatar /> with <AvatarEditor /> ---
           * It's a simple swap. The new component handles all
           * the click, modal, and upload logic by itself.
           *
           */}
          <AvatarEditor user={user} className="w-16 h-16" />
          {/*
           *
           * --- END OF CHANGE ---
           *
           */}
          <div>
            <p className="text-2xl font-semibold">{user.fullName}</p>
            <p className="text-gray-600">{user.role}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* --- Personal Information Card (No Change) --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {/* Card Header */}
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold">Personal Information</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-maroon font-semibold rounded-lg hover:bg-red-200 transition-colors"
            >
              <Pen size={16} />
              Edit
            </button>
          </div>

          {/* Details Grid (No Change) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            <InfoItem label="Full Name" value={user.fullName} />
            <InfoItem label="Course" value={user.course} />
            <InfoItem label="Year" value={user.year} />
            <InfoItem label="Cit Email" value={user.email} />
            <InfoItem label="Role" value={user.role} />
            <InfoItem label="Student ID" value={user.studentID} />
          </div>
        </div>
      </div>

      {/* --- Modal (No Change) --- */}
      {isModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />
      )}
    </main>
  );
}
