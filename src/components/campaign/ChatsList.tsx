
import React from 'react';
import { MessageSquare, ArrowRight, CalendarClock, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface ChatsListProps {
  chats: Chat[];
  campaignId: string;
}

const ChatsList = ({ chats, campaignId }: ChatsListProps) => {
  // Group chats by date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  const groupedChats = chats.reduce((groups, chat) => {
    const chatDate = new Date(chat.created_at).toDateString();
    let groupName = chatDate;
    
    if (chatDate === today) {
      groupName = 'Today';
    } else if (chatDate === yesterday) {
      groupName = 'Yesterday';
    }
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    
    groups[groupName].push(chat);
    return groups;
  }, {} as Record<string, Chat[]>);
  
  // Sort group keys with Today and Yesterday first, then by date
  const sortedGroups = Object.keys(groupedChats).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    
    // Otherwise sort by date (newest first)
    const dateA = a !== 'Today' && a !== 'Yesterday' ? new Date(a) : new Date();
    const dateB = b !== 'Today' && b !== 'Yesterday' ? new Date(b) : new Date();
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-adgentic-border overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-adgentic-border">
        <h2 className="text-xl font-semibold text-adgentic-text-primary flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-adgentic-accent" /> 
          Past Conversations 
          <div className="ml-2 px-2 py-0.5 bg-adgentic-lightGray rounded-full text-adgentic-text-secondary text-sm">
            {chats.length}
          </div>
        </h2>
        
        {chats.length > 0 && (
          <Link 
            to={`/campaign/${campaignId}/chats`} 
            className="text-sm text-adgentic-accent font-medium hover:underline flex items-center bg-adgentic-accent/5 px-3 py-1.5 rounded-full"
          >
            View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        )}
      </div>

      {chats.length === 0 ? (
        <div className="p-8 text-center">
          <div className="bg-adgentic-lightGray p-4 rounded-full inline-flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-adgentic-accent" />
          </div>
          <h3 className="text-lg font-medium text-adgentic-text-primary mb-2">No conversations yet</h3>
          <p className="text-adgentic-text-secondary mb-4">
            Start a new conversation to get insights about your campaign
          </p>
          <Link 
            to={`/chat/new?campaign_id=${campaignId}`} 
            className="inline-flex items-center px-4 py-2 rounded-full bg-adgentic-accent text-white hover:bg-adgentic-accent/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Start new conversation
          </Link>
        </div>
      ) : (
        <div className="p-4">
          {sortedGroups.map(groupName => (
            <div key={groupName} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-adgentic-text-secondary">
                <CalendarClock className="h-4 w-4" />
                {groupName}
              </div>
              <div className="space-y-2">
                {groupedChats[groupName].map((chat: Chat) => (
                  <Link 
                    key={chat.id} 
                    to={`/chat/${chat.id}?campaign_id=${campaignId}`}
                    className="flex items-center gap-3 p-3 hover:bg-adgentic-lightGray rounded-lg transition-colors relative group border border-transparent hover:border-adgentic-border"
                  >
                    <div className="p-2 bg-adgentic-accent/5 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-adgentic-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-adgentic-text-primary truncate pr-20">{chat.title}</div>
                      <div className="text-xs text-adgentic-text-secondary flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(chat.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <span className="text-xs font-medium bg-adgentic-accent text-white px-3 py-1 rounded-full">
                        Resume
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatsList;
