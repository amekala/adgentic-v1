import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Check, Globe, BarChart2, Zap, ArrowRight, Search, PieChart, TrendingUp, Tag, AlertCircle, Plus } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { SpeedInsights } from '@vercel/speed-insights/react';

const FEATURED_LOGOS = [
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/512px-TechCrunch_logo.svg.png",
    alt: "TechCrunch"
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Shopify_logo_2018.svg/2560px-Shopify_logo_2018.svg.png",
    alt: "Shopify"
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Kroger_logo_2019.svg/1280px-Kroger_logo_2019.svg.png",
    alt: "Kroger"
  },
  {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJZZQI44kxO_BYJiR0SHJCnvBzj8o9xsrRCdPJJ_x6vg&s",
    alt: "Instacart",
  },
  {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Walmart_logo.svg/2560px-Walmart_logo.svg.png",
    alt: "Walmart"
  }
];

const PRICING_PLANS = [
  {
    name: "Basic",
    price: "$49",
    description: "For small businesses getting started with retail media.",
    features: [
      "Up to 5 campaigns",
      "Basic AI optimization",
      "Standard reporting",
    ],
  },
  {
    name: "Pro",
    price: "$99",
    description: "For growing businesses looking to scale their retail media efforts.",
    features: [
      "Unlimited campaigns",
      "Advanced AI optimization",
      "Custom reporting",
      "Dedicated support",
    ],
  },
  {
    name: "Enterprise",
    price: "Contact Us",
    description: "For large organizations with complex retail media needs.",
    features: [
      "All Pro features",
      "Dedicated AI strategist",
      "Custom integrations",
      "White-label options",
    ],
  },
];

const FEATURES = [
  {
    title: "AI-Powered Campaign Creation",
    description: "Generate high-performing campaigns in minutes with our AI-driven campaign builder.",
    icon: Plus,
  },
  {
    title: "Automated Optimization",
    description: "Continuously optimize your campaigns with AI-powered bidding and targeting adjustments.",
    icon: TrendingUp,
  },
  {
    title: "Cross-Platform Management",
    description: "Manage campaigns across all major retail media platforms from a single dashboard.",
    icon: Globe,
  },
  {
    title: "Real-Time Analytics",
    description: "Track your campaign performance with real-time analytics and customizable reports.",
    icon: BarChart2,
  },
  {
    title: "Predictive Insights",
    description: "Get ahead of the competition with AI-powered insights that predict future trends and opportunities.",
    icon: PieChart,
  },
  {
    title: "Keyword Recommendations",
    description: "Discover high-value keywords with our AI-powered keyword research tool.",
    icon: Tag,
  },
];

const TESTIMONIALS = [
  {
    name: "Jane Doe",
    title: "Marketing Manager at Acme Corp",
    quote: "Adgentic has transformed our retail media strategy. We're seeing a 30% increase in sales and a significant reduction in ad spend.",
  },
  {
    name: "John Smith",
    title: "CEO at Beta Co",
    quote: "Adgentic's AI-powered optimization has been a game-changer for our business. We're now able to compete with the big players in the market.",
  },
];

const FAQ = [
  {
    question: "What is Adgentic?",
    answer: "Adgentic is an AI-powered retail media management platform that helps businesses create, manage, and optimize their advertising campaigns across all major retail media platforms.",
  },
  {
    question: "How does Adgentic work?",
    answer: "Adgentic uses artificial intelligence to automate campaign creation, optimization, and reporting. Our AI algorithms analyze your campaign data and make real-time adjustments to maximize your ROI.",
  },
  {
    question: "What retail media platforms does Adgentic support?",
    answer: "Adgentic supports all major retail media platforms, including Amazon, Walmart, Target, and more.",
  },
  {
    question: "How much does Adgentic cost?",
    answer: "Adgentic offers a variety of pricing plans to meet the needs of businesses of all sizes. Please see our pricing page for more information.",
  },
  {
    question: "Does Adgentic offer a free trial?",
    answer: "Yes, Adgentic offers a free trial. Please sign up on our website to get started.",
  },
];

const Marketing = () => {
  const contactRef = useRef<HTMLDivElement>(null);
  
  const handleContactClick = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Image error handler to show fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/150x50?text=' + target.alt;
    target.classList.add('logo-fallback');
    target.onerror = null; // Prevent infinite loop if fallback also fails
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <SpeedInsights />
      
      <nav className="flex items-center justify-between py-4 px-4 md:py-6 md:px-8 lg:px-16">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Adgentic</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleContactClick(); }} className="hover:text-blue-600 transition-colors">Contact</a>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="text-slate-700 hover:text-blue-600 hover:bg-blue-50 hidden sm:inline-flex"
            onClick={() => window.location.href = "/app"}
          >
            Log in
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => window.location.href = "/app"}
          >
            Try for free
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-8 md:py-16 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-slate-900">
            AI-Powered Retail Media Advertising
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl mx-auto">
            Create, manage, and optimize your retail media campaigns with the power of artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 text-lg w-full sm:w-auto"
              onClick={() => window.location.href = "/app"}
            >
              Start for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-300 hover:bg-slate-100 text-slate-800 h-12 px-6 text-lg w-full sm:w-auto"
              onClick={() => handleContactClick()}
            >
              Schedule a demo
            </Button>
          </div>
          
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg py-6 px-4 mb-8">
            <p className="text-sm text-slate-500 mb-4">Trusted by top companies</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {FEATURED_LOGOS.map((logo, index) => (
                <div key={index} className="h-8 sm:h-9 flex items-center">
                  <img 
                    src={logo.url} 
                    alt={logo.alt} 
                    className="h-full object-contain max-w-[120px] grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-2xl font-bold mb-4">{plan.price}</p>
                <p className="text-slate-600 mb-4">{plan.description}</p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600">
                      <Check className="h-4 w-4 text-blue-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Testimonials</h2>
          <div className="space-y-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <p className="text-slate-700 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200">
                    {/* Placeholder for user avatar */}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-slate-500">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-semibold mb-2">{item.question}</h4>
                <p className="text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto" ref={contactRef}>
          <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
          <ContactForm />
        </div>
      </section>
      
      {/* Footer - Updated for better mobile display */}
      <footer className="bg-slate-900 text-slate-300 py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-white">Adgentic</span>
              </div>
              <p className="max-w-xs text-sm">AI-powered retail media management that simplifies campaign creation and optimization.</p>
            </div>
            
            <div className="grid grid-cols-2 md:col-span-2 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><button onClick={handleContactClick} className="hover:text-white transition-colors text-left">Contact Us</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Adgentic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketing;
