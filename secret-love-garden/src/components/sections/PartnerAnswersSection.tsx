import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Search, Filter, Calendar, MessageCircle, Star, Eye, EyeOff } from "lucide-react";
import questionService from "@/services/questions.service";

const PartnerAnswersSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [reponsesPartenaire, setReponsesPartenaire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("tous");
  const [sortBy, setSortBy] = useState("recent");
  const [favoriteAnswers, setFavoriteAnswers] = useState([]);

  const filterOptions = [
    { value: "tous", label: "Toutes les réponses" },
    { value: "quotidiennes", label: "Questions du jour" },
    { value: "personnalisees", label: "Questions personnalisées" },
    { value: "favorites", label: "Mes favorites" }
  ];

  const sortOptions = [
    { value: "recent", label: "Plus récentes" },
    { value: "ancien", label: "Plus anciennes" },
    { value: "alphabetique", label: "Alphabétique" }
  ];

  useEffect(() => {
    fetchReponsesPartenaire();
    loadFavoriteAnswers();
  }, []);

  const fetchReponsesPartenaire = async () => {
    setLoading(true);
    try {
      const res = await questionService.getReponsesPartenaire();
      
      const reponsesFormatees = (res.data || res).map(reponse => ({
        id: reponse._id,
        questionId: reponse.question._id,
        questionTexte: reponse.question.texte,
        questionType: reponse.question.type,
        reponseTexte: reponse.texte,
        dateReponse: reponse.dateReponse,
        lu: reponse.lu || false,
      }));

      setReponsesPartenaire(reponsesFormatees);

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les réponses du partenaire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteAnswers = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteAnswers') || '[]');
    setFavoriteAnswers(favorites);
  };

  const toggleFavorite = (reponseId) => {
    const updatedFavorites = favoriteAnswers.includes(reponseId)
      ? favoriteAnswers.filter(id => id !== reponseId)
      : [...favoriteAnswers, reponseId];
    
    setFavoriteAnswers(updatedFavorites);
    localStorage.setItem('favoriteAnswers', JSON.stringify(updatedFavorites));
    
    toast({
      title: favoriteAnswers.includes(reponseId) ? "Retiré des favorites" : "Ajouté aux favorites",
      description: favoriteAnswers.includes(reponseId) 
        ? "Cette réponse n'est plus dans vos favorites"
        : "Cette réponse a été ajoutée à vos favorites",
    });
  };

  const marquerCommeLu = async (reponseId) => {
    // Ici vous pourriez appeler une API pour marquer comme lu
    setReponsesPartenaire(prev => 
      prev.map(rep => 
        rep.id === reponseId ? { ...rep, lu: true } : rep
      )
    );
  };

  const filteredAndSortedReponses = reponsesPartenaire
    .filter(reponse => {
      // Filtre par terme de recherche
      const matchesSearch = reponse.questionTexte.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reponse.reponseTexte.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par type
      let matchesFilter = true;
      switch (filterType) {
        case "quotidiennes":
          matchesFilter = reponse.questionType === "quotidienne";
          break;
        case "personnalisees":
          matchesFilter = reponse.questionType === "personnalisee";
          break;
        case "favorites":
          matchesFilter = favoriteAnswers.includes(reponse.id);
          break;
        default:
          matchesFilter = true;
      }
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.dateReponse).getTime() - new Date(a.dateReponse).getTime();
        case "ancien":
          return new Date(a.dateReponse).getTime() - new Date(b.dateReponse).getTime();
        case "alphabetique":
          return a.questionTexte.localeCompare(b.questionTexte);
        default:
          return 0;
      }
    });

  const ReponseCard = ({ reponse }) => {
    const isFavorite = favoriteAnswers.includes(reponse.id);
    
    return (
      <div className={`p-4 rounded-lg border transition-all duration-200 ${
        !reponse.lu ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
      } hover:shadow-md`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                reponse.questionType === 'personnalisee' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {reponse.questionType === 'personnalisee' ? 'Question personnalisée' : 'Question du jour'}
              </span>
              {!reponse.lu && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
            <h3 className={`font-medium text-gray-800 mb-2 ${isMobile ? 'text-sm' : ''}`}>
              {reponse.questionTexte}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(reponse.id)}
              className={`${isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            {!reponse.lu && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => marquerCommeLu(reponse.id)}
                className="text-blue-500 hover:text-blue-600"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="bg-pink-50 p-3 rounded-lg border border-pink-200 mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-4 h-4 text-pink-600" />
            <span className="font-medium text-pink-800 text-sm">
              Réponse de {partenaire?.nom || 'votre partenaire'}
            </span>
          </div>
          <p className={`text-pink-700 ${isMobile ? 'text-sm' : ''}`}>
            {reponse.reponseTexte}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(reponse.dateReponse).toLocaleDateString()}
          </span>
          {reponse.questionCategorie && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {reponse.questionCategorie}
            </span>
          )}
        </div>
      </div>
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
        <CardTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
          <Heart className="w-5 h-5 mr-2 text-pink-500" />
          Réponses de {partenaire?.nom || 'votre partenaire'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistiques */}
        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
            <div className="text-2xl font-bold text-pink-600">
              {reponsesPartenaire.length}
            </div>
            <div className="text-sm text-pink-600">Réponses total</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {reponsesPartenaire.filter(r => !r.lu).length}
            </div>
            <div className="text-sm text-blue-600">Non lues</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {favoriteAnswers.length}
            </div>
            <div className="text-sm text-yellow-600">Favorites</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {reponsesPartenaire.filter(r => r.questionType === 'personnalisee').length}
            </div>
            <div className="text-sm text-purple-600">Personnalisées</div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className={`space-y-4 mb-6 ${isMobile ? '' : 'flex items-center space-x-4 space-y-0'}`}>
          <div className={`flex items-center space-x-2 ${isMobile ? 'w-full' : 'flex-1'}`}>
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher dans les réponses..."
              className="border-gray-300"
            />
          </div>
          
          <div className={`flex space-x-2 ${isMobile ? 'w-full' : ''}`}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded-md text-sm ${isMobile ? 'flex-1' : ''}`}
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded-md text-sm ${isMobile ? 'flex-1' : ''}`}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des réponses */}
        {filteredAndSortedReponses.length > 0 ? (
          <div className="space-y-4">
            {filteredAndSortedReponses.map((reponse) => (
              <ReponseCard key={reponse.id} reponse={reponse} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterType !== "tous" ? (
              <>
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune réponse trouvée</p>
                <p className="text-sm mt-2">Essayez de modifier vos filtres de recherche</p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("tous");
                  }}
                  className="mt-4 bg-pink-500 hover:bg-pink-600"
                  size="sm"
                >
                  Réinitialiser les filtres
                </Button>
              </>
            ) : (
              <>
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune réponse de votre partenaire pour le moment</p>
                <p className="text-sm mt-2">
                  Les réponses apparaîtront ici dès que votre partenaire répondra aux questions
                </p>
              </>
            )}
          </div>
        )}

        {/* Actions rapides */}
        {reponsesPartenaire.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">Actions rapides</h4>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <Button
                onClick={() => setFilterType("favorites")}
                variant="outline"
                size="sm"
                className={`border-blue-200 hover:bg-blue-50 ${isMobile ? 'w-full' : ''}`}
              >
                <Star className="w-4 h-4 mr-2" />
                Voir mes favorites
              </Button>
              <Button
                onClick={() => {
                  reponsesPartenaire.forEach(r => {
                    if (!r.lu) marquerCommeLu(r.id);
                  });
                }}
                variant="outline"
                size="sm"
                className={`border-blue-200 hover:bg-blue-50 ${isMobile ? 'w-full' : ''}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Tout marquer comme lu
              </Button>
              <Button
                onClick={() => setSortBy("recent")}
                variant="outline"
                size="sm"
                className={`border-blue-200 hover:bg-blue-50 ${isMobile ? 'w-full' : ''}`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Plus récentes
              </Button>
            </div>
          </div>
        )}

        {/* Encouragement */}
        {reponsesPartenaire.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
            <h4 className="font-medium text-pink-800 mb-2">💝 Le saviez-vous ?</h4>
            <p className="text-sm text-pink-700">
              Prendre le temps de lire et apprécier les réponses de votre partenaire renforce votre 
              connexion émotionnelle. N'hésitez pas à en discuter ensemble !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerAnswersSection;