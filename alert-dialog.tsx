import { X, Code2 } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { cn } from "@/lib/utils";

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex bg-background border-b border-border/50 overflow-x-auto hide-scrollbar font-sans text-sm font-medium z-10 relative">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center h-10 px-4 min-w-[120px] max-w-[200px] border-r border-border/50 cursor-pointer select-none border-t-2 transition-colors",
              isActive 
                ? "bg-card text-foreground border-t-primary" 
                : "bg-background text-muted-foreground border-t-transparent hover:bg-accent/50"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <Code2 className="w-4 h-4 mr-2 text-primary/70 shrink-0" />
            <span className="truncate flex-1">{tab.file.name}</span>
            {tab.isDirty && <span className="w-2 h-2 rounded-full bg-primary mx-1" />}
            <button
              className={cn(
                "ml-2 p-0.5 rounded-md hover:bg-muted-foreground/20 transition-opacity",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
