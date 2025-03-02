
import React from 'react';
import { BarChart2 } from 'lucide-react';

interface Metric {
  id: string;
  label: string;
  value: string;
  timeframe: string;
}

interface MetricsSectionProps {
  metrics: Metric[];
}

const MetricsSection = ({ metrics }: MetricsSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-adgentic-text-primary mb-4 flex items-center">
        <BarChart2 className="h-5 w-5 mr-2" /> Campaign Performance
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg border border-adgentic-border p-4">
            <div className="text-sm text-adgentic-text-secondary">{metric.label}</div>
            <div className="text-2xl font-semibold text-adgentic-text-primary">{metric.value}</div>
            <div className="text-xs text-adgentic-text-secondary">{metric.timeframe}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsSection;
