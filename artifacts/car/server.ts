import { getBestCar } from "@/lib/ai/tools/best-car";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { streamText } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/models';
import { carPrompt } from "@/lib/ai/prompts";

const carSchema = z.object({
  found: z.boolean(),
  cars: z.array(z.object({
    car: z.object({
      id: z.number(),
      name: z.string(),
      price: z.string(),
      transmission: z.string(),
      horsepower: z.string(),
      year: z.string(),
      mileage: z.string(),
      photo_url: z.string().optional(),
      damage: z.string(),
      fuel: z.string(),
      cubic_capacity: z.string(),
      url: z.string(),
      created_at: z.string(),
      location: z.string(),
      all_photos: z.array(z.string())
    }),
    analysis: z.object({
      value: z.string(),
      age: z.string(),
      condition: z.string(),
      engine: z.string(),
      savings: z.number()
    }).optional(),
    description: z.string(),
    message: z.string(),
    score: z.number()
  })),
  count: z.number(),
  message: z.string()
});

export const carDocumentHandler = createDocumentHandler<"car">({
  kind: "car",
  
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';
    
    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: carPrompt,
      prompt: title,
      experimental_activeTools: ['getBestCar'],
      tools: {
        getBestCar,
      },
    });

    // 

    for await (const delta of fullStream) {
        if (delta.type === 'tool-result') {
            const carData = delta.result;
            // Validate the data against our schema
            const validatedData = carSchema.parse(carData);
            const content = JSON.stringify(validatedData, null, 2);
            
            dataStream.writeData({
                type: "car-delta",
                content,
            });

            draftContent = content;
        }
    }

    return draftContent;
  },

  onUpdateDocument: async ({ document, description , dataStream}) => {
    let draftContent = '';
    
    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: 'Update the best car based on the new information while preserving the existing structure.',
      prompt: description,
      experimental_activeTools: ['getBestCar'],
      tools: {
        getBestCar,
      },
    });


      for await (const delta of fullStream) {
        if (delta.type === 'tool-result') {
          const carData = delta.result;
          // Validate the data against our schema
          const validatedData = carSchema.parse(carData);
          const content = JSON.stringify(validatedData, null, 2);
          
          dataStream.writeData({
            type: "car-delta",
            content,
          });

          draftContent = content;
        }
      }

    return draftContent;
  
  },
});
