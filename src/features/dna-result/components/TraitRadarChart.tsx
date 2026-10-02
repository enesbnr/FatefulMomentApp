import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';
import { fontFamilies } from '../../../theme/typography';
import { appColors, withAlpha } from '../../../theme/colors';
import type { DnaTraitScores } from '../model/types';
import {
  dnaResultColors,
  dnaTraitLabels,
  dnaTraitOrder,
} from './dnaResult.constants';

type Props = {
  scores: DnaTraitScores;
};

const width = 149;
const height = 115;
const centerX = 74.5;
const centerY = 60;
const radiusX = 43;
const radiusY = 39;

const pointAt = (index: number, ratio = 1) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / 6;
  return {
    x: centerX + Math.cos(angle) * radiusX * ratio,
    y: centerY + Math.sin(angle) * radiusY * ratio,
  };
};

const pointsFor = (ratios: number[]) =>
  ratios
    .map((ratio, index) => {
      const point = pointAt(index, ratio);
      return `${point.x},${point.y}`;
    })
    .join(' ');

export default function TraitRadarChart({ scores }: Props) {
  const scorePoints = dnaTraitOrder.map(trait => scores[trait] / 100);
  const labelPositions = [
    { x: 74.5, y: 7, anchor: 'middle' as const },
    { x: 129, y: 34, anchor: 'start' as const },
    { x: 129, y: 88, anchor: 'start' as const },
    { x: 74.5, y: 114, anchor: 'middle' as const },
    { x: 20, y: 88, anchor: 'end' as const },
    { x: 20, y: 34, anchor: 'end' as const },
  ];

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      testID="dna-radar-chart"
    >
      {[0.25, 0.5, 0.75, 1].map(ratio => (
        <Polygon
          key={ratio}
          points={pointsFor(Array(6).fill(ratio))}
          fill="none"
          stroke={appColors.chartGrid}
          strokeWidth={0.5}
        />
      ))}
      {dnaTraitOrder.map((trait, index) => {
        const end = pointAt(index);
        return (
          <Line
            key={trait}
            x1={centerX}
            y1={centerY}
            x2={end.x}
            y2={end.y}
            stroke={appColors.chartGrid}
            strokeWidth={0.5}
          />
        );
      })}
      <Polygon
        testID="dna-radar-score-polygon"
        points={pointsFor(scorePoints)}
        fill={withAlpha(appColors.accentStrong, 0.4)}
        stroke={dnaResultColors.radar}
        strokeWidth={1.5}
      />
      {dnaTraitOrder.map((trait, index) => (
        <SvgText
          key={`${trait}-label`}
          x={labelPositions[index].x}
          y={labelPositions[index].y}
          textAnchor={labelPositions[index].anchor}
          fill={dnaResultColors.subdued}
          fontFamily={fontFamilies.bold}
          fontSize={6}
        >
          {dnaTraitLabels[trait]}
        </SvgText>
      ))}
    </Svg>
  );
}
