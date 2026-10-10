import { useId } from 'react';
import Svg, { Defs, G, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors, gradients } from '@/constants/theme';

interface LogoProps {
  size?: number;
  // Color del fondo donde se dibuja: el corte entre las dos T usa este color para entrelazarlas.
  backgroundColor?: string;
}

const VIEWBOX_WIDTH = 44;
const VIEWBOX_HEIGHT = 42;
const CUT_WIDTH = 4;
const STEP_OFFSETS = gradients.brand.map((_, index, list) => index / (list.length - 1));

const FRONT_T = [
  { x: 18, y: 9, width: 24, height: 7 },
  { x: 26.5, y: 9, width: 7, height: 30 },
];
const BACK_T = [
  { x: 2, y: 3, width: 24, height: 7 },
  { x: 10.5, y: 3, width: 7, height: 30 },
];

export function Logo({ size = 32, backgroundColor = colors.ink }: LogoProps) {
  const gradientId = `tt-gradient-${useId()}`;
  const fill = `url(#${gradientId})`;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      accessibilityLabel="TicketTracker">
      <Defs>
        <LinearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={VIEWBOX_WIDTH}
          y2={VIEWBOX_HEIGHT}>
          {gradients.brand.map((color, index) => (
            <Stop key={color} offset={STEP_OFFSETS[index]} stopColor={color} />
          ))}
        </LinearGradient>
      </Defs>

      <G fill={fill}>
        {BACK_T.map((rect) => (
          <Rect key={`back-${rect.x}`} {...rect} rx="2" />
        ))}
      </G>

      <G fill={backgroundColor} stroke={backgroundColor} strokeWidth={CUT_WIDTH}>
        {FRONT_T.map((rect) => (
          <Rect key={`cut-${rect.x}`} {...rect} rx="2" />
        ))}
      </G>

      <G fill={fill}>
        {FRONT_T.map((rect) => (
          <Rect key={`front-${rect.x}`} {...rect} rx="2" />
        ))}
      </G>
    </Svg>
  );
}
