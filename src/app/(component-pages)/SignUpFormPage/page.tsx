import SignUpForm from "@/app/component/General/LandingPage/Tab/SignUpForms";
import Tab from "@/app/component/General/LandingPage/Tab/LandingPageTab";

export default function SignInFormPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 overflow-y-auto">
      <div className="flex flex-col items-center py-10 gap-6">
        <Tab />
        <SignUpForm />
      </div>
    </div>
  );
}
