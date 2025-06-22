import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, Camera, MessageCircle, Calendar, Settings, LogOut, Send, Loader2, CheckCircle, Bell, Plus, Trash2, Edit, X, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Logo from "./Logo";
import { useToast } from "@/components/ui/use-toast";
import gallerieService from "@/services/gallerie.service";
import authService from "@/services/auth.service";
import questionService from "@/services/questions.service";
import { useNavigate } from "react-router-dom";

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
  currentUser: string;
  onLogout: () => void;
}

// Composant MobileMenu
const MobileMenu = ({ isOpen, onClose, menuItems, activeSection, setActiveSection, currentUser, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Logo />
            <div>
              <h2 className="font-bold text-gray-800">Nous Deux</h2>
              <p className="text-sm text-gray-600">{currentUser} 💕</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeSection === item.id 
                    ? "bg-pink-500 text-white" 
                    : "text-gray-700 hover:bg-pink-50"
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  onClose();
                }}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
          
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:bg-red-50"
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

// Composant QuestionPersonnalisee adapté mobile
const QuestionPersonnalisee = ({ question, onReponseSubmit, currentUser, isMobile }) => {
  const [reponse, setReponse] = useState("");
  const [reponseExistante, setReponseExistante] = useState(null);
  const [showAnswerField, setShowAnswerField] = useState(false);
  const [loadingReponse, setLoadingReponse] = useState(false);
  const { toast } = useToast();

  const handleSubmitReponse = async () => {
    if (!reponse.trim()) return;

    setLoadingReponse(true);
    try {
      const res = await questionService.soumettreReponse({
        questionId: question._id,
        texte: reponse,
      });
      setReponse("");
      setShowAnswerField(false);
      setReponseExistante(res.data || res);
      
      onReponseSubmit();
      
      toast({
        title: "Réponse enregistrée",
        description: "Merci pour votre réponse !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la réponse",
        variant: "destructive",
      });
    } finally {
      setLoadingReponse(false);
    }
  };

  const isCreator = question.createur?.nom === currentUser;

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg border border-pink-200">
      <div className="mb-3">
        <h3 className={`font-medium text-gray-800 mb-2 ${isMobile ? 'text-sm' : ''}`}>
          {question.texte}
        </h3>
        <div className={`flex items-center justify-between text-xs text-gray-500 ${isMobile ? 'flex-col items-start gap-1' : ''}`}>
          <span>Créée le {new Date(question.dateCreation).toLocaleDateString()}</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            isCreator ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {isCreator ? 'Votre question' : 'Question de votre partenaire'}
          </span>
        </div>
      </div>

      {reponseExistante ? (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium text-green-800 text-sm">Réponse enregistrée</span>
          </div>
          <p className="text-green-700 text-sm">{reponseExistante.texte}</p>
          <p className="text-xs text-green-600 mt-1">
            Répondu le {new Date(reponseExistante.dateReponse).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {isCreator ? (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 text-sm font-medium">
                  En attente de la réponse de votre partenaire
                </span>
              </div>
            </div>
          ) : (
            <>
              {!showAnswerField ? (
                <Button
                  onClick={() => setShowAnswerField(true)}
                  className={`bg-pink-500 hover:bg-pink-600 text-sm ${isMobile ? 'w-full' : ''}`}
                  size="sm"
                >
                  Répondre à cette question
                </Button>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    value={reponse}
                    onChange={(e) => setReponse(e.target.value)}
                    placeholder="Votre réponse..."
                    rows={3}
                    className="border-pink-200 focus:border-pink-500 text-sm"
                  />
                  <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                    <Button
                      onClick={handleSubmitReponse}
                      disabled={!reponse.trim() || loadingReponse}
                      className={`bg-pink-500 hover:bg-pink-600 text-sm ${isMobile ? 'w-full' : ''}`}
                      size="sm"
                    >
                      {loadingReponse ? (
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      ) : (
                        <Send className="w-3 h-3 mr-1" />
                      )}
                      Envoyer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAnswerField(false);
                        setReponse("");
                      }}
                      size="sm"
                      className={`text-sm ${isMobile ? 'w-full' : ''}`}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ currentUser, onLogout }: DashboardProps) => {
  const [activeSection, setActiveSection] = useState("gallery");
  const [showAnswerField, setShowAnswerField] = useState(false);
  const [answer, setAnswer] = useState("");
  const [showCodeChange, setShowCodeChange] = useState(false);
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [questionDuJour, setQuestionDuJour] = useState(null);
  const [reponseExistante, setReponseExistante] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingReponse, setLoadingReponse] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [questionsPersonnalisees, setQuestionsPersonnalisees] = useState([]);

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const menuItems = [
    { id: "gallery", label: "Galerie d'amour", icon: Camera },
    { id: "questions", label: "Questions couple", icon: MessageCircle },
    { id: "custom-questions", label: "Questions personnalisées", icon: Edit },
    { id: "partner-answers", label: "Réponses du partenaire", icon: Heart },
    { id: "reminders", label: "Rappels importants", icon: Bell },
    { id: "timeline", label: "Notre histoire", icon: Calendar },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  useEffect(() => {
    // Charger la question du jour
    const fetchQuestionDuJour = async () => {
      setLoadingQuestion(true);
      try {
        const res = await questionService.getQuestionDuJour();
        setQuestionDuJour(res.data || res); // selon la structure
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger la question du jour",
          variant: "destructive",
        });
      } finally {
        setLoadingQuestion(false);
      }
    };
    fetchQuestionDuJour();

    // Charger les questions personnalisées
    const fetchQuestionsPerso = async () => {
      try {
        const res = await questionService.getQuestionsPersonnalisees();
        setQuestionsPersonnalisees(res.data || res);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les questions personnalisées",
          variant: "destructive",
        });
      }
    };
    fetchQuestionsPerso();

    // Charger les images (déjà présent)
    const fetchImages = async () => {
      try {
        const res = await gallerieService.getImages();
        setImages(res.data || res);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les images",
          variant: "destructive",
        });
      }
    };
    fetchImages();
  }, []);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const file = files[0];
      const res = await gallerieService.uploadImage(file);
      setImages(prev => [res.data || res, ...prev]);
      toast({
        title: "Succès",
        description: "Image ajoutée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de l'upload de l'image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !questionDuJour) return;
    setLoadingReponse(true);
    try {
      const res = await questionService.soumettreReponse({
        questionId: questionDuJour._id,
        texte: answer,
      });
      setReponseExistante(res.data || res);
      setAnswer("");
      setShowAnswerField(false);
      toast({
        title: "Réponse enregistrée",
        description: "Merci pour votre réponse !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la réponse",
        variant: "destructive",
      });
    } finally {
      setLoadingReponse(false);
    }
  };

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const handleNextImage = () => {
    if (images.length > 0) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(images[nextIndex]);
    }
  };

  const handlePreviousImage = () => {
    if (images.length > 0) {
      const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(images[prevIndex]);
    }
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const handleLogoutClick = async () => {
    await onLogout();
    // Nettoyer tous les états liés à l'utilisateur
    setAnswer("");
    setOldCode("");
    setNewCode("");
    setImages([]);
    setQuestionDuJour(null);
    setReponseExistante(null);
    setQuestionsPersonnalisees([]);
    // Rediriger vers la page de connexion
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-rose-100">
      {/* Header responsive */}
      <header className="bg-white shadow-sm border-b border-pink-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileMenu(true)}
                className="mr-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <Logo />
            <div>
              <h1 className={`font-bold text-gray-800 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                Nous Deux
              </h1>
              <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {isMobile ? `${currentUser} 💕` : `Bienvenue ${currentUser} 💕`}
              </p>
            </div>
          </div>
          
          {!isMobile && (
            <Button variant="outline" size="sm" onClick={handleLogoutClick}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          )}
        </div>
      </header>

      {/* Menu mobile */}
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        menuItems={menuItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        currentUser={currentUser}
        onLogout={handleLogoutClick}
      />

      <div className={`max-w-6xl mx-auto p-4 ${isMobile ? '' : 'flex gap-6'}`}>
        {/* Sidebar desktop */}
        {!isMobile && (
          <aside className="w-64 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeSection === item.id 
                      ? "bg-pink-500 text-white" 
                      : "text-gray-700 hover:bg-pink-50"
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </aside>
        )}

        {/* Contenu principal */}
        <main className="flex-1">
          {/* Section Galerie */}
          {activeSection === "gallery" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
                  <Camera className="w-5 h-5 mr-2 text-pink-500" />
                  Notre galerie d'amour
                </CardTitle>
              </CardHeader>
              <CardContent>
                {images.length > 0 ? (
                  <div className={`grid gap-4 ${
                    isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
                  }`}>
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        onClick={() => handleImageClick(image, index)}
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={image.url}
                            alt={image.filename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune image dans la galerie</p>
                  </div>
                )}

                <div className="mt-6">
                  <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-sm' : ''}`}>
                    Ajouter une photo
                  </label>
                  <div className={`flex items-center space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      disabled={uploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className={`bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 flex items-center space-x-2 ${
                        isMobile ? 'w-full justify-center' : ''
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      <span>Choisir une image</span>
                    </label>
                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Questions */}
          {activeSection === "questions" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
                  <MessageCircle className="w-5 h-5 mr-2 text-pink-500" />
                  Question du jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingQuestion ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : questionDuJour ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-pink-200">
                      <p className={`font-medium text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
                        {questionDuJour.texte}
                      </p>
                    </div>

                    {reponseExistante ? (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">Réponse enregistrée</span>
                        </div>
                        <p className="text-green-700">{reponseExistante.texte}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {!showAnswerField ? (
                          <Button
                            onClick={() => setShowAnswerField(true)}
                            className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
                          >
                            Répondre à cette question
                          </Button>
                        ) : (
                          <div className="space-y-3">
                            <Textarea
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              placeholder="Votre réponse..."
                              rows={4}
                              className="border-pink-200 focus:border-pink-500"
                            />
                            <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                              <Button
                                onClick={handleSubmitAnswer}
                                disabled={!answer.trim()}
                                className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Envoyer
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowAnswerField(false);
                                  setAnswer("");
                                }}
                                className={isMobile ? 'w-full' : ''}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune question disponible aujourd'hui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section Questions Personnalisées */}
          {activeSection === "custom-questions" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
                  <div className="flex items-center">
                    <Edit className="w-5 h-5 mr-2 text-pink-500" />
                    <span className={isMobile ? 'text-lg' : ''}>Questions personnalisées</span>
                  </div>
                  <Button
                    className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une question
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questionsPersonnalisees.map((question) => (
                    <QuestionPersonnalisee 
                      key={question._id} 
                      question={question} 
                      onReponseSubmit={() => {}}
                      currentUser={currentUser}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section Paramètres */}
          {activeSection === "settings" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
                  <Settings className="w-5 h-5 mr-2 text-pink-500" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className={`font-medium mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
                      Modifier le code d'accès
                    </h3>
                    {!showCodeChange ? (
                      <Button
                        onClick={() => setShowCodeChange(true)}
                        variant="outline"
                        className={isMobile ? 'w-full' : ''}
                      >
                        Changer le code
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="password"
                          value={oldCode}
                          onChange={(e) => setOldCode(e.target.value)}
                          placeholder="Ancien code"
                          className="border-pink-200 focus:border-pink-500"
                        />
                        <Input
                          type="password"
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                          placeholder="Nouveau code"
                          className="border-pink-200 focus:border-pink-500"
                        />
                        <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                          <Button
                            disabled={!oldCode.trim() || !newCode.trim()}
                            className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowCodeChange(false);
                              setOldCode("");
                              setNewCode("");
                            }}
                            className={isMobile ? 'w-full' : ''}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Autres sections avec layout mobile adapté */}
          {["partner-answers", "reminders", "timeline"].includes(activeSection) && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
                  <Heart className="w-5 h-5 mr-2 text-pink-500" />
                  {activeSection === "partner-answers" && "Réponses du partenaire"}
                  {activeSection === "reminders" && "Rappels importants"}
                  {activeSection === "timeline" && "Notre histoire"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Section en cours de développement</p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Modal de visualisation d'image */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <div className="flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;