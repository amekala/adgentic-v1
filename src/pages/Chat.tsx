
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
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    };

    fetchMessages();
  }, [id]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !id) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const newMessages = [
        ...messages,
        { role: 'user', content } as const
      ];
      
      setMessages(newMessages);

      // Save message to database
      await supabase
        .from('chat_messages')
        .insert([{
          chat_id: id,
          role: 'user',
          content
        }]);

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: newMessages }
      });

      if (error) throw error;

      if (data?.content) {
        const assistantMessage = { role: 'assistant', content: data.content };
        setMessages([...newMessages, assistantMessage]);

        // Save AI response to database
        await supabase
          .from('chat_messages')
          .insert([{
            chat_id: id,
            role: 'assistant',
            content: data.content
          }]);
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
