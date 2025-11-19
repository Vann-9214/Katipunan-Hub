"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";
import { MONTHS, getDaysInMonth, getFirstDayOfMonth } from "../PLC/Utils";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["600", "700"] });
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400"] });

interface PLCViewYearProps {
  year: number;
  onMonthClick: (monthIndex: number) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
}

export default function PLCViewYear({
  year,
  onMonthClick,
  onPrevYear,
  onNextYear,
}: PLCViewYearProps) {
  return (
    <div className="bg-white rounded-[30px] border border-black/20 shadow-sm p-8 w-full max-w-[1200px] mx-auto">
      {/* Year Header */}
      <div className="flex items-center justify-center gap-12 mb-8 text-black relative">
        <button
          onClick={onPrevYear}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className={`${montserrat.className} text-[32px] font-bold`}>
          {year}
        </span>
        <button
          onClick={onNextYear}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Grid of Months (4 Columns) */}
      <div className="grid grid-cols-4 gap-x-6 gap-y-8">
        {MONTHS.map((monthName, index) => {
          const daysInMonth = getDaysInMonth(year, index);
          const startOffset = getFirstDayOfMonth(year, index);

          // Logic: Create exactly 35 or 42 slots to fill the grid box perfectly
          const totalSlots = 42;
          const dayList = Array.from({ length: daysInMonth }, (_, i) => i + 1);
          // Fill the array: [nulls for offset, ...days, ...remaining nulls]
          const gridCells = [
            ...Array(startOffset).fill(null),
            ...dayList,
            ...Array(totalSlots - (startOffset + daysInMonth)).fill(null),
          ].slice(0, 42); // Ensure max 42 cells (6 rows)

          return (
            <div
              key={monthName}
              onClick={() => onMonthClick(index)}
              className="border border-black rounded-[20px] p-4 bg-white cursor-pointer hover:shadow-lg hover:border-[#8B0E0E] transition-all flex flex-col"
            >
              {/* Month Title */}
              <h3
                className={`${montserrat.className} text-center font-bold text-black text-[18px] mb-2`}
              >
                {monthName}
              </h3>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 mb-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div
                    key={i}
                    className={`${montserrat.className} text-center text-[12px] font-semibold text-gray-600`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid (Boxed Style) */}
              <div className="grid grid-cols-7 border-t border-l border-gray-300">
                {gridCells.map((d, i) => (
                  <div
                    key={i}
                    className={`
                      h-[26px] flex items-center justify-center 
                      border-b border-r border-gray-300 
                      text-[11px]
                      ${ptSans.className}
                      ${d ? "text-black" : "bg-transparent"}
                    `}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
