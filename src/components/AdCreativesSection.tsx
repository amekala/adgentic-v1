
import { useState } from 'react';
import { ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CREATIVE_SIZES = [
  { id: 'social', name: 'Social Media Sizes', description: '1080x1080px, 1200x628px' },
  { id: 'display', name: 'Display Sizes', description: '300x250px, 728x90px' },
  { id: 'story', name: 'Story Sizes', description: '1080x1920px' },
];

const CREATIVE_TYPES = [
  { id: 'ad', name: 'Ad Creatives', description: 'Standard ad visuals' },
  { id: 'product', name: 'Product Photo Ads', description: 'Product-focused ads' },
  { id: 'video', name: 'Product Videos', description: 'Short video ads' },
  { id: 'stock', name: 'Stock Images', description: 'Professional stock photos' },
];

// Placeholder example creatives
const EXAMPLE_CREATIVES = [
  {
    id: 1,
    imageUrl: 'https://source.unsplash.com/488590528505-98d2b5aba04b',
    type: 'Social Media',
    size: '1080x1080px'
  },
  {
    id: 2,
    imageUrl: 'https://source.unsplash.com/470813740244-df37b8c1edcb',
    type: 'Display',
    size: '300x250px'
  },
  {
    id: 3,
    imageUrl: 'https://source.unsplash.com/500375592092-40eb2168fd21',
    type: 'Story',
    size: '1080x1920px'
  }
];

type GenerationStep = 'initial' | 'size' | 'type' | 'generating' | 'complete';

export const AdCreativesSection = () => {
  const [step, setStep] = useState<GenerationStep>('initial');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleGenerate = () => {
    if (step === 'initial') {
      setStep('size');
    } else if (step === 'size' && selectedSize) {
      setStep('type');
    } else if (step === 'type' && selectedType) {
      setStep('generating');
      // Simulate generation process
      setTimeout(() => {
        setStep('complete');
      }, 2000);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="text-center p-8">
            <div className="bg-adgentic-accent/10 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-adgentic-accent" />
            </div>
            <h3 className="text-lg font-medium text-adgentic-text-primary mb-2">Generate Ad Creatives</h3>
            <p className="text-adgentic-text-secondary mb-6 max-w-md mx-auto">
              Let AI help you create compelling ad visuals and copy tailored to your campaign
            </p>
            <Button 
              onClick={handleGenerate}
              className="bg-adgentic-accent hover:bg-adgentic-accent/90 text-white px-6 rounded-full"
            >
              Get Started
            </Button>
          </div>
        );

      case 'size':
        return (
          <div className="space-y-6 p-6">
            <h3 className="text-lg font-medium text-adgentic-text-primary">Select Creative Size</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CREATIVE_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all",
                    selectedSize === size.id
                      ? "border-adgentic-accent bg-adgentic-accent/5"
                      : "border-adgentic-border bg-white hover:bg-adgentic-lightGray"
                  )}
                >
                  <h4 className="font-medium text-adgentic-text-primary mb-1">{size.name}</h4>
                  <p className="text-sm text-adgentic-text-secondary">{size.description}</p>
                </button>
              ))}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!selectedSize}
              className="bg-adgentic-accent hover:bg-adgentic-accent/90 text-white w-full mt-4 rounded-full"
            >
              Continue
            </Button>
          </div>
        );

      case 'type':
        return (
          <div className="space-y-6 p-6">
            <h3 className="text-lg font-medium text-adgentic-text-primary">Select Creative Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CREATIVE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all",
                    selectedType === type.id
                      ? "border-adgentic-accent bg-adgentic-accent/5"
                      : "border-adgentic-border bg-white hover:bg-adgentic-lightGray"
                  )}
                >
                  <h4 className="font-medium text-adgentic-text-primary mb-1">{type.name}</h4>
                  <p className="text-sm text-adgentic-text-secondary">{type.description}</p>
                </button>
              ))}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!selectedType}
              className="bg-adgentic-accent hover:bg-adgentic-accent/90 text-white w-full mt-4 rounded-full"
            >
              Generate Creatives
            </Button>
          </div>
        );

      case 'generating':
        return (
          <div className="text-center p-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-adgentic-accent animate-spin" />
            <h3 className="text-lg font-medium text-adgentic-text-primary mb-2">Generating Ad Creatives</h3>
            <p className="text-adgentic-text-secondary">This might take a few moments...</p>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-adgentic-text-primary">Generated Creatives</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXAMPLE_CREATIVES.map((creative) => (
                <div
                  key={creative.id}
                  className="rounded-lg overflow-hidden border border-adgentic-border bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-medium text-adgentic-text-primary mb-1">{creative.type}</div>
                    <div className="text-xs text-adgentic-text-secondary">{creative.size}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setStep('initial')}
              className="bg-adgentic-accent hover:bg-adgentic-accent/90 text-white w-full mt-4 rounded-full"
            >
              Generate More Creatives
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-adgentic-border shadow-sm">
      <div className="flex items-center gap-2 p-4 border-b border-adgentic-border">
        <ImageIcon className="h-5 w-5 text-adgentic-accent" />
        <h2 className="text-lg font-semibold text-adgentic-text-primary">Ad Creatives</h2>
      </div>
      {renderContent()}
    </div>
  );
};
