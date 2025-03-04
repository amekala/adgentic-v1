import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Check, Globe, BarChart2, Zap, ArrowRight, Search, PieChart, TrendingUp, Tag, AlertCircle, Plus, Menu, X, Home, Phone, Info, DollarSign } from 'lucide-react';
import ContactForm from '@/components/ContactForm';

const FEATURED_LOGOS = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/512px-TechCrunch_logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Forbes_logo.svg/512px-Forbes_logo.svg.png", 
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Adweek.svg/512px-Adweek.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Retail_Dive_logo.svg/512px-Retail_Dive_logo.svg.png"
];

const PLATFORM_LOGOS = [
  {
    name: "Amazon",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/512px-Amazon_logo.svg.png"
  },
  {
    name: "Walmart",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Walmart_logo.svg/512px-Walmart_logo.svg.png"
  },
  {
    name: "Instacart",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Instacart_logo_2022.svg/512px-Instacart_logo_2022.svg.png"
  },
  {
    name: "Target",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Target_logo.svg/512px-Target_logo.svg.png"
  },
  {
    name: "Kroger",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Kroger_logo.svg/512px-Kroger_logo.svg.png"
  }
];

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

const ExampleChat = ({ title, conversation, icon: Icon, iconColor }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < conversation.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [currentStep, conversation.length]);
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-8 w-8 rounded-full ${iconColor} flex items-center justify-center text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-sm text-gray-800 font-medium">{title}</div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-4">
        {conversation.slice(0, currentStep + 1).map((message, index) => (
          <div 
            key={index} 
            className={`${message.sender === 'assistant' ? 'bg-white' : 'bg-blue-50'} rounded p-3 shadow-sm mb-3 ${message.sender === 'user' ? 'ml-8' : ''}`}
          >
            <p className="text-gray-700 text-sm font-medium">{message.sender === 'assistant' ? 'Adspirer Assistant:' : 'You:'}</p>
            <p className={`text-sm ${message.sender === 'user' ? 'text-blue-600' : 'text-gray-600'}`}>{message.content}</p>
            {message.actionButtons && (
              <div className="mt-3 flex gap-2">
                {message.actionButtons.map((button, idx) => (
                  <span 
                    key={idx} 
                    className={`text-xs ${button.primary ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'} px-2 py-1 rounded`}
                  >
                    {button.label}
                  </span>
                ))}
              </div>
            )}
            {message.metrics && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {message.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-500">{metric.label}</div>
                    <div className={`text-sm font-medium ${metric.improvement ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.value} {metric.improvement && '↑'}{!metric.improvement && metric.value !== 'N/A' && '↓'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="text-xs text-gray-500">Powered by AI</div>
        <div className="flex gap-2">
          {conversation.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-2 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Marketing = () => {
  const navigate = useNavigate();
  const pricingSectionRef = useRef<HTMLDivElement>(null);
  const contactSectionRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const benefitsSectionRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLoginClick = () => {
    navigate('/app');
  };

  const handlePricingClick = () => {
    pricingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleContactClick = () => {
    contactSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };
  
  const handleFeaturesClick = () => {
    featuresSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };
  
  const handleBenefitsClick = () => {
    benefitsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };
  
  const handleAboutClick = () => {
    navigate('/about');
    setMobileMenuOpen(false);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const campaignCreationChat = [
    {
      sender: 'assistant',
      content: 'Welcome back! How can I help you with your retail media campaigns today?'
    },
    {
      sender: 'user',
      content: 'I need to create a new campaign for our summer line of products on Amazon.'
    },
    {
      sender: 'assistant',
      content: "I'll help you set up that Amazon campaign for your summer products. What's your target ACOS and daily budget?",
    },
    {
      sender: 'user',
      content: 'Target ACOS is 18% and daily budget is $500.'
    },
    {
      sender: 'assistant',
      content: "Great! I've prepared your Amazon Summer Campaign with the following settings:",
      actionButtons: [
        { label: 'Edit Settings', primary: false },
        { label: 'Launch Campaign', primary: true }
      ]
    }
  ];

  const performanceAnalysisChat = [
    {
      sender: 'assistant',
      content: "Good morning! Here's a quick overview of your campaign performance yesterday."
    },
    {
      sender: 'user',
      content: 'Show me the details of my Amazon Black Friday campaign.'
    },
    {
      sender: 'assistant',
      content: "Here's the performance data for your Amazon Black Friday campaign over the past 7 days:",
      metrics: [
        { label: 'Impressions', value: '142,587', improvement: true },
        { label: 'Clicks', value: '3,842', improvement: true },
        { label: 'CTR', value: '2.69%', improvement: true },
        { label: 'ACOS', value: '15.8%', improvement: true },
        { label: 'Spend', value: '$4,215', improvement: false },
        { label: 'Sales', value: '$26,678', improvement: true }
      ]
    },
    {
      sender: 'assistant',
      content: "Would you like me to suggest optimizations based on this data?",
      actionButtons: [
        { label: 'Yes, optimize campaign', primary: true },
        { label: 'No, just monitoring', primary: false }
      ]
    }
  ];

  const keywordOptimizationChat = [
    {
      sender: 'assistant',
      content: 'I noticed several of your keywords could benefit from optimization. Would you like me to analyze them?'
    },
    {
      sender: 'user',
      content: 'Yes, please suggest some better keywords for my vitamin supplement campaign.'
    },
    {
      sender: 'assistant',
      content: "Based on your vitamin supplement campaign performance, here are keyword recommendations:"
    },
    {
      sender: 'assistant',
      content: "I suggest pausing: 'multivitamin supplement', 'daily vitamin', 'vitamin pills' (high spend, low conversion). And adding: 'organic vitamin supplements', 'plant-based daily vitamins', 'vegan vitamin formula' (trending in your category).",
      actionButtons: [
        { label: 'Review All Changes', primary: false },
        { label: 'Apply Recommendations', primary: true }
      ]
    }
  ];

  const budgetAllocationChat = [
    {
      sender: 'assistant',
      content: "I've analyzed your cross-platform campaigns. Would you like spending recommendations?"
    },
    {
      sender: 'user',
      content: 'Yes, how should I reallocate my budget across Amazon, Walmart, and Instacart?'
    },
    {
      sender: 'assistant',
      content: "Based on ROAS analysis, I recommend the following budget allocation:",
      metrics: [
        { label: 'Amazon (current)', value: '65%', improvement: false },
        { label: 'Amazon (recommended)', value: '50%', improvement: true },
        { label: 'Walmart (current)', value: '25%', improvement: false },
        { label: 'Walmart (recommended)', value: '30%', improvement: true },
        { label: 'Instacart (current)', value: '10%', improvement: false },
        { label: 'Instacart (recommended)', value: '20%', improvement: true }
      ]
    },
    {
      sender: 'user',
      content: 'Why increase Instacart so much?'
    },
    {
      sender: 'assistant',
      content: "Your Instacart campaigns show the highest ROAS at 4.2x compared to Amazon (3.1x) and Walmart (3.8x). There's significant growth opportunity with only 10% of your current spend.",
      actionButtons: [
        { label: 'Adjust Manually', primary: false },
        { label: 'Apply Recommendations', primary: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      
      <nav className="flex items-center justify-between py-6 px-8 md:px-16">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <span className="font-bold">A</span>
          </div>
          <span className="font-semibold text-xl">Adspirer</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={handleFeaturesClick} className="text-sm hover:text-blue-600 transition-colors">Features</button>
          <button onClick={handleBenefitsClick} className="text-sm hover:text-blue-600 transition-colors">Benefits</button>
          <button onClick={handlePricingClick} className="text-sm hover:text-blue-600 transition-colors">Pricing</button>
          <button onClick={handleContactClick} className="text-sm hover:text-blue-600 transition-colors">Contact Us</button>
          <button onClick={handleAboutClick} className="text-sm hover:text-blue-600 transition-colors">About Us</button>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleLoginClick} 
            variant="default" 
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-4 py-2"
          >
            Login <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <button 
            onClick={toggleMobileMenu} 
            className="md:hidden bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-64 h-full shadow-xl p-5 transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <span className="font-bold">A</span>
                </div>
                <span className="font-semibold">Adspirer</span>
              </div>
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col space-y-5">
              <button 
                onClick={handleFeaturesClick}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 py-2 transition-colors"
              >
                <Zap className="h-5 w-5" />
                <span>Features</span>
              </button>
              
              <button 
                onClick={handleBenefitsClick}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 py-2 transition-colors"
              >
                <Check className="h-5 w-5" />
                <span>Benefits</span>
              </button>
              
              <button 
                onClick={handlePricingClick}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 py-2 transition-colors"
              >
                <DollarSign className="h-5 w-5" />
                <span>Pricing</span>
              </button>
              
              <button 
                onClick={handleContactClick}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 py-2 transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span>Contact Us</span>
              </button>
              
              <button 
                onClick={handleAboutClick}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 py-2 transition-colors"
              >
                <Info className="h-5 w-5" />
                <span>About Us</span>
              </button>
              
              <hr className="my-2" />
              
              <Button 
                onClick={handleLoginClick} 
                variant="default" 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md w-full"
              >
                Login <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating mobile menu button (visible when scrolled) */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button 
          onClick={toggleMobileMenu}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <section className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          AI Reimagined, Retail Media Amplified
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10">
          Crafting intelligent solutions that turn your retail media goals into reality.
        </p>
        <Button
          onClick={handleLoginClick}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-md"
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <div className="mt-16 relative mx-auto max-w-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl transform rotate-1"></div>
          <ExampleChat 
            title="Campaign Creation" 
            conversation={campaignCreationChat}
            icon={Plus}
            iconColor="bg-blue-600"
          />
        </div>
      </section>

      <section className="py-12 px-6 md:px-16 max-w-6xl mx-auto">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-8 text-center">Leading Retail Media Platforms</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 gap-4 justify-items-center items-center">
          {PLATFORM_LOGOS.map((platform, index) => (
            <div key={index} className="p-4 w-full h-24 flex items-center justify-center bg-white rounded-lg shadow-sm">
              <img 
                src={platform.url} 
                alt={platform.name} 
                className="h-10 max-h-16 max-w-[80%] object-contain" 
              />
            </div>
          ))}
        </div>
        <p className="text-gray-600 mt-8 text-center">Manage your retail media presence across all major retailers from a single platform.</p>
      </section>

      <section id="benefits" ref={benefitsSectionRef} className="py-16 px-6 md:px-16 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          For 🛍️ brands, 🛒 retailers and 🏭 CPG companies
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-16">
          Empowering retail brands and marketers with cutting-edge AI solutions for retail media excellence.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-blue-100 rounded-lg text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Intelligence</h3>
            <p className="text-gray-600">Leverage cutting-edge AI for smarter keywords, optimized bids, and actionable insights.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-green-100 rounded-lg text-green-600 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Platform Reach</h3>
            <p className="text-gray-600">Seamlessly manage Amazon, Walmart, Instacart and other retail media platforms from one interface.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-purple-100 rounded-lg text-purple-600 flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Performance Optimization</h3>
            <p className="text-gray-600">Continuously improve campaign performance with AI-driven recommendations and automated adjustments.</p>
          </div>
        </div>
      </section>

      <section id="features" ref={featuresSectionRef} className="py-16 bg-gray-50">
        <div className="px-6 md:px-16 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">See Adspirer in Action</h2>
          
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Performance Analysis</h3>
              <p className="text-gray-600 mb-6">Get comprehensive cross-platform performance analytics with actionable insights, all in a simple conversation.</p>
              
              <ul className="space-y-3">
                {[
                  "Automated performance reports",
                  "Cross-platform ROAS comparison",
                  "Campaign anomaly detection",
                  "Real-time performance alerts"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <ExampleChat 
              title="Performance Analysis" 
              conversation={performanceAnalysisChat}
              icon={BarChart2}
              iconColor="bg-green-600"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <ExampleChat 
              title="Keyword Optimization" 
              conversation={keywordOptimizationChat}
              icon={Tag}
              iconColor="bg-purple-600"
            />
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">Keyword Intelligence</h3>
              <p className="text-gray-600 mb-6">Discover high-performing keywords and automatically optimize your campaigns with AI-driven recommendations.</p>
              
              <ul className="space-y-3">
                {[
                  "Competitive keyword analysis",
                  "Under-performing keyword detection",
                  "Trending search term identification",
                  "Automated bid optimization"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Budget Allocation</h3>
              <p className="text-gray-600 mb-6">Optimize your spending across multiple retail media platforms to maximize ROAS and market coverage.</p>
              
              <ul className="space-y-3">
                {[
                  "Cross-platform budget recommendations",
                  "ROAS-driven allocation strategies",
                  "Seasonal budget planning",
                  "Spend pacing and forecasting"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <ExampleChat 
              title="Budget Allocation" 
              conversation={budgetAllocationChat}
              icon={PieChart}
              iconColor="bg-orange-600"
            />
          </div>
        </div>
      </section>

      <section id="pricing" ref={pricingSectionRef} className="py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore our simple, <span className="text-blue-500">straightforward pricing</span>
            </h2>
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
      </section>

      <section className="py-16 bg-gray-50">
        <div className="px-6 md:px-16 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">Trusted by Growing Brands</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-4">★★★★★</div>
              <p className="text-gray-600 mb-6">"Adspirer has transformed how we manage our retail media. The AI suggestions have improved our ROAS by 32% in just two months."</p>
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm text-gray-500">Digital Marketing Director, HomeGoods Direct</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-4">★★★★★</div>
              <p className="text-gray-600 mb-6">"The conversational interface makes campaign management so much easier. We've saved 15+ hours per week that we used to spend in complex dashboards."</p>
              <div>
                <p className="font-semibold">Michael Chen</p>
                <p className="text-sm text-gray-500">E-commerce Manager, NutriBest</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-4">★★★★★</div>
              <p className="text-gray-600 mb-6">"Managing campaigns across Amazon, Walmart and Instacart used to be a nightmare. Adspirer has unified our strategy and improved our results."</p>
              <div>
                <p className="font-semibold">Jessica Miller</p>
                <p className="text-sm text-gray-500">CMO, TechAccessories Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" ref={contactSectionRef} className="py-16 px-6 md:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to <span className="text-blue-500">Transform</span> Your Retail Media Strategy?
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Get in touch with our team to schedule a personalized demo and see how Adspirer can help you achieve your retail media goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-xl mb-4">Why Request a Demo?</h3>
                
                <ul className="space-y-4">
                  {[
                    "See our AI-powered platform in action with your actual campaigns",
                    "Learn how our solutions can increase your ROAS by up to 30%",
                    "Discover optimization opportunities specific to your retail channels",
                    "Get expert insights from our retail media specialists"
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-xl mb-4 text-blue-800">Already a Customer?</h3>
                <p className="text-blue-700 mb-4">If you're an existing customer and need assistance, our customer success team is here to help.</p>
                <Button
                  variant="outline"
                  className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Contact Support
                </Button>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 text-white mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="font-bold">A</span>
                </div>
                <span className="font-semibold text-xl">Adspirer</span>
              </div>
              <p className="max-w-xs">AI-powered retail media management that simplifies campaign creation and optimization.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><button onClick={handleFeaturesClick} className="hover:text-white transition-colors text-left">Features</button></li>
                  <li><button onClick={handlePricingClick} className="hover:text-white transition-colors text-left">Pricing</button></li>
                  <li><button onClick={handleContactClick} className="hover:text-white transition-colors text-left">Contact Us</button></li>
                  <li><button onClick={handleAboutClick} className="hover:text-white transition-colors text-left">About Us</button></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2023 Adspirer. All rights reserved. Owned by betsonagi, LLC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketing;
