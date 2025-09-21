import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";

interface SignInFormProps {
  onClose?: () => void;
}

export default function SignInForm({ onClose }: SignInFormProps) {
  return (
    <div className=" flex justify-center items-center  fixed inset-0 bg-black/50 backdrop-blur-sm z-40">
      <div className="flex justify-center items-center w-[90%] max-w-[1200px] h-auto min-h-[500px] max-h-[770px] bg-white rounded-lg shadow-md relative">
        <h1 className="text-2xl font-bold">Sign In Form</h1>
        <TextButton
          text="Close"
          onClick={onClose}
          className="absolute top-3 right-3"
        />
        <Button text="Submit" className="absolute bottom-5 right-5" />
      </div>
    </div>
  );
}
