
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  MessageSquare, 
  Clock, 
  ChartBar, 
  DollarSign, 
  ThumbsUp
} from 'lucide-react';

const Marketing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navbar */}
      <nav className="bg-white py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-gray-900">Adgentic</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
            <a href="#platforms" className="text-gray-600 hover:text-primary">Platforms</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary">Testimonials</a>
            <Button onClick={handleLogin} className="bg-primary text-white hover:bg-primary/90">
              Login
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-2 space-y-3">
            <a href="#features" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Features</a>
            <a href="#platforms" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Platforms</a>
            <a href="#testimonials" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">Testimonials</a>
            <div className="px-4 py-2">
              <Button onClick={handleLogin} className="w-full">Login</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-violet-50 to-blue-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Conversational AI for Retail Media Advertising
            </h1>
            <p className="text-xl text-gray-700">
              Manage your Amazon, Walmart, and Instacart ads with the power of conversational AI. 
              Say goodbye to complex dashboards and hello to intelligent, chat-driven retail media management.
            </p>
            <div className="pt-4">
              <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-6">
                Login to Adgentic
              </Button>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80" 
              alt="Adgentic Interface" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The Adgentic Advantage</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform transforms how you manage retail media advertising
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="text-primary mb-4">
                <MessageSquare size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simplified Management</h3>
              <p className="text-gray-600">
                Say goodbye to complexity. Manage your retail media campaigns through an intuitive chat interface. 
                No more overwhelming dashboards.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="text-primary mb-4">
                <Brain size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Intelligence</h3>
              <p className="text-gray-600">
                Leverage the power of LLMs for intelligent keyword suggestions, bid optimization, and proactive insights.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="text-primary mb-4">
                <ChartBar size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Platform Reach</h3>
              <p className="text-gray-600">
                Control your retail media strategy across all major platforms from one unified interface.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="text-primary mb-4">
                <Clock size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time & Resources</h3>
              <p className="text-gray-600">
                Automate tasks, get instant reports, and free up your time to focus on strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Adgentic in Action</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our platform transforms retail media management
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Use Case 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Effortless Campaign Creation</h3>
              <p className="text-gray-600 mb-4">
                Create campaigns with natural language. Simply tell Adgentic what you want to achieve, 
                and it will guide you through the process.
              </p>
              <div className="text-primary">
                <MessageSquare size={24} />
              </div>
            </div>
            
            {/* Use Case 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Intelligent Keyword Research</h3>
              <p className="text-gray-600 mb-4">
                Discover high-performing keywords with AI-powered suggestions tailored to your products 
                and target audience.
              </p>
              <div className="text-primary">
                <Brain size={24} />
              </div>
            </div>
            
            {/* Use Case 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Real-Time Performance Reporting</h3>
              <p className="text-gray-600 mb-4">
                Get instant insights into your campaign performance across all platforms with 
                simple, conversational queries.
              </p>
              <div className="text-primary">
                <ChartBar size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="platforms" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Integrated with Leading Retail Media Platforms</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Adgentic connects seamlessly with the platforms you need to reach your customers where they shop
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {/* Platform logos - using placeholders */}
            <div className="bg-gray-100 p-8 rounded-lg w-full h-32 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">Amazon</span>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg w-full h-32 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">Walmart</span>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg w-full h-32 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">Instacart</span>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg w-full h-32 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">Target</span>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg w-full h-32 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">Kroger</span>
            </div>
            <div className="bg-gray-100 p-8 rounded-lg w-full h-32 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">Shopify</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Are Saying</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from brands that have transformed their retail media strategy with Adgentic
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <ThumbsUp className="text-yellow-500 mr-2" />
                <div className="text-yellow-500">★★★★★</div>
              </div>
              <p className="text-gray-600 italic mb-6">
                "Adgentic has completely transformed how we manage our Amazon campaigns. The AI-powered insights 
                have helped us increase ROAS by 38% in just one month."
              </p>
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-gray-500 text-sm">E-commerce Director, GreenLife</p>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <ThumbsUp className="text-yellow-500 mr-2" />
                <div className="text-yellow-500">★★★★★</div>
              </div>
              <p className="text-gray-600 italic mb-6">
                "The chat interface makes it so easy to manage our ads across multiple platforms. What used to 
                take hours now takes minutes. Adgentic is a game-changer."
              </p>
              <div>
                <p className="font-semibold">Michael Chen</p>
                <p className="text-gray-500 text-sm">Marketing Manager, TechGadgets</p>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <ThumbsUp className="text-yellow-500 mr-2" />
                <div className="text-yellow-500">★★★★★</div>
              </div>
              <p className="text-gray-600 italic mb-6">
                "As a small business, we couldn't afford a full-time ads specialist. Adgentic gives us 
                expert-level campaign management at a fraction of the cost."
              </p>
              <div>
                <p className="font-semibold">Jessica Martinez</p>
                <p className="text-gray-500 text-sm">Founder, Artisan Soap Co.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-violet-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Retail Media Strategy?</h2>
          <p className="text-xl text-gray-700 mb-8">
            Join innovative brands leveraging AI to simplify management and boost performance across all retail media platforms.
          </p>
          <Button onClick={handleLogin} size="lg" className="text-lg px-8 py-6">
            Login to Adgentic
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-white mr-2" />
                <span className="text-2xl font-bold">Adgentic</span>
              </div>
              <p className="text-gray-400">
                AI-powered retail media management for modern brands.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#platforms" className="text-gray-400 hover:text-white">Integrations</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Adgentic. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketing;
