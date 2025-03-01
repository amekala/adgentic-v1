
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const PricingPlans = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between py-6 px-8 md:px-16">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <span className="font-bold">A</span>
          </div>
          <span className="font-semibold text-xl">Adgentic</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm hover:text-blue-600 transition-colors">Features</a>
          <a href="/#benefits" className="text-sm hover:text-blue-600 transition-colors">Benefits</a>
          <a href="/#contact" className="text-sm hover:text-blue-600 transition-colors">Contact</a>
        </div>
        <Button 
          onClick={handleLoginClick} 
          variant="default" 
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-4 py-2"
        >
          Login <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </nav>
      
      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore our simple, <span className="text-blue-500">straightforward pricing</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Choose any tier to begin with us and enjoy a flat annual fee, ensuring predictable tech costs even as you scale your program.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier) => (
            <div key={tier.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <h3 className="text-2xl font-bold text-blue-500 mb-2">{tier.name}</h3>
              <p className="text-gray-600 mb-4">{tier.description}</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">{tier.price}<span className="text-lg text-gray-500"> per year</span></div>
              
              <Button 
                onClick={handleLoginClick} 
                className="w-full bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 transition-colors mb-6"
              >
                Get Started <ArrowRight className="h-4 w-4 ml-1" />
              </Button>

              <div className="mt-auto">
                {tier.baseText && (
                  <p className="text-gray-500 mb-2 text-sm">{tier.baseText}</p>
                )}
                <ul className="space-y-3">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
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

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 text-white mb-4 cursor-pointer" onClick={() => navigate('/')}>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="font-bold">A</span>
                </div>
                <span className="font-semibold text-xl">Adgentic</span>
              </div>
              <p className="max-w-xs">AI-powered retail media management that simplifies campaign creation and optimization.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2023 Adgentic. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPlans;
