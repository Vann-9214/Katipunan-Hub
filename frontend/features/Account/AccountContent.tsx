"use client";

import { useState } from "react";
import HomepageTab from "@/components/HomepageTab";
import LoadingScreen from "@/components/LoadingScreen";
import BackgroundGradient from "@/components/BackgroundGradient";

import AccountHeader from "./components/AccountHeader";
import AccountAbout from "./components/AccountAbout";
import AccountAcademicInfo from "./components/AccountAcademicInfo";
import EditMainProfileModal from "./components/EditMainProfileModal";
import EditBioDetailsModal from "./components/EditBioDetailsModal";

import { useAccount } from "./hooks/useAccount";
import { getTeamsEmail, getTeamsChatUrl } from "./utils/teams";

interface AccountContentProps {
  targetUserId?: string;
}

export default function AccountContent({ targetUserId }: AccountContentProps) {
  const {
    viewedUser,
    currentUser,
    isInitialLoading,
    isOwner,
    handleUpdateSuccess,
  } = useAccount({ targetUserId });

  const [showMainEdit, setShowMainEdit] = useState(false);
  const [showBioEdit, setShowBioEdit] = useState(false);

  if (isInitialLoading) return <LoadingScreen />;
  if (!viewedUser || !currentUser) return null;

  const teamsEmail = getTeamsEmail(viewedUser.email, viewedUser.fullName);
  const teamsUrl = getTeamsChatUrl(teamsEmail);

  return (
    <main className="min-h-screen bg-[#F0F2F5] pb-20">
      <HomepageTab user={currentUser} />
      <BackgroundGradient />

      {/* --- HEADER --- */}
      <AccountHeader
        user={viewedUser}
        isOwner={isOwner}
        onEditClick={() => setShowMainEdit(true)}
        teamsUrl={teamsUrl}
      />

      {/* --- MAIN BODY GRID --- */}
      <div className="max-w-[1095px] mx-auto px-4 mt-6">
        <div className="p-[2px] rounded-[24px] bg-gradient-to-br from-[#EFBF04] via-[#FFD700] to-[#D4AF37] shadow-lg">
          <div className="bg-gradient-to-b from-[#4e0505] to-[#3a0000] p-8 rounded-[22px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AccountAbout
                user={viewedUser}
                isOwner={isOwner}
                onEditClick={() => setShowBioEdit(true)}
                teamsUrl={teamsUrl}
              />
              <AccountAcademicInfo user={viewedUser} />
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {isOwner && showMainEdit && (
        <EditMainProfileModal
          user={currentUser}
          onClose={() => setShowMainEdit(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

      {isOwner && showBioEdit && (
        <EditBioDetailsModal
          user={currentUser}
          onClose={() => setShowBioEdit(false)}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </main>
  );
}
