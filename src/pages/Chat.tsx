
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      console.log('Fetching messages for chat:', chatId);
      
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (chatId) {
        query = query.eq('chat_id', chatId);
      } else {
        // For new chats, don't load any messages
        return;
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
  }, [chatId, toast]);

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
      // If this is a new chat, create it first
      if (!chatId) {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            title: content.substring(0, 50), // Use first 50 chars of first message as title
            chat_type: 'campaign'
          })
          .select()
          .single();

        if (chatError) throw chatError;

        if (chatData) {
          // Navigate to the new chat's URL
          navigate(`/chat/${chatData.id}`);
          // We don't need to continue with this execution as the navigation
          // will trigger a re-render and the message will be sent in the new context
          return;
        }
      }

      const userMessage: Message = {
        role: 'user',
        content
      };

      // Save user message to database
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
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
            chat_id: chatId,
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
