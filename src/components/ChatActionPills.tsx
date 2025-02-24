
import { BarChart3, Lightbulb, Target, PenSquare } from 'lucide-react';
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

interface ChatActionPillsProps {
  onPillClick?: (action: string) => void;
  className?: string;
}

const ChatActionPills = ({ onPillClick, className = '' }: ChatActionPillsProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    {
      id: 'analyze',
      label: 'Campaign Analysis',
      icon: <BarChart3 className="h-4 w-4" />,
      message: "Let's analyze your campaign performance and find opportunities for improvement."
    },
    {
      id: 'ideas',
      label: 'Get Ideas',
      icon: <Lightbulb className="h-4 w-4" />,
      message: "I'll help you brainstorm creative ideas to enhance your campaign."
    },
    {
      id: 'targeting',
      label: 'Targeting Strategy',
      icon: <Target className="h-4 w-4" />,
      message: "Let's optimize your campaign targeting strategy."
    },
    {
      id: 'optimize',
      label: 'Campaign Goals',
      icon: <PenSquare className="h-4 w-4" />,
      message: "Let's define clear goals and KPIs for your campaign."
    }
  ];

  const handlePillClick = async (suggestion: typeof suggestions[0]) => {
    setIsLoading(true);
    try {
      // Create a new chat in the database
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert([{
          title: suggestion.label,
          chat_type: suggestion.id
        }])
        .select()
        .single();

      if (chatError) throw chatError;

      // Add the initial message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert([{
          chat_id: chat.id,
          role: 'user',
          content: suggestion.message
        }]);

      if (messageError) throw messageError;

      // If onPillClick is provided, call it with the message
      if (onPillClick) {
        onPillClick(suggestion.message);
      }

    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="space-y-3">
        <p className="text-sm text-gray-400">
          Get started with one of these topics, or ask me anything about your campaign:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handlePillClick(suggestion)}
              disabled={isLoading}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#2F2F2F] hover:bg-[#383737] transition-colors text-sm text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-2 rounded-md bg-[#383737] group-hover:bg-[#444444]">
                {suggestion.icon}
              </div>
              <span>{suggestion.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatActionPills;
