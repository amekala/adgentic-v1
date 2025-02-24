
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import { Shield, CreditCard, Link, UserCircle } from 'lucide-react';

const Account = () => {
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
        
        <div className="flex flex-col h-full pt-[60px]">
          <div className="max-w-4xl mx-auto px-4 py-8 w-full">
            <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

            <div className="space-y-6">
              <div className="bg-[#2F2F2F] rounded-lg p-6 border border-[#383737]">
                <div className="flex items-center gap-3 mb-4">
                  <UserCircle className="h-5 w-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                </div>
                <p className="text-gray-400">Manage your profile details and preferences</p>
              </div>

              <div className="bg-[#2F2F2F] rounded-lg p-6 border border-[#383737]">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <h2 className="text-xl font-semibold text-white">Billing & Subscription</h2>
                </div>
                <p className="text-gray-400">View billing information and manage your subscription plan</p>
              </div>

              <div className="bg-[#2F2F2F] rounded-lg p-6 border border-[#383737]">
                <div className="flex items-center gap-3 mb-4">
                  <Link className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-white">Connected Accounts</h2>
                </div>
                <p className="text-gray-400">Connect and manage your Amazon Ads account integration</p>
              </div>

              <div className="bg-[#2F2F2F] rounded-lg p-6 border border-[#383737]">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-semibold text-white">Security</h2>
                </div>
                <p className="text-gray-400">Update your password and security settings</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
