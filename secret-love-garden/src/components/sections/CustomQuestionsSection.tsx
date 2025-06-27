import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Send, CheckCircle, MessageCircle, Loader2, Trash2, Calendar } from "lucide-react";
import questionService from "@/services/questions.service";

const QuestionPersonnalisee = ({ question, onReponseSubmit, currentUser, isMobile, onDelete, decrementCustomQuestionsNotification }) => {
  const [reponse, setReponse] = useState("");
  const [reponseExistante, setReponseExistante] = useState(null);
  const [showAnswerField, setShowAnswerField] = useState(false);
  const [loadingReponse, setLoadingReponse] = useState(false);

  useEffect(() => {
    // Vérifier si une réponse existe déjà
    if (question.reponses && question.reponses.length > 0) {
      const currentUserId = typeof currentUser === 'object' ? currentUser._id : currentUser;
      const maReponse = question.reponses.find(r => r.utilisateur?._id === currentUserId);
      if (maReponse) {
        setReponseExistante(maReponse);
      }
    }
  }, [question, currentUser]);

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
      
      // Décrémenter la notification de questions personnalisées
      if (decrementCustomQuestionsNotification) {
        decrementCustomQuestionsNotification();
      }
      
      onReponseSubmit();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setLoadingReponse(false);
    }
  };

  const isCreator = question.createur?._id === (typeof currentUser === 'object' ? currentUser._id : currentUser);
  const currentUserId = typeof currentUser === 'object' ? currentUser._id : currentUser;

  // Trouver la réponse du partenaire (pas du créateur)
  const reponsePartenaire = question.reponses?.find(r => r.utilisateur?._id !== currentUserId);

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg border border-pink-200">
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-medium text-gray-800 flex-1 ${isMobile ? 'text-sm' : ''}`}>
            {question.texte}
          </h3>
          {isCreator && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question._id)}
              className="text-red-600 hover:text-red-700 ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className={`flex items-center justify-between text-xs text-gray-500 ${isMobile ? 'flex-col items-start gap-1' : ''}`}>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            Créée le {new Date(question.dateCreation).toLocaleDateString()}
          </span>
          {question.createur?.nom && (
          <span className={`px-2 py-1 rounded-full text-xs ${
            isCreator ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
              {isCreator
                ? 'Votre question'
                : 'Question de votre partenaire'}
          </span>
          )}
        </div>
      </div>

      {/* Si je suis le créateur, je ne peux pas répondre mais je peux voir la réponse du partenaire */}
      {isCreator ? (
        <div className="space-y-3">
          {reponsePartenaire ? (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800 text-sm">
                  Réponse de votre partenaire
                </span>
              </div>
              <p className="text-purple-700 text-sm">{reponsePartenaire.texte}</p>
              <p className="text-xs text-purple-600 mt-1">
                Répondu le {new Date(reponsePartenaire.dateReponse).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 text-sm font-medium">
                  En attente de la réponse de votre partenaire
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Si je ne suis pas le créateur, je peux répondre */
        <div className="space-y-3">
          {reponseExistante ? (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800 text-sm">Votre réponse</span>
              </div>
              <p className="text-green-700 text-sm">{reponseExistante.texte}</p>
              <p className="text-xs text-green-600 mt-1">
                Répondu le {new Date(reponseExistante.dateReponse).toLocaleDateString()}
              </p>
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

const CustomQuestionsSection = ({ currentUser, partenaire, isMobile, toast, decrementCustomQuestionsNotification }) => {
  const [questionsPersonnalisees, setQuestionsPersonnalisees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nouvelleQuestion, setNouvelleQuestion] = useState("");
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  useEffect(() => {
    fetchQuestionsPersonnalisees();
  }, []);

  const fetchQuestionsPersonnalisees = async () => {
    try {
      const res = await questionService.getQuestionsPersonnaliseesAvecReponses();
      setQuestionsPersonnalisees(res.data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les questions personnalisées",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!nouvelleQuestion.trim() || nouvelleQuestion.trim().length < 5) {
      toast({
        title: "Question trop courte",
        description: "La question doit contenir au moins 5 caractères.",
        variant: "destructive",
      });
      return;
    }
    setCreatingQuestion(true);
    try {
      await questionService.ajouterQuestion({ texte: nouvelleQuestion });
      setNouvelleQuestion("");
      setShowCreateForm(false);
      toast({
        title: "Question ajoutée !",
        description: "Votre question personnalisée a été créée.",
      });
      fetchQuestionsPersonnalisees();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la question",
        variant: "destructive",
      });
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      try {
        await questionService.supprimerQuestion(questionId);
        toast({
          title: "Question supprimée",
          description: "La question a été supprimée avec succès",
        });
        fetchQuestionsPersonnalisees();
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la question",
          variant: "destructive",
        });
      }
    }
  };

  const handleReponseSubmit = () => {
    // Recharger les questions pour mettre à jour les réponses
    fetchQuestionsPersonnalisees();
  };

  if (loading) {
    return (
      <Card className="shadow-sm border border-pink-200">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-pink-200">
      <CardHeader>
        <CardTitle className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
          <div className="flex items-center">
            <Edit className="w-5 h-5 mr-2 text-pink-500" />
            <span className={isMobile ? 'text-lg' : ''}>Questions personnalisées</span>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une question
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistiques rapides */}
        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {questionsPersonnalisees.length}
            </div>
            <div className="text-sm text-blue-600">Questions total</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {questionsPersonnalisees.filter(q => q.createur?.nom === currentUser).length}
            </div>
            <div className="text-sm text-green-600">Vos questions</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {questionsPersonnalisees.filter(q => 
                q.reponses && q.reponses.some(r => r.utilisateur?.nom === currentUser)
              ).length}
            </div>
            <div className="text-sm text-purple-600">Répondues</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {questionsPersonnalisees.filter(q => 
                q.createur?.nom !== currentUser && 
                (!q.reponses || !q.reponses.some(r => r.utilisateur?.nom === currentUser))
              ).length}
            </div>
            <div className="text-sm text-yellow-600">En attente</div>
          </div>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium mb-4 text-blue-800">Créer une nouvelle question</h3>
            <div className="space-y-3">
              <Textarea
                value={nouvelleQuestion}
                onChange={(e) => setNouvelleQuestion(e.target.value)}
                placeholder="Quelle question aimeriez-vous poser à votre partenaire ?"
                rows={3}
                className="border-blue-200 focus:border-blue-500"
                disabled={creatingQuestion}
              />
              <div className="text-sm text-blue-600">
                💡 Exemples : "Quel est ton rêve le plus fou ?", "Qu'est-ce qui te rend le plus heureux/heureuse ?"
              </div>
              <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                <Button
                  onClick={handleCreateQuestion}
                  disabled={!nouvelleQuestion.trim() || creatingQuestion}
                  className={`bg-blue-500 hover:bg-blue-600 ${isMobile ? 'w-full' : ''}`}
                >
                  {creatingQuestion ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Créer la question
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNouvelleQuestion("");
                  }}
                  disabled={creatingQuestion}
                  className={isMobile ? 'w-full' : ''}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des questions */}
        {questionsPersonnalisees.filter(q => q.categorie === 'utilisateur').length > 0 ? (
          <div className="space-y-4">
            {questionsPersonnalisees.filter(q => q.categorie === 'utilisateur').map((question) => (
              <QuestionPersonnalisee 
                key={question._id} 
                question={question} 
                onReponseSubmit={handleReponseSubmit}
                currentUser={currentUser}
                isMobile={isMobile}
                onDelete={handleDeleteQuestion}
                decrementCustomQuestionsNotification={decrementCustomQuestionsNotification}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune question personnalisée créée</p>
            <p className="text-sm mt-2">Commencez par créer votre première question !</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomQuestionsSection;