import React, { useState, useEffect } from "react";
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
import jeuService from '@/services/jeu.service';

// Types TypeScript
interface CurrentUser {
  id?: string;
  nom?: string;
  _id?: string;
  name?: string;
}

interface Partenaire {
  id: string;
  nom: string;
}

interface SubQuiz {
  id: string;
  nom: string;
  description: string;
  difficulte: string;
  duree: string;
  maxQuestions: number;
}

interface JeuDisponible {
  id: string;
  nom: string;
  description: string;
  icon: string;
  color: string;
  difficulte: string;
  duree: string;
  needsCorrection: boolean;
  hasSubQuizzes?: boolean;
  subQuizzes?: SubQuiz[];
  minQuestions?: number;
  maxQuestions?: number;
}

interface Question {
  questionText: string;
  sujet?: string;
  devineur?: string;
  reponseSujet?: string;
  reponseDevineur?: string;
  reponduParSujet?: boolean;
  reponduParDevineur?: boolean;
  estCorrect?: boolean | null;
  corrigePar?: string;
  points?: number;
  optionA?: string;
  optionB?: string;
  reponseUtilisateur1?: string;
  reponseUtilisateur2?: string;
  reponduParUtilisateur1?: boolean;
  reponduParUtilisateur2?: boolean;
}

interface Partie {
  _id: string;
  type: string;
  statut: string;
  questions?: Question[];
  questionsSimples?: Question[];
  scores: {
    utilisateur1: { utilisateur: { id: string; nom: string }; score: number };
    utilisateur2: { utilisateur: { id: string; nom: string }; score: number };
  };
  tourActuel: string;
  dateCreation?: Date;
  dateFin?: Date;
}

interface Defi {
  id: string;
  titre: string;
  description: string;
  points: number;
  difficulte: string;
  categorie: string;
  icon: string;
  termine?: boolean;
  dateTermine?: Date;
}

interface Toast {
  title: string;
  description: string;
  variant?: string;
}

interface JeuxSectionProps {
  currentUser: CurrentUser;
  partenaire: Partenaire;
  isMobile: boolean;
  toast: (toast: Toast) => void;
}

