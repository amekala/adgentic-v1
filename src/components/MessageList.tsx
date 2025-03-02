
import Message, { MessageProps } from './Message';

const MessageList = ({ messages, onActionClick }: { 
  messages: MessageProps[]; 
  onActionClick?: (action: string) => void;
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4">
        {messages.map((message, index) => (
          <Message 
            key={index} 
            {...message} 
            onActionClick={onActionClick}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
