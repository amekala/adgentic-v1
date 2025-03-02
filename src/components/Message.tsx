
import { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import { cn } from '@/lib/utils';

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
  title?: string;
  metrics?: MetricItem[];
  actionButtons?: ActionButton[];
  onActionClick?: (action: string) => void;
};

const Message = ({ role, content, title, metrics, actionButtons, onActionClick }: MessageProps) => {
  const [expanded, setExpanded] = useState(true);
  const isAssistantMessage = role === 'assistant';

  const handleActionClick = (label: string) => {
    if (onActionClick) {
      onActionClick(label);
    }
  };

  // Format content with proper line breaks and markdown
  const formattedContent = content.split('\n').map((line, index) => (
    <p key={index} className={cn(
      "mb-2",
      line.startsWith('#') && "font-bold text-lg",
      line.startsWith('##') && "font-bold text-base",
      line.startsWith('*') && line.endsWith('*') && "italic",
      line.startsWith('**') && line.endsWith('**') && "font-bold"
    )}>
      {line.replace(/^#+ /, '')
           .replace(/^\*\*(.*)\*\*$/, "$1")
           .replace(/^\*(.*)\*$/, "$1")}
    </p>
  ));

  return (
    <div className={cn(
      "py-6 border-b border-adgentic-border",
      role === 'assistant' ? "bg-adgentic-secondary" : "bg-white"
    )}>
      <div className="w-full max-w-3xl mx-auto">
        <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
          <MessageAvatar isAssistant={isAssistantMessage} />
          <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex justify-end' : ''}`}>
            {/* Main content container */}
            <div className={`
              ${role === 'user' ? 'bg-blue-100 text-adgentic-text-primary rounded-[20px] px-4 py-3 inline-block max-w-[85%]' : 'w-full'}
              ${role === 'system' ? 'bg-blue-500/20 rounded-[20px] px-4 py-3 inline-block text-blue-800' : ''}
            `}>
              {/* Message header */}
              {isAssistantMessage && 
                <p className="text-sm font-medium text-adgentic-text-secondary mb-2">Adgentic Assistant:</p>
              }
              {role === 'user' && 
                <p className="text-sm font-medium text-adgentic-text-secondary mb-1">You:</p>
              }

              {/* Title when available */}
              {title && isAssistantMessage && (
                <h2 className="text-xl font-bold mb-3 text-adgentic-text-primary">{title}</h2>
              )}

              {/* Collapsible content section */}
              <div className={cn(
                "transition-all duration-300 overflow-hidden",
                !expanded && "max-h-20"
              )}>
                <div className="text-adgentic-text-primary space-y-1">
                  {formattedContent}
                </div>
                
                {/* Display metrics in a grid when available */}
                {metrics && metrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {metrics.map((metric, index) => (
                      <div key={index} className="bg-white shadow-sm p-3 rounded-lg border border-adgentic-border">
                        <div className="text-xs text-adgentic-text-secondary">{metric.label}</div>
                        <div className={`text-lg font-medium flex items-center ${
                          metric.improvement === undefined ? 'text-adgentic-text-primary' :
                          metric.improvement ? 'text-green-600' : 'text-red-500'
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
                            ? 'bg-adgentic-accent hover:bg-blue-700 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-adgentic-text-primary border border-adgentic-border'
                        }`}
                        onClick={() => handleActionClick(button.label)}
                      >
                        {button.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Show expand/collapse button for long messages */}
              {content.length > 300 && (
                <button 
                  onClick={() => setExpanded(!expanded)} 
                  className="flex items-center gap-1 text-sm text-adgentic-text-secondary hover:text-adgentic-accent mt-2"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" /> Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" /> Show more
                    </>
                  )}
                </button>
              )}
            </div>
            {role === 'assistant' && (
              <div className="flex items-center gap-2 text-adgentic-text-secondary">
                <MessageActions />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
