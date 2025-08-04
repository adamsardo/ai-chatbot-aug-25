export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  tools: string[];
  expertise: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  isActive: boolean;
  confidence?: number;
}

export interface AgentHandoff {
  fromAgent: string;
  toAgent: string;
  reason: string;
  timestamp: Date;
  context?: any;
}

export interface AgentStep {
  id: string;
  agentId: string;
  type: 'reasoning' | 'tool_call' | 'handoff' | 'completion';
  content: string;
  timestamp: Date;
  confidence?: number;
  metadata?: any;
}

export interface MultiAgentState {
  currentAgent: string;
  availableAgents: Agent[];
  handoffHistory: AgentHandoff[];
  stepHistory: AgentStep[];
  isActive: boolean;
  context: any;
}

export interface HandoffDecision {
  shouldHandoff: boolean;
  targetAgent?: string;
  reason?: string;
  confidence?: number;
}