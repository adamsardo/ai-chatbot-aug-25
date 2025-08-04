import type { Agent } from './types';

export const AVAILABLE_AGENTS: Agent[] = [
  {
    id: 'general-reasoning',
    name: 'General Reasoning Agent',
    description: 'Handles general conversation and basic reasoning tasks',
    capabilities: [
      {
        id: 'general-chat',
        name: 'General Chat',
        description: 'Basic conversation and general knowledge',
        tools: [],
        expertise: ['conversation', 'general-knowledge', 'basic-reasoning']
      }
    ],
    isActive: true,
    confidence: 0.8
  },
  {
    id: 'technical-specialist',
    name: 'Technical Specialist',
    description: 'Handles technical questions, code analysis, and development tasks',
    capabilities: [
      {
        id: 'code-analysis',
        name: 'Code Analysis',
        description: 'Analyze and understand code structures',
        tools: [],
        expertise: ['programming', 'debugging', 'architecture', 'code-review']
      }
    ],
    isActive: true,
    confidence: 0.9
  },
  {
    id: 'document-specialist',
    name: 'Document Specialist', 
    description: 'Specializes in document creation, editing, and management',
    capabilities: [
      {
        id: 'document-management',
        name: 'Document Management',
        description: 'Create, update, and manage documents',
        tools: ['createDocument', 'updateDocument'],
        expertise: ['writing', 'editing', 'documentation', 'content-creation']
      }
    ],
    isActive: true,
    confidence: 0.85
  },
  {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Handles research tasks, information gathering, and analysis',
    capabilities: [
      {
        id: 'information-gathering',
        name: 'Information Gathering',
        description: 'Gather and analyze information from various sources',
        tools: ['getWeather'],
        expertise: ['research', 'analysis', 'data-gathering', 'fact-checking']
      }
    ],
    isActive: true,
    confidence: 0.8
  },
  {
    id: 'creative-assistant',
    name: 'Creative Assistant',
    description: 'Handles creative tasks like suggestions and brainstorming',
    capabilities: [
      {
        id: 'creative-suggestions',
        name: 'Creative Suggestions',
        description: 'Generate creative ideas and suggestions',
        tools: ['requestSuggestions'],
        expertise: ['creativity', 'brainstorming', 'ideation', 'content-generation']
      }
    ],
    isActive: true,
    confidence: 0.75
  }
];

export function getAgentById(id: string): Agent | undefined {
  return AVAILABLE_AGENTS.find(agent => agent.id === id);
}

export function getAgentsByCapability(capability: string): Agent[] {
  return AVAILABLE_AGENTS.filter(agent => 
    agent.capabilities.some(cap => 
      cap.expertise.includes(capability) || cap.tools.includes(capability)
    )
  );
}