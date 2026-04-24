type Props = {
  /** 0-100 */
  value: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
  labelSize?: number;
};

export function ProgressDonut({
  value,
  size = 28,
  stroke = 3,
  showLabel = false,
  labelSize = 11,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex items-center gap-2">
      <svg width={size} height={size} className="block" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F0EFEC"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FF5B8A"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 150ms ease" }}
        />
      </svg>
      {showLabel && (
        <span
          className="tabular-nums text-ink"
          style={{ fontSize: labelSize, fontWeight: 500 }}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}
