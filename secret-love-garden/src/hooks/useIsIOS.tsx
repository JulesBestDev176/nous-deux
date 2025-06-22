import { useState, useEffect } from 'react';

export function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    // Détecte iPhone, iPad, et iPod
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    
    // S'assure qu'on n'est pas dans une autre app qui simule un user agent (comme Gmail)
    const isStandalone = ('standalone' in window.navigator) && (window.navigator.standalone);

    setIsIOS(isIOSDevice && !isStandalone);
  }, []);

  return isIOS;
} 