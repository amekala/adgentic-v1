
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, FolderIcon, PenIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';

const Campaign = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        
        <div className="flex flex-col h-full pt-[60px] pb-4">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4">
              <div className="mt-6">
                <input
                  type="text"
                  placeholder="New chat in this project"
                  className="w-full p-4 rounded-2xl bg-[#2F2F2F] text-white placeholder-gray-400 focus:outline-none border border-[#383737]"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-[#2F2F2F] rounded-2xl border border-[#383737] p-6 hover:bg-[#383737] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-white">Add files</h2>
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-gray-400">
                    Chats in this project can access file content
                  </p>
                </div>

                <div className="bg-[#2F2F2F] rounded-2xl border border-[#383737] p-6 hover:bg-[#383737] cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-white">Add instructions</h2>
                    <PenIcon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-gray-400">
                    Tailor the way ChatGPT responds in this project
                  </p>
                </div>
              </div>

              <div className="mt-16 text-center text-gray-400">
                Start a new chat, or drag an old one in
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Campaign;
