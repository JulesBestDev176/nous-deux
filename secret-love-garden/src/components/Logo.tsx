import { Heart } from "lucide-react";

const Logo = ({ size = "default", animated = true }) => {
  // Tailles responsive
  const sizes = {
    small: {
      container: "w-12 h-12",
      heart: "w-5 h-5",
      point1: "w-2 h-2",
      point2: "w-1.5 h-1.5",
      font: "text-xs"
    },
    default: {
      container: "w-16 h-16 md:w-20 md:h-20",
      heart: "w-6 h-6 md:w-8 md:h-8",
      point1: "w-2.5 h-2.5 md:w-3 md:h-3",
      point2: "w-2 h-2",
      font: "text-sm md:text-base"
    },
    large: {
      container: "w-24 h-24 md:w-28 md:h-28",
      heart: "w-8 h-8 md:w-10 md:h-10",
      point1: "w-3 h-3 md:w-4 md:h-4",
      point2: "w-2.5 h-2.5 md:w-3 md:h-3",
      font: "text-base md:text-lg"
    }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Cercle principal avec gradient amélioré */}
        <div className={`${currentSize.container} bg-gradient-to-br from-pink-400 via-rose-400 to-red-500 rounded-full shadow-xl flex items-center justify-center relative overflow-hidden`}>
          
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full"></div>
          
          {/* Cœurs entrelacés avec animation */}
          <div className="relative z-10">
            <Heart 
              className={`${currentSize.heart} text-white fill-white absolute transform -translate-x-0.5 -translate-y-0.5 ${
                animated ? 'animate-pulse' : ''
              }`}
              style={{ animationDelay: '0s', animationDuration: '2s' }}
            />
            <Heart 
              className={`${currentSize.heart} text-white fill-white absolute transform translate-x-0.5 translate-y-0.5 opacity-90 ${
                animated ? 'animate-pulse' : ''
              }`}
              style={{ animationDelay: '1s', animationDuration: '2s' }}
            />
          </div>

          {/* Particules d'amour flottantes */}
          {animated && (
            <>
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '1.5s' }}></div>
              <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-40" style={{ animationDelay: '2.5s' }}></div>
            </>
          )}
        </div>
        
        {/* Pulsation d'amour avec gradient */}
        {animated && (
          <>
            <div className={`absolute inset-0 ${currentSize.container} rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-red-500 animate-ping opacity-20`} style={{ animationDuration: '3s' }}></div>
            <div className={`absolute inset-0 ${currentSize.container} rounded-full bg-gradient-to-br from-pink-300 via-rose-300 to-red-400 animate-ping opacity-15`} style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          </>
        )}
        
        {/* Points décoratifs améliorés */}
        <div className={`absolute -top-1 -right-1 ${currentSize.point1} bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-sm ${
          animated ? 'animate-bounce' : ''
        }`} style={{ animationDelay: '0s', animationDuration: '2s' }}>
          <div className="w-full h-full bg-white rounded-full opacity-40"></div>
        </div>
        
        <div className={`absolute -bottom-1 -left-1 ${currentSize.point2} bg-gradient-to-br from-pink-300 to-pink-400 rounded-full shadow-sm ${
          animated ? 'animate-bounce' : ''
        }`} style={{ animationDelay: '1s', animationDuration: '2s' }}>
          <div className="w-full h-full bg-white rounded-full opacity-40"></div>
        </div>

        {/* Point d'étoile supplémentaire */}
        {animated && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '2s' }}></div>
          </div>
        )}

        {/* Lueur externe */}
        {animated && (
          <div className={`absolute inset-0 ${currentSize.container} rounded-full bg-gradient-to-br from-pink-200 via-rose-200 to-red-200 blur-sm animate-pulse opacity-30`} style={{ animationDuration: '4s' }}></div>
        )}
      </div>

      {/* Texte optionnel pour version étendue */}
      {size === 'large' && (
        <div className="ml-4 hidden md:block">
          <div className="flex flex-col">
            <span className="text-pink-600 font-bold text-lg tracking-wider">NOUS</span>
            <span className="text-rose-600 font-bold text-lg tracking-wider">DEUX</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;