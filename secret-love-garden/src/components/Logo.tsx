
import { Heart } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Cercle principal avec gradient */}
        <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 rounded-full shadow-lg flex items-center justify-center">
          {/* Coeurs entrelacés */}
          <div className="relative">
            <Heart 
              className="w-8 h-8 text-white fill-white absolute transform -translate-x-1 -translate-y-1" 
            />
            <Heart 
              className="w-8 h-8 text-white fill-white absolute transform translate-x-1 translate-y-1 opacity-80" 
            />
          </div>
        </div>
        
        {/* Pulsation d'amour */}
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 animate-ping opacity-25"></div>
        
        {/* Points décoratifs */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-300 rounded-full animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default Logo;
