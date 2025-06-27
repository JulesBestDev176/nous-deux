import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Camera, MessageCircle, Calendar, Settings, LogOut, Menu, Bell, Edit, Target, Mail, BarChart3, MapPin, Users, Gamepad2, Home, X, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Import des services
import authService from "@/services/auth.service";
import userService from "@/services/user.service";
import questionService from "@/services/questions.service";

// Import des composants de section (seulement ceux demandés)
import GalerieSection from "./sections/GalerieSection";
import QuestionsSection from "./sections/QuestionsSection";
import ObjectifsSection from "./sections/ObjectifsSection";
import MessagesSection from "./sections/MessagesSection";
import RemindersSection from "./sections/RemindersSection";
import TimelineSection from "./sections/TimelineSection";
import SettingsSection from "./sections/SettingsSection";
import CustomQuestionsSection from "./sections/CustomQuestionsSection";
import PartnerAnswersSection from "./sections/PartnerAnswersSection";
import CalendrierSection from "./sections/CalendrierSection";
import StatistiquesSection from "./sections/StatistiquesSection";
import VoyagesSection from "./sections/VoyagesSection";
import ProfilsSection from "./sections/ProfilsSection";
import JeuxSection from "./sections/JeuxSection";
import ChatbotSection from "./sections/ChatbotSection";

// Import des composants communs
import Logo from "./Logo";
import PWAInstallPrompt from "./PWAInstallPrompt";

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

interface DashboardProps {
  currentUser: { id?: string; _id?: string; name?: string; nom?: string };
  onLogout: () => void;
}

