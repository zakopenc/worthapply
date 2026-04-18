'use client';

import { type Icon } from '@phosphor-icons/react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: Icon;
  title: string;
  description: string;
  metric?: string;
  screenshot?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  metric,
  screenshot,
}: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="feature-card-visual"
    >
      <div className="feature-card-icon">
        <Icon size={32} weight="duotone" />
      </div>
      
      {screenshot && (
        <div className="feature-card-screenshot">
          <Image
            src={screenshot}
            alt={`${title} screenshot`}
            width={300}
            height={200}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
          />
        </div>
      )}
      
      <div className="feature-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {metric && <div className="feature-card-metric">{metric}</div>}
      </div>
    </motion.div>
  );
}
