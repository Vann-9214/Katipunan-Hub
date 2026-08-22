"use client";

import { useState } from "react";
import { PostUI } from "@/app/component/General/Announcement/Utils/types";
import formatPostDate from "@/app/component/General/Announcement/Utils/formatDate";

export function useUserPosts(_userId: string | undefined) {
  const [posts] = useState<PostUI[]>([
    {
      id: "feed-1",
      title: "",
      description:
        "Good luck to everyone preparing for the programming practicals this week! Remember to review pointers, recursion, and dynamic memory allocation. You got this Wildcats! 🐾💻",
      images: [],
      tags: ["Study", "Wildcats"],
      type: "feed",
      visibility: "global",
      author_id: "usr_mock_wildcat_01",
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      date: formatPostDate(new Date(Date.now() - 1000 * 60 * 30).toISOString()),
    },
    {
      id: "feed-2",
      title: "",
      description:
        "Excited for the CIT Innovation Summit! Working with the team on showcasing our project at the main auditorium.",
      images: [],
      tags: ["Innovation", "CIT"],
      type: "feed",
      visibility: "global",
      author_id: "usr_mock_wildcat_01",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      date: formatPostDate(new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()),
    },
  ]);
  const [loading] = useState(false);

  return { posts, loading, refetch: async () => {} };
}