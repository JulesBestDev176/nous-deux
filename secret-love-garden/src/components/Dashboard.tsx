import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Heart, Camera, MessageCircle, Calendar, Settings, LogOut, Send, Loader2, CheckCircle, Bell, Plus, Trash2, Edit, X, ChevronLeft, ChevronRight } from "lucide-react";
import Logo from "./Logo";
import { useToast } from "@/components/ui/use-toast";
import gallerieService from "@/services/gallerie.service";
import questionService from "@/services/questions.service";
import userService from "@/services/user.service";
import histoireService from "@/services/histoire.service";
import rappelService from "@/services/rappel.service";

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

interface Image {
  id: string;
  filename: string;
  url: string;
  createdAt: string;
}

interface HistoryEntry {
  _id: string;
  type: string;
  message: string;
  dateCreation: string;
  partenaire: {
    _id: string;
    nom: string;
  };
  photo?: {
    _id: string;
    url: string;
    legende?: string;
  };
  question?: {
    _id: string;
    texte: string;
  };
  reponse?: {
    _id: string;
    texte: string;
    dateReponse: string;
  };
}

interface Question {
  _id: string;
  texte: string;
  createur?: {
    _id: string;
    nom: string;
  };
  dateCreation?: string;
}

interface Reponse {
  _id: string;
  question: string;
  texte: string;
  dateReponse: string;
}

interface ReponseAvecQuestion {
  _id: string;
  question: {
    _id: string;
    texte: string;
  };
  texte: string;
  dateReponse: string;
}

interface Partenaire {
  _id: string;
  nom: string;
}

interface Rappel {
  _id: string;
  titre: string;
  description?: string;
  contenu: string;
  type: string;
  images: Array<{
    url: string;
    legende?: string;
  }>;
  dateRappel: string;
  priorite: string;
  statut: string;
  createur: {
    _id: string;
    nom: string;
  };
  partenaire: {
    _id: string;
    nom: string;
  };
  dateCreation: string;
}

