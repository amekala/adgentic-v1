
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import { CreditCard, Link, UserCircle, ChevronDown, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
}

const Account = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: 'profile',
      title: 'Profile Information',
      description: 'Manage your profile details and preferences',
      icon: <UserCircle className="h-5 w-5" />,
      iconColor: 'text-blue-500'
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      description: 'View billing information and manage your subscription plan',
      icon: <CreditCard className="h-5 w-5" />,
      iconColor: 'text-green-500'
    },
    {
      id: 'connected',
      title: 'Connected Accounts',
      description: 'Connect and manage your Amazon Ads account integration',
      icon: <Link className="h-5 w-5" />,
      iconColor: 'text-yellow-500'
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'profile':
        return (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Full Name</div>
                <div className="text-white">John Doe</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Email Address</div>
                <div className="text-white">john.doe@example.com</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Time Zone</div>
                <div className="text-white">(GMT-08:00) Pacific Time (US & Canada)</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Account Created</div>
                <div className="text-white">January 15, 2024</div>
              </div>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Current Plan</div>
                <div className="text-white">Standard Tier</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Next Billing Date</div>
                <div className="text-white">February 15, 2024</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Payment Method</div>
                <div className="text-white">Visa ending in 1234</div>
              </div>
            </div>
            <button className="text-blue-500 hover:text-blue-400 text-sm font-medium mt-4">
              View Billing History
            </button>
          </div>
        );
      case 'connected':
        return (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#383737] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="text-white font-medium">Amazon Ads - Store ID 12345</div>
                  <div className="text-sm text-green-500">Connected</div>
                </div>
              </div>
              <button className="px-3 py-1 text-sm text-white bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors">
                Disconnect
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#383737] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <div className="text-white font-medium">Amazon Ads</div>
                  <div className="text-sm text-red-500">Not Connected</div>
                </div>
              </div>
              <button className="px-3 py-1 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors">
                Connect Account
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
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
          <div className="max-w-4xl mx-auto px-4 py-8 w-full">
            <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="bg-[#2F2F2F] rounded-lg border border-[#383737]">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-6 flex items-start justify-between hover:bg-[#383737] transition-colors rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-1", section.iconColor)}>
                        {section.icon}
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                        <p className="text-gray-400 mt-1">{section.description}</p>
                      </div>
                    </div>
                    {expandedSection === section.id ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSection === section.id && (
                    <div className="px-6 pb-6">
                      {renderSectionContent(section.id)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
