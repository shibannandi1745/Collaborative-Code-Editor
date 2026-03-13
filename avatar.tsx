import { Terminal as TerminalIcon, AlertCircle, Info, CheckCircle2, Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

export function TerminalPanel() {
  const { terminalOutputs, clearTerminal, isTerminalOpen, toggleTerminal } = useEditorStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalOutputs]);

  if (!isTerminalOpen) {
    return (
      <div 
        className="h-8 bg-sidebar border-t border-border flex items-center px-4 cursor-pointer hover:bg-accent/50 text-xs text-muted-foreground transition-colors"
        onClick={toggleTerminal}
      >
        <TerminalIcon className="w-3.5 h-3.5 mr-2" />
        Terminal
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border-t border-border font-mono text-[13px]">
      <div className="flex items-center justify-between px-4 h-9 bg-sidebar border-b border-border/50">
        <div className="flex gap-4 h-full">
          <div className="flex items-center h-full border-b-2 border-primary text-foreground font-medium px-1">
            TERMINAL
          </div>
          <div className="flex items-center h-full border-b-2 border-transparent text-muted-foreground hover:text-foreground cursor-pointer px-1">
            OUTPUT
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={clearTerminal} title="Clear">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={toggleTerminal} title="Close">
            <span className="text-lg leading-none -mt-1">&times;</span>
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 bg-[#1e1e1e] dark:bg-background">
        <div className="p-4 flex flex-col gap-1" ref={scrollRef}>
          {terminalOutputs.map((out) => {
            const Icon = out.type === 'error' ? AlertCircle :
                         out.type === 'success' ? CheckCircle2 :
                         out.type === 'info' ? Info : TerminalIcon;
                         
            const color = out.type === 'error' ? 'text-red-400' :
                          out.type === 'success' ? 'text-green-400' :
                          out.type === 'info' ? 'text-blue-400' : 'text-muted-foreground';

            return (
              <div key={out.id} className="flex items-start group hover:bg-white/5 dark:hover:bg-white/5 -mx-4 px-4 py-0.5 rounded">
                <span className="text-muted-foreground/50 mr-3 shrink-0 select-none w-16 text-right">
                  {format(out.timestamp, 'HH:mm:ss')}
                </span>
                <Icon className={`w-3.5 h-3.5 mr-2 mt-0.5 shrink-0 ${color}`} />
                <span className={`whitespace-pre-wrap font-mono ${out.type === 'error' ? 'text-red-300' : 'text-foreground/90'}`}>
                  {out.text}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
