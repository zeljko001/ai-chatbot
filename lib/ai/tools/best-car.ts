//PROMJENA 
import { tool } from 'ai';
import { z } from 'zod';
import { getAllCars } from '@/lib/db/queries';
import type { Car } from '@/lib/db/schema';

export const getBestCar = tool({
  description: 'Find the best car offer based on budget and desired car model',
  parameters: z.object({
    budget: z.number().describe('Maximum budget for the car in USD'),
    name: z.string().describe('Name/model of the desired car'),
  }),
  execute: async ({ budget, name }) => {
    // Get cars from database
    const cars = await getAllCars();

    // Find all matching cars within budget
    const matchingCars = cars.filter(
      (car) => car.name.toLowerCase() === name.toLowerCase() && car.price <= budget
    );

    if (matchingCars.length === 0) {
      return {
        found: false,
        message: `No ${name} found within budget of $${budget}`,
      };
    }

    // Enhanced scoring system
    const scoreCar = (car: Car) => {
      let score = 0;
      
      // Age score (newer is better)
      const age = 2024 - car.year;
      score += Math.max(0, 50 - (age * 5)); // Up to 50 points for newer cars
      
      // Mileage score (lower is better)
      const mileageScore = Math.max(0, 40 - (car.mileage / 5000));
      score += mileageScore; // Up to 40 points for low mileage
      
      // Power and engine score
      score += (car.power / 2); // Up to 75 points for 150kW
      score += (car.engine_capacity / 100); // Up to 20 points for 2000cc
      
      // Condition bonuses
      if (car.condition === 'New') {
        score += 50;
      }
      if (car.damages === 'No damages') {
        score += 30;
      } else {
        score -= 20; // Penalty for damages
      }
      
      // Fuel type consideration
      switch (car.fuel_type.toLowerCase()) {
        case 'hybrid':
          score += 25; // Bonus for eco-friendly
          break;
        case 'electric':
          score += 30;
          break;
        case 'diesel':
          score += 15; // Good for long-term efficiency
          break;
        case 'petrol':
          score += 10;
          break;
      }
      
      // Price efficiency (reward better value for money)
      const priceEfficiency = (budget - car.price) / budget * 20;
      score += priceEfficiency;
      
      return score;
    };

    // Find the car with the highest score
    const bestCar = matchingCars.reduce((best, current) => 
      scoreCar(current) > scoreCar(best) ? current : best
    );

    // Calculate value score for context
    const valueScore = scoreCar(bestCar);

    return {
      found: true,
      car: bestCar,
      score: Math.round(valueScore),
      analysis: {
        value: valueScore > 150 ? 'Excellent' : valueScore > 100 ? 'Good' : 'Fair',
        age: `${2024 - bestCar.year} years old`,
        condition: bestCar.condition,
        damages: bestCar.damages,
        savings: budget - bestCar.price
      },
      message: `Found best ${name} within budget. Price: $${bestCar.price}, Year: ${bestCar.year}, Condition: ${bestCar.condition}`,
    };
  },
});
