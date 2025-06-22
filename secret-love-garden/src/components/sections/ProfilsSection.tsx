import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Star, Brain, CheckCircle, Play, RotateCcw, Award, TrendingUp, Target } from "lucide-react";
import profilService from "@/services/profil.service";

const ProfilsSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [profilCouple, setProfilCouple] = useState(null);
  const [resultatsTests, setResultatsTests] = useState([]);
  const [conseils, setConseils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testEnCours, setTestEnCours] = useState(null);
  const [questionActuelle, setQuestionActuelle] = useState(0);
  const [reponsesTest, setReponsesTest] = useState([]);
  const [activeTab, setActiveTab] = useState('profil');

  const testsDisponibles = [
    {
      id: 'compatibilite',
      nom: 'Test de Compatibilité',
      description: 'Découvrez votre niveau de compatibilité',
      duree: '10 min',
      icon: '💝',
      color: 'pink'
    },
    {
      id: 'love-languages',
      nom: 'Langages de l\'Amour',
      description: 'Identifiez vos langages d\'amour',
      duree: '8 min',
      icon: '💕',
      color: 'red'
    },
    {
      id: 'personnalite',
      nom: 'Personnalités Complémentaires',
      description: 'Analysez vos personnalités',
      duree: '15 min',
      icon: '🧠',
      color: 'blue'
    }
  ];

  const questionsCompatibilite = [
    {
      question: "Préférez-vous passer vos soirées à la maison ou sortir ?",
      options: [
        { text: "Toujours à la maison", points: 1 },
        { text: "Plutôt à la maison", points: 2 },
        { text: "Ça dépend de l'humeur", points: 3 },
        { text: "Plutôt sortir", points: 4 },
        { text: "Toujours sortir", points: 5 }
      ]
    },
    {
      question: "Comment gérez-vous les conflits dans votre relation ?",
      options: [
        { text: "J'évite les confrontations", points: 2 },
        { text: "Je discute calmement", points: 5 },
        { text: "Je peux m'énerver rapidement", points: 1 },
        { text: "Je prends du temps pour réfléchir", points: 4 },
        { text: "Je cherche immédiatement une solution", points: 3 }
      ]
    },
    {
      question: "Quelle importance accordez-vous aux cadeaux et aux attentions ?",
      options: [
        { text: "Très importante", points: 5 },
        { text: "Assez importante", points: 4 },
        { text: "Modérément importante", points: 3 },
        { text: "Peu importante", points: 2 },
        { text: "Pas importante", points: 1 }
      ]
    },
    {
      question: "Comment exprimez-vous votre affection ?",
      options: [
        { text: "Par des mots doux", points: 4 },
        { text: "Par des gestes tendres", points: 5 },
        { text: "Par des cadeaux", points: 3 },
        { text: "Par des services rendus", points: 4 },
        { text: "Par du temps de qualité", points: 5 }
      ]
    },
    {
      question: "Votre vision idéale d'un weekend en couple ?",
      options: [
        { text: "Voyage spontané", points: 3 },
        { text: "Cocooning à la maison", points: 5 },
        { text: "Activités avec des amis", points: 2 },
        { text: "Découverte culturelle", points: 4 },
        { text: "Sport ou activité physique", points: 3 }
      ]
    }
  ];

  const questionsLoveLanguages = [
    {
      question: "Vous vous sentez le plus aimé(e) quand votre partenaire...",
      options: [
        { text: "Vous dit qu'il/elle vous aime", category: "mots" },
        { text: "Vous fait un câlin spontané", category: "contact" },
        { text: "Vous offre un petit cadeau", category: "cadeaux" },
        { text: "Fait quelque chose pour vous aider", category: "services" },
        { text: "Passe du temps exclusif avec vous", category: "temps" }
      ]
    },
    {
      question: "Pour montrer votre amour, vous préférez...",
      options: [
        { text: "Dire des mots doux et romantiques", category: "mots" },
        { text: "Faire des gestes tendres", category: "contact" },
        { text: "Offrir des surprises", category: "cadeaux" },
        { text: "Rendre service sans qu'on vous le demande", category: "services" },
        { text: "Organiser des moments rien qu'à deux", category: "temps" }
      ]
    },
    {
      question: "Ce qui vous fait le plus plaisir dans votre couple...",
      options: [
        { text: "Les compliments et encouragements", category: "mots" },
        { text: "Les câlins et marques de tendresse", category: "contact" },
        { text: "Les petites attentions matérielles", category: "cadeaux" },
        { text: "L'aide dans le quotidien", category: "services" },
        { text: "Les conversations profondes", category: "temps" }
      ]
    }
  ];

  useEffect(() => {
    fetchProfilCouple();
    fetchResultatsTests();
    fetchConseils();
  }, []);

  const fetchProfilCouple = async () => {
    try {
      const res = await profilService.getProfilCouple();
      setProfilCouple(res.data || res);
    } catch (error) {
      console.log("Aucun profil couple trouvé");
    } finally {
      setLoading(false);
    }
  };

  const fetchResultatsTests = async () => {
    try {
      const res = await profilService.getResultatsTests();
      setResultatsTests(res.data || res);
    } catch (error) {
      console.log("Aucun résultat de test trouvé");
    }
  };

  const fetchConseils = async () => {
    try {
      const res = await profilService.getConseilsPersonnalises();
      setConseils(res.data || res);
    } catch (error) {
      console.log("Aucun conseil personnalisé trouvé");
    }
  };

  const demarrerTest = (typeTest) => {
    setTestEnCours(typeTest);
    setQuestionActuelle(0);
    setReponsesTest([]);
  };

  const repondreQuestion = (reponse) => {
    const nouvellesReponses = [...reponsesTest, reponse];
    setReponsesTest(nouvellesReponses);

    const questions = testEnCours === 'compatibilite' ? questionsCompatibilite : questionsLoveLanguages;
    
    if (questionActuelle + 1 < questions.length) {
      setQuestionActuelle(questionActuelle + 1);
    } else {
      terminerTest(nouvellesReponses);
    }
  };

  const terminerTest = async (reponses) => {
    try {
      let resultat;
      
      if (testEnCours === 'compatibilite') {
        resultat = await profilService.passerTestCompatibilite(reponses);
      } else if (testEnCours === 'love-languages') {
        resultat = await profilService.passerTestLoveLanguages(reponses);
      } else if (testEnCours === 'personnalite') {
        resultat = await profilService.passerTestPersonnalite(reponses);
      }

      setResultatsTests(prev => [resultat.data || resultat, ...prev]);
      setTestEnCours(null);
      setQuestionActuelle(0);
      setReponsesTest([]);

      toast({
        title: "Test terminé !",
        description: "Découvrez vos résultats dans l'onglet Résultats",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les résultats",
        variant: "destructive",
      });
    }
  };

  const calculerCompatibilite = (resultats) => {
    if (!resultats || !Array.isArray(resultats)) return 0;
    const totalPoints = resultats.reduce((acc, r) => acc + (r.points || 0), 0);
    const maxPoints = resultats.length * 5;
    return Math.round((totalPoints / maxPoints) * 100);
  };

  const getLoveLanguagePrincipal = (resultats) => {
    if (!resultats || !Array.isArray(resultats)) return "Non défini";
    
    const categories = {};
    resultats.forEach(r => {
      if (r.category) {
        categories[r.category] = (categories[r.category] || 0) + 1;
      }
    });

    const categorieMax = Object.keys(categories).reduce((a, b) => 
      categories[a] > categories[b] ? a : b, 'temps'
    );

    const traductions = {
      'mots': 'Mots d\'affirmation',
      'contact': 'Contact physique',
      'cadeaux': 'Cadeaux',
      'services': 'Services rendus',
      'temps': 'Temps de qualité'
    };

    return traductions[categorieMax] || 'Non défini';
  };

  const TestInterface = () => {
    const questions = testEnCours === 'compatibilite' ? questionsCompatibilite : questionsLoveLanguages;
    const question = questions[questionActuelle];
    const progress = ((questionActuelle + 1) / questions.length) * 100;

    return (
      <Card className="p-6 border border-blue-200 bg-blue-50">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-800">
              {testsDisponibles.find(t => t.id === testEnCours)?.nom}
            </h3>
            <span className="text-sm text-blue-600">
              {questionActuelle + 1}/{questions.length}
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
          <h4 className="font-medium text-gray-800 mb-4">
            {question.question}
          </h4>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full text-left justify-start p-4 h-auto"
                onClick={() => repondreQuestion(option)}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={() => setTestEnCours(null)}
          className="text-blue-600"
        >
          Annuler le test
        </Button>
      </Card>
    );
  };

  const ResultatCard = ({ resultat }) => {
    const testInfo = testsDisponibles.find(t => t.id === resultat.typeTest);
    
    return (
      <Card className={`p-4 border border-${testInfo?.color || 'gray'}-200 bg-${testInfo?.color || 'gray'}-50`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{testInfo?.icon || '📊'}</span>
            <div>
              <h4 className={`font-medium text-${testInfo?.color || 'gray'}-800`}>
                {testInfo?.nom || resultat.typeTest}
              </h4>
              <p className={`text-sm text-${testInfo?.color || 'gray'}-600`}>
                Passé le {new Date(resultat.dateTest).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Award className={`w-5 h-5 text-${testInfo?.color || 'gray'}-600`} />
        </div>

        <div className="space-y-3">
          {resultat.typeTest === 'compatibilite' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Compatibilité</span>
                <span className={`text-lg font-bold text-${testInfo?.color || 'gray'}-700`}>
                  {calculerCompatibilite(resultat.reponses)}%
                </span>
              </div>
              <div className={`w-full bg-${testInfo?.color || 'gray'}-200 rounded-full h-3`}>
                <div 
                  className={`bg-${testInfo?.color || 'gray'}-500 h-3 rounded-full transition-all duration-300`}
                  style={{ width: `${calculerCompatibilite(resultat.reponses)}%` }}
                ></div>
              </div>
            </div>
          )}

          {resultat.typeTest === 'love-languages' && (
            <div>
              <p className="text-sm font-medium mb-1">Votre langage d'amour principal :</p>
              <p className={`text-lg font-bold text-${testInfo?.color || 'gray'}-700`}>
                {getLoveLanguagePrincipal(resultat.reponses)}
              </p>
            </div>
          )}

          {resultat.interpretation && (
            <div className={`p-3 bg-white rounded border border-${testInfo?.color || 'gray'}-200`}>
              <p className="text-sm text-gray-700">{resultat.interpretation}</p>
            </div>
          )}

          {resultat.conseils && resultat.conseils.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Conseils personnalisés :</p>
              <ul className="text-sm space-y-1">
                {resultat.conseils.slice(0, 2).map((conseil, index) => (
                  <li key={index} className={`text-${testInfo?.color || 'gray'}-700`}>
                    • {conseil}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
            <Users className="w-5 h-5 mr-2 text-pink-500" />
            <span className={isMobile ? 'text-lg' : ''}>Profils couple</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Onglets */}
        <div className={`flex mb-6 ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
          <Button
            variant={activeTab === 'profil' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('profil')}
            className={`${activeTab === 'profil' ? 'bg-pink-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''}`}
          >
            <Users className="w-4 h-4 mr-2" />
            Profil couple
          </Button>
          <Button
            variant={activeTab === 'tests' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('tests')}
            className={`${activeTab === 'tests' ? 'bg-pink-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''}`}
          >
            <Brain className="w-4 h-4 mr-2" />
            Tests disponibles
          </Button>
          <Button
            variant={activeTab === 'resultats' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('resultats')}
            className={`${activeTab === 'resultats' ? 'bg-pink-500 text-white' : 'text-gray-700'} ${isMobile ? 'w-full' : ''}`}
          >
            <Award className="w-4 h-4 mr-2" />
            Résultats ({resultatsTests.length})
          </Button>
        </div>

        {/* Interface de test en cours */}
        {testEnCours && <TestInterface />}

        {/* Contenu des onglets */}
        {!testEnCours && (
          <>
            {activeTab === 'profil' && (
              <div className="space-y-6">
                {/* Résumé du couple */}
                <Card className="p-4 border border-pink-200 bg-pink-50">
                  <h3 className="font-medium mb-4 text-pink-800 flex items-center">
                    <Heart className="w-4 h-4 mr-2" />
                    Votre profil de couple
                  </h3>
                  
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div className="bg-white p-3 rounded border border-pink-200">
                      <h4 className="font-medium text-gray-800 mb-2">Compatibilité générale</h4>
                      {resultatsTests.find(r => r.typeTest === 'compatibilite') ? (
                        <div className="flex items-center space-x-2">
                          <div className="text-2xl font-bold text-pink-600">
                            {calculerCompatibilite(resultatsTests.find(r => r.typeTest === 'compatibilite')?.reponses)}%
                          </div>
                          <div className="text-sm text-pink-600">Compatible</div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Test de compatibilité non passé</p>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded border border-pink-200">
                      <h4 className="font-medium text-gray-800 mb-2">Langages d'amour</h4>
                      {resultatsTests.find(r => r.typeTest === 'love-languages') ? (
                        <div>
                          <p className="text-sm font-medium text-pink-600">
                            {getLoveLanguagePrincipal(resultatsTests.find(r => r.typeTest === 'love-languages')?.reponses)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Test non passé</p>
                      )}
                    </div>
                  </div>

                  {profilCouple && (
                    <div className="mt-4 p-3 bg-white rounded border border-pink-200">
                      <h4 className="font-medium text-gray-800 mb-2">Points forts de votre relation</h4>
                      <div className="flex flex-wrap gap-2">
                        {profilCouple.pointsForts?.map((point, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            ✓ {point}
                          </span>
                        )) || (
                          <span className="text-sm text-gray-500">Passez des tests pour découvrir vos points forts</span>
                        )}
                      </div>
                    </div>
                  )}
                </Card>

                {/* Conseils personnalisés */}
                {conseils.length > 0 && (
                  <Card className="p-4 border border-blue-200 bg-blue-50">
                    <h3 className="font-medium mb-4 text-blue-800 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Conseils personnalisés
                    </h3>
                    <div className="space-y-3">
                      {conseils.slice(0, 3).map((conseil, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-blue-200">
                          <p className="text-sm text-gray-700">{conseil.contenu}</p>
                          {conseil.categorie && (
                            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {conseil.categorie}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Statistiques de tests */}
                <Card className="p-4 border border-gray-200">
                  <h3 className="font-medium mb-4 text-gray-800">Progression des tests</h3>
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    {testsDisponibles.map(test => {
                      const testPasse = resultatsTests.find(r => r.typeTest === test.id);
                      return (
                        <div key={test.id} className={`p-3 rounded border ${
                          testPasse ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{test.icon}</span>
                            <div>
                              <p className="font-medium text-sm">{test.nom}</p>
                              <p className={`text-xs ${testPasse ? 'text-green-600' : 'text-gray-500'}`}>
                                {testPasse ? 'Terminé' : 'Non passé'}
                              </p>
                            </div>
                          </div>
                          {testPasse && (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Découvrez votre relation sous un nouveau jour
                  </h3>
                  <p className="text-sm text-gray-600">
                    Passez nos tests scientifiques pour mieux vous comprendre en tant que couple
                  </p>
                </div>

                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {testsDisponibles.map(test => {
                    const testPasse = resultatsTests.find(r => r.typeTest === test.id);
                    return (
                      <Card key={test.id} className={`p-4 border border-${test.color}-200 bg-${test.color}-50`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl">{test.icon}</span>
                            <div>
                              <h4 className={`font-medium text-${test.color}-800`}>{test.nom}</h4>
                              <p className={`text-sm text-${test.color}-600`}>{test.description}</p>
                              <p className={`text-xs text-${test.color}-500 mt-1`}>Durée: {test.duree}</p>
                            </div>
                          </div>
                          {testPasse && (
                            <CheckCircle className={`w-5 h-5 text-${test.color}-600`} />
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => demarrerTest(test.id)}
                            className={`bg-${test.color}-500 hover:bg-${test.color}-600 flex-1`}
                            size="sm"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {testPasse ? 'Repasser' : 'Commencer'}
                          </Button>
                          {testPasse && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={`border-${test.color}-300 text-${test.color}-600`}
                            >
                              Voir résultat
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Informations sur les tests */}
                <Card className="p-4 border border-gray-200 bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-2">À propos de nos tests</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Les tests sont basés sur des recherches scientifiques en psychologie des relations</li>
                    <li>• Vos réponses restent privées et sécurisées</li>
                    <li>• Vous pouvez repasser les tests autant de fois que vous le souhaitez</li>
                    <li>• Les résultats sont personnalisés pour votre couple</li>
                  </ul>
                </Card>
              </div>
            )}

            {activeTab === 'resultats' && (
              <div className="space-y-4">
                {resultatsTests.length > 0 ? (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Vos résultats de tests
                      </h3>
                      <p className="text-sm text-gray-600">
                        Découvrez les insights sur votre relation
                      </p>
                    </div>

                    <div className="space-y-4">
                      {resultatsTests.map((resultat, index) => (
                        <ResultatCard key={index} resultat={resultat} />
                      ))}
                    </div>

                    {/* Évolution dans le temps */}
                    {resultatsTests.length > 1 && (
                      <Card className="p-4 border border-green-200 bg-green-50">
                        <h4 className="font-medium text-green-800 mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Évolution de votre relation
                        </h4>
                        <p className="text-sm text-green-700">
                          Vous avez passé {resultatsTests.length} tests. C'est formidable de voir votre engagement 
                          à mieux comprendre votre relation !
                        </p>
                      </Card>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun test passé pour le moment</p>
                    <p className="text-sm mt-2">Commencez par passer votre premier test de personnalité !</p>
                    <Button
                      onClick={() => setActiveTab('tests')}
                      className="mt-4 bg-pink-500 hover:bg-pink-600"
                    >
                      Découvrir les tests
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

export default ProfilsSection;