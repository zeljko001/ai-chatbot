import { Artifact } from "@/components/create-artifact";
import Image from "next/image";
import { toast } from "sonner";
import { CopyIcon, RedoIcon, UndoIcon} from '@/components/icons';
import { getBestCar } from "@/lib/ai/tools/best-car";

interface CarArtifactMetadata {
  found: boolean;
  car?: {
    name: string;
    price: string;
    milage: string;
    engine_capacity: string;
    fuel_type: string;
    condition: string;
    year: number;
    power: string;
    image_url: string;
  };
  analysis?: {
    value: string;
    age: string;
    condition: string;
    savings: number;
  };
  message: string;
  score?: number;
}

const CarDetails = ({ content }: { content: string }) => {
  try {
    const data = typeof content === 'string' ? JSON.parse(content) : content;
    if (!data.found || !data.car) {
      return <div className="p-4 text-red-500">{data.message}</div>;
    }

    const { car, analysis } = data;

    return (
      <div className="p-4 space-y-4">
        <div className="flex gap-6">
          <div className="w-1/2">
            <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
            <img 
          src={car.image_url} 
          alt={car.name}
          className="object-cover size-full"
        />
            </div>
          </div>

          <div className="w-1/2 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{car.name}</h2>
              <p className="text-2xl font-semibold text-green-600">{car.price}</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Specifications:</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Year:</span> {car.year}</p>
                <p><span className="font-medium">Mileage:</span> {car.milage}</p>
                <p><span className="font-medium">Engine:</span> {car.engine_capacity}</p>
                <p><span className="font-medium">Power:</span> {car.power}</p>
                <p><span className="font-medium">Fuel:</span> {car.fuel_type}</p>
                <p><span className="font-medium">Condition:</span> {car.condition}</p>
              </div>
            </div>

            {analysis && (
              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-bold mb-2">Analysis</h4>
                <div className="space-y-1">
                  <p><span className="font-medium">Value:</span> {analysis.value}</p>
                  <p><span className="font-medium">Age:</span> {analysis.age}</p>
                  <p><span className="font-medium">Condition:</span> {analysis.condition}</p>
                  <p><span className="font-medium">Potential Savings:</span> ${analysis.savings}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (e) {
    console.error('Failed to parse car data:', e);
    return null;
  }
};

export const carArtifact = new Artifact<"car", CarArtifactMetadata>({
  kind: "car",
  description: "A car artifact for displaying vehicle information and analysis.",
  
  initialize: async ({ documentId, setMetadata }) => {
    setMetadata({
      found: false,
      message: "No car data loaded yet.",
    });
  },

  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === "car-delta") {
      try {
        const data = typeof streamPart.content === 'string' 
          ? JSON.parse(streamPart.content)
          : streamPart.content;
        setMetadata(data);
        setArtifact((draftArtifact) => ({
          ...draftArtifact,
          content: JSON.stringify(data, null, 2),
          status: "streaming",
        }));
      } catch (e) {
        console.error('Failed to parse metadata:', e);
      }
    }
  },

  content: ({
    mode,
    isLoading,
    content,
  }) => {
    if (isLoading) {
      return <div className="p-4">Loading car information...</div>;
    }

    return (
      <div className="car-artifact">
        <CarDetails content={content} />
      </div>
    );
  },

  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        return isCurrentVersion;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy car details",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],

  toolbar: [
    {
      icon: <span>🚗</span>,
      description: "Find Best Car",
      onClick: (context) => {
        context.appendMessage({
          role: "user",
          content: "Please find me the best car match",
        });
      },
    }
  ],
});
