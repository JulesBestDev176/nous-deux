import React from 'react';
import { useIsIOS } from '@/hooks/useIsIOS';
import PWAInstall from './PWAInstall'; // Ton bouton d'installation actuel
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SquareArrowUp } from 'lucide-react';

const PWAInstallPrompt = () => {
  const isIOS = useIsIOS();

  // On vérifie aussi si le PWAInstall peut s'afficher, pour ne rien montrer si déjà installé sur Android/Desktop
  const [canInstall, setCanInstall] = React.useState(true);

  if (isIOS) {
    // Affiche les instructions pour les utilisateurs iOS
    return (
      <Card className="bg-blue-50 border-blue-200 mt-4">
        <CardHeader>
          <CardTitle className="text-blue-800 text-base">Installer l'application</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 text-sm">
          <p>Pour installer l'application sur votre iPhone :</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Appuyez sur l'icône de Partage <SquareArrowUp className="inline-block w-4 h-4 mx-1" /> dans la barre d'outils.</li>
            <li>Faites défiler et sélectionnez "Sur l'écran d'accueil".</li>
            <li>Appuyez sur "Ajouter".</li>
          </ol>
        </CardContent>
      </Card>
    );
  }

  // Affiche ton bouton d'installation normal pour Android et Desktop
  // On passe une fonction pour que PWAInstall puisse nous dire s'il doit s'afficher ou non
  return <PWAInstall onInstallStateChange={({ canInstall }) => setCanInstall(canInstall)} />;
};

export default PWAInstallPrompt; 