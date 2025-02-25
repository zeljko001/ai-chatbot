import { Artifact } from "@/components/create-artifact";
import Image from "next/image";
import { toast } from "sonner";
import { CopyIcon, RedoIcon, UndoIcon} from '@/components/icons';
import { getBestCar } from "@/lib/ai/tools/best-car";

interface CarArtifactMetadata {
  found: boolean;
  car?: {
    id: number;
    name: string;
    price: string;
    transmission: string;
    horsepower: string;
    year: string;
    mileage: string;
    photo_url: string;
    damage: string;
    fuel: string;
    cubic_capacity: string;
    url: string;
    created_at: string;
  };
  analysis?: {
    value: string;
    age: string;
    condition: string;
    engine: string;
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
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-8">
          {/* Left side - Images (3/4 width) */}
          <div className="w-3/4">
            <div className="grid grid-cols-2 gap-2 h-[450px]">
              {/* Large left image */}
              <div>
                <img 
                  src={car.photo_url} 
                  alt={car.name}
                  className="w-full h-full object-cover rounded-l-xl cursor-pointer"
                />
              </div>
              
              {/* Right side 2x2 grid */}
              <div className="grid grid-cols-2 grid-rows-2 gap-2">
                <img 
                  src={car.photo_url} 
                  alt={car.name}
                  className="w-full h-full object-cover cursor-pointer"
                />
                <img 
                  src={car.photo_url} 
                  alt={car.name}
                  className="w-full h-full object-cover rounded-tr-xl cursor-pointer"
                />
                <img 
                  src={car.photo_url} 
                  alt={car.name}
                  className="w-full h-full object-cover cursor-pointer"
                />
                <div className="relative">
                  <img 
                    src={car.photo_url} 
                    alt={car.name}
                    className="w-full h-full object-cover rounded-br-xl cursor-pointer"
                  />
                  <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg 
                    shadow-md hover:shadow-lg transition-shadow duration-200 font-medium">
                    Show all photos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Info (1/4 width) */}
          <div className="w-1/4">
            {/* Title and Price Section */}
            <div className="flex flex-col gap-4 border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold">{car.name}</h2>
              <span className="text-2xl font-semibold text-green-600">{car.price}</span>
            </div>

            {/* Car Details */}
            <div className="mb-8">
              <div className="grid grid-cols-[80px_1fr] gap-y-4">
                <span className="font-semibold text-green-600">Year: <span className="font-normal">{car.year}</span></span>
                <span className="font-semibold text-green-600">Mileage: <span className="font-normal">{car.mileage}</span></span>
                <span className="font-semibold text-green-600">Engine: <span className="font-normal">{car.cubic_capacity}</span></span>
                <span className="font-semibold text-green-600">Power: <span className="font-normal">{car.horsepower}</span></span>
                <span className="font-semibold text-green-600">Fuel: <span className="font-normal">{car.fuel}</span></span>
                <span className="font-semibold text-green-600">Damage: <span className="font-normal">{car.damage}</span></span>
                <span className="font-semibold text-green-600">Transmission: <span className="font-normal">{car.transmission}</span></span>
              </div>
            </div>

            {/* First Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6"></div>

            {/* Analysis Section */}
            {analysis && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4">Analysis</h4>
                <div className="grid grid-cols-[80px_1fr] gap-y-4">
                  <span className="font-semibold text-green-600">Value: <span className="font-normal">{analysis.value}</span></span>
                  <span className="font-semibold text-green-600">Age: <span className="font-normal">{analysis.age}</span></span>
                  <span className="font-semibold text-green-600">Condition: <span className="font-normal">{analysis.condition}</span></span>
                  <span className="font-semibold text-green-600">Engine: <span className="font-normal">{analysis.engine}</span></span>
                  <span className="font-semibold text-green-600">Potential Savings: <span className="font-normal">${analysis.savings}</span></span>
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
