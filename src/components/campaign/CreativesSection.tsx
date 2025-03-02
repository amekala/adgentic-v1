
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { AdCreativesSection } from '@/components/AdCreativesSection';

const CreativesSection = () => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-adgentic-text-primary mb-4 flex items-center">
        <ImageIcon className="h-5 w-5 mr-2" /> Ad Creatives
      </h2>
      <AdCreativesSection />
    </div>
  );
};

export default CreativesSection;
