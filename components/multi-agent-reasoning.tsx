'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, LoaderIcon, UserIcon, CogIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Markdown } from './markdown';
import { cn } from '@/lib/utils';
import type { AgentStep, AgentHandoff } from '@/lib/ai/multi-agent/types';
import { getAgentById } from '@/lib/ai/multi-agent/agents';

interface MultiAgentReasoningProps {
  isLoading: boolean;
  reasoning: string;
  agentSteps?: AgentStep[];
  handoffs?: AgentHandoff[];
  currentAgent?: string;
}

interface AgentStepItemProps {
  step: AgentStep;
  isLast: boolean;
}

function AgentStepItem({ step, isLast }: AgentStepItemProps) {
  const agent = getAgentById(step.agentId);
  const agentName = agent?.name || step.agentId;
  
  const getStepIcon = (type: AgentStep['type']) => {
    switch (type) {
      case 'reasoning':
        return <CogIcon size={12} />;
      case 'tool_call':
        return <CogIcon size={12} className="text-blue-500" />;
      case 'handoff':
        return <UserIcon size={12} className="text-orange-500" />;
      case 'completion':
        return <div className="w-3 h-3 rounded-full bg-green-500" />;
      default:
        return <CogIcon size={12} />;
    }
  };

  const getStepColor = (type: AgentStep['type']) => {
    switch (type) {
      case 'reasoning':
        return 'text-zinc-600 dark:text-zinc-400';
      case 'tool_call':
        return 'text-blue-600 dark:text-blue-400';
      case 'handoff':
        return 'text-orange-600 dark:text-orange-400';
      case 'completion':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-zinc-600 dark:text-zinc-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-2"
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800">
          {getStepIcon(step.type)}
        </div>
        {!isLast && <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mt-1" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {agentName}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {step.timestamp.toLocaleTimeString()}
          </span>
          {step.confidence && (
            <span className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">
              {Math.round(step.confidence * 100)}%
            </span>
          )}
        </div>
        <div className={cn('text-sm', getStepColor(step.type))}>
          {step.content}
        </div>
        {step.metadata && (
          <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            <pre className="whitespace-pre-wrap">{JSON.stringify(step.metadata, null, 2)}</pre>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface HandoffItemProps {
  handoff: AgentHandoff;
}

function HandoffItem({ handoff }: HandoffItemProps) {
  const fromAgent = getAgentById(handoff.fromAgent);
  const toAgent = getAgentById(handoff.toAgent);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800"
    >
      <UserIcon size={14} className="text-orange-500" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
          Agent Handoff: {fromAgent?.name || handoff.fromAgent} → {toAgent?.name || handoff.toAgent}
        </div>
        <div className="text-xs text-orange-600 dark:text-orange-400">
          {handoff.reason}
        </div>
      </div>
      <div className="text-xs text-orange-500">
        {handoff.timestamp.toLocaleTimeString()}
      </div>
    </motion.div>
  );
}

export function MultiAgentReasoning({
  isLoading,
  reasoning,
  agentSteps = [],
  handoffs = [],
  currentAgent
}: MultiAgentReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [displayedSteps, setDisplayedSteps] = useState<AgentStep[]>([]);

  useEffect(() => {
    // Animate in new steps
    if (agentSteps.length > displayedSteps.length) {
      const newSteps = agentSteps.slice(displayedSteps.length);
      newSteps.forEach((step, index) => {
        setTimeout(() => {
          setDisplayedSteps(prev => [...prev, step]);
        }, index * 200);
      });
    }
  }, [agentSteps, displayedSteps.length]);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  const currentAgentData = currentAgent ? getAgentById(currentAgent) : null;

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Multi-Agent Reasoning</div>
          {currentAgentData && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              ({currentAgentData.name})
            </div>
          )}
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Multi-Agent Analysis Complete</div>
          {handoffs.length > 0 && (
            <div className="text-sm text-orange-600 dark:text-orange-400">
              ({handoffs.length} handoff{handoffs.length !== 1 ? 's' : ''})
            </div>
          )}
          <button
            data-testid="multi-agent-reasoning-toggle"
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="multi-agent-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            {/* Show agent handoffs */}
            {handoffs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Agent Handoffs
                </div>
                {handoffs.map((handoff, index) => (
                  <HandoffItem key={index} handoff={handoff} />
                ))}
              </div>
            )}

            {/* Show agent steps */}
            {displayedSteps.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Agent Process
                </div>
                {displayedSteps.map((step, index) => (
                  <AgentStepItem 
                    key={step.id} 
                    step={step} 
                    isLast={index === displayedSteps.length - 1}
                  />
                ))}
                {isLoading && displayedSteps.length > 0 && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <LoaderIcon size={12} className="animate-spin" />
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      Processing...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fallback to original reasoning if no agent steps */}
            {displayedSteps.length === 0 && reasoning && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Reasoning
                </div>
                <Markdown>{reasoning}</Markdown>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}