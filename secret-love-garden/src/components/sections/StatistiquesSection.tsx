import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Heart, MessageCircle, Calendar, Camera, TrendingUp, Star, Smile, Meh, Frown, Plus, Filter } from "lucide-react";
import statistiqueService from "@/services/statistique.service";

type Statistiques = {
  totalMessages?: number;
  totalPhotos?: number;
  photosCeMois?: number;
  tendancePhotos?: number;
  totalEvenements?: number;
  prochainEvenement?: string;
  // Ajoutez d'autres propriétés si nécessaire
};

const StatistiquesSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [statistiques, setStatistiques] = useState<Statistiques>({});

  type StatistiquesMessages = {
    moyenne?: number;
    tendance?: number;
    envoyes?: number;
    recus?: number;
    // Ajoutez d'autres propriétés si nécessaire
  };
  const [statistiquesMessages, setStatistiquesMessages] = useState<StatistiquesMessages>({});

  type StatistiquesActivites = {
    activitesFavorites?: { nom: string; count: number }[];
    // Ajoutez d'autres propriétés si nécessaire
  };
  const [statistiquesActivites, setStatistiquesActivites] = useState<StatistiquesActivites>({});

  type Humeur = {
    niveau: number;
    commentaire: string;
    activite?: string;
    date: string | Date;
  };
  const [statistiquesHumeur, setStatistiquesHumeur] = useState<Humeur[]>([]);
  type TempsEnsemble = {
    totalHeures?: number;
    joursConsecutifs?: number;
    tendance?: number;
  };
  const [tempsEnsemble, setTempsEnsemble] = useState<TempsEnsemble>({});
  const [loading, setLoading] = useState(true);
  const [periodeActive, setPeriodeActive] = useState('30j');
  const [showAjoutHumeur, setShowAjoutHumeur] = useState(false);
  const [nouvelleHumeur, setNouvelleHumeur] = useState({
    niveau: 5,
    commentaire: '',
    activite: ''
  });

  const periodes = [
    { value: '7j', label: '7 jours' },
    { value: '30j', label: '30 jours' },
    { value: '90j', label: '3 mois' },
    { value: '365j', label: '1 an' }
  ];

  const niveauxHumeur = [
    { value: 1, label: 'Très triste', icon: '😢', color: 'red' },
    { value: 2, label: 'Triste', icon: '😔', color: 'orange' },
    { value: 3, label: 'Moyen', icon: '😐', color: 'yellow' },
    { value: 4, label: 'Content', icon: '😊', color: 'blue' },
    { value: 5, label: 'Très heureux', icon: '😍', color: 'green' }
  ];

  const activitesCouple = [
    'Sortie romantique', 'Resto en amoureux', 'Voyage', 'Soirée cinéma',
    'Balade ensemble', 'Sport à deux', 'Cuisine ensemble', 'Jeux à deux',
    'Découverte culturelle', 'Temps de qualité à la maison'
  ];

  useEffect(() => {
    fetchAllStatistiques();
  }, [periodeActive]);

  const fetchAllStatistiques = async () => {
    try {
      const [
        statsGenerales,
        statsMessages,
        statsActivites,
        statsHumeur,
        statsTemps
      ] = await Promise.all([
        statistiqueService.getStatistiquesGenerales(),
        statistiqueService.getStatistiquesMessages(periodeActive),
        statistiqueService.getStatistiquesActivites(periodeActive),
        statistiqueService.getStatistiquesHumeur(periodeActive),
        statistiqueService.getTempsEnsemble()
      ]);

      setStatistiques(statsGenerales.data || statsGenerales);
      setStatistiquesMessages(statsMessages.data || statsMessages);
      setStatistiquesActivites(statsActivites.data || statsActivites);
      setStatistiquesHumeur(statsHumeur.data || statsHumeur);
      setTempsEnsemble(statsTemps.data || statsTemps);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterHumeur = async () => {
    if (!nouvelleHumeur.commentaire.trim()) {
      toast({
        title: "Commentaire requis",
        description: "Veuillez ajouter un commentaire sur votre humeur",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await statistiqueService.ajouterHumeur({
        niveau: nouvelleHumeur.niveau,
        commentaire: nouvelleHumeur.commentaire,
        activite: nouvelleHumeur.activite,
        date: new Date()
      });

      setStatistiquesHumeur(prev => [res.data || res, ...prev]);
      setNouvelleHumeur({
        niveau: 5,
        commentaire: '',
        activite: ''
      });
      setShowAjoutHumeur(false);

      toast({
        title: "Humeur enregistrée",
        description: "Merci d'avoir partagé votre humeur !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'humeur",
        variant: "destructive",
      });
    }
  };

  const getNiveauHumeurInfo = (niveau) => {
    return niveauxHumeur.find(n => n.value === niveau) || niveauxHumeur[4];
  };

  const formatDuree = (heures) => {
    if (heures < 24) {
      return `${Math.round(heures)}h`;
    }
    const jours = Math.floor(heures / 24);
    const heuresRestantes = Math.round(heures % 24);
    return `${jours}j ${heuresRestantes}h`;
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", trend = null }) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 text-${color}-600`} />
        {trend && (
          <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold text-${color}-700 mb-1`}>
        {value}
      </div>
      <div className={`text-sm text-${color}-600`}>
        {title}
      </div>
      {subtitle && (
        <div className={`text-xs text-${color}-500 mt-1`}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const HumeurChart = ({ humeurs }) => {
    const dernières7Humeurs = humeurs.slice(0, 7).reverse();
    const moyenneHumeur = humeurs.length > 0 
      ? (humeurs.reduce((acc, h) => acc + h.niveau, 0) / humeurs.length).toFixed(1)
      : 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Évolution de l'humeur (7 derniers jours)</h3>
          <div className="text-sm text-gray-600">
            Moyenne: {moyenneHumeur}/5 {getNiveauHumeurInfo(Math.round(Number(moyenneHumeur))).icon}
          </div>
        </div>
        
        <div className="flex items-end justify-between space-x-2 h-32 bg-gray-50 rounded-lg p-4">
          {dernières7Humeurs.map((humeur, index) => {
            const hauteur = (humeur.niveau / 5) * 100;
            const niveauInfo = getNiveauHumeurInfo(humeur.niveau);
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full bg-${niveauInfo.color}-400 rounded-t transition-all duration-300 flex items-end justify-center text-white text-xs font-medium`}
                  style={{ height: `${hauteur}%`, minHeight: '20px' }}
                >
                  {humeur.niveau}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(humeur.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
        
        {dernières7Humeurs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Smile className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune donnée d'humeur récente</p>
          </div>
        )}
      </div>
    );
  };

  const MessageChart = ({ stats }) => {
    const total = (stats.envoyes || 0) + (stats.recus || 0);
    const pourcentageEnvoyes = total > 0 ? ((stats.envoyes || 0) / total * 100) : 50;
    
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Répartition des messages</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span>Vous</span>
              <span>{stats.envoyes || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-pink-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${pourcentageEnvoyes}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span>{partenaire?.nom || 'Partenaire'}</span>
              <span>{stats.recus || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${100 - pourcentageEnvoyes}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          Total: {total} messages
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
            <BarChart3 className="w-5 h-5 mr-2 text-pink-500" />
            <span className={isMobile ? 'text-lg' : ''}>Statistiques d'amour</span>
          </div>
          <div className={`flex items-center space-x-2 ${isMobile ? 'w-full flex-col space-x-0 space-y-2' : ''}`}>
            <select
              value={periodeActive}
              onChange={(e) => setPeriodeActive(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {periodes.map(periode => (
                <option key={periode.value} value={periode.value}>
                  {periode.label}
                </option>
              ))}
            </select>
            <Button
              onClick={() => setShowAjoutHumeur(true)}
              className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Humeur du jour
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulaire ajout humeur */}
        {showAjoutHumeur && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-medium mb-4 text-yellow-800">Comment vous sentez-vous aujourd'hui ?</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Niveau d'humeur</label>
                <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
                  {niveauxHumeur.map(niveau => (
                    <button
                      key={niveau.value}
                      onClick={() => setNouvelleHumeur(prev => ({ ...prev, niveau: niveau.value }))}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        nouvelleHumeur.niveau === niveau.value
                          ? `bg-${niveau.color}-100 border-${niveau.color}-300`
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{niveau.icon}</div>
                      <div className="text-xs">{niveau.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Que faisiez-vous ?</label>
                <select
                  value={nouvelleHumeur.activite}
                  onChange={(e) => setNouvelleHumeur(prev => ({ ...prev, activite: e.target.value }))}
                  className="w-full px-3 py-2 border border-yellow-200 rounded-md focus:border-yellow-500"
                >
                  <option value="">Sélectionnez une activité</option>
                  {activitesCouple.map(activite => (
                    <option key={activite} value={activite}>{activite}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Commentaire</label>
                <input
                  type="text"
                  value={nouvelleHumeur.commentaire}
                  onChange={(e) => setNouvelleHumeur(prev => ({ ...prev, commentaire: e.target.value }))}
                  placeholder="Décrivez votre ressenti..."
                  className="w-full px-3 py-2 border border-yellow-200 rounded-md focus:border-yellow-500"
                />
              </div>
              
              <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                <Button
                  onClick={handleAjouterHumeur}
                  className={`bg-yellow-500 hover:bg-yellow-600 ${isMobile ? 'w-full' : ''}`}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Enregistrer mon humeur
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAjoutHumeur(false);
                    setNouvelleHumeur({ niveau: 5, commentaire: '', activite: '' });
                  }}
                  className={isMobile ? 'w-full' : ''}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques générales */}
        <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
          <StatCard
            title="Temps ensemble"
            value={formatDuree(tempsEnsemble.totalHeures || 0)}
            subtitle={`${tempsEnsemble.joursConsecutifs || 0} jours consécutifs`}
            icon={Heart}
            color="red"
            trend={tempsEnsemble.tendance}
          />
          <StatCard
            title="Photos partagées"
            value={statistiques.totalPhotos || 0}
            subtitle={`${statistiques.photosCeMois || 0} ce mois-ci`}
            icon={Camera}
            color="green"
            trend={statistiques.tendancePhotos}
          />
          <StatCard
            title="Événements planifiés"
            value={statistiques.totalEvenements || 0}
            subtitle={`${statistiques.prochainEvenement || 'Aucun'} à venir`}
            icon={Calendar}
            color="purple"
          />
        </div>

        {/* Graphiques et analyses */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
          {/* Graphique humeur */}
          <Card className="p-4 border border-gray-200">
            <HumeurChart humeurs={statistiquesHumeur} />
          </Card>
        </div>

        {/* Activités favorites */}
        {statistiquesActivites.activitesFavorites && (
          <Card className="mt-6 p-4 border border-gray-200">
            <h3 className="font-medium mb-4">Vos activités favorites</h3>
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {statistiquesActivites.activitesFavorites.slice(0, 6).map((activite, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <span className="text-sm font-medium text-pink-800">{activite.nom}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-pink-600">{activite.count}x</span>
                    <Star className="w-4 h-4 text-pink-500" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Historique humeur récente */}
        {statistiquesHumeur.length > 0 && (
          <Card className="mt-6 p-4 border border-gray-200">
            <h3 className="font-medium mb-4">Humeurs récentes</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {statistiquesHumeur.slice(0, 10).map((humeur, index) => {
                const niveauInfo = getNiveauHumeurInfo(humeur.niveau);
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{niveauInfo.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{humeur.commentaire}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{new Date(humeur.date).toLocaleDateString()}</span>
                        {humeur.activite && (
                          <>
                            <span>•</span>
                            <span>{humeur.activite}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs bg-${niveauInfo.color}-100 text-${niveauInfo.color}-800`}>
                      {humeur.niveau}/5
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Conseils personnalisés */}
        <Card className="mt-6 p-4 border border-blue-200 bg-blue-50">
          <h3 className="font-medium mb-3 text-blue-800 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Conseils pour votre relation
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            {statistiquesHumeur.length > 0 && statistiquesHumeur.slice(0, 3).every(h => h.niveau >= 4) && (
              <p>😊 Excellente période ! Votre humeur est au beau fixe ces derniers temps.</p>
            )}
            {tempsEnsemble.joursConsecutifs >= 7 && (
              <p>❤️ Félicitations ! Vous passez beaucoup de temps de qualité ensemble.</p>
            )}
            <p>📅 Planifiez régulièrement des activités nouvelles pour maintenir la complicité.</p>
          </div>
        </Card>
      </CardContent>
    </Card>
  );
};

export default StatistiquesSection;