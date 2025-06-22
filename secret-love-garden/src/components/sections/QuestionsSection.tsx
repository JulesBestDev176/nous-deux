import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send, Heart, Calendar, User, Loader2, CheckCircle, Clock, BookOpen, Lightbulb, Users, Eye, EyeOff, AlertCircle } from "lucide-react";
import questionService from "@/services/questions.service";

interface QuestionsSectionProps {
  currentUser: string;
  partenaire: {
    _id: string;
    nom: string;
  };
  isMobile: boolean;
  toast: (options: { title: string; description?: string; variant?: string }) => void;
  onLogout: () => void;
}

interface Question {
  _id: string;
  texte: string;
  categorie: string;
  createur?: {
    _id: string;
    nom: string;
  };
  dateCreation: string;
  dateProgrammation?: string;
}

interface Reponse {
  _id: string;
  question?: Question;
  texte: string;
  dateReponse: string;
  utilisateur: {
    _id: string;
    nom: string;
  };
}

interface QuestionAvecReponses {
  question: Question;
  maReponse?: Reponse;
  reponsePartenaire?: Reponse;
}

const QuestionsSection = ({ currentUser, partenaire, isMobile, toast }: QuestionsSectionProps) => {
  const [questionDuJour, setQuestionDuJour] = useState<Question | null>(null);
  const [reponseUtilisateur, setReponseUtilisateur] = useState<string>("");
  const [questionsAvecReponses, setQuestionsAvecReponses] = useState<QuestionAvecReponses[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reponseExistante, setReponseExistante] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'question' | 'historique'>('question');
  const [reponsesVisibles, setReponsesVisibles] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    // Récupérer l'ID de l'utilisateur actuel
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      setCurrentUserId(user.id);
    }
    
    loadQuestionDuJour();
    loadQuestionsAvecReponses();
  }, []);

  const loadQuestionDuJour = async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestionDuJour();
      setQuestionDuJour(response.data);
      
      // Vérifier si l'utilisateur a déjà répondu
      if (response.data?._id) {
        try {
          const reponseResponse = await questionService.getReponseUtilisateur(response.data._id);
          setReponseExistante(reponseResponse.data.texte);
        } catch (error) {
          // Pas de réponse existante, c'est normal
          setReponseExistante("");
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la question:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la question du jour",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsAvecReponses = async () => {
    try {
      console.log('🔄 Chargement des questions avec réponses du couple...');
      
      // Récupérer toutes les questions qui ont au moins une réponse du couple
      const response = await questionService.getQuestionsAvecReponsesCouple();
      
      console.log('📥 Réponse API reçue:', response);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('⚠️ Format de réponse inattendu:', response);
        setQuestionsAvecReponses([]);
        return;
      }

      // Récupérer l'ID de l'utilisateur actuel
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const monId = user.id;
      
      console.log('👤 Mon ID utilisateur:', monId);
      console.log('👥 ID partenaire:', partenaire?._id);

      // Organiser les données par question avec les réponses de chaque partenaire
      const questionsOrganisees: QuestionAvecReponses[] = response.data.map((item: { question: Question; reponses: Reponse[] }) => {
        console.log('🔍 Traitement question:', {
          questionId: item.question._id,
          questionTexte: item.question.texte.substring(0, 50) + '...',
          nombreReponses: item.reponses?.length || 0,
          reponses: item.reponses?.map((r: Reponse) => ({
            utilisateurId: r.utilisateur._id,
            utilisateurNom: r.utilisateur.nom,
            estMoi: r.utilisateur._id === monId,
            estPartenaire: r.utilisateur._id === partenaire?._id
          }))
        });

        // Trouver ma réponse et celle de mon partenaire par ID (plus fiable que le nom)
        const maReponse = item.reponses?.find((r: Reponse) => r.utilisateur._id === monId);
        const reponsePartenaire = item.reponses?.find((r: Reponse) => r.utilisateur._id === partenaire?._id);

        console.log('📝 Réponses trouvées:', {
          questionId: item.question._id,
          aiMaReponse: !!maReponse,
          aReponsePartenaire: !!reponsePartenaire,
          maReponseTexte: maReponse?.texte?.substring(0, 30) + '...' || 'N/A',
          reponsePartenaireTexte: reponsePartenaire?.texte?.substring(0, 30) + '...' || 'N/A'
        });

        return {
          question: item.question,
          maReponse,
          reponsePartenaire
        };
      });
      
      console.log(`✅ ${questionsOrganisees.length} questions organisées pour affichage`);
      setQuestionsAvecReponses(questionsOrganisees);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des réponses du couple:', error);
      
      // Fallback: charger seulement mes réponses
      try {
        console.log('🔄 Tentative de fallback vers mes réponses uniquement...');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          const response = await questionService.getReponsesUtilisateur(user.id);
          const mesReponses = response.data || [];
          const questionsSimples = mesReponses.map((reponse: Reponse) => ({
            question: reponse.question!,
            maReponse: reponse,
            reponsePartenaire: undefined
          }));
          setQuestionsAvecReponses(questionsSimples);
          console.log(`📋 Fallback réussi: ${questionsSimples.length} questions avec mes réponses`);
        }
      } catch (fallbackError) {
        console.error('❌ Erreur lors du fallback:', fallbackError);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des réponses",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmitReponse = async () => {
    if (!questionDuJour || !reponseUtilisateur.trim()) {
      toast({
        title: "Réponse manquante",
        description: "Veuillez écrire une réponse",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      await questionService.soumettreReponse({
        questionId: questionDuJour._id,
        texte: reponseUtilisateur.trim()
      });

      toast({
        title: "Réponse envoyée !",
        description: "Votre réponse a été enregistrée 💕",
      });

      setReponseExistante(reponseUtilisateur.trim());
      setReponseUtilisateur("");
      
      // Recharger l'historique après un court délai pour laisser le temps au serveur
      setTimeout(() => {
        loadQuestionsAvecReponses();
      }, 500);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      toast({
        title: "Erreur d'envoi",
        description: "Impossible d'envoyer la réponse",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReponseVisibilite = (questionId: string) => {
    setReponsesVisibles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatutQuestion = (questionAvecReponses: QuestionAvecReponses) => {
    const { maReponse, reponsePartenaire } = questionAvecReponses;
    
    if (maReponse && reponsePartenaire) {
      return { 
        statut: 'complete', 
        couleur: 'green', 
        texte: 'Vous avez tous les deux répondu',
        bg: 'bg-green-100',
        text: 'text-green-700'
      };
    } else if (maReponse && !reponsePartenaire) {
      return { 
        statut: 'attente', 
        couleur: 'orange', 
        texte: `En attente de ${partenaire?.nom || 'votre partenaire'}`,
        bg: 'bg-orange-100',
        text: 'text-orange-700'
      };
    } else if (!maReponse && reponsePartenaire) {
      return { 
        statut: 'a_repondre', 
        couleur: 'blue', 
        texte: 'À votre tour de répondre',
        bg: 'bg-blue-100',
        text: 'text-blue-700'
      };
    } else {
      return { 
        statut: 'vide', 
        couleur: 'gray', 
        texte: 'Aucune réponse',
        bg: 'bg-gray-100',
        text: 'text-gray-700'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">
                💭 Questions couple
              </CardTitle>
              <p className="text-purple-100">
                Apprenez à mieux vous connaître
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{questionsAvecReponses.length}</p>
              <p className="text-purple-100 text-sm">question{questionsAvecReponses.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation tabs */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
        <Button
          variant={activeTab === 'question' ? 'default' : 'ghost'}
          className={`flex-1 rounded-lg ${
            activeTab === 'question'
              ? 'bg-pink-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('question')}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Question du jour
        </Button>
        <Button
          variant={activeTab === 'historique' ? 'default' : 'ghost'}
          className={`flex-1 rounded-lg ${
            activeTab === 'historique'
              ? 'bg-pink-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('historique')}
        >
          <Users className="w-4 h-4 mr-2" />
          Nos réponses
        </Button>
      </div>

      {/* Question du jour */}
      {activeTab === 'question' && (
        <div className="space-y-6">
          {questionDuJour ? (
            <Card className="border-pink-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 mb-2">
                      📝 Question du jour
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(questionDuJour.dateCreation)}</span>
                      </div>
                      <div className="flex items-center">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        <span className="capitalize">{questionDuJour.categorie}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="bg-white p-6 rounded-xl border-l-4 border-pink-500">
                    <p className="text-gray-800 text-lg leading-relaxed">
                      {questionDuJour.texte}
                    </p>
                  </div>
                </div>

                {reponseExistante ? (
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Votre réponse</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {reponseExistante}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700">
                      Votre réponse
                    </Label>
                    <Textarea
                      placeholder="Partagez vos pensées sur cette question..."
                      value={reponseUtilisateur}
                      onChange={(e) => setReponseUtilisateur(e.target.value)}
                      className="min-h-[120px] resize-none"
                      rows={5}
                    />
                    <Button
                      onClick={handleSubmitReponse}
                      disabled={!reponseUtilisateur.trim() || submitting}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white h-12 rounded-xl"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {submitting ? "Envoi..." : "Envoyer ma réponse"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-pink-200">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-pink-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune question disponible
                </h3>
                <p className="text-gray-500">
                  Toutes les questions ont été répondues ! Félicitations 🎉
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Historique des réponses du couple */}
      {activeTab === 'historique' && (
        <div className="space-y-4">
          {questionsAvecReponses.length === 0 ? (
            <Card className="border-pink-200">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-pink-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune réponse pour le moment
                </h3>
                <p className="text-gray-500 mb-6">
                  Commencez par répondre à la question du jour !
                </p>
                <Button
                  onClick={() => setActiveTab('question')}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Voir la question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <span>{questionsAvecReponses.length} question{questionsAvecReponses.length > 1 ? 's' : ''} • Triées par date</span>
                {/* Indicateur de debug en mode développement */}
                {process.env.NODE_ENV === 'development' && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    Debug: Mon ID = {currentUserId} | Partenaire ID = {partenaire?._id}
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {questionsAvecReponses.map((questionAvecReponses) => {
                  const { question, maReponse, reponsePartenaire } = questionAvecReponses;
                  const statut = getStatutQuestion(questionAvecReponses);
                  const sontVisibles = reponsesVisibles.has(question._id);
                  
                  return (
                    <Card key={question._id} className="border-pink-100 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900 pr-4 leading-relaxed flex-1">
                              {question.texte}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${statut.bg} ${statut.text}`}>
                                {statut.texte}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReponseVisibilite(question._id)}
                                className="p-2 h-8 w-8"
                                title={sontVisibles ? "Masquer les réponses" : "Afficher les réponses"}
                              >
                                {sontVisibles ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {sontVisibles && (
                            <div className={`space-y-4 ${isMobile ? '' : 'grid grid-cols-2 gap-4'}`}>
                              {/* Ma réponse */}
                              <div className="space-y-2">
                                <div className="flex items-center text-sm font-medium text-gray-700">
                                  <User className="w-4 h-4 mr-1" />
                                  <span>Vous ({currentUser})</span>
                                </div>
                                {maReponse ? (
                                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
                                    <p className="text-gray-700 leading-relaxed mb-2">
                                      {maReponse.texte}
                                    </p>
                                    <div className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatDateTime(maReponse.dateReponse)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200 text-center">
                                    <p className="text-gray-500 text-sm">Pas encore de réponse</p>
                                  </div>
                                )}
                              </div>

                              {/* Réponse du partenaire */}
                              <div className="space-y-2">
                                <div className="flex items-center text-sm font-medium text-gray-700">
                                  <Heart className="w-4 h-4 mr-1 text-pink-500" />
                                  <span>{partenaire?.nom || 'Votre partenaire'}</span>
                                </div>
                                {reponsePartenaire ? (
                                  <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-300">
                                    <p className="text-gray-700 leading-relaxed mb-2">
                                      {reponsePartenaire.texte}
                                    </p>
                                    <div className="text-xs text-gray-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatDateTime(reponsePartenaire.dateReponse)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200 text-center">
                                    <p className="text-gray-500 text-sm">Pas encore de réponse</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                            {question.categorie}
                          </span>
                          <div className="flex items-center space-x-4">
                            <span>
                              {maReponse && reponsePartenaire ? '2/2 réponses' : 
                               maReponse || reponsePartenaire ? '1/2 réponses' : '0/2 réponses'}
                            </span>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{formatDate(question.dateCreation)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionsSection;