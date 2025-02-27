import { CarIcon } from './icons';

interface CarResult {
  found: boolean;
  car: {
    id: number;
    name: string;
    price: string;
    transmission: string;
    horsepower: string;
    year: string;
    mileage: string;
    all_photos: string[];
    damage: string;
    fuel: string;
    cubic_capacity: string;
    url: string;
    location: string;
    created_at: string;
  };
  analysis: {
    value: string;
    age: string;
    condition: string;
    engine: string;
    savings: number;
  };
  message: string;
  score: number;
}

// Helper function to get color based on score
const getScoreColor = (score: number) => {
  const normalizedScore = score / 100;
  if (normalizedScore >= 0.95) return "bg-emerald-500/20 text-emerald-700";
  if (normalizedScore >= 0.80) return "bg-blue-500/20 text-blue-700";
  if (normalizedScore >= 0.60) return "bg-yellow-500/20 text-yellow-700";
  if (normalizedScore >= 0.40) return "bg-orange-500/20 text-orange-700";
  return "bg-red-500/20 text-red-700";
};

export function CarPreview({ result }: { result: { found: boolean, cars: CarResult[], message: string } }) {
  if (!result.found || !result.cars || result.cars.length === 0) {
    return <div className="p-4 text-red-500">{result.message}</div>;
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-screen">
      {result.cars.map((carData, i) => (
        <div 
          key={i}
          className={`flex items-center gap-3 p-2 rounded-lg border text-foreground ${
            (() => {
              if (i === 0) return 'border-emerald-500/50 bg-emerald-50/50'
              if (i === 1) return 'border-blue-500/50 bg-blue-50/50'
              if (i === 2) return 'border-amber-500/50 bg-amber-50/50'
              return 'border-gray-200 bg-gray-50/50'
            })()
          }`}
        >
          <div className="flex items-center justify-center size-10 bg-muted rounded-md shrink-0">
            {carData.car.all_photos[0] ? (
              <img 
                src={carData.car.all_photos[0]} 
                alt={carData.car.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <CarIcon size={16} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="font-medium truncate">
                {carData.car.name}
              </h3>
              <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-md shrink-0 ${
                (() => {
                  if (i === 0) return 'bg-emerald-100 text-emerald-700'
                  if (i === 1) return 'bg-blue-100 text-blue-700'
                  if (i === 2) return 'bg-amber-100 text-amber-700'
                  return 'bg-gray-100 text-gray-700'
                })()
              }`}>
                ID: {carData.car.id}
              </span>
            </div>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="truncate">{carData.car.year} • {carData.car.fuel} • {carData.car.horsepower}</p>
              <p className="font-medium">{carData.car.price}</p>
              <p className="text-xs">{carData.car.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