const JeuxSection: React.FC<JeuxSectionProps> = ({ currentUser, partenaire, isMobile, toast }) => {
  const [jeuxDisponibles, setJeuxDisponibles] = useState<JeuDisponible[]>([]);
  const [historiqueParties, setHistoriqueParties] = useState<Partie[]>([]);
  const [defisCouple, setDefisCouple] = useState<Defi[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('jeux');
  const [partieEnCours, setPartieEnCours] = useState<Partie | null>(null);
  const [questionActuelle, setQuestionActuelle] = useState<number>(0);
  const [reponseInput, setReponseInput] = useState<string>('');
  const [showDefis, setShowDefis] = useState<boolean>(false);
  const [defiEnCours, setDefiEnCours] = useState<Defi | null>(null);
  const [showQuizSelection, setShowQuizSelection] = useState<boolean>(false);
  const [selectedQuizType, setSelectedQuizType] = useState<string | null>(null);
  const [preuveDefi, setPreuveDefi] = useState({
    commentaire: '',
    images: [] as File[]
  });
  const [vueCorrection, setVueCorrection] = useState<boolean>(false);
  const [refreshPartie, setRefreshPartie] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  // Mapping des icônes
  const iconMap: Record<string, React.ComponentType<unknown>> = {
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

  // Fonctions API
  const fetchJeuxDisponibles = async (): Promise<void> => {
    try {
      const res = await jeuService.getJeuxDisponibles();
      setJeuxDisponibles(res.data || []);
    } catch (error) {
      console.error('Erreur chargement jeux:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les jeux",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoriqueParties = async (): Promise<void> => {
    try {
      const res = await jeuService.getHistoriqueParties();
      setHistoriqueParties(res.data || []);
    } catch (error) {
      console.log("Erreur chargement historique");
    }
  };

  const fetchDefisCouple = async (): Promise<void> => {
    try {
      const res = await jeuService.getDeffisCouple();
      setDefisCouple(res.data || []);
    } catch (error) {
      console.error('Erreur chargement défis:', error);
    }
  };

  useEffect(() => {
    fetchJeuxDisponibles();
    fetchHistoriqueParties();
    fetchDefisCouple();
  }, []);

  useEffect(() => {
    if (partieEnCours && partieEnCours._id && !isTyping) {
      const interval = setInterval(() => {
        refreshPartieData();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [partieEnCours, isTyping]);

  useEffect(() => {
    refreshPartieData();
  }, [refreshPartie]);

  useEffect(() => {
    setReponseInput('');
  }, [questionActuelle]);

  const refreshPartieData = async (): Promise<void> => {
    if (!partieEnCours?._id) return;
    
    try {
      const res = await jeuService.getPartie(partieEnCours._id);
      setPartieEnCours(res.data);
      setRefreshPartie(prev => prev + 1);
    } catch (error) {
      console.log("Erreur refresh partie");
    }
  };

  const demarrerPartie = async (typeJeu: string, subQuizId?: string): Promise<void> => {
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
      
      // Trouver le nom du jeu pour la notification
      let nomJeu = 'Jeu';
      const jeuConfig = jeuxDisponibles.find(j => j.id === typeJeu);
      if (jeuConfig) {
        if (subQuizId && jeuConfig.subQuizzes) {
          const subQuiz = jeuConfig.subQuizzes.find(sq => sq.id === subQuizId);
          nomJeu = subQuiz?.nom || jeuConfig.nom;
        } else {
          nomJeu = jeuConfig.nom;
        }
      }
      
      toast({
        title: "Partie démarrée !",
        description: `${nomJeu} a commencé`,
      });
    } catch (error: unknown) {
      console.error('Erreur démarrage partie:', error);
      toast({
        title: "Erreur",
        description: (error instanceof Error ? error.message : "Impossible de démarrer la partie"),
        variant: "destructive",
      });
    }
  };

  const soumettreReponse = async (): Promise<void> => {
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
      
    } catch (error: unknown) {
      console.error('Erreur soumission réponse:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de soumettre la réponse",
        variant: "destructive",
      });
    }
  };

  const corrigerReponse = async (indexQuestion: number, estCorrect: boolean): Promise<void> => {
    try {
      const res = await jeuService.corrigerReponse(
        partieEnCours!._id,
        indexQuestion,
        estCorrect
      );
      
      setPartieEnCours(res.data);
      
      toast({
        title: estCorrect ? "Réponse validée ✅" : "Réponse rejetée ❌",
        description: estCorrect ? "Votre partenaire gagne des points !" : "Pas de points cette fois.",
      });
      
    } catch (error: unknown) {
      console.error('Erreur correction réponse:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de corriger la réponse",
        variant: "destructive",
      });
    }
  };

  const terminerPartie = (): void => {
    const nouvellePartie: Partie = {
      ...partieEnCours!,
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

  const commencerDefi = (defi: Defi): void => {
    setDefiEnCours(defi);
    setPreuveDefi({ commentaire: '', images: [] });
  };

  const terminerDefi = async (): Promise<void> => {
    if (!preuveDefi.commentaire.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez ajouter un commentaire sur votre défi",
        variant: "destructive",
      });
      return;
    }

    try {
      await jeuService.completerDefi(defiEnCours!.id, preuveDefi);
      
      setDefisCouple(prev => prev.map(defi => 
        defi.id === defiEnCours!.id 
          ? { ...defi, termine: true, dateTermine: new Date() }
          : defi
      ));

      setDefiEnCours(null);
      setPreuveDefi({ commentaire: '', images: [] });

      toast({
        title: "Défi réussi ! 🎉",
        description: `Vous avez gagné ${defiEnCours!.points} points !`,
      });
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le défi",
        variant: "destructive",
      });
    }
  };

  // Fonctions pour filtrer les questions selon le statut
  const getQuestionsACorreger = (): Question[] => {
    if (!partieEnCours?.questions) return [];
    
    return partieEnCours.questions.filter((q) => 
      q.sujet === currentUser.id && 
      q.reponduParSujet && 
      q.reponduParDevineur && 
      !q.corrigePar
    );
  };

  const getMesReponsesEnAttente = (): Question[] => {
    if (!partieEnCours?.questions) return [];
    
    return partieEnCours.questions.filter((q) => 
      q.devineur === currentUser.id && 
      q.reponduParSujet && 
      q.reponduParDevineur && 
      !q.corrigePar
    );
  };

  const QuizSelectionModal: React.FC = () => {
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
            <Card 
              key={subQuiz.id} 
              className={`p-4 border cursor-pointer transition-all duration-200 hover:shadow-md ${
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

  const JeuCard: React.FC<{ jeu: JeuDisponible }> = ({ jeu }) => {
    const IconComponent = iconMap[jeu.icon] || Gamepad2;
    
    return (
      <Card className={`p-4 border hover:shadow-lg transition-all duration-200 ${
        jeu.color === 'blue' ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' :
        jeu.color === 'purple' ? 'border-purple-200 bg-purple-50 hover:bg-purple-100' :
        jeu.color === 'green' ? 'border-green-200 bg-green-50 hover:bg-green-100' :
        jeu.color === 'red' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
        jeu.color === 'yellow' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
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
              'text-gray-600'
            }`} />
            <div>
              <h4 className={`font-medium ${
                jeu.color === 'blue' ? 'text-blue-800' :
                jeu.color === 'purple' ? 'text-purple-800' :
                jeu.color === 'green' ? 'text-green-800' :
                jeu.color === 'red' ? 'text-red-800' :
                jeu.color === 'yellow' ? 'text-yellow-800' :
                'text-gray-800'
              }`}>{jeu.nom}</h4>
              <p className={`text-sm ${
                jeu.color === 'blue' ? 'text-blue-600' :
                jeu.color === 'purple' ? 'text-purple-600' :
                jeu.color === 'green' ? 'text-green-600' :
                jeu.color === 'red' ? 'text-red-600' :
                jeu.color === 'yellow' ? 'text-yellow-600' :
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

  const InterfaceJeu: React.FC = () => {
    if (!partieEnCours) return null;
    
    const jeuConfig = jeuxDisponibles.find(j => j.id === partieEnCours.type);
    const questionsActuelles = jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple' ? 
      partieEnCours.questions : partieEnCours.questionsSimples;
    const question = questionsActuelles?.[questionActuelle];
    const progress = questionsActuelles ? ((questionActuelle + 1) / questionsActuelles.length) * 100 : 0;
    
    let estSujet = false;
    let estDevineur = false;
    let peutRepondre = false;

    if (jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') {
      const userId = currentUser.id || currentUser._id;
      console.log('DEBUG USER:', currentUser, 'userId:', userId);
      console.log('DEBUG ID:', {
        questionSujet: question?.sujet,
        questionDevineur: question?.devineur,
        userId: userId,
        questionRaw: question
      });
      estSujet = String(question?.sujet) === String(userId);
      estDevineur = String(question?.devineur) === String(userId);
      peutRepondre = (estSujet && !question?.reponduParSujet) || 
                    (estDevineur && !question?.reponduParDevineur);
    } else {
      const estUtilisateur1 = currentUser.id === partieEnCours.scores.utilisateur1.utilisateur.id;
      peutRepondre = estUtilisateur1 ? !question?.reponduParUtilisateur1 : !question?.reponduParUtilisateur2;
    }

    const IconComponent = iconMap[jeuConfig?.icon || 'Gamepad2'] || Gamepad2;

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
              Jouer ({questionsActuelles?.length || 0} questions)
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
            {/* Interface du jeu normale */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-800 flex items-center">
                  <IconComponent className="w-6 h-6 mr-2" />
                  {jeuConfig?.nom}
                </h3>
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {questionActuelle + 1}/{questionsActuelles?.length || 0}
                </span>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question et réponse */}
            {question && (
              <div className="mb-6">
                <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                  <h4 className="font-medium text-gray-800 mb-2 text-lg">
                    {question.questionText}
                  </h4>
                  
                  {/* Indicateur de rôle pour jeux avec correction */}
                  {(jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {estSujet
                          ? "Vous êtes le sujet"
                          : estDevineur
                          ? "Vous êtes le devineur"
                          : "Spectateur"}
                      </span>
                    </div>
                  )}

                  {/* Réponses affichées selon le rôle */}
                  {(jeuConfig?.needsCorrection || partieEnCours.type === 'quiz-couple') && (
                    <div className="mb-2">
                      {estSujet && question.reponduParSujet && (
                        <div className="text-green-700 text-sm mb-1">
                          Votre réponse : <span className="font-semibold">{question.reponseSujet}</span>
                        </div>
                      )}
                      {estDevineur && question.reponduParDevineur && (
                        <div className="text-blue-700 text-sm mb-1">
                          Votre devinette : <span className="font-semibold">{question.reponseDevineur}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Champ de réponse */}
                {peutRepondre && (
                  <div className="flex flex-col gap-2">
                    <Input
                      value={reponseInput}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      onChange={(e) => setReponseInput(e.target.value)}
                      placeholder="Votre réponse..."
                      className="border-blue-200 focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") soumettreReponse();
                      }}
                    />
                    <Button
                      onClick={soumettreReponse}
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={!reponseInput.trim()}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Envoyer
                    </Button>
                  </div>
                )}

                {/* Message d'attente */}
                {!peutRepondre && (
                  <div className="text-center text-blue-600 text-sm mt-4">
                    {question.reponduParSujet && question.reponduParDevineur
                      ? "En attente de correction..."
                      : "En attente de la réponse de votre partenaire..."}
                  </div>
                )}
              </div>
            )}

            {/* Contrôles */}
            <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <Button
                variant="ghost"
                onClick={() => setPartieEnCours(null)}
                className="text-blue-600"
              >
                Quitter la partie
              </Button>
            </div>
          </Card>
        ) : (
          // VUE CORRECTION
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
                    const realIndex = partieEnCours.questions?.findIndex(question => question === q) || 0;
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
          </div>
        )}
      </div>
    );
  };

  const DefiCard: React.FC<{ defi: Defi }> = ({ defi }) => (
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
                        const IconComponent = iconMap[jeuConfig?.icon || 'Gamepad2'] || Gamepad2;
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