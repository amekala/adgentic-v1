import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Paperclip, Smile } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, isLoading = false, placeholder = "Message Adspirer..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center py-2">
      <div className="relative w-full border border-adspirer-border rounded-xl bg-white shadow-sm focus-within:ring-1 focus-within:ring-blue-200">
        <div className="flex items-end">
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none rounded-xl bg-transparent px-4 py-3 pr-12 focus:outline-none text-adspirer-text-primary placeholder:text-adspirer-text-light max-h-[200px] min-h-[56px]"
            disabled={isLoading}
          />
          <div className="flex items-center p-2">
            <button 
              className="text-adspirer-text-secondary hover:text-adspirer-text-primary p-2 rounded-full"
              type="button"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button 
              className="text-adspirer-text-secondary hover:text-adspirer-text-primary p-2 rounded-full"
              type="button"
            >
              <Smile className="h-5 w-5" />
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isLoading || !message.trim()}
              className="p-2 bg-adspirer-accent rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed ml-1"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
