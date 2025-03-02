
import React, { useState } from 'react';
import { Plus, ArrowUp, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface NewChatInputProps {
  onCreateChat: (message?: string) => void;
  campaignId: string;
  campaignName: string;
}

const NewChatInput = ({ onCreateChat, campaignId, campaignName }: NewChatInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    const message = inputValue.trim();
    if (!message) {
      // Just start an empty chat if no message
      onCreateChat();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Create a new chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          title: message.length > 30 ? message.substring(0, 30) + '...' : message,
          chat_type: 'campaign',
          campaign_id: campaignId
        })
        .select()
        .single();
        
      if (chatError) {
        throw chatError;
      }
      
      // 2. Add the initial message to this chat
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatData.id,
          role: 'user',
          content: message
        });
        
      if (messageError) {
        throw messageError;
      }
      
      // 3. Navigate to the new chat
      toast.success('New chat created with your message');
      setInputValue('');
      navigate(`/chat/${chatData.id}?campaign_id=${campaignId}`);
    } catch (err) {
      console.error('Error creating chat with message:', err);
      toast.error('Failed to create chat. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8 bg-white border border-adgentic-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-adgentic-accent/10 rounded-lg">
          <MessageSquare className="h-5 w-5 text-adgentic-accent" />
        </div>
        <h2 className="text-lg font-medium text-adgentic-text-primary">Start a new conversation</h2>
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={() => onCreateChat()} 
          variant="outline" 
          className="rounded-full p-2 h-10 w-10 border-adgentic-border"
          title="Start an empty chat"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder={`Ask anything about ${campaignName}...`}
            className="w-full border border-adgentic-border rounded-full px-4 py-2 pr-12 focus:ring-2 focus:ring-adgentic-accent/30 focus:border-adgentic-accent outline-none transition-all"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isSubmitting}
          />
          <Button 
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1 h-8 w-8 ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : 'bg-adgentic-accent text-white hover:bg-adgentic-accent/90'
            }`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-adgentic-text-secondary">
        Start typing your question or use the <span className="font-medium">+</span> button to begin a blank conversation
      </div>
    </div>
  );
};

export default NewChatInput;
