import { tool } from 'ai';
import { z } from 'zod';

export const getBestCar = tool({
  description: 'Get the best car offer based on budget and desired car model',
  parameters: z.object({
    budget: z.number().describe('Maximum budget for the car in USD'),
    name: z.string().describe('Name/model of the desired car'),
  }),
  execute: async ({ budget, name }) => {
    try {
      const response = await fetch(
        // 'https://my-ai-api-gu2r.onrender.com/api/chat',//RENDER
        'http://localhost:3001/api/chat',//LOCAL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            budget,
            name
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch car data');
      }

      const carData = await response.json();
      return carData;
    } catch (error) {
      console.error('Error fetching car data:', error);
      return {
        found: false,
        message: 'Failed to fetch car data from API',
      };
    }
  },
});

