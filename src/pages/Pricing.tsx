
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Check } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';

const pricingTiers = [
  {
    name: "Standard",
    description: "For advertisers spending up to $4M per year.",
    price: "$95k",
    benefits: [
      "Access 100+ publishers",
      "Access to best-in-class automation & optimization capabilities",
      "Access to online training resources and help center"
    ]
  },
  {
    name: "Advanced",
    description: "For advertisers spending up to $10M per year.",
    price: "$230k",
    benefits: [
      "Competitive Insights",
      "Search Term Analysis",
      "Dedicated client success support"
    ],
    baseText: "All the benefits of Standard, plus:"
  },
  {
    name: "Enterprise",
    description: "For advertisers spending up to $20M per year.",
    price: "$420k",
    benefits: [
      "Expanded set of read-only publishers",
      "Customizable audits & QA capabilities",
      "Expanded customer journey intelligence"
    ],
    baseText: "All the benefits of Advanced, plus:"
  },
  {
    name: "Enterprise Premier",
    description: "For advertisers spending up to $35M per year.",
    price: "$630k",
    benefits: [
      "Incrementality testing",
      "White glove onboarding and client success",
      "Custom solution development"
    ],
    baseText: "All the benefits of Enterprise, plus:"
  }
];

const Pricing = () => {
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
          <div className="max-w-7xl mx-auto px-4 py-12 w-full">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Explore our simple, <span className="text-blue-500">straightforward pricing</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Choose any tier to begin with us and enjoy a flat annual fee, ensuring predictable tech costs even as you scale your program.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingTiers.map((tier) => (
                <div key={tier.name} className="bg-[#2F2F2F] rounded-xl p-6 border border-[#383737] flex flex-col">
                  <h3 className="text-2xl font-bold text-blue-500 mb-2">{tier.name}</h3>
                  <p className="text-gray-400 mb-4">{tier.description}</p>
                  <div className="text-3xl font-bold text-white mb-6">{tier.price}<span className="text-lg text-gray-400"> per year</span></div>
                  
                  <button className="w-full bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 transition-colors mb-6">
                    Get Started
                  </button>

                  <div className="mt-auto">
                    {tier.baseText && (
                      <p className="text-gray-400 mb-2 text-sm">{tier.baseText}</p>
                    )}
                    <ul className="space-y-3">
                      {tier.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
