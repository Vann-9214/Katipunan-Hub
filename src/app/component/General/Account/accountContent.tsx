"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pen } from "lucide-react";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import { getCurrentUserDetails } from "../../../../../supabase/Lib/General/getUser";
import { updateUserAccount } from "../../../../../supabase/Lib/Account/updateUserAccount";
import EditProfileModal from "./editProfileForm";
import InfoItem from "./infoItem";
import AvatarEditor from "./avatarEditable";
import type { User } from "../../../../../supabase/Lib/General/user";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

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

  const handleSaveProfile = async (updatedData: { fullName: string }) => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await updateUserAccount(user.id, {
      fullName: updatedData.fullName,
    });

    if (error) {
      console.error("Failed to update profile:", error);
    } else {
      setUser((prevUser) => ({ ...prevUser, ...updatedData } as User));
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  // --- Show a loading state  ---
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

  // --- Render the profile page  ---
  if (!user) {
    return null;
  }

  return (
    <main className="pt-[110px] p-8 bg-gray-50 min-h-screen">
      <HomepageTab />
      <div className="w-full mx-5 space-y-6">
        <h1 className="text-3xl font-bold text-black">My Profile</h1>

        {/* --- Top Profile Card --- */}
        <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-5">
          <AvatarEditor user={user} className="w-16 h-16" />
          <div>
            <p className="text-2xl font-semibold">{user.fullName}</p>
            <p className="text-gray-600">{user.role}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* --- Personal Information Card  --- */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {/* Card Header */}
          <div className="flex justify-between items-center pb-4">
            <h2 className="text-[25px] font-semibold">Personal Information</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 text-white font-semibold rounded-lg cursor-pointer hover:brightness-110 transition-colors"
            >
              <Pen size={16} />
              Edit
            </button>
          </div>
          <hr className="border-black/50 mb-6" />
          {/* Details Grid  */}
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

      {/* --- Modal  --- */}
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
