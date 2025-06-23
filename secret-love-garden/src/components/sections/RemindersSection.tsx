import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Plus, Clock, Calendar, Star, Trash2, Edit3, CheckCircle, AlertCircle, Camera, Loader2 } from "lucide-react";
import rappelService from "@/services/rappel.service";

const RemindersSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [rappels, setRappels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatut, setFilterStatut] = useState("tous");
  const [filterPriorite, setFilterPriorite] = useState("tous");
  const [nouveauRappel, setNouveauRappel] = useState({
    titre: '',
    description: '',
    contenu: '',
    dateRappel: '',
    priorite: 'normale',
    images: [],
    type: 'texte'
  });

  const priorites = [
    { value: 'faible', label: 'Faible', color: 'gray', icon: '⬇️' },
    { value: 'normale', label: 'Normale', color: 'blue', icon: '➡️' },
    { value: 'haute', label: 'Haute', color: 'red', icon: '⬆️' },
    { value: 'urgente', label: 'Urgente', color: 'purple', icon: '🔥' }
  ];

  const types = [
    { value: 'texte', label: 'Texte', icon: '📝' },
    { value: 'image', label: 'Image', icon: '🖼️' },
    { value: 'mixte', label: 'Mixte', icon: '📎' }
  ];

  const statuts = [
    { value: 'en_attente', label: 'En attente', color: 'yellow' },
    { value: 'en_cours', label: 'En cours', color: 'blue' },
    { value: 'termine', label: 'Terminé', color: 'green' },
    { value: 'reporte', label: 'Reporté', color: 'orange' }
  ];

  useEffect(() => {
    fetchRappels();
  }, []);

  const fetchRappels = async () => {
    try {
      const res = await rappelService.getRappels();
      setRappels(res.data || res);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les rappels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRappel = async () => {
    if (!nouveauRappel.titre.trim() || !nouveauRappel.contenu.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le titre et le contenu",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await rappelService.creerRappel(nouveauRappel);
      setRappels(prev => [res.data || res, ...prev]);
      setNouveauRappel({
        titre: '',
        description: '',
        contenu: '',
        dateRappel: '',
        priorite: 'normale',
        images: [],
        type: 'texte'
      });
      setShowCreateForm(false);
      
      toast({
        title: "Rappel créé",
        description: "Le rappel a été créé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le rappel",
        variant: "destructive",
      });
    }
  };

  const handleStatutChange = async (rappelId, nouveauStatut) => {
    try {
      await rappelService.modifierStatutRappel(rappelId, nouveauStatut);
      setRappels(prev => prev.map(rappel => 
        rappel._id === rappelId ? { ...rappel, statut: nouveauStatut } : rappel
      ));
      
      const statutInfo = statuts.find(s => s.value === nouveauStatut);
      toast({
        title: "Statut modifié",
        description: `Le rappel est maintenant ${statutInfo?.label.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRappel = async (rappelId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rappel ?")) {
      try {
        await rappelService.supprimerRappel(rappelId);
        setRappels(prev => prev.filter(rappel => rappel._id !== rappelId));
        toast({
          title: "Rappel supprimé",
          description: "Le rappel a été supprimé avec succès",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le rappel",
          variant: "destructive",
        });
      }
    }
  };

  const getPrioriteInfo = (priorite) => {
    return priorites.find(p => p.value === priorite) || priorites[1];
  };

  const getTypeInfo = (type) => {
    return types.find(t => t.value === type) || types[0];
  };

  const getStatutInfo = (statut) => {
    return statuts.find(s => s.value === statut) || statuts[0];
  };

  const isRappelUrgent = (rappel) => {
    if (!rappel.dateRappel) return false;
    const dateRappel = new Date(rappel.dateRappel);
    const maintenant = new Date();
    const diff = dateRappel.getTime() - maintenant.getTime();
    const joursRestants = diff / (1000 * 60 * 60 * 24);
    return joursRestants <= 1 && joursRestants >= 0;
  };

  const filteredRappels = rappels.filter(rappel => {
    const matchesStatut = filterStatut === "tous" || rappel.statut === filterStatut;
    const matchesPriorite = filterPriorite === "tous" || rappel.priorite === filterPriorite;
    return matchesStatut && matchesPriorite;
  });

  const RappelCard = ({ rappel }) => {
    const prioriteInfo = getPrioriteInfo(rappel.priorite);
    const typeInfo = getTypeInfo(rappel.type);
    const statutInfo = getStatutInfo(rappel.statut);
    const isUrgent = isRappelUrgent(rappel);
    const isCreator = rappel.createur?.nom === currentUser;

    return (
      <div className={`border rounded-lg p-4 transition-all hover:shadow-md ${
        isUrgent ? 'border-red-300 bg-red-50' : 
        `border-${prioriteInfo.color}-200 bg-${prioriteInfo.color}-50`
      }`}>
        {isUrgent && (
          <div className="flex items-center space-x-2 mb-3 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Rappel urgent !</span>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{typeInfo.icon}</span>
              <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
                {rappel.titre}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs bg-${prioriteInfo.color}-100 text-${prioriteInfo.color}-800`}>
                {prioriteInfo.icon} {prioriteInfo.label}
              </span>
            </div>
            {rappel.description && (
              <p className={`text-gray-600 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {rappel.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs bg-${statutInfo.color}-100 text-${statutInfo.color}-800`}>
              {statutInfo.label}
            </span>
            {isCreator && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteRappel(rappel._id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className={`text-gray-700 ${isMobile ? 'text-sm' : ''}`}>
            {rappel.contenu}
          </p>

          {rappel.images && rappel.images.length > 0 && (
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {rappel.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Rappel ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
              ))}
            </div>
          )}

          <div className={`flex items-center justify-between text-xs text-gray-500 ${isMobile ? 'flex-col items-start gap-2' : ''}`}>
            <div className="flex items-center space-x-4">
              {rappel.dateRappel && (
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(rappel.dateRappel).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Créé le {new Date(rappel.dateCreation).toLocaleDateString()}
              </span>
              <span className="text-gray-400">
                par {isCreator ? 'vous' : (partenaire?.nom || 'votre partenaire')}
              </span>
            </div>
            
            {rappel.statut !== 'termine' && (
              <div className={`flex space-x-1 ${isMobile ? 'w-full' : ''}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatutChange(rappel._id, 'en_cours')}
                  className={`text-xs ${isMobile ? 'flex-1' : ''}`}
                  disabled={rappel.statut === 'en_cours'}
                >
                  En cours
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatutChange(rappel._id, 'termine')}
                  className={`text-xs ${isMobile ? 'flex-1' : ''}`}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Terminer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatutChange(rappel._id, 'reporte')}
                  className={`text-xs ${isMobile ? 'flex-1' : ''}`}
                >
                  Reporter
                </Button>
              </div>
            )}
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

  const rappelsUrgents = rappels.filter(isRappelUrgent);

  return (
    <Card className="shadow-sm border border-pink-200">
      <CardHeader>
        <CardTitle className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
          <div className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-pink-500" />
            <span className={isMobile ? 'text-lg' : ''}>Rappels importants</span>
            {rappelsUrgents.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                {rappelsUrgents.length} urgent{rappelsUrgents.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau rappel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistiques */}
        <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{rappels.length}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {rappels.filter(r => r.statut === 'en_attente').length}
            </div>
            <div className="text-sm text-yellow-600">En attente</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {rappels.filter(r => r.statut === 'termine').length}
            </div>
            <div className="text-sm text-green-600">Terminés</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {rappelsUrgents.length}
            </div>
            <div className="text-sm text-red-600">Urgents</div>
          </div>
        </div>

        {/* Rappels urgents highlight */}
        {rappelsUrgents.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-medium text-red-800 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Rappels urgents
            </h3>
            <div className="space-y-3">
              {rappelsUrgents.slice(0, 3).map(rappel => (
                <div key={rappel._id} className="bg-white p-3 rounded border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-800">{rappel.titre}</p>
                      <p className="text-sm text-red-600">
                        Échéance : {new Date(rappel.dateRappel).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStatutChange(rappel._id, 'en_cours')}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Traiter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire création */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium mb-4">Créer un nouveau rappel</h3>
            <div className="space-y-3">
              <Input
                value={nouveauRappel.titre}
                onChange={(e) => setNouveauRappel(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Titre du rappel"
                className="border-pink-200 focus:border-pink-500"
              />
              <Input
                value={nouveauRappel.description}
                onChange={(e) => setNouveauRappel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description courte (optionnel)"
                className="border-pink-200 focus:border-pink-500"
              />
              <Textarea
                value={nouveauRappel.contenu}
                onChange={(e) => setNouveauRappel(prev => ({ ...prev, contenu: e.target.value }))}
                placeholder="Contenu détaillé du rappel"
                rows={3}
                className="border-pink-200 focus:border-pink-500"
              />
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <Input
                  type="date"
                  value={nouveauRappel.dateRappel}
                  onChange={(e) => setNouveauRappel(prev => ({ ...prev, dateRappel: e.target.value }))}
                  className="border-pink-200 focus:border-pink-500"
                />
                <select
                  value={nouveauRappel.priorite}
                  onChange={(e) => setNouveauRappel(prev => ({ ...prev, priorite: e.target.value }))}
                  className="px-3 py-2 border border-pink-200 rounded-md focus:border-pink-500"
                >
                  {priorites.map(priorite => (
                    <option key={priorite.value} value={priorite.value}>
                      {priorite.icon} {priorite.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                <Button
                  onClick={handleCreateRappel}
                  className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Créer le rappel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNouveauRappel({
                      titre: '',
                      description: '',
                      contenu: '',
                      dateRappel: '',
                      priorite: 'normale',
                      images: [],
                      type: 'texte'
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

        {/* Filtres */}
        <div className={`flex items-center space-x-4 mb-6 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className={`px-3 py-2 border border-gray-300 rounded-md text-sm ${isMobile ? 'w-full' : ''}`}
          >
            <option value="tous">Tous les statuts</option>
            {statuts.map(statut => (
              <option key={statut.value} value={statut.value}>
                {statut.label}
              </option>
            ))}
          </select>
          <select
            value={filterPriorite}
            onChange={(e) => setFilterPriorite(e.target.value)}
            className={`px-3 py-2 border border-gray-300 rounded-md text-sm ${isMobile ? 'w-full' : ''}`}
          >
            <option value="tous">Toutes les priorités</option>
            {priorites.map(priorite => (
              <option key={priorite.value} value={priorite.value}>
                {priorite.icon} {priorite.label}
              </option>
            ))}
          </select>
        </div>

        {/* Liste des rappels */}
        {filteredRappels.length > 0 ? (
          <div className="space-y-4">
            {filteredRappels.map((rappel) => (
              <RappelCard key={rappel._id} rappel={rappel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun rappel trouvé</p>
            <p className="text-sm mt-2">
              {filterStatut !== "tous" || filterPriorite !== "tous" 
                ? "Essayez de modifier vos filtres"
                : "Créez votre premier rappel pour ne rien oublier !"
              }
            </p>
          </div>
        )}

        {/* Conseils */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">💡 Conseils pour bien organiser vos rappels</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Utilisez des titres clairs et précis</li>
            <li>• Définissez des priorités pour mieux vous organiser</li>
            <li>• Ajoutez une date pour les échéances importantes</li>
            <li>• N'hésitez pas à partager avec votre partenaire</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RemindersSection;