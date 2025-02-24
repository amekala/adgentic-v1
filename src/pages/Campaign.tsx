
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, PenIcon, PlayCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';

// Example static messages for demonstration
const exampleMessages: Array<{ role: 'assistant' | 'user' | 'system'; content: string }> = [
  {
    role: 'assistant',
    content: 'Welcome to your new campaign! How can I help you optimize your retail media strategy today?'
  }
];

const Campaign = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages] = useState(exampleMessages);

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
    // Message handling will be implemented later
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
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#2F2F2F] rounded-2xl border border-[#383737] p-6 hover:bg-[#383737] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-white">Add files</h2>
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-gray-400">
                    Upload campaign assets and documents
                  </p>
                </div>

                <div className="bg-[#2F2F2F] rounded-2xl border border-[#383737] p-6 hover:bg-[#383737] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-white">Campaign Goals</h2>
                    <PenIcon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-gray-400">
                    Define and edit your campaign objectives
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <MessageList messages={messages} />
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-[#383737]">
            <div className="max-w-3xl mx-auto">
              <ChatInput 
                onSend={handleSendMessage} 
                placeholder="Start a new chat with Adgentic about this campaign..."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Campaign;
