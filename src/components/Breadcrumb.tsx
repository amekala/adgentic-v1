
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Breadcrumb = ({ items }: { items: { label: string; href: string }[] }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-adgentic-text-secondary px-4 py-2">
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <ChevronRight className="h-3 w-3" />}
          <Link to={item.href} className="hover:text-adgentic-text-primary">
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
