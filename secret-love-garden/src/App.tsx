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
    // 1. Toujours restaurer l'utilisateur local immédiatement
    const savedUser = authService.getCurrentUser();
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setCurrentUser(savedUser);
      setIsAuthenticated(true);
      setIsLoading(false); // On arrête le loading tout de suite
    } else {
      setIsLoading(false); // Même si pas d'utilisateur, on arrête le loading
    }

    // 2. Vérifier la session serveur en arrière-plan (sans bloquer l'UI)
    const verifier = async () => {
      try {
        const sessionData = await authService.verifierSession();
        if (sessionData.success && sessionData.user) {
          setCurrentUser(sessionData.user);
          setIsAuthenticated(true);
        } else {
          // Token invalide ou expiré
          setIsAuthenticated(false);
          setCurrentUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // En cas d'erreur réseau, on garde l'utilisateur local
        console.log("Erreur serveur, on reste en mode local:", error.message);
      }
    };
    if (token) verifier();
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
