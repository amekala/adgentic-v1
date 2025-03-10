
import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputAreaProps {
  inputValue: string;
  isSending: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputValue,
  isSending,
  onInputChange,
  onSendMessage,
  onKeyDown
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle auto-resize of textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Default key handler if not provided
  const handleKeyDown = onKeyDown || ((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  });

  return (
    <div className="border-t border-adspirer-border bg-white p-4">
      <div className="max-w-4xl mx-auto relative">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Adspirer..."
          className="resize-none pr-12 min-h-[60px] max-h-[200px] overflow-y-auto"
          disabled={isSending}
        />
        <Button
          size="icon"
          className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-adspirer-accent text-white hover:bg-adspirer-accent/90"
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isSending}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatInputArea;
