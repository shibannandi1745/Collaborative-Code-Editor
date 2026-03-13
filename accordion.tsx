import { useEffect, useRef, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { useEditorStore } from "@/store/use-editor-store";
import { EditorTabs } from "./EditorTabs";
import { Terminal, Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateFile } from "@workspace/api-client-react";

interface CodeEditorProps {
  roomId: string;
  emitCodeChange: (fileId: string, content: string) => void;
  emitTyping: (isTyping: boolean) => void;
  emitRunCode: (fileId: string) => void;
}

export function CodeEditor({ roomId, emitCodeChange, emitTyping, emitRunCode }: CodeEditorProps) {
  const monaco = useMonaco();
  const { tabs, activeTabId, updateFileContent, markTabDirty } = useEditorStore();
  const { mutateAsync: saveFile } = useUpdateFile();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (monaco) {
      // Setup themes
      monaco.editor.defineTheme('codecollab-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1e1f22', // Matches app bg
          'editor.lineHighlightBackground': '#2b2d3150',
        }
      });
      
      const isDark = document.documentElement.classList.contains("dark");
      monaco.editor.setTheme(isDark ? 'codecollab-dark' : 'vs');
      
      // Observer for theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isDarkNow = document.documentElement.classList.contains("dark");
            monaco.editor.setTheme(isDarkNow ? 'codecollab-dark' : 'vs');
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, [monaco]);

  const handleEditorChange = (value: string | undefined) => {
    if (!activeTab || value === undefined) return;
    
    updateFileContent(activeTab.id, value);
    markTabDirty(activeTab.id, true);
    emitCodeChange(activeTab.id, value);

    // Typing indicator logic
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  };

  const handleSave = async () => {
    if (!activeTab || !activeTab.isDirty) return;
    try {
      await saveFile({ 
        roomId, 
        fileId: activeTab.id, 
        data: { name: activeTab.file.name, content: activeTab.file.content } 
      });
      markTabDirty(activeTab.id, false);
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  if (!activeTab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-card text-muted-foreground">
        <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Terminal className="w-12 h-12 text-primary/50" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2 font-display">CodeCollab Editor</h2>
        <p className="text-sm mb-8">Select a file from the explorer or create a new one.</p>
        <div className="flex gap-4 text-xs font-mono opacity-60">
          <span className="flex items-center gap-1 bg-accent px-2 py-1 rounded">
            <kbd>Ctrl</kbd>+<kbd>S</kbd> to save
          </span>
          <span className="flex items-center gap-1 bg-accent px-2 py-1 rounded">
            <kbd>Ctrl</kbd>+<kbd>P</kbd> to search
          </span>
        </div>
      </div>
    );
  }

  // Determine language based on extension
  const ext = activeTab.file.name.split('.').pop();
  const language = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'json': 'json',
    'css': 'css',
    'html': 'html',
    'py': 'python',
    'md': 'markdown'
  }[ext || ''] || 'plaintext';

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#1e1e1e] dark:bg-[#1e1f22]">
      <EditorTabs />
      
      <div className="flex items-center justify-between px-4 py-1.5 bg-card/50 border-b border-border/30 text-xs font-mono text-muted-foreground z-10">
        <div className="flex items-center">
          CodeCollab <span className="mx-2 opacity-50">/</span> {activeTab.file.name}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs" 
            onClick={handleSave}
            disabled={!activeTab.isDirty}
          >
            <Save className="w-3 h-3 mr-1" /> Save
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            className="h-6 px-3 bg-primary/20 text-primary hover:bg-primary/30"
            onClick={() => emitRunCode(activeTab.id)}
          >
            <Play className="w-3 h-3 mr-1 fill-current" /> Run
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          value={activeTab.file.content || ''}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            wordWrap: "on",
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
          loading={
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
