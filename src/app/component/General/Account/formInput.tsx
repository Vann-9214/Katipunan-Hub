interface FormInputProps {
  label: string;
  id: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function FormInput({
  label,
  id,
  value,
  onChange,
  disabled = false,
}: FormInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                   focus:outline-none focus:ring-black focus:border-black
                   disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}
