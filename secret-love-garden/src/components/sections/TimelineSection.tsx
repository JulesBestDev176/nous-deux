import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Book, Loader2, Heart, Star, Camera, MapPin, Clock, Edit3, Plus, RotateCcw, Mail, Target } from "lucide-react";
import histoireService from "@/services/histoire.service";

const EvenementHistoire = ({ evenement, isMobile }) => {
  const getIcon = () => {
    switch (evenement.type) {
      case 'question': return <Book className="w-5 h-5 text-purple-500" />;
      case 'message': return <Mail className="w-5 h-5 text-blue-500" />;
      case 'photo': return <Camera className="w-5 h-5 text-pink-500" />;
      case 'objectif': return <Target className="w-5 h-5 text-green-500" />;
      default: return <Heart className="w-5 h-5 text-red-500" />;
    }
  };

  const renderContenu = () => {
    switch (evenement.type) {
      case 'question':
        return (
          <p>
            <strong>{evenement.partenaire?.nom}</strong> a répondu à la question : <em>"{evenement.question?.texte}"</em>
          </p>
        );
      case 'message':
        return (
          <p>
            Un message a été envoyé : <em>"{evenement.message?.contenu}"</em>
          </p>
        );
      case 'photo':
          return (
            <p>
              Une nouvelle photo a été ajoutée à votre galerie.
            </p>
          );
      default:
        // Safely render properties, avoid rendering the object itself
        return <p>Un nouvel événement a eu lieu.</p>;
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        {getIcon()}
      </div>
      <div className="flex-1">
        {renderContenu()}
        <p className="text-xs text-gray-500 mt-1">
          {new Date(evenement.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

const TimelineSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [histoire, setHistoire] = useState(null);
  const [loadingHistoire, setLoadingHistoire] = useState(true);
  const [generatingHistoire, setGeneratingHistoire] = useState(false);
  const [historiqueVersions, setHistoriqueVersions] = useState([]);
  const [showHistorique, setShowHistorique] = useState(false);

  useEffect(() => {
    fetchHistoire();
    fetchHistoriqueVersions();
  }, []);

  const fetchHistoire = async () => {
    setLoadingHistoire(true);
    try {
      const res = await histoireService.getHistorique();
      setHistoire(res.data || res);
    } catch (error) {
      console.log("Aucune histoire trouvée");
    } finally {
      setLoadingHistoire(false);
    }
  };

  const fetchHistoriqueVersions = async () => {
    try {
      const res = await histoireService.getHistoriqueVersions();
      setHistoriqueVersions(res.data || res || []);
    } catch (error) {
      console.log("Aucun historique trouvé");
    }
  };

  const handleGenererHistoire = async () => {
    setGeneratingHistoire(true);
    try {
      const res = await histoireService.genererHistoire();
      const nouvelleHistoire = res.data || res;
      
      // Sauvegarder l'ancienne version dans l'historique si elle existe
      if (histoire) {
        setHistoriqueVersions(prev => [histoire, ...prev]);
      }
      
      setHistoire(nouvelleHistoire);
      
      toast({
        title: "Histoire générée ! ✨",
        description: "Votre belle histoire d'amour a été créée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer l'histoire",
        variant: "destructive",
      });
    } finally {
      setGeneratingHistoire(false);
    }
  };

  const restaurerVersion = async (versionId) => {
    try {
      const res = await histoireService.restaurerVersion(versionId);
      setHistoire(res.data || res);
      toast({
        title: "Version restaurée",
        description: "L'ancienne version de votre histoire a été restaurée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de restaurer cette version",
        variant: "destructive",
      });
    }
  };

  const chapitres = [
    {
      id: 1,
      titre: "La rencontre",
      icon: "💫",
      description: "Comment tout a commencé...",
      couleur: "pink"
    },
    {
      id: 2,
      titre: "Les premiers pas",
      icon: "👫",
      description: "Vos premiers moments ensemble",
      couleur: "purple"
    },
    {
      id: 3,
      titre: "L'épanouissement",
      icon: "🌸",
      description: "Votre relation qui grandit",
      couleur: "rose"
    },
    {
      id: 4,
      titre: "Les aventures",
      icon: "🗺️",
      description: "Vos voyages et découvertes",
      couleur: "blue"
    },
    {
      id: 5,
      titre: "L'avenir ensemble",
      icon: "🌟",
      description: "Vos projets et rêves communs",
      couleur: "yellow"
    }
  ];

  if (loadingHistoire) {
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
            <Calendar className="w-5 h-5 mr-2 text-pink-500" />
            <span className={isMobile ? 'text-lg' : ''}>Notre histoire</span>
          </div>
          <div className={`flex space-x-2 ${isMobile ? 'w-full flex-col space-x-0 space-y-2' : ''}`}>
            {historiqueVersions.length > 0 && (
              <Button
                onClick={() => setShowHistorique(!showHistorique)}
                variant="outline"
                className={`border-pink-200 hover:bg-pink-50 ${isMobile ? 'w-full' : ''}`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Historique ({historiqueVersions.length})
              </Button>
            )}
            <Button
              onClick={handleGenererHistoire}
              disabled={generatingHistoire}
              className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
            >
              {generatingHistoire ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : histoire ? (
                <RotateCcw className="w-4 h-4 mr-2" />
              ) : (
                <Book className="w-4 h-4 mr-2" />
              )}
              {histoire ? "Générer une nouvelle version" : "Générer notre histoire"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Historique des versions */}
        {showHistorique && historiqueVersions.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Versions précédentes
            </h3>
            <div className="space-y-3">
              {historiqueVersions.slice(0, 3).map((version, index) => (
                <div key={index} className="bg-white p-3 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-800">
                        {version.titre || "Notre Histoire d'Amour"}
                      </p>
                      <p className="text-sm text-blue-600">
                        Générée le {new Date(version.dateGeneration).toLocaleDateString()} à{' '}
                        {new Date(version.dateGeneration).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => restaurerVersion(version._id)}
                      size="sm"
                      variant="outline"
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restaurer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Génération en cours */}
        {generatingHistoire && (
          <div className="mb-6 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <h3 className="font-medium text-pink-800 mb-2">
                ✨ Création de votre histoire en cours...
              </h3>
              <p className="text-sm text-pink-600">
                Nous rassemblons vos plus beaux souvenirs pour créer un récit unique
              </p>
            </div>
          </div>
        )}

        {/* Histoire générée */}
        {histoire && !generatingHistoire && (
          <div className="space-y-6">
            <div className="text-center p-6 bg-rose-50 rounded-2xl border border-rose-100">
              <h2 className="text-2xl font-bold text-rose-800 mb-2">
                {histoire.titre || "Notre Belle Histoire"}
              </h2>
              <p className="text-rose-600 max-w-2xl mx-auto">
                {histoire.resume || "Un résumé de vos moments les plus précieux, généré avec amour."}
              </p>
            </div>

            {histoire.evenements && histoire.evenements.length > 0 ? (
              <div className="space-y-4">
                {histoire.evenements.map((evenement) => (
                  <EvenementHistoire key={evenement._id} evenement={evenement} isMobile={isMobile} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun événement à afficher pour le moment.</p>
              </div>
            )}
          </div>
        )}

        {/* État vide - Aucune histoire générée */}
        {!histoire && !generatingHistoire && (
          <div className="text-center py-12">
            <div className="mb-6">
              <Book className="w-16 h-16 mx-auto text-pink-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Votre histoire d'amour attend d'être écrite
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Cliquez sur le bouton ci-dessous pour générer un récit unique de votre relation, 
                basé sur vos interactions et souvenirs partagés.
              </p>
            </div>

            {/* Aperçu des chapitres */}
            <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {chapitres.slice(0, isMobile ? 3 : 6).map((chapitre) => (
                <div key={chapitre.id} className={`p-4 bg-${chapitre.couleur}-50 border border-${chapitre.couleur}-200 rounded-lg`}>
                  <div className="text-2xl mb-2">{chapitre.icon}</div>
                  <h4 className={`font-medium text-${chapitre.couleur}-800 mb-1`}>
                    {chapitre.titre}
                  </h4>
                  <p className={`text-sm text-${chapitre.couleur}-600`}>
                    {chapitre.description}
                  </p>
                </div>
              ))}
            </div>

            <Button
              onClick={handleGenererHistoire}
              disabled={generatingHistoire}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg text-lg"
            >
              <Book className="w-5 h-5 mr-2" />
              Générer notre histoire
            </Button>
          </div>
        )}

        {/* Informations sur la génération */}
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <Star className="w-4 h-4 mr-2" />
            Comment ça marche ?
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• L'IA analyse vos interactions, messages et souvenirs partagés</li>
            <li>• Un récit unique est créé en respectant votre histoire personnelle</li>
            <li>• Vous pouvez générer plusieurs versions et les comparer</li>
            <li>• Chaque histoire est sauvegardée dans votre historique personnel</li>
          </ul>
        </div>

        {/* Conseils pour une meilleure histoire */}
        {(!histoire || historiqueVersions.length === 0) && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Pour une histoire plus riche</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Ajoutez plus de photos dans votre galerie</li>
              <li>• Répondez aux questions du jour régulièrement</li>
              <li>• Créez des rappels pour vos moments importants</li>
              <li>• Partagez vos voyages et sorties dans le carnet de voyage</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineSection;