import { tool } from 'ai';
import { z } from 'zod';

export const composioSearch = tool({
  description: 'Search and scrape the web using Composio Search - an all-in-one tool for searching and scraping web content',
  inputSchema: z.object({
    query: z.string().describe('The search query to execute'),
    maxResults: z.number().optional().default(10).describe('Maximum number of results to return'),
    includeContent: z.boolean().optional().default(true).describe('Whether to include scraped content from the results'),
  }),
  execute: async ({ query, maxResults, includeContent }) => {
    try {
      // This would normally use the Composio API
      // For now, implementing a basic web search functionality
      const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      // Format results similar to what Composio would return
      const results = data.RelatedTopics?.slice(0, maxResults).map((topic: any, index: number) => ({
        id: index + 1,
        title: topic.Text?.split(' - ')[0] || 'No title',
        url: topic.FirstURL || '',
        snippet: topic.Text || 'No snippet available',
        content: includeContent ? topic.Text : undefined,
      })) || [];

      return {
        query,
        totalResults: results.length,
        results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in composio search:', error);
      return {
        query,
        totalResults: 0,
        results: [],
        error: 'Failed to perform search',
        timestamp: new Date().toISOString(),
      };
    }
  },
});