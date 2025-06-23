import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Gamepad2, Play, Trophy, Heart, Star, Zap, Camera, CheckCircle, 
  RotateCcw, Timer, Target, BrainCircuit, GitCompareArrows, Users,
  MessageSquare, AlertCircle, Crown, Clock, Eye, ThumbsUp, ThumbsDown,
  ClipboardCheck, User, UserCheck, Lightbulb, Key, Smile
} from "lucide-react";
import jeuService from "@/services/jeu.service";

const jeuxData = {
  jeux: [],
  defis: []
};

const JeuxSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [jeuxDisponibles, setJeuxDisponibles] = useState([]);
  const [historiqueParties, setHistoriqueParties] = useState([]);
  const [defisCouple, setDefisCouple] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jeux');
  const [partieEnCours, setPartieEnCours] = useState(null);
  const [questionActuelle, setQuestionActuelle] = useState(0);
  const [reponseInput, setReponseInput] = useState('');
  const [showDefis, setShowDefis] = useState(false);
  const [defiEnCours, setDefiEnCours] = useState(null);
  const [showQuizSelection, setShowQuizSelection] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const [preuveDefi, setPreuveDefi] = useState({
    commentaire: '',
    images: []
  });
  const [vueCorrection, setVueCorrection] = useState(false);
  const [refreshPartie, setRefreshPartie] = useState(0);

  // Mapping des icônes
  const iconMap = {
    BrainCircuit,
    GitCompareArrows,
    Users,
    Heart,
    MessageSquare,
    Camera,
    Lightbulb,
    Smile,
    Zap,
    Key
  };

  // Services API utilisant le backend
  // const fetchJeuxDisponibles = async () => {
  //   try {
  //     const res = await jeuService.getJeuxDisponibles();
  //     setJeuxDisponibles(res.data || []);
  //   } catch (error) {
  //     console.error('Erreur chargement jeux:', error);
  //     toast({
  //       title: "Erreur",
  //       description: "Impossible de charger les jeux",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchHistoriqueParties = async () => {
  //   try {
  //     const res = await jeuService.getHistoriqueParties();
  //     setHistoriqueParties(res.data || []);
  //   } catch (error) {
  //     console.log("Erreur chargement historique");
  //   }
  // };

  // const fetchDefisCouple = async () => {
  //   try {
  //     const res = await jeuService.getDeffisCouple();
  //     setDefisCouple(res.data || []);
  //   } catch (error) {
  //     console.error('Erreur chargement défis:', error);
  //   }
  // };

  useEffect(() => {
    fetchJeuxDisponibles();
    fetchHistoriqueParties();
    fetchDefisCouple();
  }, []);

  useEffect(() => {
    if (partieEnCours && partieEnCours._id) {
      const interval = setInterval(() => {
        refreshPartieData();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [partieEnCours]);

  useEffect(() => {
    fetchJeuxDisponibles();
    fetchHistoriqueParties();
    fetchDefisCouple();
  }, []);

  useEffect(() => {
    if (partieEnCours && partieEnCours._id) {
      const interval = setInterval(() => {
        refreshPartieData();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [partieEnCours]);

  const fetchJeuxDisponibles = async () => {
    try {
      const res = await jeuService.getJeuxDisponibles();
      setJeuxDisponibles(res.data);
    } catch (error) {
      setJeuxDisponibles(jeuxData.jeux);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoriqueParties = async () => {
    try {
      const res = await jeuService.getHistoriqueParties();
      setHistoriqueParties(res.data || []);
    } catch (error) {
      console.log("Erreur chargement historique");
    }
  };

  const fetchDefisCouple = async () => {
    try {
      const res = await jeuService.getDeffisCouple();
      setDefisCouple(res.data || jeuxData.defis);
    } catch (error) {
      setDefisCouple(jeuxData.defis);
    }
  };

  const refreshPartieData = async () => {
    if (!partieEnCours?._id) return;
    
    try {
      const res = await jeuService.getPartie(partieEnCours._id);
      setPartieEnCours(res.data);
      setRefreshPartie(prev => prev + 1);
    } catch (error) {
      console.log("Erreur refresh partie");
    }
  };

  const demarrerPartie = async (typeJeu, subQuizId = null) => {
    try {
      // Si c'est un quiz couple, on a besoin de sélectionner un sous-quiz
      if (typeJeu === 'quiz-couple' && !subQuizId) {
        setSelectedQuizType('quiz-couple');
        setShowQuizSelection(true);
        return;
      }

      const res = await jeuService.demarrerPartie(subQuizId || typeJeu);
      setPartieEnCours(res.data);
      setQuestionActuelle(0);
      setReponseInput('');
      setVueCorrection(false);
      setShowQuizSelection(false);
      
      const jeuConfig = getJeuConfig(typeJeu);
      let nomJeu = jeuConfig?.nom;
      
      // Si c'est un sous-quiz, récupérer le nom spécifique
      if (subQuizId && jeuConfig?.subQuizzes) {
        const subQuiz = jeuConfig.subQuizzes.find(sq => sq.id === subQuizId);
        nomJeu = subQuiz?.nom || nomJeu;
      }
      
      toast({
        title: "Partie démarrée !",
        description: `${nomJeu} a commencé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la partie",
        variant: "destructive",
      });
    }
  };

  const soumettreReponse = async () => {
    if (!reponseInput.trim() || !partieEnCours) return;
    
    try {
      const res = await jeuService.soumettreReponse(
        partieEnCours._id,
        questionActuelle,
        reponseInput.trim()
      );
      
      setPartieEnCours(res.data);
      setReponseInput('');
      
      toast({
        title: "Réponse envoyée ! ✅",
        description: "En attente de votre partenaire...",
      });
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la réponse",
        variant: "destructive",
      });
    }
  };

  const corrigerReponse = async (indexQuestion, estCorrect) => {
    try {
      const res = await jeuService.corrigerReponse(
        partieEnCours._id,
        indexQuestion,
        estCorrect
      );
      
      setPartieEnCours(res.data);
      
      toast({
        title: estCorrect ? "Réponse validée ✅" : "Réponse rejetée ❌",
        description: estCorrect ? "Votre partenaire gagne des points !" : "Pas de points cette fois.",
      });
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de corriger la réponse",
        variant: "destructive",
      });
    }
  };

  const terminerPartie = () => {
    const nouvellePartie = {
      ...partieEnCours,
      statut: 'termine',
      dateFin: new Date()
    };
    
    setHistoriqueParties(prev => [nouvellePartie, ...prev]);
    setPartieEnCours(null);
    setQuestionActuelle(0);
    setVueCorrection(false);

    toast({
      title: "Partie terminée ! 🏆",
      description: "Merci d'avoir joué ensemble !",
    });
  };

  const commencerDefi = (defi) => {
    setDefiEnCours(defi);
    setPreuveDefi({ commentaire: '', images: [] });
  };

  const terminerDefi = async () => {
    if (!preuveDefi.commentaire.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez ajouter un commentaire sur votre défi",
        variant: "destructive",
      });
      return;
    }

    try {
      await jeuService.completerDefi(defiEnCours.id, preuveDefi);
      
      setDefisCouple(prev => prev.map(defi => 
        defi.id === defiEnCours.id 
          ? { ...defi, termine: true, dateTermine: new Date() }
          : defi
      ));

      setDefiEnCours(null);
      setPreuveDefi({ commentaire: '', images: [] });

      toast({
        title: "Défi réussi ! 🎉",
        description: `Vous avez gagné ${defiEnCours.points} points !`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le défi",
        variant: "destructive",
      });
    }
  };

  // Fonctions pour filtrer les questions selon le statut
  const getQuestionsACorreger = () => {
    if (!partieEnCours?.questions) return [];
    
    return partieEnCours.questions.filter((q, index) => 
      q.sujet === currentUser.id && 
      q.reponduParSujet && 
      q.reponduParDevineur && 
      !q.corrigePar
    );
  };

  const getMesReponsesEnAttente = () => {
    if (!partieEnCours?.questions) return [];
    
    return partieEnCours.questions.filter((q, index) => 
      q.devineur === currentUser.id && 
      q.reponduParSujet && 
      q.reponduParDevineur && 
      !q.corrigePar
    );
  };

  const JeuCard = ({ jeu }) => {
    const IconComponent = iconMap[jeu.icon] || Gamepad2;
    
    return (
      <Card className={`p-4 border hover:shadow-lg transition-all duration-200 ${
        jeu.color === 'blue' ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' :
        jeu.color === 'purple' ? 'border-purple-200 bg-purple-50 hover:bg-purple-100' :
        jeu.color === 'green' ? 'border-green-200 bg-green-50 hover:bg-green-100' :
        jeu.color === 'red' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
        jeu.color === 'yellow' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
        jeu.color === 'orange' ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' :
        jeu.color === 'teal' ? 'border-teal-200 bg-teal-50 hover:bg-teal-100' :
        jeu.color === 'pink' ? 'border-pink-200 bg-pink-50 hover:bg-pink-100' :
        jeu.color === 'indigo' ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100' :
        jeu.color === 'slate' ? 'border-slate-200 bg-slate-50 hover:bg-slate-100' :
        'border-gray-200 bg-gray-50 hover:bg-gray-100'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <IconComponent className={`w-8 h-8 ${
              jeu.color === 'blue' ? 'text-blue-600' :
              jeu.color === 'purple' ? 'text-purple-600' :
              jeu.color === 'green' ? 'text-green-600' :
              jeu.color === 'red' ? 'text-red-600' :
              jeu.color === 'yellow' ? 'text-yellow-600' :
              jeu.color === 'orange' ? 'text-orange-600' :
              jeu.color === 'teal' ? 'text-teal-600' :
              jeu.color === 'pink' ? 'text-pink-600' :
              jeu.color === 'indigo' ? 'text-indigo-600' :
              jeu.color === 'slate' ? 'text-slate-600' :
              'text-gray-600'
            }`} />
            <div>
              <h4 className={`font-medium ${
                jeu.color === 'blue' ? 'text-blue-800' :
                jeu.color === 'purple' ? 'text-purple-800' :
                jeu.color === 'green' ? 'text-green-800' :
                jeu.color === 'red' ? 'text-red-800' :
                jeu.color === 'yellow' ? 'text-yellow-800' :
                jeu.color === 'orange' ? 'text-orange-800' :
                jeu.color === 'teal' ? 'text-teal-800' :
                jeu.color === 'pink' ? 'text-pink-800' :
                jeu.color === 'indigo' ? 'text-indigo-800' :
                jeu.color === 'slate' ? 'text-slate-800' :
                'text-gray-800'
              }`}>{jeu.nom}</h4>
              <p className={`text-sm ${
                jeu.color === 'blue' ? 'text-blue-600' :
                jeu.color === 'purple' ? 'text-purple-600' :
                jeu.color === 'green' ? 'text-green-600' :
                jeu.color === 'red' ? 'text-red-600' :
                jeu.color === 'yellow' ? 'text-yellow-600' :
                jeu.color === 'orange' ? 'text-orange-600' :
                jeu.color === 'teal' ? 'text-teal-600' :
                jeu.color === 'pink' ? 'text-pink-600' :
                jeu.color === 'indigo' ? 'text-indigo-600' :
                jeu.color === 'slate' ? 'text-slate-600' :
                'text-gray-600'
              }`}>{jeu.description}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${
            jeu.difficulte === 'Facile' ? 'bg-green-200 text-green-800' :
            jeu.difficulte === 'Moyen' ? 'bg-yellow-200 text-yellow-800' :
            'bg-red-200 text-red-800'
          }`}>
            {jeu.difficulte}
          </span>
        </div>

        <div className={`flex items-center justify-between text-xs mb-3 ${
          jeu.color === 'blue' ? 'text-blue-600' :
          jeu.color === 'purple' ? 'text-purple-600' :
          jeu.color === 'green' ? 'text-green-600' :
          jeu.color === 'red' ? 'text-red-600' :
          jeu.color === 'yellow' ? 'text-yellow-600' :
          jeu.color === 'orange' ? 'text-orange-600' :
          jeu.color === 'teal' ? 'text-teal-600' :
          jeu.color === 'pink' ? 'text-pink-600' :
          jeu.color === 'indigo' ? 'text-indigo-600' :
          jeu.color === 'slate' ? 'text-slate-600' :
          'text-gray-600'
        }`}>
          <span className="flex items-center">
            <Timer className="w-3 h-3 mr-1" />
            {jeu.duree}
          </span>
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            2 joueurs
          </span>
          {jeu.needsCorrection && (
            <span className="flex items-center">
              <ClipboardCheck className="w-3 h-3 mr-1" />
              Correction
            </span>
          )}
        </div>

        <Button
          onClick={() => demarrerPartie(jeu.id)}
          className={`w-full transition-colors ${
            jeu.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
            jeu.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
            jeu.color === 'green' ? 'bg-green-500 hover:bg-green-600' :
            jeu.color === 'red' ? 'bg-red-500 hover:bg-red-600' :
            jeu.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
            jeu.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
            jeu.color === 'teal' ? 'bg-teal-500 hover:bg-teal-600' :
            jeu.color === 'pink' ? 'bg-pink-500 hover:bg-pink-600' :
            jeu.color === 'indigo' ? 'bg-indigo-500 hover:bg-indigo-600' :
            jeu.color === 'slate' ? 'bg-slate-500 hover:bg-slate-600' :
            'bg-gray-500 hover:bg-gray-600'
          }`}
          size="sm"
        >
          <Play className="w-3 h-3 mr-1" />
          Jouer maintenant
        </Button>
      </Card>
    );
  };

  const InterfaceJeu = () => {
    if (!partieEnCours) return null;
    
    const jeuConfig = jeuxDisponibles.find(j => j.id === partieEnCours.type);
    const questionsActuelles = jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple' ? 
      partieEnCours.questions : partieEnCours.questionsSimples;
    const question = questionsActuelles[questionActuelle];
    const progress = ((questionActuelle + 1) / questionsActuelles.length) * 100;
    
    let estSujet = false;
    let estDevineur = false;
    let peutRepondre = false;

    if (jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') {
      estSujet = question?.sujet === currentUser.id;
      estDevineur = question?.devineur === currentUser.id;
      peutRepondre = (estSujet && !question?.reponduParSujet) || 
                    (estDevineur && !question?.reponduParDevineur);
    } else {
      const estUtilisateur1 = currentUser.id === partieEnCours.scores.utilisateur1.utilisateur.id;
      peutRepondre = estUtilisateur1 ? !question?.reponduParUtilisateur1 : !question?.reponduParUtilisateur2;
    }

    const IconComponent = iconMap[jeuConfig?.icon] || Gamepad2;

    return (
      <div className="space-y-6">
        {/* Sélecteur de vue pour les jeux avec correction */}
        {(jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') && (
          <div className={`flex mb-4 ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
            <Button
              variant={!vueCorrection ? 'default' : 'outline'}
              onClick={() => setVueCorrection(false)}
              className={`${!vueCorrection ? 'bg-blue-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''}`}
            >
              <User className="w-4 h-4 mr-2" />
              Jouer ({questionsActuelles.length} questions)
            </Button>
            <Button
              variant={vueCorrection ? 'default' : 'outline'}
              onClick={() => setVueCorrection(true)}
              className={`${vueCorrection ? 'bg-orange-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''} relative`}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Correction ({getQuestionsACorreger().length})
              {getQuestionsACorreger().length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getQuestionsACorreger().length}
                </span>
              )}
            </Button>
          </div>
        )}

        {!vueCorrection ? (
          // VUE NORMALE DU JEU
          <Card className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* En-tête du jeu */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-800 flex items-center">
                  <IconComponent className="w-6 h-6 mr-2" />
                  {jeuConfig?.nom}
                </h3>
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {questionActuelle + 1}/{questionsActuelles.length}
                </span>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {/* Scores */}
              <div className={`grid gap-4 mt-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600">Votre score</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {partieEnCours.scores.utilisateur1.utilisateur.id === currentUser.id ? 
                      partieEnCours.scores.utilisateur1.score : 
                      partieEnCours.scores.utilisateur2.score}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-600">{partenaire.nom}</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {partieEnCours.scores.utilisateur1.utilisateur.id === partenaire.id ? 
                      partieEnCours.scores.utilisateur1.score : 
                      partieEnCours.scores.utilisateur2.score}
                  </div>
                </div>
              </div>
            </div>

            {/* Interface de question */}
            <div className="mb-6">
              <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                <h4 className="font-medium text-gray-800 mb-2 text-lg">
                  {question?.questionText || question?.question}
                </h4>
                
                {/* Indicateur de rôle pour jeux avec correction */}
                {(jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') && (
                  <div className={`text-sm mb-3 p-2 rounded ${
                    estSujet ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {estSujet ? 
                      "🎯 Vous devez donner la vraie réponse à cette question sur vous" : 
                      `🔮 Vous devez deviner la réponse de ${partenaire.nom} à cette question`}
                  </div>
                )}
                
                {/* Statut des réponses pour jeux avec correction */}
                {(jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') && (
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className={`p-2 rounded ${
                      question?.reponduParSujet ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {question?.reponduParSujet ? '✅' : '⏳'} Vraie réponse
                    </div>
                    <div className={`p-2 rounded ${
                      question?.reponduParDevineur ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {question?.reponduParDevineur ? '✅' : '⏳'} Devinette
                    </div>
                  </div>
                )}

                {/* Options pour "Tu préfères" */}
                {partieEnCours.type === 'tu-preferes' && question?.optionA && (
                  <div className={`grid gap-3 mb-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <Button
                      variant="outline"
                      className="p-4 h-auto text-left justify-start"
                      onClick={() => {
                        setReponseInput(question.optionA);
                        setTimeout(() => soumettreReponse(), 100);
                      }}
                      disabled={!peutRepondre}
                    >
                      <div>
                        <span className="font-medium">Option A</span>
                        <p className="text-sm mt-1">{question.optionA}</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="p-4 h-auto text-left justify-start"
                      onClick={() => {
                        setReponseInput(question.optionB);
                        setTimeout(() => soumettreReponse(), 100);
                      }}
                      disabled={!peutRepondre}
                    >
                      <div>
                        <span className="font-medium">Option B</span>
                        <p className="text-sm mt-1">{question.optionB}</p>
                      </div>
                    </Button>
                  </div>
                )}
              </div>

              {/* Interface de réponse */}
              {partieEnCours.type !== 'tu-preferes' && peutRepondre ? (
                <div className="space-y-3">
                  <Input
                    value={reponseInput}
                    onChange={(e) => setReponseInput(e.target.value)}
                    placeholder={(jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') ? 
                      (estSujet ? "Votre vraie réponse..." : "Votre devinette...") :
                      "Votre réponse..."
                    }
                    className="border-blue-200 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && reponseInput.trim()) {
                        soumettreReponse();
                      }
                    }}
                  />
                  <Button
                    onClick={soumettreReponse}
                    disabled={!reponseInput.trim()}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    {(jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') ? 
                      (estSujet ? "Donner ma vraie réponse" : "Envoyer ma devinette") :
                      "Valider ma réponse"
                    }
                  </Button>
                </div>
              ) : !peutRepondre && partieEnCours.type !== 'tu-preferes' ? (
                <div className="text-center py-4 text-gray-600">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm">
                    {(jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') ? 
                      (!question?.reponduParSujet && estDevineur ? "En attente de la vraie réponse..." :
                       !question?.reponduParDevineur && estSujet ? "En attente de la devinette..." :
                       "Réponses complètes ! En attente de correction...") :
                      "Vous avez déjà répondu à cette question."
                    }
                  </div>
                </div>
              ) : null}
            </div>

            {/* Contrôles */}
            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <Button
                variant="ghost"
                onClick={() => setPartieEnCours(null)}
                className="text-blue-600"
              >
                Quitter la partie
              </Button>
              {questionActuelle > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setQuestionActuelle(questionActuelle - 1)}
                  className="border-blue-200"
                >
                  Question précédente
                </Button>
              )}
              {questionActuelle < questionsActuelles.length - 1 && (
                <Button
                  variant="outline"
                  onClick={() => setQuestionActuelle(questionActuelle + 1)}
                  className="border-blue-200"
                >
                  Question suivante
                </Button>
              )}
            </div>
          </Card>
        ) : (
          // VUE CORRECTION (uniquement pour les jeux avec correction)
          <div className="space-y-6">
            {/* Section : Questions à corriger */}
            <Card className="p-6 border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <h3 className="font-semibold text-orange-800 mb-4 flex items-center">
                <ClipboardCheck className="w-6 h-6 mr-2" />
                Réponses de {partenaire.nom} à corriger ({getQuestionsACorreger().length})
              </h3>
              
              {getQuestionsACorreger().length > 0 ? (
                <div className="space-y-4">
                  {getQuestionsACorreger().map((q, qIndex) => {
                    const realIndex = partieEnCours.questions.findIndex(question => question === q);
                    return (
                      <div key={realIndex} className="bg-white p-4 rounded-lg border border-orange-200">
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-800 mb-2">
                            Question : {q.questionText}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <strong className="text-green-800">Votre vraie réponse :</strong>
                              <p className="text-green-700 mt-1">{q.reponseSujet}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <strong className="text-blue-800">Devinette de {partenaire.nom} :</strong>
                              <p className="text-blue-700 mt-1">{q.reponseDevineur}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => corrigerReponse(realIndex, true)}
                            className="bg-green-500 hover:bg-green-600 flex-1"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Correct ! (+{q.points || 10} pts)
                          </Button>
                          <Button
                            onClick={() => corrigerReponse(realIndex, false)}
                            className="bg-red-500 hover:bg-red-600 flex-1"
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Incorrect (0 pt)
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-orange-600">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune réponse à corriger pour le moment</p>
                  <p className="text-sm mt-2">Les réponses apparaîtront ici quand votre partenaire aura joué</p>
                </div>
              )}
            </Card>

            {/* Section : Mes réponses en attente */}
            <Card className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Vos réponses en attente de correction ({getMesReponsesEnAttente().length})
              </h3>
              
              {getMesReponsesEnAttente().length > 0 ? (
                <div className="space-y-4">
                  {getMesReponsesEnAttente().map((q, qIndex) => {
                    const realIndex = partieEnCours.questions.findIndex(question => question === q);
                    return (
                      <div key={realIndex} className="bg-white p-4 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-gray-800 mb-2">
                          Question : {q.questionText}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <strong className="text-green-800">Vraie réponse de {partenaire.nom} :</strong>
                            <p className="text-green-700 mt-1">{q.reponseSujet}</p>
                          </div>
                          <div className="bg-orange-50 p-3 rounded border border-orange-200">
                            <strong className="text-orange-800">Votre devinette :</strong>
                            <p className="text-orange-700 mt-1">{q.reponseDevineur}</p>
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            En attente de correction par {partenaire.nom}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-blue-600">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune réponse en attente</p>
                  <p className="text-sm mt-2">Vos devinettes apparaîtront ici en attente de correction</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    );
  };

  const QuizSelectionModal = () => {
    const quizCouple = jeuxDisponibles.find(j => j.id === 'quiz-couple');
    
    if (!showQuizSelection || !quizCouple?.subQuizzes) return null;

    return (
      <Card className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 mb-6">
        <div className="mb-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <BrainCircuit className="w-6 h-6 mr-2" />
            Choisissez votre niveau de Quiz Couple
          </h3>
          <p className="text-sm text-blue-600">
            Sélectionnez le niveau qui correspond à votre degré de connaissance mutuelle
          </p>
        </div>

        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {quizCouple.subQuizzes.map((subQuiz) => (
            <Card key={subQuiz.id} className={`p-4 border cursor-pointer transition-all duration-200 hover:shadow-md ${
              subQuiz.difficulte === 'Facile' ? 'border-green-200 bg-green-50 hover:bg-green-100' :
              subQuiz.difficulte === 'Moyen' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
              subQuiz.difficulte === 'Difficile' ? 'border-orange-200 bg-orange-50 hover:bg-orange-100' :
              'border-red-200 bg-red-50 hover:bg-red-100'
            }`}
            onClick={() => demarrerPartie('quiz-couple', subQuiz.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className={`font-medium ${
                    subQuiz.difficulte === 'Facile' ? 'text-green-800' :
                    subQuiz.difficulte === 'Moyen' ? 'text-yellow-800' :
                    subQuiz.difficulte === 'Difficile' ? 'text-orange-800' :
                    'text-red-800'
                  }`}>{subQuiz.nom}</h4>
                  <p className={`text-sm ${
                    subQuiz.difficulte === 'Facile' ? 'text-green-600' :
                    subQuiz.difficulte === 'Moyen' ? 'text-yellow-600' :
                    subQuiz.difficulte === 'Difficile' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>{subQuiz.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  subQuiz.difficulte === 'Facile' ? 'bg-green-200 text-green-800' :
                  subQuiz.difficulte === 'Moyen' ? 'bg-yellow-200 text-yellow-800' :
                  subQuiz.difficulte === 'Difficile' ? 'bg-orange-200 text-orange-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {subQuiz.difficulte}
                </span>
              </div>

              <div className={`flex items-center justify-between text-xs mb-3 ${
                subQuiz.difficulte === 'Facile' ? 'text-green-600' :
                subQuiz.difficulte === 'Moyen' ? 'text-yellow-600' :
                subQuiz.difficulte === 'Difficile' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                <span className="flex items-center">
                  <Timer className="w-3 h-3 mr-1" />
                  {subQuiz.duree}
                </span>
                <span className="flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  {subQuiz.maxQuestions} questions
                </span>
                <span className="flex items-center">
                  <ClipboardCheck className="w-3 h-3 mr-1" />
                  Correction
                </span>
              </div>

              <Button
                className={`w-full transition-colors ${
                  subQuiz.difficulte === 'Facile' ? 'bg-green-500 hover:bg-green-600' :
                  subQuiz.difficulte === 'Moyen' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  subQuiz.difficulte === 'Difficile' ? 'bg-orange-500 hover:bg-orange-600' :
                  'bg-red-500 hover:bg-red-600'
                }`}
                size="sm"
              >
                <Play className="w-3 h-3 mr-1" />
                Commencer ce quiz
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => setShowQuizSelection(false)}
            className="text-blue-600"
          >
            Annuler
          </Button>
        </div>
      </Card>
    );
  };
    <Card className={`p-4 border transition-all duration-200 ${
      defi.termine ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{defi.icon}</span>
          <div>
            <h4 className={`font-medium ${defi.termine ? 'text-green-800' : 'text-gray-800'}`}>
              {defi.titre}
            </h4>
            <p className={`text-sm ${defi.termine ? 'text-green-600' : 'text-gray-600'}`}>
              {defi.description}
            </p>
          </div>
        </div>
        {defi.termine && <CheckCircle className="w-5 h-5 text-green-600" />}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <span className={`px-2 py-1 rounded-full ${
          defi.difficulte === 'Facile' ? 'bg-green-100 text-green-800' :
          defi.difficulte === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {defi.difficulte}
        </span>
        <span className="flex items-center">
          <Star className="w-3 h-3 mr-1" />
          {defi.points} points
        </span>
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {defi.categorie}
        </span>
      </div>

      {!defi.termine ? (
        <Button
          onClick={() => commencerDefi(defi)}
          className="w-full bg-orange-500 hover:bg-orange-600"
          size="sm"
        >
          <Zap className="w-3 h-3 mr-1" />
          Relever le défi
        </Button>
      ) : (
        <div className="text-center text-sm text-green-600">
          ✅ Défi réussi le {defi.dateTermine && new Date(defi.dateTermine).toLocaleDateString()}
        </div>
      )}
    </Card>
  );

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
        <CardTitle className={`flex items-center ${isMobile ? 'flex-col space-y-3' : 'justify-between'}`}>
          <div className="flex items-center">
            <Gamepad2 className="w-5 h-5 mr-2 text-pink-500" />
            <span className={isMobile ? 'text-lg' : ''}>Jeux couple</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Interface de jeu en cours */}
        {partieEnCours && <InterfaceJeu />}

        {/* Sélection des quiz couple */}
        {showQuizSelection && <QuizSelectionModal />}

        {/* Interface de défi en cours */}
        {defiEnCours && (
          <Card className="p-6 border border-orange-200 bg-orange-50 mb-6">
            <h3 className="font-medium text-orange-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">{defiEnCours.icon}</span>
              Défi en cours : {defiEnCours.titre}
            </h3>
            <p className="text-orange-700 mb-4">{defiEnCours.description}</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-2">
                  Comment s'est passé le défi ?
                </label>
                <Textarea
                  value={preuveDefi.commentaire}
                  onChange={(e) => setPreuveDefi(prev => ({ ...prev, commentaire: e.target.value }))}
                  placeholder="Racontez-nous votre expérience..."
                  rows={3}
                  className="border-orange-200 focus:border-orange-500"
                />
              </div>
              
              <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                <Button
                  onClick={terminerDefi}
                  className={`bg-orange-500 hover:bg-orange-600 ${isMobile ? 'w-full' : ''}`}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Valider le défi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDefiEnCours(null)}
                  className={`border-orange-200 ${isMobile ? 'w-full' : ''}`}
                >
                  Abandonner
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Onglets */}
        {!partieEnCours && !defiEnCours && !showQuizSelection && (
          <>
            <div className={`flex mb-6 ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
              <Button
                variant={activeTab === 'jeux' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('jeux')}
                className={`${activeTab === 'jeux' ? 'bg-pink-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''}`}
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Jeux disponibles ({jeuxDisponibles.length})
              </Button>
              <Button
                variant={activeTab === 'defis' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('defis')}
                className={`${activeTab === 'defis' ? 'bg-pink-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''}`}
              >
                <Zap className="w-4 h-4 mr-2" />
                Défis couple ({defisCouple.filter(d => !d.termine).length})
              </Button>
              <Button
                variant={activeTab === 'historique' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('historique')}
                className={`${activeTab === 'historique' ? 'bg-pink-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''}`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Historique
              </Button>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'jeux' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Découvrez nos {jeuxDisponibles.length} jeux couple !
                  </h3>
                  <p className="text-sm text-gray-600">
                    Des expériences variées pour mieux vous connaître
                  </p>
                </div>

                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                  {jeuxDisponibles.map(jeu => (
                    <JeuCard key={jeu.id} jeu={jeu} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'defis' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Relevez des défis ensemble !
                  </h3>
                  <p className="text-sm text-gray-600">
                    Des missions amusantes pour pimenter votre relation
                  </p>
                </div>

                {/* Statistiques des défis */}
                <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{defisCouple.length}</div>
                    <div className="text-sm text-orange-600">Défis total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {defisCouple.filter(d => d.termine).length}
                    </div>
                    <div className="text-sm text-green-600">Réussis</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {defisCouple.filter(d => !d.termine).length}
                    </div>
                    <div className="text-sm text-blue-600">À faire</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">
                      {defisCouple.filter(d => d.termine).reduce((acc, d) => acc + d.points, 0)}
                    </div>
                    <div className="text-sm text-purple-600">Points gagnés</div>
                  </div>
                </div>

                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {defisCouple.map(defi => (
                    <DefiCard key={defi.id} defi={defi} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'historique' && (
              <div className="space-y-4">
                {historiqueParties.length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Vos parties précédentes
                      </h3>
                      <p className="text-sm text-gray-600">
                        Retrouvez l'historique de vos jeux
                      </p>
                    </div>

                    <div className="space-y-3">
                      {historiqueParties.map((partie, index) => {
                        const jeuConfig = jeuxDisponibles.find(j => j.id === partie.type);
                        const IconComponent = iconMap[jeuConfig?.icon] || Gamepad2;
                        return (
                          <Card key={index} className="p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <IconComponent className="w-6 h-6 text-gray-600" />
                                <div>
                                  <h4 className="font-medium text-gray-800">{jeuConfig?.nom || 'Jeu inconnu'}</h4>
                                  <p className="text-sm text-gray-600">
                                    {new Date(partie.dateCreation || Date.now()).toLocaleDateString()} à{' '}
                                    {new Date(partie.dateCreation || Date.now()).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  Terminé
                                </span>
                                {partie.scores && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Score: {partie.scores.utilisateur1.score} - {partie.scores.utilisateur2.score}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune partie jouée pour le moment</p>
                    <p className="text-sm mt-2">Commencez votre première partie !</p>
                    <Button
                      onClick={() => setActiveTab('jeux')}
                      className="mt-4 bg-pink-500 hover:bg-pink-600"
                    >
                      Découvrir les jeux
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default JeuxSection;