
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Check, Globe, BarChart2, Zap, ArrowRight } from 'lucide-react';

const Marketing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between py-6 px-8 md:px-16">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <span className="font-bold">A</span>
          </div>
          <span className="font-semibold text-xl">Adgentic</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm hover:text-blue-600 transition-colors">Features</a>
          <a href="#benefits" className="text-sm hover:text-blue-600 transition-colors">Benefits</a>
          <a href="#pricing" className="text-sm hover:text-blue-600 transition-colors">Pricing</a>
          <a href="#contact" className="text-sm hover:text-blue-600 transition-colors">Contact</a>
        </div>
        <Button 
          onClick={() => navigate('/')} 
          variant="default" 
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-4 py-2"
        >
          Login <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          AI Reimagined, Retail Media Amplified
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10">
          Crafting intelligent solutions that turn your retail media goals into reality.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-md"
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* App Preview */}
        <div className="mt-16 relative mx-auto max-w-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl transform rotate-1"></div>
          <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <span className="font-bold">A</span>
                </div>
                <div className="text-sm text-gray-800 font-medium">Adgentic Assistant</div>
              </div>
              <div className="bg-white rounded p-3 shadow-sm mb-3">
                <p className="text-gray-700 text-sm">How can I help you optimize your retail media campaigns today?</p>
              </div>
              <div className="bg-blue-50 rounded p-3 shadow-sm mb-3 ml-8">
                <p className="text-gray-700 text-sm">I need to create a new Amazon campaign for our summer promotion</p>
              </div>
              <div className="bg-white rounded p-3 shadow-sm">
                <p className="text-gray-700 text-sm">I'll help you set up an Amazon campaign for your summer promotion. Let's start with the basics:</p>
                <ul className="text-xs text-gray-600 mt-2 space-y-1">
                  <li>• Campaign name: Summer Promotion 2023</li>
                  <li>• Platform: Amazon Ads</li>
                  <li>• Budget: $1,000/day</li>
                  <li>• Target ACOS: 15%</li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Edit Details</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Approve & Create</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">Powered by AI</div>
              <div className="flex gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-200"></div>
                <div className="h-2 w-2 rounded-full bg-gray-200"></div>
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* As Featured In */}
      <section className="py-12 px-6 md:px-16 max-w-6xl mx-auto text-center">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-8">As Featured In</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          <div className="grayscale opacity-50 hover:opacity-75 transition-opacity">
            <img src="https://placehold.co/120x40?text=TechCrunch" alt="TechCrunch" className="h-8" />
          </div>
          <div className="grayscale opacity-50 hover:opacity-75 transition-opacity">
            <img src="https://placehold.co/120x40?text=Forbes" alt="Forbes" className="h-8" />
          </div>
          <div className="grayscale opacity-50 hover:opacity-75 transition-opacity">
            <img src="https://placehold.co/120x40?text=AdWeek" alt="AdWeek" className="h-8" />
          </div>
          <div className="grayscale opacity-50 hover:opacity-75 transition-opacity">
            <img src="https://placehold.co/120x40?text=RetailDive" alt="Retail Dive" className="h-8" />
          </div>
        </div>
      </section>

      {/* For Section */}
      <section id="benefits" className="py-16 px-6 md:px-16 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          For 🛍️ brands, 🛒 retailers and 🏭 CPG companies
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-16">
          Empowering retail brands and marketers with cutting-edge AI solutions for retail media excellence.
        </p>

        {/* Value Proposition Cards */}
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

      {/* App Features */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="px-6 md:px-16 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">See Adgentic in Action</h2>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Conversational Campaign Creation</h3>
              <p className="text-gray-600 mb-6">Create, manage, and optimize retail media campaigns through a simple chat interface. No more complex dashboards.</p>
              
              <ul className="space-y-3">
                {[
                  "Guided campaign setup",
                  "AI-recommended keywords and bids",
                  "Cross-platform campaign management",
                  "Automatic performance alerts"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="bg-white rounded p-3 shadow-sm mb-3">
                  <p className="text-gray-700 text-sm font-medium">Adgentic Assistant:</p>
                  <p className="text-gray-600 text-sm">I've analyzed your campaigns across Amazon, Walmart and Instacart. Your ACOS is 18% on Amazon, which is 3% higher than your target. Would you like me to suggest optimization strategies?</p>
                </div>
                <div className="bg-blue-50 rounded p-3 shadow-sm mb-3">
                  <p className="text-gray-700 text-sm font-medium">You:</p>
                  <p className="text-blue-600 text-sm">Yes, please optimize my Amazon campaigns to reduce ACOS</p>
                </div>
                <div className="bg-white rounded p-3 shadow-sm">
                  <p className="text-gray-700 text-sm font-medium">Adgentic Assistant:</p>
                  <p className="text-gray-600 text-sm">I'll optimize your Amazon campaigns to reduce ACOS. Here's my plan:</p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>• Pause 5 underperforming keywords (high spend, low sales)</li>
                    <li>• Reduce bids by 15% on 8 keywords with ACOS > 25%</li>
                    <li>• Add 12 new keywords from top-performing products</li>
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Review Changes</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Apply All Optimizations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Integrations */}
      <section className="py-16 px-6 md:px-16 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">Seamlessly Integrated with Leading Retail Platforms</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center items-center">
          <div className="p-4">
            <img src="https://placehold.co/150x60?text=Amazon+Ads" alt="Amazon Ads" className="h-12" />
          </div>
          <div className="p-4">
            <img src="https://placehold.co/150x60?text=Walmart+Connect" alt="Walmart Connect" className="h-12" />
          </div>
          <div className="p-4">
            <img src="https://placehold.co/150x60?text=Instacart+Ads" alt="Instacart Ads" className="h-12" />
          </div>
          <div className="p-4">
            <img src="https://placehold.co/150x60?text=Target+Roundel" alt="Target Roundel" className="h-12" />
          </div>
        </div>
        
        <p className="text-gray-600 mt-8">Manage your retail media presence across all major retailers from a single platform.</p>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="px-6 md:px-16 max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">Trusted by Growing Brands</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-4">★★★★★</div>
              <p className="text-gray-600 mb-6">"Adgentic has transformed how we manage our retail media. The AI suggestions have improved our ROAS by 32% in just two months."</p>
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
              <p className="text-gray-600 mb-6">"Managing campaigns across Amazon, Walmart and Instacart used to be a nightmare. Adgentic has unified our strategy and improved our results."</p>
              <div>
                <p className="font-semibold">Jessica Miller</p>
                <p className="text-sm text-gray-500">CMO, TechAccessories Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-16 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Transform Your Retail Media Strategy?</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Join forward-thinking brands already using Adgentic to simplify their retail media management and drive growth.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-md"
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 text-white mb-4">
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
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
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

export default Marketing;
