import { streamText } from 'ai';
import type { 
  Agent, 
  AgentHandoff, 
  AgentStep, 
  HandoffDecision, 
  MultiAgentState 
} from './types';
import { AVAILABLE_AGENTS, getAgentById } from './agents';
import { generateUUID } from '@/lib/utils';

export class MultiAgentCoordinator {
  private state: MultiAgentState;
  private onStepUpdate?: (step: AgentStep) => void;
  private onHandoffUpdate?: (handoff: AgentHandoff) => void;

  constructor(
    onStepUpdate?: (step: AgentStep) => void,
    onHandoffUpdate?: (handoff: AgentHandoff) => void
  ) {
    this.state = {
      currentAgent: 'general-reasoning',
      availableAgents: AVAILABLE_AGENTS,
      handoffHistory: [],
      stepHistory: [],
      isActive: false,
      context: {}
    };
    this.onStepUpdate = onStepUpdate;
    this.onHandoffUpdate = onHandoffUpdate;
  }

  public getState(): MultiAgentState {
    return { ...this.state };
  }

  public getCurrentAgent(): Agent | undefined {
    return getAgentById(this.state.currentAgent);
  }

  private addStep(step: Omit<AgentStep, 'id' | 'timestamp'>): AgentStep {
    const newStep: AgentStep = {
      ...step,
      id: generateUUID(),
      timestamp: new Date()
    };
    
    this.state.stepHistory.push(newStep);
    this.onStepUpdate?.(newStep);
    return newStep;
  }

  private async shouldHandoff(
    currentMessage: string,
    currentAgent: Agent,
    context: any
  ): Promise<HandoffDecision> {
    // Simple heuristic-based handoff decision
    // In a real implementation, this could use ML models or more sophisticated logic
    
    const messageWords = currentMessage.toLowerCase().split(' ');
    
    // Check for document-related keywords
    if (messageWords.some(word => 
      ['document', 'write', 'edit', 'create', 'update', 'draft'].includes(word)
    ) && currentAgent.id !== 'document-specialist') {
      return {
        shouldHandoff: true,
        targetAgent: 'document-specialist',
        reason: 'Task requires document management capabilities',
        confidence: 0.8
      };
    }

    // Check for technical/code keywords
    if (messageWords.some(word => 
      ['code', 'debug', 'programming', 'function', 'class', 'method', 'bug'].includes(word)
    ) && currentAgent.id !== 'technical-specialist') {
      return {
        shouldHandoff: true,
        targetAgent: 'technical-specialist',
        reason: 'Task requires technical programming expertise',
        confidence: 0.85
      };
    }

    // Check for research keywords
    if (messageWords.some(word => 
      ['research', 'find', 'search', 'weather', 'data', 'information'].includes(word)
    ) && currentAgent.id !== 'research-agent') {
      return {
        shouldHandoff: true,
        targetAgent: 'research-agent',
        reason: 'Task requires research and information gathering',
        confidence: 0.75
      };
    }

    // Check for creative keywords
    if (messageWords.some(word => 
      ['suggest', 'ideas', 'creative', 'brainstorm', 'generate'].includes(word)
    ) && currentAgent.id !== 'creative-assistant') {
      return {
        shouldHandoff: true,
        targetAgent: 'creative-assistant',
        reason: 'Task requires creative assistance and ideation',
        confidence: 0.7
      };
    }

    return { shouldHandoff: false };
  }

  private performHandoff(targetAgentId: string, reason: string): void {
    const previousAgent = this.state.currentAgent;
    const handoff: AgentHandoff = {
      fromAgent: previousAgent,
      toAgent: targetAgentId,
      reason,
      timestamp: new Date(),
      context: this.state.context
    };

    this.state.currentAgent = targetAgentId;
    this.state.handoffHistory.push(handoff);
    
    this.onHandoffUpdate?.(handoff);
    
    this.addStep({
      agentId: targetAgentId,
      type: 'handoff',
      content: `Handed off from ${previousAgent} to ${targetAgentId}: ${reason}`,
      confidence: 0.9
    });
  }

  public async processMessage(
    message: string,
    options: {
      model: any;
      system: string;
      messages: any[];
      tools: any;
      experimental_activeTools?: string[];
    }
  ): Promise<any> {
    this.state.isActive = true;
    
    const currentAgent = this.getCurrentAgent();
    if (!currentAgent) {
      throw new Error('No current agent available');
    }

    // Add initial reasoning step
    this.addStep({
      agentId: currentAgent.id,
      type: 'reasoning',
      content: `${currentAgent.name} is analyzing the request: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`
    });

    // Check if we should handoff to a different agent
    const handoffDecision = await this.shouldHandoff(message, currentAgent, this.state.context);
    
    if (handoffDecision.shouldHandoff && handoffDecision.targetAgent) {
      this.performHandoff(handoffDecision.targetAgent, handoffDecision.reason || 'Agent handoff required');
    }

    const activeAgent = this.getCurrentAgent();
    if (!activeAgent) {
      throw new Error('No active agent available after handoff');
    }

    // Filter tools based on agent capabilities
    const agentTools = activeAgent.capabilities.flatMap(cap => cap.tools);
    const filteredActiveTools = options.experimental_activeTools?.filter(tool => 
      agentTools.includes(tool) || agentTools.length === 0
    ) || [];

    // Add step for tool selection
    if (filteredActiveTools.length > 0) {
      this.addStep({
        agentId: activeAgent.id,
        type: 'reasoning',
        content: `${activeAgent.name} has access to tools: ${filteredActiveTools.join(', ')}`
      });
    }

    // Create enhanced system prompt with agent context
    const enhancedSystemPrompt = `${options.system}

You are currently acting as: ${activeAgent.name}
Your role: ${activeAgent.description}
Your capabilities: ${activeAgent.capabilities.map(cap => cap.name).join(', ')}

Previous agent handoffs: ${this.state.handoffHistory.slice(-3).map(h => 
  `${h.fromAgent} → ${h.toAgent}: ${h.reason}`
).join('; ')}

Provide reasoning for your actions and decisions as part of your response.`;

    // Add reasoning step for processing
    this.addStep({
      agentId: activeAgent.id,
      type: 'reasoning',
      content: `${activeAgent.name} is processing the request with specialized knowledge in: ${activeAgent.capabilities.flatMap(cap => cap.expertise).join(', ')}`
    });

    try {
      const result = streamText({
        ...options,
        system: enhancedSystemPrompt,
        experimental_activeTools: filteredActiveTools,
        onStepFinish: (event) => {
          if (event.stepType === 'tool-call') {
            this.addStep({
              agentId: activeAgent.id,
              type: 'tool_call',
              content: `${activeAgent.name} used tool: ${event.toolName} with args: ${JSON.stringify(event.toolArgs)}`,
              metadata: { toolName: event.toolName, toolArgs: event.toolArgs }
            });
          }
        }
      });

      // Add completion step
      result.then(() => {
        this.addStep({
          agentId: activeAgent.id,
          type: 'completion',
          content: `${activeAgent.name} completed processing the request`
        });
        this.state.isActive = false;
      }).catch(() => {
        this.state.isActive = false;
      });

      return result;
    } catch (error) {
      this.state.isActive = false;
      throw error;
    }
  }
}