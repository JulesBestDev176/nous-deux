import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-red-50 border border-red-200 rounded-lg p-3 z-50">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-red-600" />
        <span className="text-red-800 text-sm font-medium">
          Vous êtes hors ligne
        </span>
      </div>
      <p className="text-red-700 text-xs mt-1">
        Certaines fonctionnalités peuvent ne pas être disponibles
      </p>
    </div>
  );
};

export default NetworkStatus; 