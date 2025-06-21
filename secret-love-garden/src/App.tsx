import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PWAInstall from "./components/PWAInstall";
import PWAUpdate from "./components/PWAUpdate";
import NetworkStatus from "./components/NetworkStatus";
import { useEffect, useState } from "react";
import axios from "axios";
import authService from "./services/auth.service";
import { RingLoader } from "react-spinners";

const queryClient = new QueryClient();

// Interface pour l'utilisateur
interface User {
  _id: string;
  nom: string;
  email?: string;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Configuration API - utiliser l'URL de production si disponible
  const API_URL = import.meta.env.VITE_API_URL || 
                  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://nous-deux-backend.onrender.com');
  
  useEffect(() => {
    const initialiserSession = async () => {
      try {
        // 1. Vérifier s'il y a des données de session locales
        const savedUser = authService.getCurrentUser();
        const token = localStorage.getItem('token');
        
        if (savedUser && token) {
          // Si on a des données locales, on les utilise immédiatement
          setCurrentUser(savedUser);
          setIsAuthenticated(true);
        }
        
        // 2. Vérifier la session avec le serveur (en arrière-plan)
        try {
          const sessionData = await authService.verifierSession();
          if (sessionData.success && sessionData.user) {
            // Mettre à jour avec les données du serveur si elles sont plus récentes
            setCurrentUser(sessionData.user);
            setIsAuthenticated(true);
          }
        } catch (serverError) {
          // En cas d'erreur serveur, on garde les données locales
          if (!savedUser) {
            // Seulement déconnecter si on n'a pas de données locales
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        }
      } catch (error) {
        // En cas d'erreur générale, on déconnecte
        setIsAuthenticated(false);
        setCurrentUser(null);
        setError("Erreur lors de l'initialisation de la session");
      } finally {
        setIsLoading(false);
      }
    };

    initialiserSession();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLogin = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setError(null);
  };

  const handleLogout = async () => {
    try {
      await authService.deconnexion();
    } catch (error) {
      // Erreur silencieuse lors de la déconnexion
    } finally {
      // Toujours nettoyer le localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <RingLoader color="#f472b6" size={80} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de connexion</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstall />
        <PWAUpdate />
        <NetworkStatus />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Index
                  isAuthenticated={isAuthenticated}
                  currentUser={currentUser}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
