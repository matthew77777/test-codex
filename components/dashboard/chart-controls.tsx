type Option = {
  label: string;
  seconds: number;
};

type Props = {
  options: Option[];
  lookbackSec: number;
  minutesAgo: number;
  onLookbackChange: (seconds: number) => void;
  onMinutesAgoChange: (minutes: number) => void;
};

export default function ChartControls({
  options,
  lookbackSec,
  minutesAgo,
  onLookbackChange,
  onMinutesAgoChange
}: Props) {
  return (
    <section className="mt-4 rounded-2xl border border-brand-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="m-0 text-sm font-medium text-brand-sub">表示期間:</p>
        {options.map((option) => (
          <button
            key={option.seconds}
            type="button"
            onClick={() => onLookbackChange(option.seconds)}
            className={`rounded-full px-3 py-1 text-sm ${
              lookbackSec === option.seconds
                ? 'bg-[#2248a8] text-white'
                : 'border border-brand-line bg-white text-brand-sub hover:bg-[#f5f8ff]'
            }`}
          >
            {option.label}
          </button>
        ))}

        <label className="ml-auto flex items-center gap-2 text-sm text-brand-sub">
          何分前を表示
          <input
            type="range"
            min={5}
            max={60}
            value={minutesAgo}
            onChange={(e) => onMinutesAgoChange(Number(e.target.value))}
          />
          <span className="w-12 text-right">{minutesAgo}分</span>
        </label>
      </div>
    </section>
  );
}
