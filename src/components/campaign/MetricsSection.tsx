
import React from 'react';
import { BarChart2, ArrowUp, ArrowDown, Clock, Calendar, TrendingUp } from 'lucide-react';

interface Metric {
  id: string;
  label: string;
  value: string;
  timeframe: string;
  change?: {
    value: string;
    positive: boolean;
  };
}

interface MetricsSectionProps {
  metrics: Metric[];
}

const MetricsSection = ({ metrics }: MetricsSectionProps) => {
  // Define extended metrics with trend data
  const extendedMetrics: Metric[] = [
    {
      id: '1',
      label: 'Impressions',
      value: '143,892',
      timeframe: 'Last 30 days',
      change: {
        value: '12.4%',
        positive: true
      }
    },
    {
      id: '2',
      label: 'Clicks',
      value: '12,453',
      timeframe: 'Last 30 days',
      change: {
        value: '8.2%',
        positive: true
      }
    },
    {
      id: '3',
      label: 'CTR',
      value: '8.65%',
      timeframe: 'Last 30 days',
      change: {
        value: '1.2%',
        positive: false
      }
    },
    {
      id: '4',
      label: 'ACOS',
      value: '15.2%',
      timeframe: 'Last 30 days',
      change: {
        value: '3.7%',
        positive: false
      }
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-adgentic-text-primary flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-adgentic-accent" /> Campaign Performance
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-adgentic-text-secondary flex items-center">
            <Clock className="h-4 w-4 mr-1 text-adgentic-text-light" />
            Last updated: Today, 2:30 PM
          </span>
          <button className="text-sm text-adgentic-accent font-medium hover:underline">
            View Details
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-adgentic-border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-adgentic-text-light" />
          <span className="text-sm font-medium text-adgentic-text-secondary">Last 30 days</span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Trending Up
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {extendedMetrics.map((metric) => (
            <div key={metric.id} className="relative">
              <div className="text-sm font-medium text-adgentic-text-secondary mb-1">{metric.label}</div>
              <div className="text-2xl font-semibold text-adgentic-text-primary mb-1">{metric.value}</div>
              
              {metric.change && (
                <div className={`flex items-center text-sm font-medium ${
                  metric.change.positive ? 'text-green-600' : 'text-red-500'
                }`}>
                  {metric.change.positive ? 
                    <ArrowUp className="h-4 w-4 mr-1" /> : 
                    <ArrowDown className="h-4 w-4 mr-1" />
                  }
                  {metric.change.value}
                </div>
              )}
              
              {/* Decorative bar showing relative performance */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${metric.change?.positive ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.random() * 60 + 40}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;
