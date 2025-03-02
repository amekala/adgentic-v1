
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

// Updated interface to include 'campaign' and 'chat' types
export interface BreadcrumbItem {
  label: string;
  href: string;
  type: 'home' | 'campaign' | 'chat'; // Updated to allow more type values
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

  return (
    <nav className="flex items-center px-6 py-3 text-sm text-adgentic-text-secondary">
      <div className="flex items-center space-x-1">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-adgentic-text-tertiary" />
            )}
            <button
              onClick={() => handleClick(item.href)}
              className={`flex items-center hover:text-adgentic-text-primary transition-colors px-2 py-1 rounded hover:bg-adgentic-border/20 ${
                index === items.length - 1 ? 'font-medium text-adgentic-text-primary' : ''
              }`}
            >
              {item.type === 'home' && <Home className="h-3.5 w-3.5 mr-1" />}
              <span>{item.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
