
import React from 'react';
import { ChevronRight, Home, FolderOpen, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href: string;
  type: 'home' | 'campaign' | 'chat';
  id?: string;
}

export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Helper to determine if an item is the current page
  const isCurrentPage = (href: string) => {
    return location.pathname === href;
  };

  // Function to get the appropriate icon for each item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-3.5 w-3.5 mr-1" aria-hidden="true" />;
      case 'campaign':
        return <FolderOpen className="h-3.5 w-3.5 mr-1" aria-hidden="true" />;
      case 'chat':
        return <MessageSquare className="h-3.5 w-3.5 mr-1" aria-hidden="true" />;
      default:
        return null;
    }
  };

  // Function to get the appropriate background color for each item type
  const getItemStyle = (item: BreadcrumbItem, isCurrent: boolean) => {
    const baseClasses = "flex items-center hover:text-adgentic-text-primary whitespace-nowrap rounded-md transition-colors";
    
    if (isCurrent) {
      return `${baseClasses} font-medium text-adgentic-text-primary px-2 py-1`;
    }
    
    switch (item.type) {
      case 'home':
        return `${baseClasses} text-adgentic-text-secondary px-2 py-1 hover:bg-adgentic-hover`;
      case 'campaign':
        return `${baseClasses} text-adgentic-accent px-2 py-1 hover:bg-adgentic-hover`;
      case 'chat':
        return `${baseClasses} text-adgentic-text-secondary px-2 py-1 hover:bg-adgentic-hover`;
      default:
        return baseClasses;
    }
  };

  // Only display items that have a path and label
  const validItems = items.filter(item => item.href && item.label);

  return (
    <nav aria-label="Breadcrumb" className="w-full sticky z-10 top-[60px] bg-white/95 backdrop-blur-sm">
      <div className="flex items-center gap-1 text-sm px-6 py-3 border-b border-adgentic-border">
        {validItems.map((item, index) => (
          <React.Fragment key={`${item.type}-${item.id || index}`}>
            {/* Chevron separator between items */}
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-adgentic-text-light flex-shrink-0 mx-1" />
            )}
            
            {/* The breadcrumb item */}
            <Link 
              to={item.href} 
              className={getItemStyle(item, isCurrentPage(item.href))}
            >
              {/* Icon appropriate for the item type */}
              {getItemIcon(item.type)}
              
              {/* Label with truncation for long titles */}
              {item.type === 'chat' && item.label.length > 25 ? (
                <span className="truncate max-w-[200px]" title={item.label}>
                  {item.label}
                </span>
              ) : (
                <span>{item.label}</span>
              )}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
