"use client";

import { useParams } from "next/navigation";
import AccountContent from "@/app/component/General/Account/accountContent";

export default function ProfilePage() {
  const params = useParams();
  // Ensure we capture the ID as a string.
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return <AccountContent targetUserId={id} />;
}
