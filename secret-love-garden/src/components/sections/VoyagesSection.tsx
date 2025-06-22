import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Plus, Calendar, Camera, Star, Plane, Map, Heart, Trash2, Edit3, Globe } from "lucide-react";
import voyageService from "@/services/voyage.service";

const VoyagesSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [voyages, setVoyages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('voyages');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSouvenirForm, setShowSouvenirForm] = useState(null);
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  
  const [nouveauVoyage, setNouveauVoyage] = useState({
    titre: '',
    destination: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    statut: 'planifie',
    images: []
  });

  const [nouveauSouvenir, setNouveauSouvenir] = useState({
    titre: '',
    description: '',
    date: '',
    lieu: '',
    images: []
  });

  const statutsVoyage = [
    { value: 'planifie', label: 'Planifié', color: 'blue', icon: '📋' },
    { value: 'en_cours', label: 'En cours', color: 'yellow', icon: '✈️' },
    { value: 'termine', label: 'Terminé', color: 'green', icon: '✅' },
    { value: 'annule', label: 'Annulé', color: 'red', icon: '❌' }
  ];

  const destinationsPopulaires = [
    '🇫🇷 Paris, France',
    '🇮🇹 Rome, Italie', 
    '🇬🇷 Santorin, Grèce',
    '🇯🇵 Tokyo, Japon',
    '🇺🇸 New York, États-Unis',
    '🇹🇭 Phuket, Thaïlande',
    '🇪🇸 Barcelone, Espagne',
    '🇲🇦 Marrakech, Maroc'
  ];

  useEffect(() => {
    fetchVoyages();
  }, []);

  const fetchVoyages = async () => {
    try {
      const res = await voyageService.getVoyages();
      setVoyages(res.data || res);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les voyages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoyage = async () => {
    if (!nouveauVoyage.titre.trim() || !nouveauVoyage.destination.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le titre et la destination",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await voyageService.creerVoyage(nouveauVoyage);
      setVoyages(prev => [res.data || res, ...prev]);
      setNouveauVoyage({
        titre: '',
        destination: '',
        description: '',
        dateDebut: '',
        dateFin: '',
        statut: 'planifie',
        images: []
      });
      setShowCreateForm(false);
      toast({
        title: "Voyage créé",
        description: "Votre voyage a été ajouté au carnet !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le voyage",
        variant: "destructive",
      });
    }
  };

  const handleAddSouvenir = async (voyageId) => {
    if (!nouveauSouvenir.titre.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez saisir un titre pour le souvenir",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await voyageService.ajouterSouvenir(voyageId, nouveauSouvenir);
      
      // Mettre à jour le voyage avec le nouveau souvenir
      setVoyages(prev => prev.map(voyage => 
        voyage._id === voyageId 
          ? { ...voyage, souvenirs: [...(voyage.souvenirs || []), res.data || res] }
          : voyage
      ));
      
      setNouveauSouvenir({
        titre: '',
        description: '',
        date: '',
        lieu: '',
        images: []
      });
      setShowSouvenirForm(null);
      
      toast({
        title: "Souvenir ajouté",
        description: "Votre souvenir a été ajouté au voyage !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le souvenir",
        variant: "destructive",
      });
    }
  };

  const handleChangeStatus = async (voyageId, newStatus) => {
    try {
      await voyageService.modifierStatutVoyage(voyageId, newStatus);
      setVoyages(prev => prev.map(voyage => 
        voyage._id === voyageId ? { ...voyage, statut: newStatus } : voyage
      ));
      
      const statusInfo = statutsVoyage.find(s => s.value === newStatus);
      toast({
        title: "Statut modifié",
        description: `Le voyage est maintenant ${statusInfo?.label.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVoyage = async (voyageId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce voyage et tous ses souvenirs ?")) {
      try {
        await voyageService.supprimerVoyage(voyageId);
        setVoyages(prev => prev.filter(voyage => voyage._id !== voyageId));
        toast({
          title: "Voyage supprimé",
          description: "Le voyage a été supprimé avec succès",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le voyage",
          variant: "destructive",
        });
      }
    }
  };

  const getStatutInfo = (statut) => {
    return statutsVoyage.find(s => s.value === statut) || statutsVoyage[0];
  };

  const VoyageCard = ({ voyage }) => {
    const statutInfo = getStatutInfo(voyage.statut);
    const nombreSouvenirs = voyage.souvenirs?.length || 0;
    
    return (
      <div className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Header du voyage */}
        <div className="p-4 border-b">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-5 h-5 text-pink-500" />
                <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {voyage.titre}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs bg-${statutInfo.color}-100 text-${statutInfo.color}-800`}>
                  {statutInfo.icon} {statutInfo.label}
                </span>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                📍 {voyage.destination}
              </p>
              {voyage.description && (
                <p className="text-gray-500 text-sm mb-2">{voyage.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={voyage.statut}
                onChange={(e) => handleChangeStatus(voyage._id, e.target.value)}
                className={`px-2 py-1 text-xs border rounded ${isMobile ? 'w-20' : ''}`}
              >
                {statutsVoyage.map(statut => (
                  <option key={statut.value} value={statut.value}>
                    {statut.icon} {statut.label}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteVoyage(voyage._id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dates du voyage */}
          <div className={`flex items-center space-x-4 text-sm text-gray-500 ${isMobile ? 'flex-col items-start space-x-0 space-y-1' : ''}`}>
            {voyage.dateDebut && (
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Du {new Date(voyage.dateDebut).toLocaleDateString()}
              </span>
            )}
            {voyage.dateFin && (
              <span>
                au {new Date(voyage.dateFin).toLocaleDateString()}
              </span>
            )}
            <span className="flex items-center">
              <Star className="w-3 h-3 mr-1" />
              {nombreSouvenirs} souvenir{nombreSouvenirs > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Images du voyage */}
        {voyage.images && voyage.images.length > 0 && (
          <div className="p-4 border-b">
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {voyage.images.slice(0, isMobile ? 2 : 3).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Voyage ${index + 1}`}
                  className="w-full h-20 object-cover rounded border hover:scale-105 transition-transform cursor-pointer"
                />
              ))}
              {voyage.images.length > (isMobile ? 2 : 3) && (
                <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center text-gray-500 text-sm">
                  +{voyage.images.length - (isMobile ? 2 : 3)} photos
                </div>
              )}
            </div>
          </div>
        )}

        {/* Souvenirs récents */}
        {voyage.souvenirs && voyage.souvenirs.length > 0 && (
          <div className="p-4 border-b">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Heart className="w-4 h-4 mr-2 text-pink-500" />
              Souvenirs récents
            </h4>
            <div className="space-y-2">
              {voyage.souvenirs.slice(0, 2).map((souvenir, index) => (
                <div key={index} className="bg-pink-50 p-3 rounded border border-pink-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-pink-800 text-sm">{souvenir.titre}</h5>
                      {souvenir.description && (
                        <p className="text-pink-600 text-xs mt-1">{souvenir.description}</p>
                      )}
                    </div>
                    {souvenir.date && (
                      <span className="text-xs text-pink-500">
                        {new Date(souvenir.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {voyage.souvenirs.length > 2 && (
                <p className="text-xs text-gray-500 text-center">
                  +{voyage.souvenirs.length - 2} autres souvenirs
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4">
          <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
            <Button
              onClick={() => setShowSouvenirForm(voyage._id)}
              variant="outline"
              size="sm"
              className={`border-pink-200 hover:bg-pink-50 text-pink-600 ${isMobile ? 'w-full' : ''}`}
            >
              <Plus className="w-3 h-3 mr-1" />
              Ajouter un souvenir
            </Button>
            <Button
              onClick={() => setSelectedVoyage(voyage)}
              variant="outline"
              size="sm"
              className={isMobile ? 'w-full' : ''}
            >
              <Map className="w-3 h-3 mr-1" />
              Voir détails
            </Button>
          </div>
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
        <CardTitle className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-pink-500" />
            <span className={isMobile ? 'text-lg' : ''}>Carnet de voyage</span>
          </div>
          <div className={`flex space-x-2 ${isMobile ? 'w-full flex-col space-x-0 space-y-2' : ''}`}>
            <Button
              onClick={() => setShowCreateForm(true)}
              className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau voyage
            </Button>
            <Button
              onClick={() => setActiveTab('carte')}
              variant="outline"
              className={`border-pink-200 hover:bg-pink-50 ${isMobile ? 'w-full' : ''}`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Carte des voyages
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistiques */}
        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{voyages.length}</div>
            <div className="text-sm text-blue-600">Voyages total</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {voyages.filter(v => v.statut === 'termine').length}
            </div>
            <div className="text-sm text-green-600">Terminés</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {voyages.filter(v => v.statut === 'planifie').length}
            </div>
            <div className="text-sm text-yellow-600">Planifiés</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {voyages.reduce((acc, voyage) => acc + (voyage.souvenirs?.length || 0), 0)}
            </div>
            <div className="text-sm text-purple-600">Souvenirs</div>
          </div>
        </div>

        {/* Formulaire nouveau voyage */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium mb-4 text-blue-800">Planifier un nouveau voyage</h3>
            <div className="space-y-3">
              <Input
                value={nouveauVoyage.titre}
                onChange={(e) => setNouveauVoyage(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Titre du voyage (ex: Weekend romantique à Paris)"
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
                {destinationsPopulaires.map((dest, index) => (
                  <option key={index} value={dest} />
                ))}
              </datalist>
              <Textarea
                value={nouveauVoyage.description}
                onChange={(e) => setNouveauVoyage(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du voyage (optionnel)"
                rows={2}
                className="border-blue-200 focus:border-blue-500"
              />
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <Input
                  type="date"
                  value={nouveauVoyage.dateDebut}
                  onChange={(e) => setNouveauVoyage(prev => ({ ...prev, dateDebut: e.target.value }))}
                  className="border-blue-200 focus:border-blue-500"
                />
                <Input
                  type="date"
                  value={nouveauVoyage.dateFin}
                  onChange={(e) => setNouveauVoyage(prev => ({ ...prev, dateFin: e.target.value }))}
                  className="border-blue-200 focus:border-blue-500"
                />
                <select
                  value={nouveauVoyage.statut}
                  onChange={(e) => setNouveauVoyage(prev => ({ ...prev, statut: e.target.value }))}
                  className="px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500"
                >
                  {statutsVoyage.map(statut => (
                    <option key={statut.value} value={statut.value}>
                      {statut.icon} {statut.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                <Button
                  onClick={handleCreateVoyage}
                  className={`bg-blue-500 hover:bg-blue-600 ${isMobile ? 'w-full' : ''}`}
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
                      dateDebut: '',
                      dateFin: '',
                      statut: 'planifie',
                      images: []
                    });
                  }}
                  className={isMobile ? 'w-full' : ''}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire nouveau souvenir */}
        {showSouvenirForm && (
          <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
            <h3 className="font-medium mb-4 text-pink-800">
              Ajouter un souvenir au voyage
            </h3>
            <div className="space-y-3">
              <Input
                value={nouveauSouvenir.titre}
                onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Titre du souvenir"
                className="border-pink-200 focus:border-pink-500"
              />
              <Textarea
                value={nouveauSouvenir.description}
                onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du souvenir"
                rows={2}
                className="border-pink-200 focus:border-pink-500"
              />
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <Input
                  type="date"
                  value={nouveauSouvenir.date}
                  onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, date: e.target.value }))}
                  className="border-pink-200 focus:border-pink-500"
                />
                <Input
                  value={nouveauSouvenir.lieu}
                  onChange={(e) => setNouveauSouvenir(prev => ({ ...prev, lieu: e.target.value }))}
                  placeholder="Lieu spécifique (optionnel)"
                  className="border-pink-200 focus:border-pink-500"
                />
              </div>
              <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                <Button
                  onClick={() => handleAddSouvenir(showSouvenirForm)}
                  className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Ajouter le souvenir
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
                      images: []
                    });
                  }}
                  className={isMobile ? 'w-full' : ''}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des voyages */}
        {voyages.length > 0 ? (
          <div className="space-y-6">
            {voyages.map((voyage) => (
              <VoyageCard key={voyage._id} voyage={voyage} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun voyage dans votre carnet</p>
            <p className="text-sm mt-2">Commencez à planifier votre première aventure à deux !</p>
          </div>
        )}

        {/* Section inspiration destinations */}
        {voyages.length === 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="font-medium mb-3 text-blue-800">✈️ Destinations inspirantes pour couples</h3>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {destinationsPopulaires.slice(0, 8).map((dest, index) => (
                <div
                  key={index}
                  className="p-2 bg-white rounded border border-blue-200 text-center text-sm hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => setNouveauVoyage(prev => ({ ...prev, destination: dest }))}
                >
                  {dest}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoyagesSection;