
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, PenIcon, PlayCircle, BarChart3 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import ChatActionPills from '@/components/ChatActionPills';

// Initialize with empty messages array - removing welcome message
const exampleMessages: Array<{ role: 'assistant' | 'user' | 'system'; content: string }> = [];

const Campaign = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages] = useState(exampleMessages);

  const metrics = [
    {
      id: 'roas',
      label: 'RoAS',
      value: '3.5x',
      timeframe: 'Last 7 Days',
      className: 'bg-[#1E2A1F] border-[#2D3F2E] hover:bg-[#232E24]' // Muted green
    },
    {
      id: 'sales',
      label: 'Sales',
      value: '$1,500',
      timeframe: 'Last 7 Days',
      className: 'bg-[#1E2429] border-[#2D363D] hover:bg-[#232B31]' // Muted blue
    },
    {
      id: 'spend',
      label: 'Spend',
      value: '$428',
      timeframe: 'Last 7 Days',
      className: 'bg-[#2A231E] border-[#3D332D] hover:bg-[#2E2723]' // Muted amber
    },
    {
      id: 'clicks',
      label: 'Clicks',
      value: '875',
      timeframe: 'Last 7 Days',
      className: 'bg-[#241E2A] border-[#362D3D] hover:bg-[#2A232E]' // Muted purple
    }
  ];

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
    // Message handling will be implemented later
  };

  const handlePillAction = (message: string) => {
    console.log('Pill clicked:', message);
    // Pill action handling will be implemented later
  };

  return (
    <div className="flex h-screen bg-[#212121]">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}} 
        onNewCampaign={() => {}}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} />
        
        <div className="flex flex-col h-full pt-[60px]">
          <div className="flex items-center px-4 py-3 border-b border-[#383737]">
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              New Product Launch Campaign
              <span className="flex items-center gap-1 text-sm font-normal text-green-500">
                <PlayCircle className="h-4 w-4" />
                Live
              </span>
            </h1>
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

              <div className="mt-6">
                <MessageList messages={messages} />
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-[#383737]">
            <div className="max-w-3xl mx-auto space-y-4">
              <ChatInput 
                onSend={handleSendMessage} 
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
