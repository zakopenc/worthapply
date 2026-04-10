'use client';

import { ArrowRight, Target, FileText, ChartBar } from '@phosphor-icons/react';

interface WorkflowStep {
  iconName: string;
  title: string;
  description: string;
  metric: string;
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
}

function getIcon(iconName: string) {
  const icons: Record<string, typeof Target> = {
    target: Target,
    fileText: FileText,
    barChart3: ChartBar,
  };
  return icons[iconName] || Target;
}

export default function WorkflowDiagram({ steps }: WorkflowDiagramProps) {
  return (
    <div className="workflow-diagram">
      {steps.map((step, index) => {
        const Icon = getIcon(step.iconName);
        return (
          <div key={step.title} className="workflow-step-container">
            <div className="workflow-step">
              <div className="workflow-icon">
                <Icon size={32} weight="duotone" />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <div className="workflow-metric">{step.metric}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="workflow-arrow">
                <ArrowRight size={24} weight="bold" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
