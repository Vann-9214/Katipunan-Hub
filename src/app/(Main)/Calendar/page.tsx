import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";
import CalendarContent from "@/app/component/General/Calendar/CalendarContent";

export default function Calendar() {
  return (
    <div className="p-[25px]">
      {" "}
      <HomepageTab />
      <CalendarContent />
    </div>
  );
}
