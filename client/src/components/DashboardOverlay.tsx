import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Beaker, List, Plus, Trash2, Database, RefreshCw } from 'lucide-react';
import { useCreateExperiment, useExperiments } from '@/hooks/use-experiments';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { insertExperimentSchema } from '@shared/schema';

interface DashboardOverlayProps {
  lastInteraction: string | null;
}

export function DashboardOverlay({ lastInteraction }: DashboardOverlayProps) {
  const [open, setOpen] = useState(false);
  const { data: experiments, isLoading } = useExperiments();
  const { toast } = useToast();
  const createExperiment = useCreateExperiment();
  
  const form = useForm<z.infer<typeof insertExperimentSchema>>({
    resolver: zodResolver(insertExperimentSchema),
    defaultValues: {
      name: "",
      status: "in_progress",
      data: {}
    }
  });

  const onSubmit = (data: z.infer<typeof insertExperimentSchema>) => {
    createExperiment.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        toast({ title: "Experiment Started", description: "Data logging initialized." });
        form.reset();
      }
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex justify-between items-start z-10">
      {/* Top Left: Title & Status */}
      <div className="flex flex-col gap-4 pointer-events-auto">
        <div className="glass-panel p-6 w-80">
          <h1 className="text-3xl neon-text font-bold mb-2 flex items-center gap-2">
            <Beaker className="w-8 h-8 text-primary" />
            XR CHEM LAB
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            SYSTEM ONLINE
          </div>
          
          <div className="mt-6 space-y-2">
             <div className="flex justify-between items-center text-sm border-b border-border pb-2">
               <span className="text-muted-foreground">Current User</span>
               <span className="font-mono text-primary">DR. FREEMAN</span>
             </div>
             <div className="flex justify-between items-center text-sm border-b border-border pb-2">
               <span className="text-muted-foreground">Lab Temp</span>
               <span className="font-mono">22.4°C</span>
             </div>
          </div>
        </div>

        {/* Interaction Log */}
        <AnimatePresence>
          {lastInteraction && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="glass-panel p-4 w-80 border-l-4 border-l-primary"
            >
              <h3 className="text-xs font-bold text-muted-foreground uppercase mb-1">Last Interaction</h3>
              <p className="text-lg font-mono text-primary">{lastInteraction}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Right: Experiments Panel */}
      <div className="glass-panel p-6 w-96 pointer-events-auto flex flex-col gap-4 max-h-[80vh]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-5 h-5 text-secondary" />
            EXPERIMENTS
          </h2>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1" /> NEW
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Start New Experiment</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experiment Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Reaction Alpha-9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                           <Input {...field} readOnly className="opacity-50 cursor-not-allowed" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createExperiment.isPending}>
                    {createExperiment.isPending ? "Initializing..." : "Begin Logging"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : experiments?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No active experiments.
            </div>
          ) : (
            experiments?.map((exp) => (
              <div key={exp.id} className="bg-black/40 p-3 rounded border border-white/5 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm">{exp.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                    exp.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {exp.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  ID: #{exp.id.toString().padStart(4, '0')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
