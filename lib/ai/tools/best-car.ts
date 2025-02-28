import { tool } from 'ai';
import { z } from 'zod';

// Define the expected structure of the result
interface CarResult {
  car: {
    id: number;
    name: string;
    price: string;
    transmission: string;
    horsepower: string;
    year: string;
    mileage: string;
    damage: string;
    fuel: string;
    cubic_capacity: string;
    url: string;
    all_photos: string[];
    location: string;
    created_at: string;
  };
  score: number;
  analysis?: {
    value: string;
    age: string;
    condition: string;
    engine: string;
    savings: number;
  };
  description: string;
  message?: string;
}

// Define the car changes response structure
interface CarChangesResult {
  carName: string;
  changes: string[];
}

export const getBestCar = tool({
  description: 'Get the best car offer based on budget and desired car model',
  parameters: z.object({
    budget: z.number().describe('Maximum budget for the car in USD (convert "k" notation like 20k to 20000)'),
    name: z.string().describe('Name/model of the desired car (e.g., Audi, BMW, Toyota)'),
  }),
  execute: async ({ budget, name }) => {
    console.log(`Searching for ${name} with budget: $${budget}`);
    
    try {
      // // Ensure budget is a proper number
      // const normalizedBudget = typeof budget === 'string' 
      //   ? parseFloat(budget.replace(/k$/i, '')) * 1000 
      //   : budget;
      
      const response = await fetch(
        'http://localhost:3001/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            budget: budget,
            name: name.trim()
          })
        }
      );

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        return {
          found: false,
          message: `Failed to fetch car data: ${response.statusText}`,
          description: 'The car search service is currently unavailable. Please try again later.',
          score: 0
        };
      }

      const carData = await response.json();
      
      if (!carData || !carData.results || carData.results.length === 0) {
        return {
          found: false,
          message: `No ${name} found within your budget of $${budget}`,
          description: 'Try increasing your budget or searching for a different model.',
          score: 0
        };
      }
      
      // Return a properly formatted response with multiple cars
      return {
        found: true,
        cars: carData.results.map((result: CarResult) => ({
          car: result.car,
          analysis: result.analysis || null,
          description: result.description || '',
          message: result.message || '',
          score: result.score || 0
        })),
        count: carData.count,
        message: carData.message
      };
    } catch (error) {
      console.error('Error fetching car data:', error);
      return {
        found: false,
        message: 'Failed to process your car search request',
        description: 'There was a technical issue with the car search service. Please try again later.',
        score: 0
      };
    }
  },
});

export const getCarChanges = tool({
  description: 'Get changes history for a specific car listing',
  parameters: z.object({
    id: z.number().describe('The ID of the car listing to check for changes'),
  }),
  execute: async ({ id }) => {
    console.log(`Checking changes for car listing with ID: ${id}`);
    
    try {
      const response = await fetch(
        'http://localhost:3001/api/changes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id })
        }
      );

      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        return {
          found: false,
          message: `Failed to fetch car changes: ${response.statusText}`,
          description: 'The car changes service is currently unavailable. Please try again later.'
        };
      }

      const changesData: CarChangesResult = await response.json();
      
      if (!changesData || !changesData.changes || changesData.changes.length === 0) {
        return {
          found: false,
          message: `No changes found for car listing with ID: ${id}`,
          description: 'This car listing has not had any recorded changes.',
          carName: changesData.carName || 'Unknown car'
        };
      }
      
      // Return a properly formatted response with the changes
      return {
        found: true,
        carName: changesData.carName,
        changes: changesData.changes,
        message: `Found ${changesData.changes.length} changes for ${changesData.carName}`
      };
    } catch (error) {
      console.error('Error fetching car changes:', error);
      return {
        found: false,
        message: 'Failed to process your car changes request',
        description: 'There was a technical issue with the car changes service. Please try again later.'
      };
    }
  },
});

