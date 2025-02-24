
import { useNavigate } from 'react-router-dom';
import { Plus, FolderIcon, PenIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';

const Campaign = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        
        <div className="flex flex-col h-full pt-[60px] pb-4">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4">
              <div className="bg-white rounded-2xl border mt-6">
                <input
                  type="text"
                  placeholder="New chat in this project"
                  className="w-full p-4 rounded-2xl text-gray-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-2xl border p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Add files</h2>
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-gray-600">
                    Chats in this project can access file content
                  </p>
                </div>

                <div className="bg-white rounded-2xl border p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">Add instructions</h2>
                    <PenIcon className="h-5 w-5" />
                  </div>
                  <p className="text-gray-600">
                    Tailor the way ChatGPT responds in this project
                  </p>
                </div>
              </div>

              <div className="mt-16 text-center text-gray-600">
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
