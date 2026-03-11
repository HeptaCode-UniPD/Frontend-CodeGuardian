import React from 'react';

interface Props {
  percentage: number;
  label: string;
  size?: number;
}

export const CircularProgress: React.FC<Props> = ({ percentage, label, size = 90 }) => {

  const getColorClass = (pct: number) => {
    if (pct >= 90) return 'top-performance';
    if (pct >= 50) return 'medium-performance';
    return 'bad-performance';
  };

  return (
    <div>
      <div className="percentage" style={{ width: size, height: size }}>
        <svg
          height={size}
          width={size}
          viewBox="0 0 100 100"
        >
          <circle
            className="circle-bg"
            cx="50"
            cy="50"
            fill="transparent"
          />
          
          <circle
            className={`circle-progress ${getColorClass(percentage)}`}
            cx="50"
            cy="50"
            style={{ '--percentage': percentage } as React.CSSProperties}
          />
        </svg>

        {/* Testo centrato nel cerchio */}
        <div className="percentage-text">
          <span className="text-xl">{percentage}%</span>
        </div>
      </div>
      
      {/* Label sotto il cerchio */}
      <span className="label-persentage">
        {label}
      </span>
    </div>
  );
};