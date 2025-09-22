import React from 'react';

interface ShimmerProps {
  width?: number;
  height?: number;
  className?: string;
  duration?: number;
  opacity?: number;
  borderRadius?: number;
  padding?: number;
  responsive?: boolean;
  backgroundColor?: string;
}

const Shimmer: React.FC<ShimmerProps> = ({
  width = 169,
  height = 169,
  className = '',
  duration = 1.5,
  opacity = 0.6,
  borderRadius = 0,
  padding = 0,
  responsive = false,
  backgroundColor = 'rgb(232, 233, 236)'
}) => {
  const svgProps = responsive
    ? {
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'none'
    }
    : {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`
    };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
      {...svgProps}
    >
      {/* 背景层 */}
      <rect
        x={padding}
        y={padding}
        width={width - padding * 2}
        height={height - padding * 2}
        rx={borderRadius}
      />
      <rect
        x={padding}
        y={padding}
        width={width - padding * 2 + 0.5}
        height={height - padding * 2 + 0.5}
        rx={borderRadius + 0.25}
      />

      {/* 高光层 */}
      <rect
        x={padding}
        y={padding}
        width={width - padding * 2}
        height={height - padding * 2}
        rx={borderRadius}
        fill="url(#shimmerGradient)"
      />

      <defs>
        <linearGradient
          id="shimmerGradient"
          x1="0%"
          y1="0%"
          x2="50%"
          y2="50%"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={backgroundColor} stopOpacity="0" />
          <stop offset="47%" stopColor={'white'} stopOpacity={opacity} />
          <stop offset="53%" stopColor={'white'} stopOpacity={opacity} />
          <stop offset="100%" stopColor={backgroundColor} stopOpacity="0" />
          <animateTransform
            attributeName="gradientTransform"
            attributeType="XML"
            type="translate"
            values="-180,-180;180,180"
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Shimmer; 