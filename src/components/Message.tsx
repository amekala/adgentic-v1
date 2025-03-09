import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';

export interface MessageProps {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  title?: string;
  actionButtons?: Array<{ label: string; primary?: boolean }>;
  metrics?: Array<{ label: string; value: string; improvement?: boolean }>;
  followupPrompts?: Array<{ text: string }>;
  followupQuestions?: Array<{ text: string }>;
  structuredData?: any;
  apiData?: any;
  toolCall?: {
    type: string;
    operation: string;
    params: any;
  };
}

interface MessageComponentProps {
  message: MessageProps;
  onActionClick?: (action: string) => void;
  onFollowupClick?: (prompt: string) => void;
}

const Message: React.FC<MessageComponentProps> = ({ 
  message, 
  onActionClick,
  onFollowupClick
}) => {
  const isUser = message.role === 'user';
  const hasMetrics = message.metrics && message.metrics.length > 0;
  const hasActionButtons = message.actionButtons && message.actionButtons.length > 0;
  const hasFollowupPrompts = message.followupPrompts && message.followupPrompts.length > 0;
  const hasApiData = message.apiData;
  
  return (
    <div className={cn(
      "flex gap-3 px-4 py-6",
      isUser ? "bg-adgentic-bg" : "bg-adgentic-bglight border-b border-adgentic-border",
    )}>
      <div className="flex-shrink-0">
        <Avatar className={cn(
          "h-8 w-8",
          isUser ? "bg-adgentic-primary" : "bg-adgentic-accent"
        )}>
          <AvatarFallback>
            {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 space-y-4 max-w-4xl">
        {message.title && (
          <h3 className="font-semibold text-lg">{message.title}</h3>
        )}
        
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({node, ...props}) => <p className="text-gray-800 whitespace-pre-wrap break-words" {...props} />
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        
        {/* Metrics Display */}
        {hasMetrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 my-4">
            {message.metrics.map((metric, index) => (
              <Card key={index} className="bg-white border border-gray-100 shadow-sm">
                <CardContent className="p-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{metric.value}</span>
                      {metric.improvement !== undefined && (
                        <Badge className={metric.improvement ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {metric.improvement ? "▲" : "▼"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* API Data Display */}
        {hasApiData && (
          <div className="mt-4 p-4 border border-blue-100 bg-blue-50 rounded-md">
            <h4 className="font-medium text-blue-800 mb-2">Campaign Data</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(message.apiData).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {hasActionButtons && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.actionButtons.map((button, index) => (
              <Button
                key={index}
                onClick={() => onActionClick && onActionClick(button.label)}
                variant={button.primary ? "default" : "outline"}
                size="sm"
                className={cn(
                  button.primary 
                    ? "bg-adgentic-accent hover:bg-adgentic-accent/90 text-white" 
                    : "border border-adgentic-border hover:bg-adgentic-bglight"
                )}
              >
                {button.label}
              </Button>
            ))}
          </div>
        )}
        
        {/* Followup Prompts with improved hover effect */}
        {hasFollowupPrompts && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.followupPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onFollowupClick && onFollowupClick(prompt.text)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200/70 rounded-full text-sm text-gray-700 transition-colors"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
