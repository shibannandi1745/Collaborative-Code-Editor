import { Users, Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { type Room } from "@workspace/api-client-react";
import { UserAvatar } from "../UserAvatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RightSidebarProps {
  room: Room;
  activeTypers: Set<string>;
}

export function RightSidebar({ room, activeTypers }: RightSidebarProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [inCall, setInCall] = useState(true);

  return (
    <div className="w-60 bg-sidebar border-l border-border/50 flex flex-col h-full z-20">
      <div className="p-4 border-b border-border/50 bg-background/50 backdrop-blur">
        <h3 className="font-semibold text-sm flex items-center text-foreground">
          <Users className="w-4 h-4 mr-2 text-primary" />
          Collaborators — {room.members?.length || 0}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {room.members?.map(member => {
          const isTyping = activeTypers.has(member.id);
          
          return (
            <div 
              key={member.id} 
              className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors group cursor-pointer"
            >
              <UserAvatar user={member} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground/90 group-hover:text-foreground">
                  {member.username}
                </p>
                <div className="flex items-center h-4">
                  <AnimatePresence mode="wait">
                    {isTyping ? (
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[10px] text-primary font-medium flex items-center"
                      >
                        <span className="flex space-x-0.5 mr-1">
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-primary rounded-full" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-primary rounded-full" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-primary rounded-full" />
                        </span>
                        typing
                      </motion.span>
                    ) : (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-muted-foreground capitalize"
                      >
                        {member.status}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border/50 bg-background/30">
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-green-500 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              Voice Connected
            </span>
            <span className="text-xs text-muted-foreground font-mono">12 ms</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={isMuted ? "destructive" : "secondary"} 
              size="icon" 
              className="flex-1 rounded-lg"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              variant={inCall ? "destructive" : "default"} 
              size="icon" 
              className="flex-1 rounded-lg"
              onClick={() => setInCall(!inCall)}
            >
              {inCall ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
