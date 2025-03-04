
import { BreadcrumbItem } from '@/components/Breadcrumb';

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  title?: string;
  metrics?: Array<{ label: string; value: string; improvement?: boolean }>;
  actionButtons?: Array<{ label: string; primary?: boolean }>;
}

export interface ChatData {
  id: string;
  title: string;
  chat_type: string;
  campaign_id?: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  campaign_name: string;
  campaign_status: string;
}

export interface DbMessage {
  chat_id: string;
  role: string;
  content: string;
  actionbuttons?: Array<{ label: string; primary?: boolean }>;
}

export interface UseCurrentChatResult {
  chatId: string | undefined;
  campaignId: string | null;
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  isSending: boolean;
  chatData: ChatData | null;
  campaign: Campaign | null;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => Promise<void>;
  handleDeleteChat: () => Promise<void>;
  handleBackClick: () => void;
  getBreadcrumbItems: () => BreadcrumbItem[];
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}
