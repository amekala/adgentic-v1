
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Heart, Users, Zap, Target, Lightbulb, Mail, ArrowRight } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const About = () => {
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    navigate('/app');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <SpeedInsights />
      
      <nav className="flex items-center justify-between py-6 px-8 md:px-16">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <span className="font-bold">A</span>
          </div>
          <span className="font-semibold text-xl">Adgentic</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-sm hover:text-blue-600 transition-colors">Features</a>
          <a href="/#benefits" className="text-sm hover:text-blue-600 transition-colors">Benefits</a>
          <a href="/#pricing" className="text-sm hover:text-blue-600 transition-colors">Pricing</a>
          <a href="/#contact" className="text-sm hover:text-blue-600 transition-colors">Contact Us</a>
          <a href="/about" className="text-sm text-blue-600 font-medium">About Us</a>
        </div>
        <Button 
          onClick={handleLoginClick} 
          variant="default" 
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-4 py-2"
        >
          Login <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </nav>

      <section className="py-16 md:py-24 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            About Adspirer
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
            Turning retail media challenges into opportunities ✨
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Mission 🚀</h2>
            <p className="text-lg text-gray-700 mb-6">
              At Adspirer, we're on a mission to revolutionize how brands approach retail media advertising. We believe that AI can transform complex campaign management into intuitive conversations, making retail media accessible to everyone.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Our platform empowers marketers with intelligent insights and automated optimizations that were previously only available to those with technical expertise and large teams. With Adspirer, we're democratizing retail media excellence! 💪
            </p>
            <p className="text-lg text-gray-700">
              Adspirer is proudly owned by betsonagi, LLC — committed to building innovative solutions for retail media challenges.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-blue-50 rounded-2xl p-8">
            <div className="h-12 w-12 bg-blue-100 rounded-lg text-blue-600 flex items-center justify-center mb-6">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">What We Value ❤️</h3>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mt-1 mr-3">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <span><strong>Innovation:</strong> We're constantly pushing the boundaries of what's possible with AI and retail media.</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mt-1 mr-3">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span><strong>Simplicity:</strong> We believe powerful tools should be accessible and easy to use.</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mt-1 mr-3">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <span><strong>Results:</strong> We're obsessed with driving measurable performance for our clients.</span>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 p-1 rounded-full mt-1 mr-3">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                </div>
                <span><strong>Transparency:</strong> We believe in clear communication and honest metrics.</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-2xl p-8">
            <div className="h-12 w-12 bg-amber-100 rounded-lg text-amber-600 flex items-center justify-center mb-6">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Story 📚</h3>
            <p className="text-gray-700 mb-4">
              Adspirer was born from a simple observation: retail media advertising was becoming increasingly complex, fragmented, and time-consuming. 😫
            </p>
            <p className="text-gray-700 mb-4">
              Our founder, having experienced these frustrations firsthand, envisioned a platform where marketers could simply have a conversation about their goals and let AI handle the technical details. 💡
            </p>
            <p className="text-gray-700">
              Today, we're proud to help brands of all sizes optimize their retail media presence across major platforms, driving better results with less effort. 🎯
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white p-8 md:p-12 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Choose Adspirer? 🤔</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-3">AI-Powered Intelligence 🧠</h3>
              <p>Our advanced AI understands retail media nuances and provides strategic recommendations that drive performance.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-3">Conversational UX 💬</h3>
              <p>No more complex dashboards or endless menus. Just tell us what you need, and we'll make it happen.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-3">Cross-Platform Mastery 🌐</h3>
              <p>Manage all your retail media campaigns across Amazon, Walmart, Instacart, and more from one interface.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Get In Touch 📬</h2>
            <p className="text-lg text-gray-700 mb-6">
              We'd love to hear from you! Whether you have questions about our platform, pricing, or just want to say hello, our team is here to help.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <a href="mailto:abhi@adspirer.com" className="text-blue-600 font-medium">abhi@adspirer.com</a>
              </div>
              <Button 
                onClick={() => navigate('/#contact')} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
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
                <span className="font-semibold text-xl">Adgentic</span>
              </div>
              <p className="max-w-xs">AI-powered retail media management that simplifies campaign creation and optimization.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
              <div>
                <h4 className="text-white font-medium mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="/#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="/#contact" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
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

export default About;
