
import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';

type MetricItem = {
  label: string;
  value: string;
  improvement?: boolean;
};

type ActionButton = {
  label: string;
  primary?: boolean;
  onClick?: () => void;
};

export type MessageProps = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metrics?: MetricItem[];
  actionButtons?: ActionButton[];
  onActionClick?: (action: string) => void;
};

const Message = ({ role, content, metrics, actionButtons, onActionClick }: MessageProps) => {
  const [expanded, setExpanded] = useState(true);

  const handleActionClick = (label: string) => {
    if (onActionClick) {
      onActionClick(label);
    }
  };

  return (
    <div className="py-6">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <MessageAvatar isAssistant={role !== 'user'} />
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex justify-end' : ''}`}>
          <div className={`
            ${role === 'user' ? 'bg-gray-700/50 rounded-[20px] px-4 py-2 inline-block' : ''}
            ${role === 'system' ? 'bg-blue-500/20 rounded-[20px] px-4 py-2 inline-block text-blue-200' : ''}
          `}>
            {role !== 'user' && 
              <p className="text-sm font-medium text-gray-400 mb-1">Adgentic Assistant:</p>
            }
            {role === 'user' && 
              <p className="text-sm font-medium text-gray-400 mb-1">You:</p>
            }
            <div className="text-white">{content}</div>
            
            {/* Display metrics in a grid when available */}
            {metrics && metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">{metric.label}</div>
                    <div className={`text-lg font-medium flex items-center ${
                      metric.improvement === undefined ? 'text-white' :
                      metric.improvement ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {metric.value}
                      {metric.improvement !== undefined && (
                        metric.improvement ? 
                          <ArrowUp className="h-4 w-4 ml-1" /> : 
                          <ArrowDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Display action buttons when available */}
            {actionButtons && actionButtons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {actionButtons.map((button, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-full text-sm ${
                      button.primary 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                    onClick={() => handleActionClick(button.label)}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {role === 'assistant' && <MessageActions />}
        </div>
      </div>
    </div>
  );
};

export default Message;
