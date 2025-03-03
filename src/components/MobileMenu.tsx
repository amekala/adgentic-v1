
import React, { useState } from 'react';
import { Menu, X, Home, MessageSquare, FolderOpen, Settings, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    onToggle(); // Close menu after navigation
  };

  return (
    <>
      {/* Floating hamburger button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-adgentic-accent text-white shadow-lg transition-transform hover:scale-105 md:hidden"
        aria-label="Toggle mobile menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white md:hidden">
          <div className="flex h-16 items-center justify-between border-b border-adgentic-border px-6">
            <h2 className="text-xl font-semibold text-adgentic-text-primary">Adgentic</h2>
            <button onClick={onToggle}>
              <X className="h-6 w-6 text-adgentic-text-primary" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              <li className="rounded-md hover:bg-adgentic-hover">
                <button
                  onClick={() => handleNavigation('/app')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-adgentic-text-primary"
                >
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </button>
              </li>
              <li className="rounded-md hover:bg-adgentic-hover">
                <button
                  onClick={() => handleNavigation('/chat/new')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-adgentic-text-primary"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>New Chat</span>
                </button>
              </li>
              <li className="rounded-md hover:bg-adgentic-hover">
                <button
                  onClick={() => handleNavigation('/account')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-adgentic-text-primary"
                >
                  <User className="h-5 w-5" />
                  <span>Account</span>
                </button>
              </li>
            </ul>
            
            <div className="mt-6 border-t border-adgentic-border pt-6">
              <h3 className="mb-3 px-4 text-sm font-medium text-adgentic-text-secondary">Campaigns</h3>
              <ul className="space-y-2">
                <li className="rounded-md hover:bg-adgentic-hover">
                  <button
                    onClick={() => handleNavigation('/app')}
                    className="flex w-full items-center gap-3 px-4 py-3 text-adgentic-text-primary"
                  >
                    <FolderOpen className="h-5 w-5" />
                    <span>All Campaigns</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
          
          <div className="border-t border-adgentic-border p-4">
            <button
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-adgentic-text-primary hover:bg-adgentic-hover"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
