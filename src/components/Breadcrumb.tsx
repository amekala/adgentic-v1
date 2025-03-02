
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCampaign?: boolean;
  isChat?: boolean;
}

export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
  const location = useLocation();
  
  // Helper to determine if an item is the current page
  const isCurrentPage = (href: string) => {
    return location.pathname === href;
  };

  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <div className="flex items-center gap-2 text-sm text-adgentic-text-secondary px-4 py-2 border-b border-adgentic-border">
        {items.map((item, index) => (
          <React.Fragment key={`${item.href}-${index}`}>
            {/* Chevron separator between items */}
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-adgentic-text-light flex-shrink-0" />
            )}
            
            {/* Different styling for different item types */}
            <Link 
              to={item.href} 
              className={`flex items-center hover:text-adgentic-text-primary whitespace-nowrap ${
                isCurrentPage(item.href) 
                  ? 'font-medium text-adgentic-text-primary' 
                  : 'text-adgentic-text-secondary'
              } ${item.isCampaign ? 'text-adgentic-accent' : ''}`}
            >
              {/* Home icon for the first (home) item */}
              {index === 0 && (
                <Home className="h-3.5 w-3.5 mr-1" />
              )}
              
              {/* For long chat titles, truncate them */}
              {item.isChat && item.label.length > 25 ? (
                <span className="truncate max-w-[200px]" title={item.label}>
                  {item.label}
                </span>
              ) : (
                item.label
              )}
            </Link>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
