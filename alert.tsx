import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FileJson, FileCode, Plus, FolderPlus, RefreshCw, Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { type FileNode, useListRoomFiles, useCreateFile, useDeleteFile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  roomId: string;
}

export function FileExplorer({ roomId }: FileExplorerProps) {
  const { data: files = [], refetch } = useListRoomFiles(roomId);
  const { activeTabId, openFile, closeTab } = useEditorStore();
  const { mutateAsync: createFile } = useCreateFile();
  const { mutateAsync: deleteFile } = useDeleteFile();
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateFile = async () => {
    const name = prompt("Enter file name:");
    if (!name) return;
    await createFile({ roomId, data: { name, path: `/${name}`, type: 'file', content: '// New file\n' } });
    refetch();
  };

  const handleDelete = async (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this file?")) {
      await deleteFile({ roomId, fileId });
      closeTab(fileId);
      refetch();
    }
  };

  // Build tree logic
  const renderTree = (parentId: string | null = null, level = 0) => {
    const nodes = files.filter(f => f.parentId === parentId || (parentId === null && !f.parentId));
    
    return nodes.map(node => {
      const isExpanded = expandedFolders.has(node.id);
      const isFolder = node.type === 'folder';
      const isActive = activeTabId === node.id;
      
      const Icon = isFolder ? (isExpanded ? ChevronDown : ChevronRight) : 
                   node.name.endsWith('.json') ? FileJson : 
                   node.name.endsWith('.js') || node.name.endsWith('.ts') ? FileCode : File;
                   
      const iconColor = isFolder ? "text-muted-foreground" : 
                        node.name.endsWith('.ts') ? "text-blue-400" :
                        node.name.endsWith('.js') ? "text-yellow-400" :
                        node.name.endsWith('.json') ? "text-green-400" : "text-muted-foreground";

      return (
        <div key={node.id}>
          <div 
            className={cn(
              "flex items-center group py-[3px] px-2 text-sm cursor-pointer select-none border-l-2",
              isActive ? "bg-accent/50 text-accent-foreground border-primary" : "text-muted-foreground hover:bg-accent/30 hover:text-foreground border-transparent"
            )}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => isFolder ? toggleFolder(node.id) : openFile(node)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <Icon className={cn("w-4 h-4 mr-1.5 shrink-0", iconColor)} />
            <span className="truncate">{node.name}</span>
            
            {hoveredNode === node.id && (
              <button 
                onClick={(e) => handleDelete(e, node.id)}
                className="ml-auto p-0.5 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {isFolder && isExpanded && renderTree(node.id, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-border/50 font-mono">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Explorer</h2>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Button variant="ghost" size="icon" className="w-6 h-6 rounded-md hover:bg-accent" onClick={handleCreateFile}>
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 rounded-md hover:bg-accent">
            <FolderPlus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 rounded-md hover:bg-accent" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 py-2">
        {files.length === 0 ? (
          <div className="px-4 py-8 text-center flex flex-col items-center text-muted-foreground">
            <Folder className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-sans">No files yet.</p>
            <Button variant="link" size="sm" className="mt-2 text-primary" onClick={handleCreateFile}>Create one</Button>
          </div>
        ) : (
          renderTree()
        )}
      </ScrollArea>
    </div>
  );
}
