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
    photo_url: string;
    damage: string;
    fuel: string;
    cubic_capacity: string;
    url: string;
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

export function CarPreview({ result }: { result: CarResult }) {
  if (!result.found || !result.car) {
    return <div className="p-4 text-red-500">{result.message}</div>;
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-card text-card-foreground">
      <div className="relative size-20 rounded-md overflow-hidden shrink-0">
        <img 
          src={result.car.photo_url} 
          alt={result.car.name}
          className="object-cover size-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{result.car.name}</h3>
        <div className="text-sm text-muted-foreground space-y-0.5">
          <p className="truncate">
            {result.car.year} • {result.car.mileage} • {result.car.fuel}
          </p>
          <p className="truncate text-xs">
            {result.car.cubic_capacity} • {result.car.horsepower} • {result.car.damage}
          </p>
          <p className="font-medium">{result.car.price}</p>
        </div>
      </div>
      <div className={`flex flex-col items-center justify-center size-14 rounded-full shrink-0 ${getScoreColor(result.score)}`}>
        <span className="text-sm font-semibold">{Math.round(result.score)}</span>
      </div>
    </div>
  );
}
