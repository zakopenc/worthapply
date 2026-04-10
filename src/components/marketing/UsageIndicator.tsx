'use client';

interface UsageIndicatorProps {
  current?: number;
  max?: number;
  label: string;
  unlimited?: boolean;
}

export default function UsageIndicator({ max = 1, label, unlimited = false }: UsageIndicatorProps) {
  return (
    <div className="usage-indicator">
      <div className="usage-label">
        <span>{label}</span>
        {unlimited ? (
          <span className="usage-count unlimited">∞ Unlimited</span>
        ) : (
          <span className={`usage-count`}>
            {max} included
          </span>
        )}
      </div>
      <div className="usage-bar-bg">
        <div
          className={`usage-bar ${unlimited ? 'unlimited-bar' : 'normal-bar'}`}
          style={{ width: `${unlimited ? 100 : 100}%` }}
        />
      </div>
    </div>
  );
}
