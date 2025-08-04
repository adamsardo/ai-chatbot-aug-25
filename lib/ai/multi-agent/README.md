# Multi-Agent Reasoning Framework

This framework enhances the reasoning chat to use multiple specialized agents instead of a single model call. It provides dynamic agent handoff, real-time tracking, and comprehensive progress visualization.

## Architecture

### Core Components

1. **Agent Types** (`agents.ts`)
   - **General Reasoning Agent**: Handles basic conversation and general knowledge
   - **Technical Specialist**: Handles code analysis, debugging, and development tasks
   - **Document Specialist**: Specializes in document creation and management
   - **Research Agent**: Handles information gathering and analysis
   - **Creative Assistant**: Provides creative suggestions and brainstorming

2. **Multi-Agent Coordinator** (`coordinator.ts`)
   - Manages agent lifecycle and handoffs
   - Implements handoff decision logic based on message content analysis
   - Provides real-time updates via callbacks
   - Integrates with the existing AI SDK streamText functionality

3. **Type Definitions** (`types.ts`)
   - Comprehensive TypeScript types for agents, handoffs, and steps
   - Multi-agent state management types
   - Agent capability and step tracking types

### UI Components

1. **MultiAgentReasoning** (`components/multi-agent-reasoning.tsx`)
   - Enhanced reasoning display with agent step visualization
   - Real-time handoff notifications
   - Animated step progression
   - Agent confidence indicators

2. **MultiAgentProvider** (`components/multi-agent-provider.tsx`)
   - React context for managing multi-agent state
   - Real-time step and handoff tracking
   - State persistence during chat sessions

3. **Agent Data Hook** (`hooks/use-agent-data.ts`)
   - Custom hook for consuming agent data from data streams
   - Automatic deduplication of steps and handoffs
   - Real-time updates integration

## How It Works

### When Reasoning Model is Selected

1. **Request Processing**: When `chat-model-reasoning` is selected, the chat API routes through the multi-agent coordinator
2. **Agent Selection**: The coordinator analyzes the user message and selects the most appropriate initial agent
3. **Dynamic Handoffs**: During processing, the system evaluates if a different agent would be better suited for the task
4. **Real-time Updates**: All agent steps, tool calls, and handoffs are streamed to the client in real-time
5. **UI Visualization**: The enhanced reasoning component shows the complete multi-agent process

### Agent Handoff Logic

The framework uses keyword-based heuristics to determine when to hand off between agents:

- **Document tasks**: Words like "document", "write", "edit", "create" → Document Specialist
- **Technical tasks**: Words like "code", "debug", "programming", "function" → Technical Specialist  
- **Research tasks**: Words like "research", "find", "search", "weather" → Research Agent
- **Creative tasks**: Words like "suggest", "ideas", "creative", "brainstorm" → Creative Assistant

### Tool Access Control

Each agent has specific tool access based on their capabilities:
- Document Specialist: `createDocument`, `updateDocument`
- Research Agent: `getWeather`
- Creative Assistant: `requestSuggestions`
- Technical Specialist: All tools for code-related tasks

## Integration Points

### API Route Changes (`app/(chat)/api/chat/route.ts`)
- Conditional routing based on selected chat model
- Multi-agent coordinator integration for reasoning model
- Real-time data streaming for agent steps and handoffs
- Maintains backward compatibility with standard chat model

### Message Component Updates (`components/message.tsx`)
- Automatic detection of agent data availability
- Seamless fallback to standard reasoning display
- Integration with agent data hooks

### Layout Provider (`app/(chat)/layout.tsx`)
- Multi-agent context provider integration
- Scoped to chat routes only
- Maintains existing data stream provider functionality

## Usage

### For Users
1. Select "Reasoning model" in the chat interface
2. Send any message - the system automatically handles agent selection and handoffs
3. Watch real-time agent progress in the expanded reasoning section
4. See which agents were involved and why handoffs occurred

### For Developers
```typescript
// Initialize coordinator with callbacks
const coordinator = new MultiAgentCoordinator(
  (step) => handleAgentStep(step),
  (handoff) => handleAgentHandoff(handoff)
);

// Process message through multi-agent pipeline
const result = await coordinator.processMessage(userMessage, streamTextOptions);
```

## Future Enhancements

1. **ML-Based Handoff Decisions**: Replace keyword heuristics with trained models
2. **Agent Learning**: Implement feedback loops to improve agent selection
3. **Custom Agent Creation**: Allow users to define custom specialist agents
4. **Performance Metrics**: Track agent performance and handoff success rates
5. **Advanced Coordination**: Implement parallel agent execution for complex tasks

## Benefits

- **Specialized Expertise**: Each agent focuses on their domain of expertise
- **Transparent Process**: Users can see exactly how their request is being handled
- **Dynamic Adaptation**: System adapts to request complexity and type
- **Real-time Feedback**: Immediate visibility into agent reasoning and decisions
- **Backward Compatibility**: Seamless integration with existing chat functionality