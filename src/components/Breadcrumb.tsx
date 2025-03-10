import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight, FolderOpen, MessageSquare } from 'lucide-react';

// Updated interface to include 'campaign' and 'chat' types
export interface BreadcrumbItem {
  label: string;
  href: string;
  type: 'home' | 'campaign' | 'chat' | string;
  id: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    navigate(href);
  };
  
  // Get the appropriate icon based on item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-3.5 w-3.5 mr-1" />;
      case 'campaign':
        return <FolderOpen className="h-3.5 w-3.5 mr-1" />;
      case 'chat':
        return <MessageSquare className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Home className="h-3.5 w-3.5 mr-1" />;
    }
  };

  return (
    <nav className="flex items-center px-6 py-3 text-sm text-adgentic-text-secondary">
      <div className="flex items-center space-x-1">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-adgentic-text-tertiary" />
            )}
            <button
              onClick={() => handleClick(item.href)}
              className={`flex items-center hover:text-adgentic-text-primary transition-colors px-2 py-1 rounded hover:bg-adgentic-border/20 ${
                index === items.length - 1 ? 'font-medium text-adgentic-text-primary' : ''
              }`}
            >
              {getItemIcon(item.type)}
              <span>{item.label}</span>
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
