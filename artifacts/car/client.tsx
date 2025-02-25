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
  description: string;
  message: string;
  score: number;
}

const getScoreColor = (score: number) => {
  const normalizedScore = score / 100;
  if (normalizedScore >= 0.95) return "bg-emerald-500/20 text-emerald-700";
  if (normalizedScore >= 0.80) return "bg-blue-500/20 text-blue-700";
  if (normalizedScore >= 0.60) return "bg-yellow-500/20 text-yellow-700";
  if (normalizedScore >= 0.40) return "bg-orange-500/20 text-orange-700";
  return "bg-red-500/20 text-red-700";
};

const CarDetails = ({ content }: { content: string }) => {
  try {
    const data = typeof content === 'string' ? JSON.parse(content) : content;
    if (!data.found || !data.car) {
      return <div className="p-4 text-red-500">{data.message}</div>;
    }

    const { car, analysis } = data;
    console.log(car);

    return (
      <div className="max-w-7xl mx-auto p-4 flex flex-col gap-8 h-screen">
        {/* Top Section */}
        <div className="flex flex-1 gap-8">
          {/* Images (3/4 width) */}
          <div className="w-3/4">
            <div className="grid grid-cols-2 gap-2 h-full">
              <div>
                <img 
                  src={car.photo_url} 
                  alt={car.name}
                  className="w-full h-full object-cover rounded-l-xl cursor-pointer"
                />
              </div>
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
                  <button 
                    style={{ 
                      backgroundColor: 'white', 
                      color: 'black', 
                      position: 'absolute', 
                      bottom: 1, 
                      right: 2,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                    className="">
                    <img 
                      src="/images/ikonica.png" 
                      alt="photos" 
                      style={{ width: '14px', height: '14px' }}
                    />
                    Show all photos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info (1/4 width) */}
          <div className="w-1/4">
            <div className="flex flex-col gap-4 border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold">{car.name}</h2>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-green-600">{car.price}</span>
                <div className={`flex items-center justify-center px-4 py-2 rounded-full ${getScoreColor(data.score)}`}>
                  <span className="font-semibold">{Math.round(data.score)}</span>
                </div>
              </div>
            </div>

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
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-1 gap-8">
          {/* Analysis (1/4 width) */}
          <div className="w-1/4">
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

          {/* Description (3/4 width) */}
          <div className="w-3/4">
            <h4 className="text-xl font-semibold mb-4">Description</h4>
            <div 
              className="text-sm text-gray-600 dark:text-gray-300" 
              style={{ 
                textAlign: 'justify',
                textJustify: 'inter-word'
              }}>
              {data.description}
            </div>
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
      description: "",
      score: 0
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

