// This component just displays a single piece of info
interface InfoItemProps {
  label: string;
  value: string | undefined | null;
}

export default function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-black">{value || "Not set"}</p>
    </div>
  );
}
