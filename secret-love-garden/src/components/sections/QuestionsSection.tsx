import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send, Heart, Calendar, User, Loader2, CheckCircle, Clock, BookOpen, Lightbulb } from "lucide-react";
import questionService from "@/services/questions.service";

interface QuestionsSectionProps {
  currentUser: string;
  partenaire: {
    _id: string;
    nom: string;
    // Ajoutez d'autres propriétés si nécessaire
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
  question: Question;
  texte: string;
  dateReponse: string;
}

const QuestionsSection = ({ currentUser, partenaire, isMobile, toast }: QuestionsSectionProps) => {
  const [questionDuJour, setQuestionDuJour] = useState<Question | null>(null);
  const [reponseUtilisateur, setReponseUtilisateur] = useState<string>("");
  const [mesReponses, setMesReponses] = useState<Reponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reponseExistante, setReponseExistante] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'question' | 'historique'>('question');

  useEffect(() => {
    loadQuestionDuJour();
    loadMesReponses();
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

  const loadMesReponses = async () => {
    try {
      // On récupère l'ID utilisateur depuis le localStorage ou un store
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        const response = await questionService.getReponsesUtilisateur(user.id);
        setMesReponses(response.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error);
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
      loadMesReponses(); // Recharger l'historique
      
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
              <p className="text-3xl font-bold">{mesReponses.length}</p>
              <p className="text-purple-100 text-sm">réponse{mesReponses.length > 1 ? 's' : ''}</p>
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
          <BookOpen className="w-4 h-4 mr-2" />
          Mes réponses
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

      {/* Historique des réponses */}
      {activeTab === 'historique' && (
        <div className="space-y-4">
          {mesReponses.length === 0 ? (
            <Card className="border-pink-200">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-10 h-10 text-pink-500" />
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
              <div className="text-sm text-gray-600 mb-4">
                {mesReponses.length} réponse{mesReponses.length > 1 ? 's' : ''} • Triées par date
              </div>
              
              <div className="space-y-4">
                {mesReponses.map((reponse) => (
                  <Card key={reponse._id} className="border-pink-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 pr-4 leading-relaxed">
                            {reponse.question.texte}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatDateTime(reponse.dateReponse)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-300">
                          <p className="text-gray-700 leading-relaxed">
                            {reponse.texte}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                          {reponse.question.categorie}
                        </span>
                        <div className="flex items-center">
                          <Heart className="w-3 h-3 mr-1 text-pink-400" />
                          <span>Répondu par vous</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionsSection;