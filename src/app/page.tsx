import Background from "@/app/component/ReusableComponent/Background";
import LandingPageTab from "@/app/component/General/LandingPage/Tab/LandingPageTab";
import LandingPageContent from "@/app/component/General/LandingPage/Tab/LandingPageContent";

export default function Page() {
  return (
    <Background>
      <LandingPageTab />
      <LandingPageContent />
    </Background>
  );
}
