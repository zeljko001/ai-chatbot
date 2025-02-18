import { tool } from 'ai';
import { z } from 'zod';

interface Car {
  name: string;
  price: number;
  mileage: number;
  engine_capacity: number;
  fuel_type: string;
  year: number;
  condition: string;
  power: number;
  damages: string;
}

const cars: Car[] = [
  {
    name: "Audi A4",
    price: 10000,
    mileage: 120,
    engine_capacity: 2000,
    fuel_type: "Diesel",
    year: 2018,
    condition: "New",
    power: 110,
    damages: "No damages"
  },
  {
    name: "Audi A4",
    price: 7000,
    mileage: 120000,
    engine_capacity: 2000,
    fuel_type: "Diesel",
    year: 2001,
    condition: "Used",
    power: 110,
    damages: "Scratches on bumper"
  },
  {
    name: "BMW 320d",
    price: 18000,
    mileage: 90000,
    engine_capacity: 1995,
    fuel_type: "Diesel",
    year: 2019,
    condition: "Used",
    power: 140,
    damages: "Minor scratches"
  },
  {
    name: "Volkswagen Golf 7",
    price: 13500,
    mileage: 100000,
    engine_capacity: 1600,
    fuel_type: "Diesel",
    year: 2017,
    condition: "Used",
    power: 85,
    damages: "No damages"
  },
  {
    name: "Mercedes-Benz C200",  
    price: 22000,
    mileage: 75000,
    engine_capacity: 1991,
    fuel_type: "Petrol",
    year: 2020,
    condition: "Used",
    power: 150,
    damages: "No damages"
  },
  {
    name: "Toyota Corolla",
    price: 17000,
    mileage: 50000,
    engine_capacity: 1800,
    fuel_type: "Hybrid",
    year: 2021,
    condition: "New",
    power: 90,
    damages: "No damages"
  },
  {
    name: "Ford Focus",
    price: 12000,
    mileage: 110000,
    engine_capacity: 1500,
    fuel_type: "Petrol",
    year: 2016,
    condition: "Used",
    power: 95,
    damages: "Minor dents"
  },
  {
    name: "Opel Astra",    
    price: 11000,
    mileage: 130000,
    engine_capacity: 1400,
    fuel_type: "Petrol",
    year: 2015,
    condition: "Used",
    power: 74,
    damages: "No damages"
  },
  {
    name: "Skoda Octavia",
    price: 14000,
    mileage: 85000,
    engine_capacity: 1968,
    fuel_type: "Diesel",
    year: 2018,
    condition: "Used",
    power: 110,
    damages: "Scratches on bumper"
  },
  {
    name: "Peugeot 308",
    price: 12500,
    mileage: 95000,
    engine_capacity: 1560,
    fuel_type: "Diesel",
    year: 2017,
    condition: "Used",
    power: 88,
    damages: "No damages"
  },
  {
    name: "Renault Megane",
    price: 13000,
    mileage: 70000,
    engine_capacity: 1500,
    fuel_type: "Diesel",
    year: 2019,
    condition: "Used",
    power: 85,
    damages: "No damages"
  }
];

export const getBestCar = tool({
  description: 'Find the best car offer based on budget and desired car model',
  parameters: z.object({
    budget: z.number().describe('Maximum budget for the car in USD'),
    name: z.string().describe('Name/model of the desired car'),
  }),
  execute: async ({ budget, name }) => {
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
