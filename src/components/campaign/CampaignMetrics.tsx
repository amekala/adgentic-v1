
import { BarChart3 } from "lucide-react";

interface Metric {
  id: string;
  label: string;
  value: string;
  timeframe: string;
}

interface CampaignMetricsProps {
  metrics: Metric[];
}

const CampaignMetrics = ({ metrics }: CampaignMetricsProps) => {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="h-5 w-5 text-adgentic-text-primary" />
        <h2 className="text-lg font-semibold text-adgentic-text-primary">Campaign Performance</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div 
            key={metric.id}
            className="rounded-xl border border-adgentic-border p-4 bg-white shadow-sm"
          >
            <div className="text-sm text-adgentic-text-secondary mb-1.5 font-medium">{metric.label}</div>
            <div className="text-2xl font-bold text-adgentic-text-primary mb-1.5">{metric.value}</div>
            <div className="text-xs text-adgentic-text-light">{metric.timeframe}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignMetrics;
