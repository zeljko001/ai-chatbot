import { memo } from 'react';// PROMEJANA - DODAT cio fajl

interface CarResultProps {
  result: {
    found: boolean;
    car?: {
      id: number;
      name: string;
      price: string;
      milage: string;
      engine_capacity: string;
      fuel_type: string;
      condition: string;
      year: number;
      power: string;
      image_url: string;
      created_at: Date;
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
        {result.car?.image_url && (
          <img 
            src={result.car.image_url} 
            alt={result.car.name}
            className="w-24 h-24 object-cover rounded-md"
          />
        )}
      </div>

      {result.car && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Price</p>
            <p>{result.car.price}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Year</p>
            <p>{result.car.year}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mileage</p>
            <p>{result.car.milage}</p>
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
            <p className="text-muted-foreground">Engine Capacity</p>
            <p>{result.car.engine_capacity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Power</p>
            <p>{result.car.power}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const CarResult = memo(PureCarResult); 