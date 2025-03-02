
import React, { useState } from 'react';
import { Plus, ArrowUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NewChatInputProps {
  onCreateChat: (message?: string) => void;
}

const NewChatInput = ({ onCreateChat }: NewChatInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onCreateChat(inputValue);
      setInputValue('');
    } else {
      onCreateChat();
    }
  };

  return (
    <div className="mb-8 bg-white border border-adgentic-border rounded-xl p-4">
      <h2 className="text-lg text-adgentic-text-secondary mb-2">New chat in this campaign</h2>
      <div className="flex gap-3">
        <Button 
          onClick={() => onCreateChat()} 
          variant="outline" 
          className="rounded-full p-2 h-10 w-10"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Message Adgentic..."
            className="w-full border border-adgentic-border rounded-full px-4 py-2 pr-10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <Button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100 rounded-full p-1 h-7 w-7"
            onClick={handleSubmit}
          >
            <ArrowUp className="h-4 w-4 text-adgentic-text-secondary" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewChatInput;
