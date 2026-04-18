type Option = {
  label: string;
  seconds: number;
};

type Props = {
  options: Option[];
  lookbackSec: number;
  onLookbackChange: (seconds: number) => void;
  compact?: boolean;
};

export default function ChartControls({ options, lookbackSec, onLookbackChange, compact = false }: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? 'justify-end' : ''}`}>
      {!compact ? <p className="m-0 text-sm font-medium text-brand-sub">表示期間:</p> : null}
      {options.map((option) => (
        <button
          key={option.seconds}
          type="button"
          onClick={() => onLookbackChange(option.seconds)}
          className={`rounded-full px-3 py-1 text-xs ${
            lookbackSec === option.seconds
              ? 'bg-[#2248a8] text-white'
              : 'border border-brand-line bg-white text-brand-sub hover:bg-[#f5f8ff]'
          }`}
        >
          {option.label}
        </button>
      ))}
      <span className="text-xs text-brand-sub">30分集計</span>
    </div>
  );
}
