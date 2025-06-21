import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast({
        title: "Application installée !",
        description: "Vous pouvez maintenant accéder à l'application depuis votre écran d'accueil.",
      });
    } else {
      toast({
        title: "Installation annulée",
        description: "Vous pouvez toujours installer l'application plus tard.",
      });
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    setDeferredPrompt(null);
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-pink-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 rounded-full">
            <Download className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">Installer l'application</h3>
            <p className="text-gray-600 text-xs">
              Accédez rapidement à votre jardin secret d'amour
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={handleInstallClick}
          className="flex-1 bg-pink-500 hover:bg-pink-600 text-sm"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Installer
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline"
          size="sm"
          className="text-sm"
        >
          Plus tard
        </Button>
      </div>
    </div>
  );
};

export default PWAInstall; 