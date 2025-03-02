
import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  title: string;
  icon: ReactNode;
  sectionKey: string;
  isOpen: boolean;
  expandedSection: string;
  textColorClass: string;
  onToggle: (section: string) => void;
  children?: ReactNode;
}

const SidebarSection = ({ 
  title, 
  icon, 
  sectionKey, 
  isOpen, 
  expandedSection, 
  textColorClass,
  onToggle,
  children 
}: SidebarSectionProps) => {
  return (
    <div className="mb-4">
      <button
        onClick={() => onToggle(sectionKey)}
        className={cn(
          "flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md",
          textColorClass,
          isOpen ? "hover:bg-adgentic-hover" : "justify-center"
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          {isOpen && <span>{title}</span>}
        </div>
        {isOpen && children && (
          <ChevronDown className={cn("h-4 w-4 transition-transform", expandedSection !== sectionKey && "rotate-[-90deg]")} />
        )}
      </button>
      
      {isOpen && expandedSection === sectionKey && children}
    </div>
  );
};

export default SidebarSection;
