'use client';

import { useState, useEffect } from 'react';
import type { AgentStep, AgentHandoff } from '@/lib/ai/multi-agent/types';
import { useDataStream } from '@/components/data-stream-provider';

export function useAgentData() {
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [handoffs, setHandoffs] = useState<AgentHandoff[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string>('general-reasoning');

  const { data } = useDataStream();

  useEffect(() => {
    if (!data) return;

    data.forEach((item) => {
      if (item.type === 'agent-step') {
        const step = item.value as AgentStep;
        setAgentSteps(prev => {
          // Avoid duplicates
          if (prev.some(s => s.id === step.id)) return prev;
          return [...prev, step];
        });
        setCurrentAgent(step.agentId);
      } else if (item.type === 'agent-handoff') {
        const handoff = item.value as AgentHandoff;
        setHandoffs(prev => {
          // Avoid duplicates based on timestamp and agents
          if (prev.some(h => 
            h.timestamp.getTime() === handoff.timestamp.getTime() &&
            h.fromAgent === handoff.fromAgent &&
            h.toAgent === handoff.toAgent
          )) return prev;
          return [...prev, handoff];
        });
        setCurrentAgent(handoff.toAgent);
      }
    });
  }, [data]);

  const clearAgentData = () => {
    setAgentSteps([]);
    setHandoffs([]);
    setCurrentAgent('general-reasoning');
  };

  return {
    agentSteps,
    handoffs,
    currentAgent,
    clearAgentData,
    hasAgentData: agentSteps.length > 0 || handoffs.length > 0
  };
}