const Dashboard = ({ currentUser, onLogout }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState("gallery");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [partenaire, setPartenaire] = useState(null);
  const [notifications, setNotifications] = useState({
    questions: 0,
    customQuestions: 0
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Organisation des éléments du menu par catégories pour éviter le scroll
  const menuCategories = [
    {
      title: "💕 Essentiel",
      items: [
        { id: "gallery", label: "Galerie", icon: Camera },
        { id: "questions", label: "Questions", icon: MessageCircle },
        { id: "chatbot", label: "Chatbot", icon: Bot },
      ]
    },
    {
      title: "🎯 Objectifs",
      items: [
        { id: "custom-questions", label: "Mes questions", icon: Edit },
        { id: "objectifs", label: "Objectifs", icon: Target },
        { id: "reminders", label: "Rappels", icon: Bell },
      ]
    },
    {
      title: "📊 Suivi",
      items: [
        { id: "calendrier", label: "Calendrier", icon: Calendar },
        { id: "statistiques", label: "Stats", icon: BarChart3 },
        { id: "timeline", label: "Histoire", icon: Heart },
      ]
    },
    {
      title: "🌟 Extra",
      items: [
        { id: "voyages", label: "Voyages", icon: MapPin },
        { id: "profils", label: "Profil", icon: Users },
        { id: "jeux", label: "Jeux", icon: Gamepad2 },
      ]
    }
  ];

  // Version aplatie pour mobile
  const allMenuItems = [
    { id: "gallery", label: "Galerie d'amour", icon: Camera },
    { id: "questions", label: "Questions couple", icon: MessageCircle },
    { id: "chatbot", label: "Chatbot", icon: Bot },
    { id: "custom-questions", label: "Mes questions", icon: Edit }, 
    { id: "objectifs", label: "Objectifs", icon: Target },
    { id: "reminders", label: "Rappels", icon: Bell },
    { id: "calendrier", label: "Calendrier", icon: Calendar },
    { id: "statistiques", label: "Statistiques", icon: BarChart3 },
    { id: "timeline", label: "Notre histoire", icon: Heart },
    { id: "voyages", label: "Voyages", icon: MapPin },
    { id: "profils", label: "Profil couple", icon: Users },
    { id: "jeux", label: "Jeux couple", icon: Gamepad2 },
  ];

  useEffect(() => {
    const fetchPartenaire = async () => {
      try {
        const res = await userService.getPartenaire();
        setPartenaire(res.data || res);
      } catch (error) {
        console.log("Impossible de charger les infos du partenaire");
      }
    };

    fetchPartenaire();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Récupérer les questions non répondues
      const questionsResponse = await questionService.getQuestionsAvecReponsesCouple();
      const questionsNonRepondues = (questionsResponse.data || []).filter(q => {
        const currentUserId = typeof currentUser === 'object' ? currentUser._id : currentUser;
        const maReponse = q.reponses?.find(r => r.utilisateur?._id === currentUserId);
        return !maReponse;
      });

      // Récupérer les questions personnalisées non répondues
      const customQuestionsResponse = await questionService.getQuestionsPersonnaliseesAvecReponses();
      const customQuestionsNonRepondues = (customQuestionsResponse.data || []).filter(q => {
        const currentUserId = typeof currentUser === 'object' ? currentUser._id : currentUser;
        const maReponse = q.reponses?.find(r => r.utilisateur?._id === currentUserId);
        // On ne compte que les questions dont je ne suis PAS le créateur
        const isCreator = q.createur?._id === currentUserId;
        return !maReponse && q.categorie === 'utilisateur' && !isCreator;
      });

      setNotifications({
        questions: questionsNonRepondues.length,
        customQuestions: customQuestionsNonRepondues.length
      });
    } catch (error) {
      console.log("Impossible de charger les notifications");
    }
  };

  const handleLogoutClick = async () => {
    try {
      await authService.deconnexion();
      await onLogout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      await onLogout();
    }
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setShowMobileMenu(false);
  };

  const decrementCustomQuestionsNotification = () => {
    setNotifications(prev => ({
      ...prev,
      customQuestions: Math.max(0, prev.customQuestions - 1)
    }));
  };

  const removeQuestionsNotification = () => {
    setNotifications(prev => ({
      ...prev,
      questions: 0
    }));
  };

  const renderSection = () => {
    // Adapt the toast function to match the expected signature for GalerieSection
    const toastForGalerieSection = ({
      title,
      description,
      variant,
    }: {
      title: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      toast({
        title,
        description,
        variant,
      });
    };

    const commonProps = {
      currentUser,
      partenaire,
      isMobile,
      toast,
      onLogout,
      decrementCustomQuestionsNotification,
      removeQuestionsNotification
    };

    switch (activeSection) {
      case "gallery":
        return <GalerieSection {...commonProps} toast={toastForGalerieSection} />;
      case "questions":
        return <QuestionsSection {...commonProps} toast={toastForGalerieSection} />;
      case "objectifs":
        return <ObjectifsSection {...commonProps} />;
      case "reminders":
        return <RemindersSection {...commonProps} />;
      case "timeline":
        return <TimelineSection {...commonProps} />;
      case "settings":
        return <SettingsSection {...commonProps} />;
      case "custom-questions":
        return <CustomQuestionsSection {...commonProps} />;
      case "partner-answers":
        return <PartnerAnswersSection {...commonProps} />;
      case "calendrier":
        return <CalendrierSection {...commonProps} />;
      case "statistiques":
        return <StatistiquesSection {...commonProps} />;
      case "voyages":
        return <VoyagesSection {...commonProps} />;
      case "profils":
        return <ProfilsSection {...commonProps} />;
      case "jeux":
        return <JeuxSection {...commonProps} />;
      case "chatbot":
        return (
          <ChatbotSection
            currentUser={currentUserForSections}
            partenaire={partenaire}
            isMobile={isMobile}
            toast={toast}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-pink-100">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Section en développement</h3>
              <p className="text-gray-500">Cette fonctionnalité sera bientôt disponible !</p>
            </div>
          </div>
        );
    }
  };

  const getCurrentSectionLabel = () => {
    const item = allMenuItems.find(item => item.id === activeSection);
    return item ? item.label : "Nos souvenirs";
  };

  // Juste avant le return du composant Dashboard, on prépare un currentUserForSections compatible :
  const currentUserForSections = {
    _id: currentUser._id || currentUser.id || '',
    nom: currentUser.nom || currentUser.name || '',
    email: currentUser.email || '', // Pour VoyagesSection
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header moderne */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(true)}
                  className="p-2 hover:bg-pink-100 rounded-xl"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </Button>
              )}
              
              <div className="flex items-center space-x-3">
                <Logo />
                <div>
                  <h1 className="font-bold text-gray-900 text-lg">
                    Nous Deux
                  </h1>
                  {!isMobile && (
                    <p className="text-sm text-gray-600">
                      {(currentUser?.name || currentUser?.nom)} & {partenaire?.nom || "..."} 💕
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Section actuelle sur mobile */}
            {isMobile && (
              <div className="text-center flex-1 mx-4">
                <p className="text-sm font-medium text-gray-900">
                  {getCurrentSectionLabel()}
                </p>
              </div>
            )}
            
            {!isMobile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogoutClick}
                className="bg-white hover:bg-pink-50 border-pink-200 text-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Menu mobile moderne avec overlay */}
      {isMobile && showMobileMenu && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu mobile */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Header du menu */}
              <div className="p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Menu</h2>
                    <p className="text-pink-100 text-sm">{currentUser?.name || currentUser?.nom} 💕</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileMenu(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allMenuItems.map((item) => {
                  const Icon = item.icon;
                  const notificationCount = item.id === 'questions' ? notifications.questions : 
                                           item.id === 'custom-questions' ? notifications.customQuestions : 0;
                  return (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className={`w-full justify-start p-4 h-auto relative ${
                        activeSection === item.id 
                          ? "bg-pink-500 text-white shadow-md" 
                          : "text-gray-700 hover:bg-pink-50"
                      } rounded-xl`}
                      onClick={() => {
                        handleSectionClick(item.id);
                      }}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {notificationCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {notificationCount > 9 ? '9+' : notificationCount}
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
              
              {/* Footer du menu mobile */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleLogoutClick}
                  className="w-full justify-start p-4 h-auto border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">Déconnexion</span>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:flex lg:space-x-8">
          {/* Sidebar desktop sans scroll */}
          {!isMobile && (
            <aside className="w-72 h-fit bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
              <div className="space-y-6">
                {menuCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {category.title}
                    </h3>
                    <div className="space-y-1">
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const notificationCount = item.id === 'questions' ? notifications.questions : 
                                                 item.id === 'custom-questions' ? notifications.customQuestions : 0;
                        return (
                          <Button
                            key={item.id}
                            variant={activeSection === item.id ? "default" : "ghost"}
                            className={`w-full justify-start p-3 h-auto relative ${
                              activeSection === item.id 
                                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md" 
                                : "text-gray-700 hover:bg-pink-50"
                            } rounded-xl transition-all duration-200`}
                            onClick={() => handleSectionClick(item.id)}
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            <span className="text-sm font-medium">{item.label}</span>
                            {notificationCount > 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {notificationCount > 9 ? '9+' : notificationCount}
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Settings séparé */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant={activeSection === "settings" ? "default" : "ghost"}
                    className={`w-full justify-start p-3 h-auto ${
                      activeSection === "settings" 
                        ? "bg-gray-600 text-white" 
                        : "text-gray-700 hover:bg-gray-50"
                    } rounded-xl`}
                    onClick={() => handleSectionClick("settings")}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    <span className="text-sm font-medium">Paramètres</span>
                  </Button>
                </div>
              </div>
            </aside>
          )}

          <main className="flex-1">
            {/* <div className="mb-6">
              <PWAInstallPrompt />
            </div> */}

            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;