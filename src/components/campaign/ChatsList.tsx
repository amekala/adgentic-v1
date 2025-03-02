
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface ChatsListProps {
  chats: Chat[];
}

const ChatsList = ({ chats }: ChatsListProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-adgentic-text-primary mb-4">Chats in this campaign</h2>
      <div className="space-y-2">
        {chats.length === 0 ? (
          <div className="text-adgentic-text-secondary p-4 bg-white border border-adgentic-border rounded-lg">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          chats.map((chat: any) => (
            <Link 
              key={chat.id} 
              to={`/chat/${chat.id}`}
              className="flex items-center gap-3 p-3 bg-white border border-adgentic-border rounded-lg hover:bg-adgentic-lightGray"
            >
              <MessageSquare className="h-5 w-5 text-adgentic-text-secondary" />
              <div>
                <div className="font-medium text-adgentic-text-primary">{chat.title}</div>
                <div className="text-sm text-adgentic-text-secondary">
                  {new Date(chat.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatsList;
