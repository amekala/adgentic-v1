
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Plus, PenIcon, PlayCircle, BarChart3, MessageSquare } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import ChatActionPills from '@/components/ChatActionPills';
import { AdCreativesSection } from '@/components/AdCreativesSection';
import { Button } from '@/components/ui/button';

const Campaign = () => {
  const { id: campaignId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user' | 'system'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('New Campaign');
  const [campaignStatus, setCampaignStatus] = useState<'draft' | 'live' | 'paused'>('draft');

  // Fetch campaign details
  useEffect(() => {
    if (campaignId && campaignId !== 'new') {
      const fetchCampaign = async () => {
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', campaignId)
          .single();
        
        if (error) {
          console.error('Error fetching campaign:', error);
          toast({
            title: "Error",
            description: "Failed to load campaign details",
            variant: "destructive"
          });
          return;
        }
        
        if (data) {
          setCampaignName(data.campaign_name);
          setCampaignStatus(data.campaign_status);
        }
      };
      
      fetchCampaign();
    }
  }, [campaignId, toast]);

  const metrics = [
    {
      id: 'roas',
      label: 'RoAS',
      value: '3.5x',
      timeframe: 'Last 7 Days',
      className: 'bg-[#1E2A1F] border-[#2D3F2E] hover:bg-[#232E24]'
    },
    {
      id: 'sales',
      label: 'Sales',
      value: '$1,500',
      timeframe: 'Last 7 Days',
      className: 'bg-[#1E2429] border-[#2D363D] hover:bg-[#232B31]'
    },
    {
      id: 'spend',
      label: 'Spend',
      value: '$428',
      timeframe: 'Last 7 Days',
      className: 'bg-[#2A231E] border-[#3D332D] hover:bg-[#2E2723]'
    },
    {
      id: 'clicks',
      label: 'Clicks',
      value: '875',
      timeframe: 'Last 7 Days',
      className: 'bg-[#241E2A] border-[#362D3D] hover:bg-[#2A232E]'
    }
  ];

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
      const newMessages = [
        ...messages,
        { role: 'user', content } as const
      ];
      
      setMessages(newMessages);

      console.log('Sending message to chat function:', { messages: newMessages });

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: newMessages }
      });

      console.log('Response from chat function:', { data, error });

      if (error) throw error;

      if (data?.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      } else {
        throw new Error('No response content received');
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

  const handlePillAction = (message: string) => {
    console.log('Pill clicked:', message);
    handleSendMessage(message);
  };

  const createNewChat = async () => {
    // Check if campaign exists, if not create it
    if (campaignId === 'new') {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          campaign_name: campaignName,
          campaign_status: campaignStatus
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating campaign:', error);
        toast({
          title: "Error",
          description: "Failed to create campaign",
          variant: "destructive"
        });
        return;
      }
      
      // Navigate to new chat with campaign_id in query
      navigate(`/chat/new?campaign_id=${data.id}`);
    } else {
      // Navigate to new chat with campaign_id in query
      navigate(`/chat/new?campaign_id=${campaignId}`);
    }
  };

  // Add initial system message when component mounts
  useEffect(() => {
    setMessages([{
      role: 'system',
      content: 'This is a new campaign conversation. How can I help you with your campaign?'
    }]);
  }, []);

  return (
    <div className="flex h-screen bg-[#212121]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={() => { navigate('/campaign/new'); }}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} title={campaignName} />
        
        <div className="flex flex-col h-full pt-[60px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#383737]">
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              {campaignName}
              <span className={`flex items-center gap-1 text-sm font-normal ${
                campaignStatus === 'live' ? 'text-green-500' : 
                campaignStatus === 'paused' ? 'text-yellow-500' : 'text-gray-400'
              }`}>
                {campaignStatus === 'live' ? <PlayCircle className="h-4 w-4" /> : null}
                {campaignStatus === 'paused' ? <PlayCircle className="h-4 w-4" /> : null}
                {campaignStatus === 'draft' ? <PenIcon className="h-4 w-4" /> : null}
                {campaignStatus.charAt(0).toUpperCase() + campaignStatus.slice(1)}
              </span>
            </h1>
            
            <Button 
              variant="outline" 
              onClick={createNewChat}
              className="flex items-center gap-2 text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-[#2F2F2F] rounded-xl border border-[#383737] p-6 hover:bg-[#383737] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Add files</h2>
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    Upload campaign assets and documents
                  </p>
                </div>

                <div className="bg-[#2F2F2F] rounded-xl border border-[#383737] p-6 hover:bg-[#383737] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Campaign Goals</h2>
                    <PenIcon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    Define and edit your campaign objectives
                  </p>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="h-5 w-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">Campaign Performance</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics.map((metric) => (
                    <div 
                      key={metric.id}
                      className={`rounded-xl border p-4 transition-colors ${metric.className}`}
                    >
                      <div className="text-sm text-gray-400 mb-1.5 font-medium">{metric.label}</div>
                      <div className="text-2xl font-bold text-white mb-1.5">{metric.value}</div>
                      <div className="text-xs text-gray-500">{metric.timeframe}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <AdCreativesSection />
              </div>

              <div className="mt-6">
                <MessageList messages={messages.filter(msg => msg.role !== 'system')} />
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-[#383737]">
            <div className="max-w-3xl mx-auto space-y-4">
              <ChatInput 
                onSend={handleSendMessage} 
                isLoading={isLoading}
                placeholder="Start a new chat with Adgentic about this campaign..."
              />
              <ChatActionPills onPillClick={handlePillAction} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Campaign;
