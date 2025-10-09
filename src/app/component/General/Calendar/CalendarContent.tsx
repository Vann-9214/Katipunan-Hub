"use client";

import Image from "next/image";
import { useState } from "react";
import { Montserrat, PT_Sans } from "next/font/google";
import { ChevronLeft, ChevronRight } from "lucide-react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("Reminder");
  const [viewMode, setViewMode] = useState<"month" | "year">("month"); // ✅ NEW

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const firstDay = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  const prevMonth = () =>
    setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  // Highlight today's date
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === currentDate.getMonth();
  const todayDate = today.getDate();

  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  // ✅ Generate mini-months for year view
  const renderMiniMonth = (monthIndex: number) => {
    const firstDayMini = new Date(year, monthIndex, 1).getDay();
    const daysInMini = new Date(year, monthIndex + 1, 0).getDate();
    const miniDays = Array.from({ length: 35 }, (_, i) => {
      const d = i - firstDayMini + 1;
      return d > 0 && d <= daysInMini ? d : null;
    });

    return (
      <div
        key={monthIndex}
        className="border rounded-lg p-2 bg-white shadow-sm hover:scale-105 transition cursor-pointer"
        onClick={() => {
          setCurrentDate(new Date(year, monthIndex, 1));
          setViewMode("month"); // ✅ clicking month switches to that month
        }}
      >
        <div className="text-center font-bold text-sm text-[#800000] mb-1">
          {new Date(year, monthIndex).toLocaleString("default", {
            month: "short",
          })}
        </div>
        <div className="grid grid-cols-7 gap-[2px] text-[10px] text-gray-700">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i}>{d}</div> // ✅ FIXED: unique keys
          ))}
          {miniDays.map((d, i) => (
            <div
              key={i}
              className="h-5 flex items-center justify-center text-[10px]"
            >
              {d || ""}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      {/* 🔘 MENU ICON */}
      <button
        className="absolute z-[9999]"
        style={{ left: "1356px", top: "207px" }}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Image src="/menu icon.svg" alt="Menu Icon" width={35} height={35} />
      </button>

      {/* 🧾 POPUP MENU */}
      {menuOpen && (
        <div
          className="absolute z-[9999] flex flex-col p-3 shadow-lg"
          style={{
            left: "1150px",
            top: "250px",
            width: "217px",
            borderRadius: "25px",
            backgroundColor: "#D2C8CA",
          }}
        >
          {[
            { name: "Year", icon: "/Calendar.svg" },
            { name: "Month", icon: "/Calendar.svg" },
            { name: "Schedule", icon: "/Schedule.svg" },
            { name: "Reminder", icon: "/Bellplus.svg" },
          ].map((item, index) => (
            <div
              key={item.name}
              onClick={() => {
                setSelectedMenu(item.name);
                if (item.name === "Year") setViewMode("year");
                if (item.name === "Month") setViewMode("month");
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md cursor-pointer ${
                ptSans.className
              } text-[17px] text-black font-normal ${
                selectedMenu === item.name ? "bg-black/20" : "bg-transparent"
              }`}
              style={{ marginBottom: index !== 3 ? "2px" : "0px" }}
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={50}
                height={50}
                className="select-none"
              />
              <span className="flex-1">{item.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* MAIN WRAPPER */}
      <div className="relative flex flex-col px-[66px] pt-[40px]">
        <h1
          className={`${montserrat.className} text-[#800000] text-[32px] font-extrabold`}
        >
          YOUR EVENT BOARD:
        </h1>

        {/* 🗓 Calendar Section */}
        <div className="relative mt-[30px] w-[922px]">
          <Image
            src="/Calendar Box.svg"
            alt="Calendar Box"
            width={922}
            height={650}
            className="absolute top-0 left-0 -z-10 select-none"
          />

          {/* Header */}
          <div
            className={`${montserrat.className} flex justify-between items-center px-10 py-3 bg-[#800000] text-white text-[24px] font-semibold rounded-t-md`}
          >
            <button
              onClick={prevMonth}
              className="hover:text-[#FFD700] transition"
            >
              <ChevronLeft size={28} />
            </button>
            <span>{viewMode === "month" ? `${monthName} ${year}` : year}</span>
            <button
              onClick={nextMonth}
              className="hover:text-[#FFD700] transition"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Month View */}
          {viewMode === "month" && (
            <>
              <div
                className={`${ptSans.className} grid grid-cols-7 text-center font-bold text-gray-700 mt-3 text-[15px]`}
              >
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day, i) => (
                  <div key={i}>{day}</div> // ✅ FIXED: unique keys
                ))}
              </div>

              <div className="grid grid-cols-7 gap-4 mt-3 px-6">
                {daysArray.map((day, index) => {
                  const isToday = isCurrentMonth && day === todayDate;
                  return (
                    <div
                      key={index}
                      className={`relative w-[85px] h-[85px] flex items-center justify-center ${
                        day ? "cursor-pointer" : "opacity-30"
                      }`}
                      onClick={() => day && setSelectedDay(day)}
                    >
                      {isToday && (
                        <div className="absolute inset-0 border-4 border-[#FFD700] rounded-md pointer-events-none"></div>
                      )}
                      <Image
                        src="/Date Box.svg"
                        alt="Date Box"
                        width={85}
                        height={85}
                        className="absolute top-0 left-0 select-none"
                      />
                      {day && (
                        <span
                          className={`${
                            ptSans.className
                          } text-[14px] font-bold absolute top-[8px] left-1/2 -translate-x-1/2 ${
                            selectedDay === day
                              ? "text-[#FFD700]"
                              : "text-[#800000]"
                          }`}
                        >
                          {day}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Year View */}
          {viewMode === "year" && (
            <div className="grid grid-cols-3 gap-4 p-4">
              {Array.from({ length: 12 }, (_, i) => renderMiniMonth(i))}
            </div>
          )}
        </div>
      </div>
      {/* ➕ Plus Sign Button */}
      <button
        className="absolute z-[9999]"
        style={{ left: "1286px", top: "867px" }}
        onClick={() => {
          // TODO: Add your handler logic here (open modal, add event, etc.)
          alert("Plus sign clicked!");
        }}
      >
        <Image src="/Plus Sign.svg" alt="Add Event" width={103} height={101} />
      </button>
    </div>
  );
}
