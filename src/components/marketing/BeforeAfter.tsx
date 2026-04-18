'use client';

import { ArrowRight, FileText } from '@phosphor-icons/react';

interface BeforeAfterProps {
  beforeScore: number;
  afterScore: number;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfter({
  beforeScore,
  afterScore,
  beforeLabel = 'Generic Resume',
  afterLabel = 'Tailored Resume',
}: BeforeAfterProps) {
  const improvement = afterScore - beforeScore;

  return (
    <div className="before-after-container">
      <div className="before-after-card before-card">
        <div className="before-after-screenshot">
          <FileText size={64} opacity={0.3} weight="duotone" />
          <div className="screenshot-text">
            <div className="screenshot-line"></div>
            <div className="screenshot-line"></div>
            <div className="screenshot-line short"></div>
            <div className="screenshot-line"></div>
            <div className="screenshot-line short"></div>
          </div>
        </div>
        <div className="before-after-label">{beforeLabel}</div>
        <div className="before-after-score error-score">
          ❌ {beforeScore}% Match
        </div>
      </div>

      <div className="before-after-arrow">
        <ArrowRight size={32} weight="bold" />
        <div className="improvement-badge">+{improvement}%</div>
      </div>

      <div className="before-after-card after-card">
        <div className="before-after-screenshot">
          <FileText size={64} opacity={0.3} weight="duotone" />
          <div className="screenshot-text">
            <div className="screenshot-line highlighted"></div>
            <div className="screenshot-line"></div>
            <div className="screenshot-line short highlighted"></div>
            <div className="screenshot-line highlighted"></div>
            <div className="screenshot-line short"></div>
          </div>
        </div>
        <div className="before-after-label">{afterLabel}</div>
        <div className="before-after-score success-score">
          ✅ {afterScore}% Match
        </div>
      </div>
    </div>
  );
}
