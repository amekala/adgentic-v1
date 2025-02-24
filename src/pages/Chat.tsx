
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const Chat = () => {
  const { id: campaignId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      console.log('Fetching messages for:', campaignId || 'main chat');
      
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      // If we're in a campaign chat, filter by chat_id
      if (campaignId) {
        query = query.eq('chat_id', campaignId);
      } else {
        // For main chat, get messages with null chat_id
        query = query.is('chat_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        console.log('Fetched messages:', data);
        const validMessages = data.map(msg => ({
          role: msg.role as Message['role'],
          content: msg.content
        }));
        setMessages(validMessages);
      }
    };

    fetchMessages();
  }, [campaignId, toast]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const userMessage: Message = {
        role: 'user',
        content
      };

      // Save user message to database first
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: campaignId || null,
          role: 'user',
          content: content
        });

      if (insertError) throw insertError;

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: newMessages }
      });

      if (error) throw error;

      if (data?.content) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.content
        };

        // Save AI response to database
        const { error: aiInsertError } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: campaignId || null,
            role: 'assistant',
            content: data.content
          });

        if (aiInsertError) throw aiInsertError;
        
        setMessages([...newMessages, assistantMessage]);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={() => {}}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} />
        
        <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
          <MessageList messages={messages} />
          <div className="space-y-4 mt-auto">
            <div className="w-full max-w-3xl mx-auto px-4">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
            <div className="text-xs text-center text-gray-500">
              Adgentic can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
