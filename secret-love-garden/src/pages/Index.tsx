import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Lock, Users } from "lucide-react";
import Logo from "@/components/Logo";
import Dashboard from "@/components/Dashboard";
import authService from "@/services/auth.service";
import { useToast } from "@/components/ui/use-toast";

const Index = ({ isAuthenticated, currentUser, onLogin, onLogout }) => {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      const response = await authService.connexion(accessCode);
      localStorage.setItem("token", response.token);
      onLogin(response.user);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue ${response.user.nom} !`,
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Code d'accès invalide",
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
        currentUser={userName}
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <Logo />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Nous Deux</h1>
          <p className="text-gray-600 text-lg">Notre jardin secret d'amour</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-pink-100 rounded-full">
                <Lock className="h-6 w-6 text-pink-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-800">Accès privé</CardTitle>
            <CardDescription className="text-gray-600">
              Entrez votre code unique personnel pour accéder à votre espace d'amour
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Code d'accès
              </label>
              <Input
                id="code"
                type="password"
                placeholder="Entrez votre code personnel"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="text-center tracking-wider"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              disabled={!accessCode.trim() || loading}
            >
              {loading ? (
                "Chargement..."
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Entrer dans notre monde
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
            <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Galerie d'amour</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
            <Users className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Questions couple</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
            <Lock className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600">Privé & sécurisé</p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Créé avec 💕 pour Souleymane & Hadiyatou</p>
        </div>
      </div>
    </div>
  );
};

export default Index;