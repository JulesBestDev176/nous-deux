import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Lock, Users, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import Dashboard from "@/components/Dashboard";
import { useToast } from "@/components/ui/use-toast";
import authService from "@/services/auth.service";

// Hook pour détecter mobile
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

const Index = ({ isAuthenticated, currentUser, onLogin, onLogout }) => {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Debug: Afficher les props reçues
  useEffect(() => {
    console.log("Index - Props reçues:", {
      isAuthenticated,
      currentUser,
      hasUser: !!currentUser,
      userName: currentUser?.nom || currentUser?.name,
      userKeys: currentUser ? Object.keys(currentUser) : []
    });
  }, [isAuthenticated, currentUser]);

  const handleLogin = async () => {
    if (!accessCode.trim()) return;

    setLoading(true);
    try {
      // Connexion réelle via le backend
      const response = await authService.connexion(accessCode);
      onLogin(response.user);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${response.user.nom} !`,
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: error?.message || "Code d'accès invalide",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est authentifié et a un nom
  const isUserAuthenticated = isAuthenticated && currentUser && (currentUser.nom || currentUser.name);
  const userName = currentUser?.nom || currentUser?.name;

  console.log("Index - Condition d'authentification:", {
    isAuthenticated,
    hasCurrentUser: !!currentUser,
    hasName: !!(currentUser?.nom || currentUser?.name),
    isUserAuthenticated,
    userName
  });

  if (isUserAuthenticated) {
    console.log("Index - Affichage du Dashboard pour:", userName);
    return (
      <Dashboard
        currentUser={currentUser}
        onLogout={() => {
          onLogout();
          toast({
            title: "Déconnexion réussie",
            description: "À bientôt !",
          });
        }}
      />
    );
  }

  console.log("Index - Affichage de la page de connexion");
  return (
    <div className={`min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center ${
      isMobile ? 'p-4' : 'p-8'
    }`}>
      <div className={`w-full space-y-8 ${
        isMobile ? 'max-w-sm' : 'max-w-md'
      }`}>
        {/* Header section */}
        <div className="text-center space-y-4">
          <div className={`flex justify-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
            <Logo />
          </div>
          <h1 className={`font-bold text-gray-800 mb-2 ${
            isMobile ? 'text-3xl' : 'text-4xl'
          }`}>
            Nous Deux
          </h1>
          <p className={`text-gray-600 ${
            isMobile ? 'text-base px-4' : 'text-lg'
          }`}>
            Notre jardin secret d'amour
          </p>
        </div>

        {/* Login card */}
        <Card className={`shadow-xl border-0 bg-white/80 backdrop-blur-sm ${
          isMobile ? 'mx-2' : ''
        }`}>
          <CardHeader className={`text-center ${isMobile ? 'pb-3' : 'pb-4'}`}>
            <div className={`flex justify-center ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <div className={`bg-pink-100 rounded-full ${isMobile ? 'p-2' : 'p-3'}`}>
                <Lock className={`text-pink-600 ${isMobile ? 'h-5 w-5' : 'h-6 w-6'}`} />
              </div>
            </div>
            <CardTitle className={`text-gray-800 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              Accès privé
            </CardTitle>
            <CardDescription className={`text-gray-600 ${
              isMobile ? 'text-sm px-2' : ''
            }`}>
              Entrez votre code unique personnel pour accéder à votre espace d'amour
            </CardDescription>
          </CardHeader>
          
          <CardContent className={`space-y-6 ${isMobile ? 'px-4 pb-4' : ''}`}>
            <div className="space-y-2">
              <label 
                htmlFor="code" 
                className={`font-medium text-gray-700 ${isMobile ? 'text-sm' : ''}`}
              >
                Code d'accès
              </label>
              <Input
                id="code"
                type="password"
                placeholder="Entrez votre code personnel"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className={`text-center tracking-wider ${
                  isMobile ? 'h-12 text-base' : 'h-11'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
                disabled={loading}
              />
            </div>
            
            <Button 
              onClick={handleLogin}
              className={`w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 ${
                isMobile ? 'h-12 text-base' : 'py-3'
              }`}
              disabled={!accessCode.trim() || loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Connexion...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Entrer dans notre monde
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Features grid */}
        <div className={`grid grid-cols-3 gap-4 ${isMobile ? 'mt-6' : 'mt-8'}`}>
          <div className={`text-center bg-white/60 rounded-lg backdrop-blur-sm ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <Heart className={`text-pink-500 mx-auto mb-2 ${
              isMobile ? 'w-5 h-5' : 'w-6 h-6'
            }`} />
            <p className={`text-gray-600 ${
              isMobile ? 'text-xs leading-tight' : 'text-xs'
            }`}>
              Galerie d'amour
            </p>
          </div>
          
          <div className={`text-center bg-white/60 rounded-lg backdrop-blur-sm ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <Users className={`text-rose-500 mx-auto mb-2 ${
              isMobile ? 'w-5 h-5' : 'w-6 h-6'
            }`} />
            <p className={`text-gray-600 ${
              isMobile ? 'text-xs leading-tight' : 'text-xs'
            }`}>
              Questions couple
            </p>
          </div>
          
          <div className={`text-center bg-white/60 rounded-lg backdrop-blur-sm ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <Lock className={`text-red-500 mx-auto mb-2 ${
              isMobile ? 'w-5 h-5' : 'w-6 h-6'
            }`} />
            <p className={`text-gray-600 ${
              isMobile ? 'text-xs leading-tight' : 'text-xs'
            }`}>
              Privé & sécurisé
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center text-gray-500 ${
          isMobile ? 'mt-6 text-xs px-4' : 'text-sm mt-8'
        }`}>
          <p>Créé avec 💕 pour Souleymane & Hadiyatou</p>
        </div>

        {/* Instructions pour mobile PWA */}
        {isMobile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-2 mt-4">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-blue-800 text-xs font-medium mb-1">
                  Installation sur votre téléphone
                </p>
                <p className="text-blue-700 text-xs leading-relaxed">
                  Pour une meilleure expérience, ajoutez cette application à votre écran d'accueil. 
                  Appuyez sur le bouton de partage puis "Ajouter à l'écran d'accueil".
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;