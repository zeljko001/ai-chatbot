import { memo } from 'react';// PROMEJANA - DODAT cio fajl

interface CarResultProps {
  result: {
    found: boolean;
    car?: {
      name: string;
      price: number;
      year: number;
      condition: string;
      mileage: number;
      fuel_type: string;
      damages: string;
    };
    score?: number;
    analysis?: {
      value: string;
      age: string;
      condition: string;
      damages: string;
      savings: number;
    };
    message: string;
  };
}

const PureCarResult = ({ result }: CarResultProps) => {
  if (!result.found) {
    return (
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground">{result.message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{result.car?.name}</h3>
          <p className="text-muted-foreground">{result.message}</p>
        </div>
        {result.score && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded-md text-sm">
            Score: {result.score}
          </span>
        )}
      </div>

      {result.car && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Price</p>
            <p>${result.car.price}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Year</p>
            <p>{result.car.year}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mileage</p>
            <p>{result.car.mileage} km</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fuel Type</p>
            <p>{result.car.fuel_type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Condition</p>
            <p>{result.car.condition}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Damages</p>
            <p>{result.car.damages}</p>
          </div>
        </div>
      )}

      {result.analysis && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold mb-2">Analysis</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Value Rating</p>
              <p>{result.analysis.value}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Age</p>
              <p>{result.analysis.age}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Savings</p>
              <p>${result.analysis.savings}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CarResult = memo(PureCarResult); 