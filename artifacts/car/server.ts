import { getBestCar } from "@/lib/ai/tools/best-car";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { streamText } from 'ai';
import { z } from 'zod';
import { myProvider } from '@/lib/ai/models';
import { carPrompt } from "@/lib/ai/prompts";

const carSchema = z.object({
  found: z.boolean(),
  car: z.object({
    name: z.string(),
    price: z.string(),
    milage: z.string(),
    engine_capacity: z.string(),
    fuel_type: z.string(),
    condition: z.string(),
    year: z.number(),
    power: z.string(),
    image_url: z.string(),
  }).optional(),
  analysis: z.object({
    value: z.string(),
    age: z.string(),
    condition: z.string(),
    savings: z.number(),
  }).optional(),
  message: z.string(),
  score: z.number().optional(),
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
