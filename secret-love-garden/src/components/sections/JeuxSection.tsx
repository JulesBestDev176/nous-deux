import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Gamepad2, Play, Trophy, Heart, Star, Zap, Camera, CheckCircle, RotateCcw, Timer, Target } from "lucide-react";
import jeuService from "@/services/jeu.service";

const JeuxSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [jeuxDisponibles, setJeuxDisponibles] = useState([]);
  const [historiqueParties, setHistoriqueParties] = useState([]);
  const [defisCouple, setDefisCouple] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jeux');
  const [partieEnCours, setPartieEnCours] = useState(null);
  const [questionActuelle, setQuestionActuelle] = useState(0);
  const [score, setScore] = useState({ joueur1: 0, joueur2: 0 });
  const [showDefis, setShowDefis] = useState(false);
  const [defiEnCours, setDefiEnCours] = useState(null);
  const [preuveDefi, setPreuveDefi] = useState({
    commentaire: '',
    images: []
  });

  const typeJeux = [
    {
      id: 'quiz-relation',
      nom: 'Quiz sur votre relation',
      description: 'Testez vos connaissances mutuel',
      duree: '10-15 min',
      joueurs: '2',
      icon: '🧠',
      color: 'blue',
      difficulte: 'Facile'
    },
    {
      id: 'tu-preferes',
      nom: 'Tu préfères...',
      description: 'Découvrez vos préférences',
      duree: '5-10 min',
      joueurs: '2',
      icon: '🤔',
      color: 'green',
      difficulte: 'Facile'
    },
    {
      id: 'devine-moi',
      nom: 'Devine-moi',
      description: 'Devinez les pensées de l\'autre',
      duree: '15-20 min',
      joueurs: '2',
      icon: '🔮',
      color: 'purple',
      difficulte: 'Moyen'
    },
    {
      id: 'memory-souvenirs',
      nom: 'Memory des souvenirs',
      description: 'Retrouvez vos souvenirs communs',
      duree: '10-15 min',
      joueurs: '2',
      icon: '💭',
      color: 'pink',
      difficulte: 'Moyen'
    },
    {
      id: 'association-mots',
      nom: 'Association de mots',
      description: 'Trouvez les mots qui vous unissent',
      duree: '5-10 min',
      joueurs: '2',
      icon: '💬',
      color: 'yellow',
      difficulte: 'Facile'
    },
    {
      id: 'creative-challenge',
      nom: 'Défi créatif',
      description: 'Créez ensemble quelque chose',
      duree: '20-30 min',
      joueurs: '2',
      icon: '🎨',
      color: 'orange',
      difficulte: 'Difficile'
    }
  ];

  const questionsQuizRelation = [
    {
      question: "Quelle est la couleur préférée de votre partenaire ?",
      type: "ouverte"
    },
    {
      question: "Quel est le plat préféré de votre partenaire ?",
      type: "ouverte"
    },
    {
      question: "Dans quelle ville votre partenaire aimerait-il/elle vivre ?",
      type: "ouverte"
    },
    {
      question: "Quel est le plus grand rêve de votre partenaire ?",
      type: "ouverte"
    },
    {
      question: "Quel film votre partenaire peut regarder en boucle ?",
      type: "ouverte"
    }
  ];

  const questionsTuPreferes = [
    {
      question: "Tu préfères...",
      optionA: "Un weekend à la montagne",
      optionB: "Un weekend à la mer"
    },
    {
      question: "Tu préfères...",
      optionA: "Cuisiner ensemble",
      optionB: "Commander à emporter"
    },
    {
      question: "Tu préfères...",
      optionA: "Sortir avec des amis",
      optionB: "Rester à deux à la maison"
    },
    {
      question: "Tu préfères...",
      optionA: "Voyager de façon spontanée",
      optionB: "Planifier minutieusement"
    },
    {
      question: "Tu préfères...",
      optionA: "Regarder un film d'action",
      optionB: "Regarder une comédie romantique"
    }
  ];

  const defisExemples = [
    {
      id: 1,
      titre: "Photo couple rigolote",
      description: "Prenez une photo amusante ensemble dans un lieu public",
      points: 10,
      difficulte: "Facile",
      categorie: "Photo",
      icon: "📸"
    },
    {
      id: 2,
      titre: "Cuisine surprise",
      description: "Préparez un plat que vous n'avez jamais cuisiné ensemble",
      points: 15,
      difficulte: "Moyen",
      categorie: "Cuisine",
      icon: "👨‍🍳"
    },
    {
      id: 3,
      titre: "Danse spontanée",
      description: "Dansez ensemble dans un lieu inattendu pendant 2 minutes",
      points: 20,
      difficulte: "Difficile",
      categorie: "Sortie",
      icon: "💃"
    },
    {
      id: 4,
      titre: "Lettre d'amour express",
      description: "Écrivez-vous mutuellement une lettre d'amour en 5 minutes",
      points: 10,
      difficulte: "Facile",
      categorie: "Romantique",
      icon: "💌"
    },
    {
      id: 5,
      titre: "Activité sportive",
      description: "Faites ensemble un sport que vous n'avez jamais pratiqué",
      points: 25,
      difficulte: "Difficile",
      categorie: "Sport",
      icon: "⚽"
    },
    {
      id: 6,
      titre: "Surprise petit-déjeuner",
      description: "Préparez le petit-déjeuner surprise pour votre partenaire",
      points: 12,
      difficulte: "Facile",
      categorie: "Romantique",
      icon: "🥐"
    }
  ];

  useEffect(() => {
    fetchJeuxDisponibles();
    fetchHistoriqueParties();
    fetchDefisCouple();
  }, []);

  const fetchJeuxDisponibles = async () => {
    try {
      const res = await jeuService.getJeuxDisponibles();
      setJeuxDisponibles(res.data || typeJeux);
    } catch (error) {
      setJeuxDisponibles(typeJeux);
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
      setDefisCouple(res.data || defisExemples);
    } catch (error) {
      setDefisCouple(defisExemples);
    }
  };

  const demarrerPartie = async (typeJeu) => {
    try {
      const res = await jeuService.demarrerPartie(typeJeu);
      setPartieEnCours({
        id: res.data?.id || Date.now(),
        typeJeu,
        questions: typeJeu === 'quiz-relation' ? questionsQuizRelation : 
                  typeJeu === 'tu-preferes' ? questionsTuPreferes : [],
        status: 'en_cours',
        dateDebut: new Date()
      });
      setQuestionActuelle(0);
      setScore({ joueur1: 0, joueur2: 0 });
    } catch (error) {
      // Fallback en mode hors ligne
      setPartieEnCours({
        id: Date.now(),
        typeJeu,
        questions: typeJeu === 'quiz-relation' ? questionsQuizRelation : 
                  typeJeu === 'tu-preferes' ? questionsTuPreferes : [],
        status: 'en_cours',
        dateDebut: new Date()
      });
      setQuestionActuelle(0);
      setScore({ joueur1: 0, joueur2: 0 });
    }
  };

  const repondreQuestion = async (reponse) => {
    try {
      if (partieEnCours) {
        await jeuService.soumettreReponseJeu(partieEnCours.id, reponse);
      }
    } catch (error) {
      console.log("Erreur sauvegarde réponse");
    }

    // Logique locale du jeu
    if (questionActuelle + 1 < partieEnCours.questions.length) {
      setQuestionActuelle(questionActuelle + 1);
    } else {
      terminerPartie();
    }
  };

  const terminerPartie = () => {
    const nouvellePartie = {
      ...partieEnCours,
      status: 'termine',
      dateFin: new Date(),
      score: score
    };
    
    setHistoriqueParties(prev => [nouvellePartie, ...prev]);
    setPartieEnCours(null);
    setQuestionActuelle(0);
    setScore({ joueur1: 0, joueur2: 0 });

    toast({
      title: "Partie terminée !",
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
      
      // Marquer le défi comme terminé
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

  const getJeuInfo = (typeJeu) => {
    return typeJeux.find(j => j.id === typeJeu) || typeJeux[0];
  };

  const JeuCard = ({ jeu }) => (
    <Card className={`p-4 border border-${jeu.color}-200 bg-${jeu.color}-50 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{jeu.icon}</span>
          <div>
            <h4 className={`font-medium text-${jeu.color}-800`}>{jeu.nom}</h4>
            <p className={`text-sm text-${jeu.color}-600`}>{jeu.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs bg-${jeu.color}-200 text-${jeu.color}-800`}>
          {jeu.difficulte}
        </span>
      </div>

      <div className={`flex items-center justify-between text-xs text-${jeu.color}-600 mb-3`}>
        <span className="flex items-center">
          <Timer className="w-3 h-3 mr-1" />
          {jeu.duree}
        </span>
        <span className="flex items-center">
          <Gamepad2 className="w-3 h-3 mr-1" />
          {jeu.joueurs} joueurs
        </span>
      </div>

      <Button
        onClick={() => demarrerPartie(jeu.id)}
        className={`w-full bg-${jeu.color}-500 hover:bg-${jeu.color}-600`}
        size="sm"
      >
        <Play className="w-3 h-3 mr-1" />
        Jouer maintenant
      </Button>
    </Card>
  );

  const DefiCard = ({ defi }) => (
    <Card className={`p-4 border ${defi.termine ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
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

  const InterfaceJeu = () => {
    const jeuInfo = getJeuInfo(partieEnCours.typeJeu);
    const question = partieEnCours.questions[questionActuelle];
    const progress = ((questionActuelle + 1) / partieEnCours.questions.length) * 100;

    return (
      <Card className="p-6 border border-blue-200 bg-blue-50">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium text-blue-800 flex items-center`}>
              <span className="text-2xl mr-2">{jeuInfo.icon}</span>
              {jeuInfo.nom}
            </h3>
            <span className="text-sm text-blue-600">
              {questionActuelle + 1}/{partieEnCours.questions.length}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-4 text-lg">
            {question.question}
          </h4>
          
          {partieEnCours.typeJeu === 'quiz-relation' && (
            <div className="space-y-3">
              <Input
                placeholder="Votre réponse..."
                className="border-blue-200 focus:border-blue-500"
                onKeyPress={(e) => {
                  const target = e.target as HTMLInputElement;
                  if (e.key === 'Enter' && target.value.trim()) {
                    repondreQuestion(target.value);
                    target.value = '';
                  }
                }}
              />
              <p className="text-sm text-blue-600">
                Appuyez sur Entrée pour valider votre réponse
              </p>
            </div>
          )}

          {partieEnCours.typeJeu === 'tu-preferes' && (
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <Button
                variant="outline"
                className="p-4 h-auto text-left justify-start"
                onClick={() => repondreQuestion('A')}
              >
                <div>
                  <span className="font-medium">Option A</span>
                  <p className="text-sm mt-1">{question.optionA}</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="p-4 h-auto text-left justify-start"
                onClick={() => repondreQuestion('B')}
              >
                <div>
                  <span className="font-medium">Option B</span>
                  <p className="text-sm mt-1">{question.optionB}</p>
                </div>
              </Button>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="ghost"
            onClick={() => setPartieEnCours(null)}
            className="text-blue-600"
          >
            Quitter la partie
          </Button>
          <Button
            variant="outline"
            onClick={() => setQuestionActuelle(Math.max(0, questionActuelle - 1))}
            disabled={questionActuelle === 0}
            className="border-blue-200"
          >
            Question précédente
          </Button>
        </div>
      </Card>
    );
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
        {!partieEnCours && !defiEnCours && (
          <>
            <div className={`flex mb-6 ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
              <Button
                variant={activeTab === 'jeux' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('jeux')}
                className={`${activeTab === 'jeux' ? 'bg-pink-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''}`}
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Jeux disponibles
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
                    Amusez-vous ensemble !
                  </h3>
                  <p className="text-sm text-gray-600">
                    Découvrez des jeux spécialement conçus pour les couples
                  </p>
                </div>

                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {typeJeux.map(jeu => (
                    <JeuCard key={jeu.id} jeu={jeu} />
                  ))}
                </div>

                {/* Conseils de jeu */}
                <Card className="p-4 border border-blue-200 bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Conseils pour bien jouer</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Restez bienveillants et amusez-vous</li>
                    <li>• Il n'y a pas de bonnes ou mauvaises réponses</li>
                    <li>• Profitez-en pour apprendre des choses sur votre partenaire</li>
                    <li>• N'hésitez pas à discuter après chaque question</li>
                  </ul>
                </Card>
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
                        const jeuInfo = getJeuInfo(partie.typeJeu);
                        return (
                          <Card key={index} className="p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{jeuInfo.icon}</span>
                                <div>
                                  <h4 className="font-medium text-gray-800">{jeuInfo.nom}</h4>
                                  <p className="text-sm text-gray-600">
                                    {new Date(partie.dateDebut).toLocaleDateString()} à{' '}
                                    {new Date(partie.dateDebut).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                  Terminé
                                </span>
                                {partie.score && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Score: {partie.score.joueur1} - {partie.score.joueur2}
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