import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Plus, Calendar, Camera, Star, Plane, Map, Heart, Trash2, Edit3, Globe, Utensils, Coffee, Film, ShoppingBag, TreePine, Mountain, Building2, Clock, Users, Navigation, Search, Filter, X, ExternalLink } from "lucide-react";
import voyageService from "@/services/voyage.service";
import LieuPresentationPage from "./LieuPresentationPage";
import lieuxGuide from "@/data/lieux_guide.json";

interface Souvenir {
  titre: string;
  description: string;
  date?: string;
  lieu?: string;
  adresse?: string;
  images?: (string | { url: string; legende?: string })[];
}

interface Voyage {
  _id: string;
  titre: string;
  destination: string;
  description?: string;
  adresse?: string;
  dateDebut?: string;
  dateFin?: string;
  statut: string;
  souvenirs?: Souvenir[];
  images?: string[];
}

interface VoyagesSectionProps {
  currentUser: {
    _id: string;
    nom: string;
    email: string;
  };
  partenaire: {
    _id: string;
    nom: string;
    email: string;
  };
  isMobile: boolean;
  toast: (options: { title: string; description: string; variant?: string }) => void;
}

interface LieuData {
  id: string;
  pays: string;
  ville: string;
  categorie: string;
  nom: string;
  type?: string;
  description: string;
  specialites?: string[];
  budget?: string;
  horaires?: string;
  contact?: string;
  note?: string;
  avis?: string;
  decor?: string;
  animation?: string;
  special?: string;
  service?: string;
  public?: string;
  fraicheur?: string;
  ideal?: string;
  conseils?: string;
  activites?: string[];
  images?: string[];
  videos?: string[];
  details?: string;
  liens?: {
    maps?: string;
    instagram?: string;
    site?: string;
    youtube?: string;
    tiktok?: string;
    applemaps?: string;
  };
}

