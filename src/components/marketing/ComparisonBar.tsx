'use client';

import { Trophy } from '@phosphor-icons/react';

interface ComparisonBarProps {
  feature: string;
  ourValue: number;
  theirValue: number;
  ourLabel: string;
  theirLabel: string;
  ourPrice?: string;
  theirPrice?: string;
  showTrophy?: boolean;
}

export default function ComparisonBar({
  feature,
  ourValue,
  theirValue,
  ourLabel,
  theirLabel,
  ourPrice,
  theirPrice,
  showTrophy = true,
}: ComparisonBarProps) {
  return (
    <div className="comparison-bar-container">
      <h4 className="comparison-feature">{feature}</h4>
      
      <div className="comparison-row our-row">
        <div className="comparison-label">
          {ourLabel}
          {showTrophy && <Trophy size={16} className="trophy-icon" weight="duotone" />}
        </div>
        <div className="comparison-bar-wrapper">
          <div 
            className="comparison-bar our-bar" 
            style={{ width: `${ourValue}%` }}
          />
        </div>
        <div className="comparison-value">
          {ourPrice || `${ourValue}%`}
        </div>
      </div>

      <div className="comparison-row their-row">
        <div className="comparison-label">{theirLabel}</div>
        <div className="comparison-bar-wrapper">
          <div 
            className="comparison-bar their-bar" 
            style={{ width: `${theirValue}%` }}
          />
        </div>
        <div className="comparison-value">
          {theirPrice || `${theirValue}%`}
        </div>
      </div>
    </div>
  );
}