// Composant pour afficher une question personnalisée
const QuestionPersonnalisee = ({ question, onReponseSubmit, currentUser }: { 
  question: Question; 
  onReponseSubmit: () => void;
  currentUser: string;
}) => {
  const [reponse, setReponse] = useState("");
  const [reponseExistante, setReponseExistante] = useState<Reponse | null>(null);
  const [showAnswerField, setShowAnswerField] = useState(false);
  const [loadingReponse, setLoadingReponse] = useState(false);
  const { toast } = useToast();

  // Charger la réponse existante
  useEffect(() => {
    const chargerReponse = async () => {
      try {
        const reponseData = await questionService.getReponseUtilisateur(question._id);
        if (reponseData && reponseData.data) {
          setReponseExistante(reponseData.data);
        }
      } catch (error) {
        // Pas de réponse existante, c'est normal
        setReponseExistante(null);
      }
    };
    chargerReponse();
  }, [question._id]);

  const handleSubmitReponse = async () => {
    if (!reponse.trim()) return;

    setLoadingReponse(true);
    try {
      await questionService.soumettreReponse({
        questionId: question._id,
        texte: reponse,
      });
      setReponse("");
      setShowAnswerField(false);
      
      // Mettre à jour la réponse existante
      setReponseExistante({
        _id: "temp",
        question: question._id,
        texte: reponse,
        dateReponse: new Date().toISOString()
      });
      
      // Notifier le parent pour recharger
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

  // Vérifier si l'utilisateur actuel est le créateur de la question
  const isCreator = question.createur?.nom === currentUser || 
                   (typeof question.createur === 'string' && question.createur === currentUser) ||
                   (question.createur && question.createur._id && question.createur.nom === currentUser);
  
  // Debug: afficher les valeurs pour vérifier
  console.log('Debug question personnalisée:', {
    questionCreateur: question.createur,
    questionCreateurNom: question.createur?.nom,
    currentUser: currentUser,
    isCreator: isCreator,
    questionTexte: question.texte
  });

  return (
    <div className="bg-white p-4 rounded-lg border border-pink-200">
      <div className="mb-3">
        <h3 className="font-medium text-gray-800 mb-2">{question.texte}</h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Créée le {question.dateCreation ? new Date(question.dateCreation).toLocaleDateString() : ''}</span>
          <span className={`px-2 py-1 rounded-full ${
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
              <p className="text-blue-700 text-xs mt-1">
                Votre partenaire pourra répondre à cette question
              </p>
            </div>
          ) : (
            <>
              {!showAnswerField ? (
                <Button
                  onClick={() => setShowAnswerField(true)}
                  className="bg-pink-500 hover:bg-pink-600 text-sm"
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
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSubmitReponse}
                      disabled={!reponse.trim() || loadingReponse}
                      className="bg-pink-500 hover:bg-pink-600 text-sm"
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
                      className="text-sm"
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
  const [images, setImages] = useState<Image[]>([]);
  const [uploading, setUploading] = useState(false);
  const [questionDuJour, setQuestionDuJour] = useState<Question | null>(null);
  const [reponseExistante, setReponseExistante] = useState<Reponse | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [loadingReponse, setLoadingReponse] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [partenaire, setPartenaire] = useState<Partenaire | null>(null);
  const [reponsesPartenaire, setReponsesPartenaire] = useState<ReponseAvecQuestion[]>([]);
  const [loadingPartenaire, setLoadingPartenaire] = useState(false);
  const [rappel, setRappel] = useState<Rappel[]>([]);
  const [loadingRappel, setLoadingRappel] = useState(false);
  const [showRappelForm, setShowRappelForm] = useState(false);
  const [rappelForm, setRappelForm] = useState({
    titre: '',
    description: '',
    contenu: '',
    dateRappel: '',
    priorite: 'normale',
    type: 'texte',
    images: [] as File[]
  });
  const [showCustomQuestionForm, setShowCustomQuestionForm] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [questionsPersonnalisees, setQuestionsPersonnalisees] = useState<Question[]>([]);
  const [loadingQuestionsPerso, setLoadingQuestionsPerso] = useState(false);
  const { toast } = useToast();

  // Vérifier que l'utilisateur est connecté
  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Session expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      onLogout();
    }
  }, [currentUser, onLogout, toast]);

  const menuItems = [
    { id: "gallery", label: "Galerie d'amour", icon: Camera },
    { id: "questions", label: "Questions couple", icon: MessageCircle },
    { id: "custom-questions", label: "Questions personnalisées", icon: Edit },
    { id: "partner-answers", label: "Réponses du partenaire", icon: Heart },
    { id: "reminders", label: "Rappels importants", icon: Bell },
    { id: "timeline", label: "Notre histoire", icon: Calendar },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        if (activeSection === "gallery") {
          const galleryData = await gallerieService.getImages();
          if (galleryData && galleryData.data) {
            setImages(galleryData.data);
          } else {
            setImages([]);
          }
        } else if (activeSection === "questions") {
          setLoadingQuestion(true);
          setLoadingReponse(true);
          
          const questionData = await questionService.getQuestionDuJour();
          if (questionData && questionData.data) {
            setQuestionDuJour(questionData.data);
            
            // Vérifier si l'utilisateur a déjà répondu à cette question
            try {
              const reponseData = await questionService.getReponseUtilisateur(questionData.data._id);
              if (reponseData && reponseData.data) {
                setReponseExistante(reponseData.data);
              }
            } catch (error) {
              // Pas de réponse existante, c'est normal
              setReponseExistante(null);
            }
          } else {
            setQuestionDuJour(null);
            setReponseExistante(null);
          }
          
          setLoadingQuestion(false);
          setLoadingReponse(false);
        } else if (activeSection === "partner-answers") {
          setLoadingPartenaire(true);
          
          try {
            // Récupérer les informations du partenaire
            const partenaireData = await userService.getPartenaire();
            if (partenaireData && partenaireData.data) {
              setPartenaire(partenaireData.data);
              
              // Récupérer les réponses du partenaire
              const reponsesData = await questionService.getReponsesUtilisateur(partenaireData.data._id);
              if (reponsesData && reponsesData.data) {
                setReponsesPartenaire(reponsesData.data);
              }
            }
          } catch (error) {
            toast({
              title: "Erreur",
              description: "Impossible de charger les données du partenaire",
              variant: "destructive",
            });
          }
          
          setLoadingPartenaire(false);
        } else if (activeSection === "reminders") {
          setLoadingRappel(true);
          
          try {
            const rappelsData = await rappelService.getRappels();
            if (rappelsData && rappelsData.data) {
              setRappel(rappelsData.data);
            }
          } catch (error) {
            toast({
              title: "Erreur",
              description: "Impossible de charger les rappels",
              variant: "destructive",
            });
          }
          
          setLoadingRappel(false);
        } else if (activeSection === "timeline") {
          setLoadingHistory(true);
          const historyData = await histoireService.getHistorique();
          if (historyData && historyData.data) {
            setHistoryEntries(historyData.data);
          } else {
            setHistoryEntries([]);
          }
          setLoadingHistory(false);
        } else if (activeSection === "custom-questions") {
          setLoadingQuestionsPerso(true);
          
          try {
            const questionsData = await questionService.getQuestionsPersonnalisees();
            if (questionsData && questionsData.data) {
              setQuestionsPersonnalisees(questionsData.data);
            }
          } catch (error) {
            toast({
              title: "Erreur",
              description: "Impossible de charger les questions personnalisées",
              variant: "destructive",
            });
          }
          
          setLoadingQuestionsPerso(false);
        }
      } catch (error) {
        // Vérifier si c'est une erreur d'authentification
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof error === 'object' && error && 'response' in error && (error as any).response.status === 401) {
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
          onLogout();
          return;
        }
        
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
        setLoadingQuestion(false);
        setLoadingReponse(false);
        setLoadingPartenaire(false);
      }
    };

    // Ne charger les données que si l'utilisateur est connecté
    if (currentUser) {
      loadData();
    }
  }, [activeSection, toast, currentUser, onLogout]);

  // Si pas d'utilisateur, ne pas afficher le dashboard
  if (!currentUser) {
    return null;
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      await gallerieService.uploadImage(files[0]);
      const updatedGallery = await gallerieService.getImages();
      if (updatedGallery && updatedGallery.data) {
        setImages(updatedGallery.data);
      }
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

    try {
      await questionService.soumettreReponse({
        questionId: questionDuJour._id,
        texte: answer,
      });
      setAnswer("");
      setShowAnswerField(false);
      
      // Mettre à jour la réponse existante
      setReponseExistante({
        _id: "temp",
        question: questionDuJour._id,
        texte: answer,
        dateReponse: new Date().toISOString()
      });
      
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
    }
  };

  const handleGenerateHistory = async () => {
    try {
      setLoadingHistory(true);
      await histoireService.genererHistoire();
      const updatedHistory = await histoireService.getHistorique();
      if (updatedHistory && updatedHistory.data) {
        setHistoryEntries(updatedHistory.data);
      }
      toast({
        title: "Succès",
        description: "Nouvelle entrée d'histoire générée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer l'histoire",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCodeChange = async () => {
    if (!oldCode.trim() || !newCode.trim()) return;

    try {
      await userService.modifierCode(oldCode, newCode);
      setOldCode("");
      setNewCode("");
      setShowCodeChange(false);
      toast({
        title: "Succès",
        description: "Code modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la modification du code",
        variant: "destructive",
      });
    }
  };

  const handleCreateRappel = async () => {
    if (!rappelForm.titre.trim() || !rappelForm.contenu.trim() || !rappelForm.dateRappel) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await rappelService.creerRappel(rappelForm);
      setRappelForm({
        titre: '',
        description: '',
        contenu: '',
        dateRappel: '',
        priorite: 'normale',
        type: 'texte',
        images: []
      });
      setShowRappelForm(false);
      
      // Recharger les rappels
      const rappelsData = await rappelService.getRappels();
      if (rappelsData && rappelsData.data) {
        setRappel(rappelsData.data);
      }
      
      toast({
        title: "Succès",
        description: "Rappel créé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le rappel",
        variant: "destructive",
      });
    }
  };

  const handleCreateCustomQuestion = async () => {
    if (!customQuestion.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une question",
        variant: "destructive",
      });
      return;
    }

    try {
      await questionService.ajouterQuestion({ texte: customQuestion });
      setCustomQuestion('');
      setShowCustomQuestionForm(false);
      
      // Recharger les questions personnalisées
      await chargerQuestionsPersonnalisees();
      
      toast({
        title: "Succès",
        description: "Question ajoutée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la question",
        variant: "destructive",
      });
    }
  };

  const chargerQuestionsPersonnalisees = async () => {
    setLoadingQuestionsPerso(true);
    try {
      const questionsData = await questionService.getQuestionsPersonnalisees();
      if (questionsData && questionsData.data) {
        setQuestionsPersonnalisees(questionsData.data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les questions personnalisées",
        variant: "destructive",
      });
    } finally {
      setLoadingQuestionsPerso(false);
    }
  };

  const handleModifierStatutRappel = async (rappelId: string, nouveauStatut: string) => {
    try {
      await rappelService.modifierStatutRappel(rappelId, nouveauStatut);
      
      // Mettre à jour l'état local
      setRappel(prev => prev.map(r => 
        r._id === rappelId ? { ...r, statut: nouveauStatut } : r
      ));
      
      toast({
        title: "Succès",
        description: "Statut modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleSupprimerRappel = async (rappelId: string) => {
    try {
      await rappelService.supprimerRappel(rappelId);
      
      // Mettre à jour l'état local
      setRappel(prev => prev.filter(r => r._id !== rappelId));
      
      toast({
        title: "Succès",
        description: "Rappel supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rappel",
        variant: "destructive",
      });
    }
  };

  const handleImageClick = (image: Image, index: number) => {
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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showImageModal) {
      if (e.key === 'Escape') {
        handleCloseModal();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePreviousImage();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal, currentImageIndex, images]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-rose-100">
      <header className="bg-white shadow-sm border-b border-pink-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Nous Deux</h1>
              <p className="text-sm text-gray-600">Bienvenue {currentUser} 💕</p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 flex gap-6">
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

        <main className="flex-1">
          {/* Section Galerie */}
          {activeSection === "gallery" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-pink-500" />
                  Notre galerie d'amour
                </CardTitle>
              </CardHeader>
              <CardContent>
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ajouter une photo
                  </label>
                  <div className="flex items-center space-x-2">
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
                      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 flex items-center space-x-2"
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
                <CardTitle className="flex items-center">
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
                      <p className="text-lg font-medium text-gray-800">
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
                            className="bg-pink-500 hover:bg-pink-600"
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
                            <div className="flex space-x-2">
                              <Button
                                onClick={handleSubmitAnswer}
                                disabled={!answer.trim()}
                                className="bg-pink-500 hover:bg-pink-600"
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Edit className="w-5 h-5 mr-2 text-pink-500" />
                    Questions personnalisées
                  </div>
                  <Button
                    onClick={() => setShowCustomQuestionForm(true)}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une question
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showCustomQuestionForm && (
                  <div className="bg-white p-4 rounded-lg border border-pink-200 mb-4">
                    <h3 className="font-medium mb-3">Nouvelle question</h3>
                    <Textarea
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Posez votre question..."
                      rows={3}
                      className="mb-3 border-pink-200 focus:border-pink-500"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleCreateCustomQuestion}
                        disabled={!customQuestion.trim()}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        Créer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCustomQuestionForm(false);
                          setCustomQuestion('');
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {loadingQuestionsPerso ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : questionsPersonnalisees.length > 0 ? (
                  <div className="space-y-4">
                    {questionsPersonnalisees.map((question) => (
                      <QuestionPersonnalisee 
                        key={question._id} 
                        question={question} 
                        onReponseSubmit={chargerQuestionsPersonnalisees}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune question personnalisée créée</p>
                    <p className="text-sm mt-2">Créez votre première question pour commencer</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section Réponses du Partenaire */}
          {activeSection === "partner-answers" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-500" />
                  Réponses de {partenaire?.nom || 'votre partenaire'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPartenaire ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : reponsesPartenaire.length > 0 ? (
                  <div className="space-y-4">
                    {reponsesPartenaire.map((reponse) => (
                      <div key={reponse._id} className="bg-white p-4 rounded-lg border border-pink-200">
                        <div className="mb-2">
                          <p className="font-medium text-gray-800">{reponse.question.texte}</p>
                        </div>
                        <div className="bg-pink-50 p-3 rounded border-l-4 border-pink-300">
                          <p className="text-gray-700">{reponse.texte}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Répondu le {new Date(reponse.dateReponse).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune réponse disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section Rappels */}
          {activeSection === "reminders" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-pink-500" />
                    Rappels importants
                  </div>
                  <Button
                    onClick={() => setShowRappelForm(true)}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau rappel
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showRappelForm && (
                  <div className="bg-white p-4 rounded-lg border border-pink-200 mb-6">
                    <h3 className="font-medium mb-3">Nouveau rappel</h3>
                    <div className="space-y-3">
                      <Input
                        value={rappelForm.titre}
                        onChange={(e) => setRappelForm({...rappelForm, titre: e.target.value})}
                        placeholder="Titre du rappel"
                        className="border-pink-200 focus:border-pink-500"
                      />
                      <Textarea
                        value={rappelForm.description}
                        onChange={(e) => setRappelForm({...rappelForm, description: e.target.value})}
                        placeholder="Description (optionnel)"
                        rows={2}
                        className="border-pink-200 focus:border-pink-500"
                      />
                      <Textarea
                        value={rappelForm.contenu}
                        onChange={(e) => setRappelForm({...rappelForm, contenu: e.target.value})}
                        placeholder="Contenu du rappel"
                        rows={3}
                        className="border-pink-200 focus:border-pink-500"
                      />
                      <Input
                        type="datetime-local"
                        value={rappelForm.dateRappel}
                        onChange={(e) => setRappelForm({...rappelForm, dateRappel: e.target.value})}
                        className="border-pink-200 focus:border-pink-500"
                      />
                      <select
                        value={rappelForm.priorite}
                        onChange={(e) => setRappelForm({...rappelForm, priorite: e.target.value})}
                        className="w-full p-2 border border-pink-200 rounded-md focus:border-pink-500"
                      >
                        <option value="normale">Priorité normale</option>
                        <option value="importante">Priorité importante</option>
                        <option value="urgente">Priorité urgente</option>
                      </select>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button
                        onClick={handleCreateRappel}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        Créer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowRappelForm(false)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {loadingRappel ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : rappel.length > 0 ? (
                  <div className="space-y-4">
                    {rappel.map((r) => (
                      <div key={r._id} className="bg-white p-4 rounded-lg border border-pink-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-800">{r.titre}</h3>
                            {r.description && (
                              <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              r.priorite === 'urgente' ? 'bg-red-100 text-red-800' :
                              r.priorite === 'importante' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {r.priorite}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              r.statut === 'termine' ? 'bg-green-100 text-green-800' :
                              r.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.statut}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{r.contenu}</p>
                        
                        {/* Affichage des images du rappel */}
                        {r.images && r.images.length > 0 && (
                          <div className="mb-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {r.images.map((image, index) => (
                                <div key={index} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                                  <img
                                    src={image.url}
                                    alt={image.legende || `Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  {image.legende && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                                      {image.legende}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Pour le {new Date(r.dateRappel).toLocaleDateString()}</span>
                          <span>Par {r.createur.nom}</span>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <select
                            value={r.statut}
                            onChange={(e) => handleModifierStatutRappel(r._id, e.target.value)}
                            className="text-xs p-1 border border-gray-300 rounded"
                          >
                            <option value="a_faire">À faire</option>
                            <option value="en_cours">En cours</option>
                            <option value="termine">Terminé</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSupprimerRappel(r._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun rappel créé</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section Timeline */}
          {activeSection === "timeline" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-pink-500" />
                    Notre histoire
                  </div>
                  <Button
                    onClick={handleGenerateHistory}
                    disabled={loadingHistory}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    {loadingHistory ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span className="ml-2">Générer une entrée</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : historyEntries.length > 0 ? (
                  <div className="space-y-4">
                    {historyEntries.map((entry) => (
                      <div key={entry._id} className="bg-white p-4 rounded-lg border border-pink-200">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 bg-pink-500 rounded-full mt-2"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-800">
                                {entry.type === 'question' ? 'Question répondue' : 
                                 entry.type === 'photo' ? 'Photo ajoutée' : 'Moment partagé'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(entry.dateCreation).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{entry.message}</p>
                            {entry.photo && (
                              <div className="mt-3">
                                <div className="relative w-32 h-32 overflow-hidden rounded-lg">
                                  <img
                                    src={entry.photo.url}
                                    alt={entry.photo.legende || 'Photo'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {entry.photo.legende && (
                                  <p className="text-sm text-gray-600 mt-1">{entry.photo.legende}</p>
                                )}
                              </div>
                            )}
                            {entry.question && entry.reponse && (
                              <div className="mt-3 bg-pink-50 p-3 rounded">
                                <p className="font-medium text-sm text-gray-800 mb-1">
                                  {entry.question.texte}
                                </p>
                                <p className="text-sm text-gray-700">{entry.reponse.texte}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune entrée d'histoire</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Section Paramètres */}
          {activeSection === "settings" && (
            <Card className="shadow-sm border border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-pink-500" />
                  Paramètres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Modifier le code d'accès</h3>
                    {!showCodeChange ? (
                      <Button
                        onClick={() => setShowCodeChange(true)}
                        variant="outline"
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
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleCodeChange}
                            disabled={!oldCode.trim() || !newCode.trim()}
                            className="bg-pink-500 hover:bg-pink-600"
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
        </main>
      </div>

      {/* Modal de visualisation d'image */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Bouton fermer */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Boutons navigation */}
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

            {/* Image */}
            <div className="flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Indicateur de position */}
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