import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, Trash2, ArrowLeft, MoreVertical } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ChatMessage from '@/components/ChatMessage';

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

interface ChatData {
  id: string;
  title: string;
  chat_type: string;
  campaign_id?: string;
  created_at: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
  campaign_status: string;
}

const Chat = () => {
  const { id: chatId } = useParams();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign_id');
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch chat data and messages
  useEffect(() => {
    const fetchChatData = async () => {
      if (chatId === 'new') {
        setChatData({
          id: 'new',
          title: 'New Chat',
          chat_type: campaignId ? 'campaign' : 'general',
          campaign_id: campaignId || undefined,
          created_at: new Date().toISOString()
        });
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch chat data
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single();
          
        if (chatError) throw chatError;
        setChatData(chatData);
        
        // If this is a campaign chat, fetch campaign data
        if (chatData.campaign_id) {
          const { data: campaignData, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', chatData.campaign_id)
            .single();
            
          if (!campaignError && campaignData) {
            setCampaign(campaignData);
          }
        }
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        if (messagesData && messagesData.length > 0) {
          setMessages(messagesData);
        }
      } catch (error) {
        console.error('Error fetching chat data:', error);
        toast.error('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatData();
  }, [chatId, campaignId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Breadcrumb items with proper type information
  const breadcrumbItems = [
    { 
      label: "Home", 
      href: "/app",
      type: "home" as const,
      id: "home"
    },
  ];

  // For campaign chats, add the campaign breadcrumb
  if (campaign) {
    breadcrumbItems.push({ 
      label: campaign.campaign_name, 
      href: `/campaign/${campaignId}`,
      type: "campaign" as const,
      id: campaignId as string 
    });
  }

  // Always add the chat breadcrumb for the current chat
  breadcrumbItems.push({ 
    label: chatData?.title || 'New Chat', 
    href: `/chat/${chatId}`,
    type: "chat" as const,
    id: chatId || 'new'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const userMessage = {
      role: 'user' as const,
      content: inputValue.trim()
    };
    
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // For new chats, create the chat first
    if (chatId === 'new') {
      try {
        setIsSending(true);
        
        // Create a new chat
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            title: userMessage.content.length > 30 
              ? userMessage.content.substring(0, 30) + '...' 
              : userMessage.content,
            chat_type: campaignId ? 'campaign' : 'general',
            campaign_id: campaignId || null
          })
          .select()
          .single();
          
        if (chatError) throw chatError;
        
        // Add the message to the new chat
        const { data: newMessage, error: messageError } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: newChat.id,
            role: userMessage.role,
            content: userMessage.content
          })
          .select()
          .single();
          
        if (messageError) throw messageError;
        
        // Navigate to the new chat
        navigate(`/chat/${newChat.id}${campaignId ? `?campaign_id=${campaignId}` : ''}`);
        
        // Update local state
        setChatData(newChat);
        setMessages([newMessage]);
        
        // Send to AI
        await sendToAI(newChat.id, [newMessage]);
      } catch (error) {
        console.error('Error creating chat:', error);
        toast.error('Failed to create chat');
        setIsSending(false);
      }
    } else {
      // For existing chats, just add the message
      try {
        setIsSending(true);
        setMessages(prev => [...prev, userMessage]);
        
        // Save message to database
        const { data: newMessage, error } = await supabase
          .from('chat_messages')
          .insert({
            chat_id: chatId,
            role: userMessage.role,
            content: userMessage.content
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update messages with the saved message
        setMessages(prev => 
          prev.map(msg => 
            msg === userMessage ? newMessage : msg
          )
        );
        
        // Send to AI
        await sendToAI(chatId as string, [...messages, newMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        setIsSending(false);
      }
    }
  };

  const sendToAI = async (chatId: string, messageHistory: Message[]) => {
    try {
      // Add thinking message
      const thinkingMessage = { role: 'assistant' as const, content: '...' };
      setMessages(prev => [...prev, thinkingMessage]);
      
      // Format messages for the AI
      const formattedMessages = messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Call the Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ messages: formattedMessages })
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const aiResponse = await response.json();
      
      // Replace thinking message with actual response
      setMessages(prev => 
        prev.map(msg => 
          msg === thinkingMessage ? {
            role: 'assistant',
            content: aiResponse.content
          } : msg
        )
      );
      
      // Save AI response to database
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          role: 'assistant',
          content: aiResponse.content
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get AI response');
      
      // Remove thinking message on error
      setMessages(prev => prev.filter(msg => msg.content !== '...'));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteChat = async () => {
    if (chatId === 'new') {
      navigate('/app');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      // Delete all messages first (due to foreign key constraints)
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('chat_id', chatId);
        
      if (messagesError) throw messagesError;
      
      // Then delete the chat
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
        
      if (chatError) throw chatError;
      
      toast.success('Chat deleted');
      
      // Navigate back to campaign or home
      if (campaignId) {
        navigate(`/campaign/${campaignId}`);
      } else {
        navigate('/app');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleBackClick = () => {
    if (campaignId) {
      navigate(`/campaign/${campaignId}`);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="flex min-h-screen bg-adgentic-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={() => navigate('/campaign/new')}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-10 h-[60px] border-b border-adgentic-border bg-white bg-opacity-80 backdrop-blur-md px-4">
          <div className={`flex items-center justify-between h-full transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackClick}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold text-adgentic-text-primary truncate">
                {chatData?.title || 'New Chat'}
              </h1>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDeleteChat} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <div className="pt-[60px]">
          {/* Breadcrumb navigation */}
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Chat messages */}
          <div className="flex flex-col h-[calc(100vh-180px)] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-adgentic-accent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-adgentic-text-secondary">
                  <p className="text-lg font-medium mb-2">No messages yet</p>
                  <p>Start a conversation by typing a message below.</p>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {messages.map((message, index) => (
                    <ChatMessage 
                      key={message.id || index}
                      message={message}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="border-t border-adgentic-border bg-white p-4">
              <div className="max-w-4xl mx-auto relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="resize-none pr-12 min-h-[60px] max-h-[200px] overflow-y-auto"
                  disabled={isSending}
                />
                <Button
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-adgentic-accent text-white hover:bg-adgentic-accent/90"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
