type Option = {
  label: string;
  seconds: number;
};

type Props = {
  options: Option[];
  value: number;
  onChange: (seconds: number) => void;
};

export default function ChartControls({ options, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-md border border-brand-line bg-white px-2 py-1 text-xs text-brand-navy"
      aria-label="期間選択"
    >
      {options.map((option) => (
        <option key={option.seconds} value={option.seconds}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
