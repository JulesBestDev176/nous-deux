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

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
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
          console.log("Session restaurée depuis le localStorage:", savedUser.nom);
        }
        
        // 2. Vérifier la session avec le serveur (en arrière-plan)
        try {
          const sessionData = await authService.verifierSession();
          if (sessionData.success && sessionData.user) {
            // Mettre à jour avec les données du serveur si elles sont plus récentes
            setCurrentUser(sessionData.user);
            setIsAuthenticated(true);
            console.log("Session vérifiée avec le serveur:", sessionData.user.nom);
          }
        } catch (serverError) {
          console.log("Erreur serveur, utilisation des données locales:", serverError.message);
          // En cas d'erreur serveur, on garde les données locales
          if (!savedUser) {
            // Seulement déconnecter si on n'a pas de données locales
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la session:", error);
        // En cas d'erreur générale, on déconnecte
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initialiserSession();
  }, []);

  const handleLogin = (user) => {
    console.log("Connexion réussie:", user.nom);
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    try {
      await authService.deconnexion();
      console.log("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
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
