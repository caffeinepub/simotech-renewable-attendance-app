import { MapPin } from 'lucide-react';

interface LocationDisplayProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export default function LocationDisplay({ latitude, longitude, className = '' }: LocationDisplayProps) {
  const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <img 
        src="/assets/generated/icon-location.dim_48x48.png" 
        alt="Location" 
        className="h-4 w-4"
      />
      <a 
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </a>
    </div>
  );
}

