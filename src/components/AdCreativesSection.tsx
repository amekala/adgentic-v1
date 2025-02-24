
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
      }, 3000);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'initial':
        return (
          <div className="text-center p-8">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-white mb-2">Generate Ad Creatives</h3>
            <p className="text-gray-400 mb-6">Let AI help you create compelling ad visuals and copy</p>
            <Button 
              onClick={handleGenerate}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              Get Started
            </Button>
          </div>
        );

      case 'size':
        return (
          <div className="space-y-6 p-6">
            <h3 className="text-lg font-medium text-white">Select Creative Size</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CREATIVE_SIZES.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={cn(
                    "p-4 rounded-lg border text-left",
                    selectedSize === size.id
                      ? "border-pink-500 bg-pink-500/10"
                      : "border-[#383737] bg-[#2F2F2F] hover:bg-[#383737]"
                  )}
                >
                  <h4 className="font-medium text-white mb-1">{size.name}</h4>
                  <p className="text-sm text-gray-400">{size.description}</p>
                </button>
              ))}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!selectedSize}
              className="bg-pink-500 hover:bg-pink-600 text-white w-full mt-4"
            >
              Continue
            </Button>
          </div>
        );

      case 'type':
        return (
          <div className="space-y-6 p-6">
            <h3 className="text-lg font-medium text-white">Select Creative Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CREATIVE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-4 rounded-lg border text-left",
                    selectedType === type.id
                      ? "border-pink-500 bg-pink-500/10"
                      : "border-[#383737] bg-[#2F2F2F] hover:bg-[#383737]"
                  )}
                >
                  <h4 className="font-medium text-white mb-1">{type.name}</h4>
                  <p className="text-sm text-gray-400">{type.description}</p>
                </button>
              ))}
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!selectedType}
              className="bg-pink-500 hover:bg-pink-600 text-white w-full mt-4"
            >
              Generate Creatives
            </Button>
          </div>
        );

      case 'generating':
        return (
          <div className="text-center p-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-pink-500 animate-spin" />
            <h3 className="text-lg font-medium text-white mb-2">Generating Ad Creatives</h3>
            <p className="text-gray-400">This might take a few moments...</p>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium text-white">Generated Creatives</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXAMPLE_CREATIVES.map((creative) => (
                <div
                  key={creative.id}
                  className="rounded-lg overflow-hidden border border-[#383737] bg-[#2F2F2F]"
                >
                  <img
                    src={creative.imageUrl}
                    alt={`Creative ${creative.id}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="text-sm font-medium text-white mb-1">{creative.type}</div>
                    <div className="text-xs text-gray-400">{creative.size}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setStep('initial')}
              className="bg-pink-500 hover:bg-pink-600 text-white w-full mt-4"
            >
              Generate More Creatives
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#2F2F2F] rounded-xl border border-[#383737]">
      <div className="flex items-center gap-2 p-4 border-b border-[#383737]">
        <ImageIcon className="h-5 w-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Ad Creatives</h2>
      </div>
      {renderContent()}
    </div>
  );
};
