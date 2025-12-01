"use client";

import { useEffect, useState } from "react";
import { getPLCHighlights } from "../../../../../supabase/Lib/Feeds/feeds";
import { PLCHighlight } from "../../../../../supabase/Lib/Feeds/types";
import Avatar from "@/app/component/ReusableComponent/Avatar";
import { Star, Quote, Award } from "lucide-react";
import LoadingScreen from "@/app/component/ReusableComponent/LoadingScreen";
// Import supabase for realtime
import { supabase } from "../../../../../supabase/Lib/General/supabaseClient";

export default function PLCStream() {
  const [items, setItems] = useState<PLCHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHighlights = async () => {
    const data = await getPLCHighlights();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch
    fetchHighlights();

    // Realtime Subscription to TutorRatings
    const channel = supabase
      .channel("plc-highlights-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "TutorRatings" },
        () => {
          fetchHighlights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading)
    return (
      <div className="mt-20">
        <LoadingScreen />
      </div>
    );

  if (items.length === 0) {
    return (
      <div className="text-center mt-20 text-gray-500 font-montserrat">
        No rated tutors yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[600px] pb-20">
      <div className="flex items-center gap-2 mb-2">
        <Award className="text-gold" size={32} />
        <h2 className="text-[#800000] font-bold text-2xl font-montserrat">
          Tutor Hall of Fame
        </h2>
        <Award className="text-gold" size={32} />
      </div>

      {items.map((item) => {
        const isPerfect = item.rating === 5;
        const borderColor = isPerfect ? "border-gold" : "border-gray-200";
        const shadowClass = isPerfect
          ? "shadow-lg shadow-yellow-100"
          : "shadow-sm";

        return (
          <div
            key={item.id}
            className={`w-full bg-white rounded-[20px] border-2 ${borderColor} ${shadowClass} p-6 relative overflow-hidden transition-transform hover:scale-[1.01]`}
          >
            {/* Decoration for Perfect Scores */}
            {isPerfect && (
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-yellow-100 rounded-full opacity-50 blur-xl pointer-events-none" />
            )}

            <div className="flex items-start gap-4 relative z-10">
              <div className="relative">
                <Avatar
                  avatarURL={item.tutorAvatar}
                  altText={item.tutorName}
                  className={`w-16 h-16 border-1 rounded-full ${
                    isPerfect ? "border-gold" : "border-gray-100"
                  }`}
                />
                {isPerfect && (
                  <div className="absolute -bottom-2 -right-2 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    TOP
                  </div>
                )}
              </div>

              <div className="flex-1">
                {/* Header: Name and Stars */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-black font-montserrat">
                      {item.tutorName}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      Tutor for{" "}
                      <span className="text-maroon font-bold">
                        {item.subject}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={
                            i < item.rating
                              ? "fill-gold text-gold"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 mt-1 font-medium">
                      {item.rating}.0 / 5.0
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                {item.review ? (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 relative">
                    <Quote
                      size={20}
                      className="absolute top-2 left-2 text-gray-300 fill-current opacity-50"
                    />
                    <p className="pl-6 font-montserrat text-sm text-gray-700 italic leading-relaxed">
                      &quot;{item.review}&quot;
                    </p>
                    <div className="mt-3 flex justify-between items-center border-t border-gray-200 pt-2">
                      <span className="text-xs text-gray-400">
                        Rate by:{" "}
                        <span className="font-bold text-gray-600">
                          {item.studentName}
                        </span>
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-xs text-gray-400 text-right italic">
                    Rated by {item.studentName} on{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