const VoyagesSection = ({ currentUser, partenaire, isMobile, toast }: VoyagesSectionProps) => {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('voyages');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSouvenirForm, setShowSouvenirForm] = useState<string | null>(null);
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  
  // Nouveaux états pour les pages de lieux
  const [lieuSelectionne, setLieuSelectionne] = useState<LieuData | null>(null);
  
  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filtres, setFiltres] = useState({
    categorie: '',
    ville: '',
    budget: '',
    type: ''
  });
  
  const [nouveauVoyage, setNouveauVoyage] = useState({
    titre: '',
    destination: '',
    description: '',
    adresse: '',
    dateDebut: '',
    dateFin: '',
    statut: 'planifie',
    images: []
  });

  const [nouveauSouvenir, setNouveauSouvenir] = useState<{
    titre: string;
    description: string;
    date: string;
    lieu: string;
    adresse: string;
    images: (File | string | { url: string; legende?: string })[];
  }>({
    titre: '',
    description: '',
    date: '',
    lieu: '',
    adresse: '',
    images: []
  });

  const statutsVoyage = [
    { value: 'planifie', label: 'Planifié', color: 'blue', icon: '📋', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-200' },
    { value: 'en_cours', label: 'En cours', color: 'yellow', icon: '✈️', bgClass: 'bg-yellow-50', textClass: 'text-yellow-700', borderClass: 'border-yellow-200' },
    { value: 'termine', label: 'Terminé', color: 'green', icon: '✅', bgClass: 'bg-green-50', textClass: 'text-green-700', borderClass: 'border-green-200' },
    { value: 'annule', label: 'Annulé', color: 'gray', icon: '❌', bgClass: 'bg-gray-50', textClass: 'text-gray-700', borderClass: 'border-gray-200' }
  ];

  // Obtenir les options uniques pour les filtres
  const getFilterOptions = () => {
    const categories = [...new Set(lieuxGuide.map(lieu => lieu.categorie))];
    const villes = [...new Set(lieuxGuide.map(lieu => lieu.ville))];
    const types = [...new Set(lieuxGuide.map(lieu => lieu.type))];
    
    return { categories, villes, types };
  };

  // Filtrer les lieux selon les critères
  const getFilteredLieux = () => {
    let filtered = lieuxGuide;

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(lieu => 
        lieu.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lieu.specialites?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtres par catégorie
    if (filtres.categorie) {
      filtered = filtered.filter(lieu => lieu.categorie === filtres.categorie);
    }

    if (filtres.ville) {
      filtered = filtered.filter(lieu => lieu.ville === filtres.ville);
    }

    if (filtres.type) {
      filtered = filtered.filter(lieu => lieu.type === filtres.type);
    }

    return filtered;
  };

  const resetFilters = () => {
    setFiltres({
      categorie: '',
      ville: '',
      budget: '',
      type: ''
    });
    setSearchTerm('');
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  const fetchVoyages = async () => {
    try {
      const response = await voyageService.getVoyages();
      setVoyages(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des voyages:", error);
      setLoading(false);
    }
  };

  const handleCreateVoyage = async () => {
    try {
      await voyageService.createVoyage(nouveauVoyage);
      toast({
        title: "Voyage créé !",
        description: "Votre nouveau voyage a été ajouté avec succès.",
      });
      setShowCreateForm(false);
      setNouveauVoyage({
        titre: '',
        destination: '',
        description: '',
        adresse: '',
        dateDebut: '',
        dateFin: '',
        statut: 'planifie',
        images: []
      });
      fetchVoyages();
    } catch (error) {
      console.error("Erreur lors de la création du voyage:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le voyage.",
        variant: "destructive",
      });
    }
  };

  const handleAddSouvenir = async (voyageId: string) => {
    try {
      await voyageService.addSouvenir(voyageId, nouveauSouvenir);
      toast({
        title: "Souvenir ajouté !",
        description: "Votre souvenir a été ajouté avec succès.",
      });
      setShowSouvenirForm(null);
      setNouveauSouvenir({
        titre: '',
        description: '',
        date: '',
        lieu: '',
        adresse: '',
        images: []
      });
      fetchVoyages();
    } catch (error) {
      console.error("Erreur lors de l'ajout du souvenir:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le souvenir.",
        variant: "destructive",
      });
    }
  };

  const handleChangeStatus = async (voyageId: string, newStatus: string) => {
    try {
      await voyageService.modifierStatutVoyage(voyageId, newStatus);
      toast({
        title: "Statut mis à jour !",
        description: "Le statut du voyage a été modifié.",
      });
      fetchVoyages();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVoyage = async (voyageId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce voyage ?")) {
      try {
        await voyageService.deleteVoyage(voyageId);
        toast({
          title: "Voyage supprimé !",
          description: "Le voyage a été supprimé avec succès.",
        });
        fetchVoyages();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le voyage.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatutInfo = (statut: string) => {
    return statutsVoyage.find(s => s.value === statut) || statutsVoyage[0];
  };

  const getCategoryIcon = (categorie: string) => {
    const icons = {
      'restaurant': <Utensils className="w-5 h-5" />,
      'cafe': <Coffee className="w-5 h-5" />,
      'cinema': <Film className="w-5 h-5" />,
      'shopping': <ShoppingBag className="w-5 h-5" />,
      'nature': <TreePine className="w-5 h-5" />,
      'montagne': <Mountain className="w-5 h-5" />,
      'monument': <Building2 className="w-5 h-5" />,
      'default': <MapPin className="w-5 h-5" />
    };
    return icons[categorie] || icons.default;
  };

  // Fonction pour gérer l'upload d'images
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNouveauSouvenir(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  // Fonction pour supprimer une image
  const removeImage = (index: number) => {
    setNouveauSouvenir(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const VoyageCard = ({ voyage }: { voyage: Voyage }) => {
    const statutInfo = getStatutInfo(voyage.statut);
    
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{voyage.titre}</h3>
            <div className="flex items-center text-gray-600 mb-1">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{voyage.destination}</span>
            </div>
            {voyage.adresse && (
              <div className="flex items-center text-gray-500 text-sm">
                <Navigation className="w-3 h-3 mr-2" />
                <span>{voyage.adresse}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statutInfo.bgClass} ${statutInfo.textClass} border ${statutInfo.borderClass}`}>
              {statutInfo.icon} {statutInfo.label}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteVoyage(voyage._id)}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {voyage.description && (
          <p className="text-gray-700 mb-4 text-sm leading-relaxed">{voyage.description}</p>
        )}

        {/* Dates */}
        <div className="flex flex-wrap gap-3 mb-4">
          {voyage.dateDebut && (
            <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200">
              <Calendar className="w-3 h-3 mr-2" />
              <span className="text-xs font-medium">Début: {new Date(voyage.dateDebut).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
          {voyage.dateFin && (
            <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-200">
              <Clock className="w-3 h-3 mr-2" />
              <span className="text-xs font-medium">Fin: {new Date(voyage.dateFin).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
        </div>

        {/* Boutons de statut rapides */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={voyage.statut === 'planifie' ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeStatus(voyage._id, 'planifie')}
            className={`text-xs font-medium ${
              voyage.statut === 'planifie' 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'border-blue-200 text-blue-700 hover:bg-blue-50'
            }`}
          >
            📋 Planifié
          </Button>
          <Button
            variant={voyage.statut === 'en_cours' ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeStatus(voyage._id, 'en_cours')}
            className={`text-xs font-medium ${
              voyage.statut === 'en_cours' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'
            }`}
          >
            ✈️ En cours
          </Button>
          <Button
            variant={voyage.statut === 'termine' ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeStatus(voyage._id, 'termine')}
            className={`text-xs font-medium ${
              voyage.statut === 'termine' 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'border-green-200 text-green-700 hover:bg-green-50'
            }`}
          >
            ✅ Terminé
          </Button>
          <Button
            variant={voyage.statut === 'annule' ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeStatus(voyage._id, 'annule')}
            className={`text-xs font-medium ${
              voyage.statut === 'annule' 
                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ❌ Annulé
          </Button>
        </div>

        {/* Bouton ajouter souvenir */}
        <Button
          onClick={() => setShowSouvenirForm(voyage._id)}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 text-sm mb-4"
        >
          <Heart className="w-4 h-4 mr-2" />
          Ajouter un souvenir
        </Button>

        {/* Liste des souvenirs avec images */}
        {voyage.souvenirs && voyage.souvenirs.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <Heart className="w-4 h-4 text-pink-500 mr-2" />
              <h4 className="font-medium text-gray-900 text-sm">Souvenirs ({voyage.souvenirs.length})</h4>
            </div>
            <div className="space-y-3">
              {voyage.souvenirs.map((souvenir, index) => (
                <div key={index} className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                  <div className="font-medium text-pink-800 text-sm mb-2">{souvenir.titre}</div>
                  
                  {/* Images du souvenir */}
                  {souvenir.images && souvenir.images.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {souvenir.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <img 
                              src={typeof image === 'string' ? image : image.url} 
                              alt={`${souvenir.titre} - Image ${imgIndex + 1}`}
                              className="w-full h-20 object-cover rounded-md border border-pink-200 group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-md flex items-center justify-center">
                              <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Description et date */}
                  <div className="text-pink-700 text-sm mb-2">{souvenir.description}</div>
                  {souvenir.date && (
                    <div className="flex items-center text-pink-600 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(souvenir.date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Chargement de vos aventures...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si un lieu est sélectionné, afficher sa page de présentation
  if (lieuSelectionne) {
    return (
      <LieuPresentationPage
        lieu={lieuSelectionne}
        ville={lieuSelectionne.ville || "Dakar"}
        onBack={() => setLieuSelectionne(null)}
      />
    );
  }

  const filteredLieux = getFilteredLieux();
  const { categories, villes, types } = getFilterOptions();

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-4' : ''}`}>
          <div className="flex items-center">
            {activeTab === 'carte' ? <Globe className="w-5 h-5 mr-2 text-gray-600" /> : 
             activeTab === 'propositions' ? <Heart className="w-5 h-5 mr-2 text-pink-500" /> : 
             <MapPin className="w-5 h-5 mr-2 text-gray-600" />}
            <span className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {activeTab === 'carte' ? 'Carte des voyages' : 
               activeTab === 'propositions' ? 'Destinations romantiques' : 
               'Carnet de voyage'}
            </span>
          </div>
          <div className={`flex space-x-3 ${isMobile ? 'w-full flex-col space-x-0 space-y-3' : ''}`}>
            {activeTab === 'voyages' ? (
              <>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className={`bg-pink-500 hover:bg-pink-600 text-white ${isMobile ? 'w-full' : ''}`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau voyage
                </Button>
                <Button
                  onClick={() => setActiveTab('propositions')}
                  variant="outline"
                  className={`border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? 'w-full' : ''}`}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Inspirations
                </Button>
                <Button
                  onClick={() => setActiveTab('carte')}
                  variant="outline"
                  className={`border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? 'w-full' : ''}`}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Carte
                </Button>
              </>
            ) : activeTab === 'propositions' ? (
              <>
                <Button
                  onClick={() => setActiveTab('voyages')}
                  variant="outline"
                  className={`border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? 'w-full' : ''}`}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Mes voyages
                </Button>
                <Button
                  onClick={() => setActiveTab('carte')}
                  variant="outline"
                  className={`border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? 'w-full' : ''}`}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Carte
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setActiveTab('voyages')}
                  variant="outline"
                  className={`border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? 'w-full' : ''}`}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Mes voyages
                </Button>
                <Button
                  onClick={() => setActiveTab('propositions')}
                  variant="outline"
                  className={`border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? 'w-full' : ''}`}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Inspirations
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activeTab === 'propositions' ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Découvrez des lieux romantiques</h2>
              <p className="text-gray-600">Des destinations parfaites pour créer des souvenirs à deux</p>
            </div>
            
            {/* Barre de recherche et filtres */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className={`${isMobile ? 'space-y-3' : 'flex items-center space-x-4'}`}>
                {/* Barre de recherche */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un lieu, une ville, une spécialité..."
                    className="pl-9 border-gray-300 focus:border-pink-500"
                  />
                </div>
                
                {/* Bouton filtres */}
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className={`border-gray-300 text-gray-700 hover:bg-gray-100 ${isMobile ? 'w-full' : ''}`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                  {(filtres.categorie || filtres.ville || filtres.type) && (
                    <span className="ml-2 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {[filtres.categorie, filtres.ville, filtres.type].filter(Boolean).length}
                    </span>
                  )}
                </Button>
                
                {/* Bouton reset */}
                {(searchTerm || filtres.categorie || filtres.ville || filtres.type) && (
                  <Button
                    onClick={resetFilters}
                    variant="ghost"
                    className={`text-gray-600 hover:bg-gray-100 ${isMobile ? 'w-full' : ''}`}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Effacer
                  </Button>
                )}
              </div>
              
              {/* Panneau de filtres */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-4'}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={filtres.categorie}
                        onChange={(e) => setFiltres(prev => ({ ...prev, categorie: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-pink-500 bg-white text-sm"
                      >
                        <option value="">Toutes les catégories</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                      <select
                        value={filtres.ville}
                        onChange={(e) => setFiltres(prev => ({ ...prev, ville: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-pink-500 bg-white text-sm"
                      >
                        <option value="">Toutes les villes</option>
                        {villes.map(ville => (
                          <option key={ville} value={ville}>{ville}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={filtres.type}
                        onChange={(e) => setFiltres(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-pink-500 bg-white text-sm"
                      >
                        <option value="">Tous les types</option>
                        {types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        onClick={() => setShowFilters(false)}
                        className={`bg-pink-500 hover:bg-pink-600 text-white ${isMobile ? 'w-full' : ''}`}
                      >
                        Appliquer
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Résultats */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm">
                {filteredLieux.length} destination{filteredLieux.length > 1 ? 's' : ''} trouvée{filteredLieux.length > 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLieux.map((lieu) => (
                <div
                  key={lieu.id}
                  className="group cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                  onClick={() => setLieuSelectionne(lieu)}
                >
                  {/* Image principale */}
                  <div className="relative h-40 overflow-hidden">
                    {Array.isArray((lieu as LieuData).images) && (lieu as LieuData).images && (lieu as LieuData).images.length > 0 ? (
                      <img 
                        src={(lieu as LieuData).images![0]} 
                        alt={lieu.nom} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        {getCategoryIcon(lieu.categorie)}
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700">
                        {lieu.ville}
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <div className="bg-pink-500 text-white p-1.5 rounded-md">
                        {getCategoryIcon(lieu.categorie)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{lieu.nom}</h3>
                    <p className="text-pink-600 text-sm mb-2">{lieu.type}</p>
                    <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-2">{lieu.description}</p>
                    
                    {/* Spécialités */}
                    {lieu.specialites && lieu.specialites.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {lieu.specialites.slice(0, 2).map((specialite, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                              {specialite}
                            </span>
                          ))}
                          {lieu.specialites.length > 2 && (
                            <span className="text-gray-500 text-xs">+{lieu.specialites.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Informations pratiques */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{lieu.horaires}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{lieu.budget}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 text-sm"
                    >
                      <Heart className="w-4 h-4 mr-2" /> 
                      Découvrir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredLieux.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 p-6 rounded-lg mx-auto max-w-md border border-gray-200">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun résultat trouvé</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {searchTerm 
                      ? `Aucun lieu ne correspond à "${searchTerm}"`
                      : "Aucun lieu ne correspond aux filtres sélectionnés"
                    }
                  </p>
                  <Button
                    onClick={resetFilters}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 text-sm"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'voyages' ? (
          <div className="space-y-6">
            {/* Statistiques */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{voyages.length}</div>
                    <div className="text-blue-600 text-sm">Voyages</div>
                  </div>
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {voyages.filter(v => v.statut === 'termine').length}
                    </div>
                    <div className="text-green-600 text-sm">Terminés</div>
                  </div>
                  <Star className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {voyages.filter(v => v.statut === 'planifie').length}
                    </div>
                    <div className="text-yellow-600 text-sm">À venir</div>
                  </div>
                  <Calendar className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {voyages.reduce((acc, voyage) => acc + (voyage.souvenirs?.length || 0), 0)}
                    </div>
                    <div className="text-purple-600 text-sm">Souvenirs</div>
                  </div>
                  <Heart className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Formulaire nouveau voyage */}
            {showCreateForm && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 p-2 rounded-lg mr-3">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">Planifier un nouveau voyage</h3>
                </div>
                <div className="space-y-4">
                  <Input
                    value={nouveauVoyage.titre}
                    onChange={(e) => setNouveauVoyage(prev => ({ ...prev, titre: e.target.value }))}
                    placeholder="Titre du voyage"
                    className="border-blue-200 focus:border-blue-500"
                  />
                  <Input
                    value={nouveauVoyage.destination}
                    onChange={(e) => setNouveauVoyage(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="Destination"
                    className="border-blue-200 focus:border-blue-500"
                    list="destinations-populaires"
                  />
                  <datalist id="destinations-populaires">
                    {lieuxGuide.map((dest: LieuData, index: number) => (
                      <option key={index} value={dest.nom} />
                    ))}
                  </datalist>
                  <Textarea
                    value={nouveauVoyage.description}
                    onChange={(e) => setNouveauVoyage(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du voyage..."
                    rows={3}
                    className="border-blue-200 focus:border-blue-500"
                  />
                  <Input
                    value={nouveauVoyage.adresse}
                    onChange={(e) => setNouveauVoyage(prev => ({ ...prev, adresse: e.target.value }))}
                    placeholder="Adresse (optionnel)"
                    className="border-blue-200 focus:border-blue-500"
                  />
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                    <div>
                      <label className="text-sm font-medium text-blue-700 block mb-1">Date de début</label>
                      <Input
                        type="date"
                        value={nouveauVoyage.dateDebut}
                        onChange={(e) => setNouveauVoyage(prev => ({ ...prev, dateDebut: e.target.value }))}
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700 block mb-1">Date de fin</label>
                      <Input
                        type="date"
                        value={nouveauVoyage.dateFin}
                        onChange={(e) => setNouveauVoyage(prev => ({ ...prev, dateFin: e.target.value }))}
                        className="border-blue-200 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700 block mb-1">Statut</label>
                      <select
                        value={nouveauVoyage.statut}
                        onChange={(e) => setNouveauVoyage(prev => ({ ...prev, statut: e.target.value }))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500"
                      >
                        {statutsVoyage.map(statut => (
                          <option key={statut.value} value={statut.value}>
                            {statut.icon} {statut.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={`flex space-x-3 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                    <Button
                      onClick={handleCreateVoyage}
                      className={`bg-blue-500 hover:bg-blue-600 text-white ${isMobile ? 'w-full' : 'flex-1'}`}
                    >
                      <Plane className="w-4 h-4 mr-2" />
                      Créer le voyage
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNouveauVoyage({
                          titre: '',
                          destination: '',
                          description: '',
                          adresse: '',
                          dateDebut: '',
                          dateFin: '',
                          statut: 'planifie',
                          images: []
                        });
                      }}
                      className={`border-blue-300 hover:bg-blue-50 ${isMobile ? 'w-full' : ''}`}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire nouveau souvenir */}
            {showSouvenirForm && (
              <div className="bg-pink-50 rounded-lg border border-pink-200 p-4">
                <div className="flex items-center mb-4">
                  <div className="bg-pink-500 p-2 rounded-lg mr-3">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-pink-800">
                    Ajouter un souvenir
                  </h3>
                </div>
                <div className="space-y-4">
                  <Input
                    value={nouveauSouvenir.titre}
                    onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, titre: e.target.value }))}
                    placeholder="Titre du souvenir"
                    className="border-pink-200 focus:border-pink-500"
                  />
                  <Textarea
                    value={nouveauSouvenir.description}
                    onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du moment..."
                    rows={3}
                    className="border-pink-200 focus:border-pink-500"
                  />
                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div>
                      <label className="text-sm font-medium text-pink-700 block mb-1">Date</label>
                      <Input
                        type="date"
                        value={nouveauSouvenir.date}
                        onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, date: e.target.value }))}
                        className="border-pink-200 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-pink-700 block mb-1">Lieu</label>
                      <Input
                        value={nouveauSouvenir.lieu}
                        onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, lieu: e.target.value }))}
                        placeholder="Lieu"
                        className="border-pink-200 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <Input
                    value={nouveauSouvenir.adresse}
                    onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, adresse: e.target.value }))}
                    placeholder="Adresse (optionnel)"
                    className="border-pink-200 focus:border-pink-500"
                  />
                  
                  {/* Upload d'images */}
                  <div>
                    <label className="text-sm font-medium text-pink-700 block mb-2">Images du souvenir</label>
                    <div className="border-2 border-dashed border-pink-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                        <p className="text-pink-600 font-medium">Cliquez pour ajouter des photos</p>
                        <p className="text-pink-500 text-sm">ou glissez-déposez vos images ici</p>
                      </label>
                    </div>
                  </div>

                  {/* Aperçu des images */}
                  {nouveauSouvenir.images.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-pink-700 block mb-2">Aperçu des images ({nouveauSouvenir.images.length})</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {nouveauSouvenir.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image instanceof File ? URL.createObjectURL(image) : (typeof image === 'string' ? image : image.url)} 
                              alt={`Aperçu ${index + 1}`}
                              className="w-full h-20 object-cover rounded-md border border-pink-200"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`flex space-x-3 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                    <Button
                      onClick={() => handleAddSouvenir(showSouvenirForm)}
                      className={`bg-pink-500 hover:bg-pink-600 text-white ${isMobile ? 'w-full' : 'flex-1'}`}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSouvenirForm(null);
                        setNouveauSouvenir({
                          titre: '',
                          description: '',
                          date: '',
                          lieu: '',
                          adresse: '',
                          images: []
                        });
                      }}
                      className={`border-pink-300 hover:bg-pink-50 ${isMobile ? 'w-full' : ''}`}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des voyages */}
            {voyages.length > 0 ? (
              <div className="space-y-4">
                {voyages.map((voyage) => (
                  <VoyageCard key={voyage._id} voyage={voyage} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 p-6 rounded-lg mx-auto max-w-md border border-gray-200">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun voyage créé</h3>
                  <p className="text-gray-600 mb-4 text-sm">Commencez à planifier votre première aventure !</p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer mon premier voyage
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Section Carte */
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Carte de vos voyages</h3>
                <p className="text-gray-600 mb-4">Explorez tous vos voyages sur une carte interactive</p>
                
                {voyages.length > 0 ? (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {voyages.map((voyage) => (
                      <div key={voyage._id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="bg-gray-600 p-2 rounded-lg mr-3">
                                <MapPin className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-800">{voyage.titre}</h4>
                            </div>
                            <p className="text-gray-700 font-medium mb-1 flex items-center">
                              <Navigation className="w-4 h-4 mr-2 text-gray-500" />
                              {voyage.destination}
                            </p>
                            {voyage.adresse && (
                              <p className="text-gray-600 mb-2 flex items-center">
                                <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                                {voyage.adresse}
                              </p>
                            )}
                            {voyage.description && (
                              <p className="text-gray-600 text-sm">{voyage.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button
                              onClick={() => {
                                const searchQuery = encodeURIComponent(`${voyage.destination} ${voyage.adresse || ''}`);
                                window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank');
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 text-sm"
                            >
                              <Map className="w-4 h-4 mr-2" />
                              Google Maps
                            </Button>
                            <Button
                              onClick={() => {
                                const searchQuery = encodeURIComponent(`${voyage.destination} ${voyage.adresse || ''}`);
                                window.open(`https://maps.apple.com/?q=${searchQuery}`, '_blank');
                              }}
                              variant="outline"
                              className="border-gray-300 hover:bg-gray-50 font-medium px-4 py-2 text-sm"
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Apple Maps
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto border border-gray-200">
                      <Map className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Aucun voyage à cartographier</h4>
                      <p className="text-gray-600 mb-4 text-sm">Créez votre premier voyage pour le voir sur la carte !</p>
                      <Button
                        onClick={() => setActiveTab('voyages')}
                        className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Commencer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoyagesSection;