import {
  BookOpen,
  Calendar,
  Hash,
  School,
  MapPin,
  Mail,
} from "lucide-react";
import type { User } from "@/database/supabase/General/user";

interface AccountAcademicInfoProps {
  user: User;
}

export default function AccountAcademicInfo({ user }: AccountAcademicInfoProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-3 text-white font-montserrat">
        Academic Information
      </h2>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 text-white/90">
          <BookOpen size={20} className="text-[#EFBF04] shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-white/60">Degree Program</p>
            <p className="text-sm font-bold text-white font-montserrat">{user.course || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 text-white/90">
          <Calendar size={20} className="text-[#EFBF04] shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-white/60">Year Level</p>
            <p className="text-sm font-bold text-white font-montserrat">{user.year || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 text-white/90">
          <Hash size={20} className="text-[#EFBF04] shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-white/60">Student ID</p>
            <p className="text-sm font-bold text-white font-montserrat">{user.studentID || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 text-white/90">
          <School size={20} className="text-[#EFBF04] shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold text-white/60">Campus Role</p>
            <p className="text-sm font-bold text-white font-montserrat">{user.role || "Student"}</p>
          </div>
        </div>

        {user.location && (
          <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 text-white/90">
            <MapPin size={20} className="text-[#EFBF04] shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-white/60">Location</p>
              <p className="text-sm font-bold text-white font-montserrat">{user.location}</p>
            </div>
          </div>
        )}

        {user.email && (
          <div className="flex items-center gap-3 p-3.5 bg-white/5 rounded-xl border border-white/10 text-white/90">
            <Mail size={20} className="text-[#EFBF04] shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-white/60">CIT Email</p>
              <p className="text-sm font-bold text-white font-montserrat truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
