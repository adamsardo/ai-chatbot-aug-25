'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { 
  MultiAgentState, 
  AgentStep, 
  AgentHandoff 
} from '@/lib/ai/multi-agent/types';
import { AVAILABLE_AGENTS } from '@/lib/ai/multi-agent/agents';

interface MultiAgentContextType {
  state: MultiAgentState;
  addStep: (step: AgentStep) => void;
  addHandoff: (handoff: AgentHandoff) => void;
  clearHistory: () => void;
  isActive: boolean;
}

const MultiAgentContext = createContext<MultiAgentContextType | undefined>(undefined);

export function MultiAgentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MultiAgentState>({
    currentAgent: 'general-reasoning',
    availableAgents: AVAILABLE_AGENTS,
    handoffHistory: [],
    stepHistory: [],
    isActive: false,
    context: {}
  });

  const addStep = useCallback((step: AgentStep) => {
    setState(prev => ({
      ...prev,
      stepHistory: [...prev.stepHistory, step],
      isActive: step.type !== 'completion'
    }));
  }, []);

  const addHandoff = useCallback((handoff: AgentHandoff) => {
    setState(prev => ({
      ...prev,
      currentAgent: handoff.toAgent,
      handoffHistory: [...prev.handoffHistory, handoff]
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      handoffHistory: [],
      stepHistory: [],
      isActive: false,
      currentAgent: 'general-reasoning'
    }));
  }, []);

  return (
    <MultiAgentContext.Provider value={{
      state,
      addStep,
      addHandoff,
      clearHistory,
      isActive: state.isActive
    }}>
      {children}
    </MultiAgentContext.Provider>
  );
}

export function useMultiAgent(): MultiAgentContextType {
  const context = useContext(MultiAgentContext);
  if (!context) {
    throw new Error('useMultiAgent must be used within a MultiAgentProvider');
  }
  return context;
}