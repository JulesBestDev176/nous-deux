import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Heart, Gift, MapPin, Clock, Trash2, Edit3, Star, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import calendrierService from "@/services/calendrier.service";

const CalendrierSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [evenements, setEvenements] = useState([]);
  const [anniversaires, setAnniversaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeView, setActiveView] = useState('mois');
  
  const [nouvelEvenement, setNouvelEvenement] = useState({
    titre: '',
    description: '',
    date: '',
    heure: '10:00',
    type: 'rendez_vous',
    lieu: '',
    rappel: true
  });

  const typesEvenements = [
    { value: 'anniversaire', label: 'Anniversaire', color: 'red', icon: '🎂' },
    { value: 'rendez_vous', label: 'Rendez-vous', color: 'pink', icon: '💕' },
    { value: 'voyage', label: 'Voyage', color: 'blue', icon: '✈️' },
    { value: 'restaurant', label: 'Restaurant', color: 'yellow', icon: '🍽️' },
    { value: 'cinema', label: 'Cinéma/Spectacle', color: 'purple', icon: '🎬' },
    { value: 'sport', label: 'Activité sportive', color: 'green', icon: '⚽' },
    { value: 'famille', label: 'Famille/Amis', color: 'orange', icon: '👨‍👩‍👧‍👦' },
    { value: 'travail', label: 'Professionnel', color: 'gray', icon: '💼' },
    { value: 'special', label: 'Événement spécial', color: 'indigo', icon: '⭐' }
  ];

  const joursSemaine = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const mois = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    fetchEvenements();
    fetchAnniversaires();
  }, [currentDate]);

  const fetchEvenements = async () => {
    try {
      const moisActuel = currentDate.getMonth() + 1;
      const anneeActuelle = currentDate.getFullYear();
      const res = await calendrierService.getEvenements(moisActuel, anneeActuelle);
      setEvenements(res.data || res);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnniversaires = async () => {
    try {
      const res = await calendrierService.getEvenementsAnniversaires();
      setAnniversaires(res.data || res);
    } catch (error) {
      console.log("Erreur lors du chargement des anniversaires");
    }
  };

  const handleCreateEvenement = async () => {
    if (!nouvelEvenement.titre.trim() || !nouvelEvenement.date) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le titre et la date",
        variant: "destructive",
      });
      return;
    }

    try {
      const dateTime = new Date(`${nouvelEvenement.date}T${nouvelEvenement.heure}`);
      
      const res = await calendrierService.creerEvenement({
        ...nouvelEvenement,
        dateTime
      });
      
      setEvenements(prev => [res.data || res, ...prev]);
      setNouvelEvenement({
        titre: '',
        description: '',
        date: '',
        heure: '10:00',
        type: 'rendez_vous',
        lieu: '',
        rappel: true
      });
      setShowCreateForm(false);
      
      toast({
        title: "Événement créé",
        description: "L'événement a été ajouté au calendrier !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvenement = async (evenementId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      try {
        await calendrierService.supprimerEvenement(evenementId);
        setEvenements(prev => prev.filter(evt => evt._id !== evenementId));
        toast({
          title: "Événement supprimé",
          description: "L'événement a été supprimé avec succès",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'événement",
          variant: "destructive",
        });
      }
    }
  };

  const naviguerMois = (direction) => {
    const nouvelleMois = new Date(currentDate);
    nouvelleMois.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(nouvelleMois);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = new Date(year, month, -i);
      days.push({ date: prevDay, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({ date: currentDay, isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la grille
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextDay = 1;
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, nextDay);
      days.push({ date: nextDate, isCurrentMonth: false });
      nextDay++;
    }
    
    return days;
  };

  const getEvenementsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return evenements.filter(evt => {
      const evtDate = new Date(evt.dateTime).toISOString().split('T')[0];
      return evtDate === dateStr;
    });
  };

  const getTypeInfo = (type) => {
    return typesEvenements.find(t => t.value === type) || typesEvenements[1];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const EvenementCard = ({ evenement }) => {
    const typeInfo = getTypeInfo(evenement.type);
    const isCreator = evenement.createur?.nom === currentUser;
    
    return (
      <div className={`p-3 rounded-lg border bg-${typeInfo.color}-50 border-${typeInfo.color}-200`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{typeInfo.icon}</span>
            <h4 className={`font-medium text-${typeInfo.color}-800 ${isMobile ? 'text-sm' : ''}`}>
              {evenement.titre}
            </h4>
          </div>
          {isCreator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteEvenement(evenement._id)}
              className={`text-${typeInfo.color}-600 hover:text-${typeInfo.color}-700`}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        {evenement.description && (
          <p className={`text-${typeInfo.color}-700 text-sm mb-2`}>
            {evenement.description}
          </p>
        )}
        
        <div className={`flex items-center space-x-3 text-xs text-${typeInfo.color}-600`}>
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(evenement.dateTime).toLocaleTimeString()}
          </span>
          {evenement.lieu && (
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {evenement.lieu}
            </span>
          )}
          {evenement.rappel && (
            <span className="flex items-center">
              <Bell className="w-3 h-3 mr-1" />
              Rappel
            </span>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Créé par {isCreator ? 'vous' : (partenaire?.nom || 'votre partenaire')}
        </div>
      </div>
    );
  };

  const CalendarDay = ({ day }) => {
    const eventsForDay = getEvenementsForDate(day.date);
    const isCurrentMonthDay = day.isCurrentMonth;
    const isTodayDate = isToday(day.date);
    
    return (
      <div
        className={`min-h-20 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
          !isCurrentMonthDay ? 'text-gray-400 bg-gray-50' : ''
        } ${isTodayDate ? 'bg-pink-100 border-pink-300' : ''}`}
        onClick={() => setSelectedDate(day.date)}
      >
        <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-pink-600' : ''}`}>
          {day.date.getDate()}
        </div>
        
        {eventsForDay.length > 0 && (
          <div className="space-y-1">
            {eventsForDay.slice(0, isMobile ? 1 : 2).map((evt, index) => {
              const typeInfo = getTypeInfo(evt.type);
              return (
                <div
                  key={index}
                  className={`text-xs p-1 rounded bg-${typeInfo.color}-200 text-${typeInfo.color}-800 truncate`}
                >
                  {typeInfo.icon} {evt.titre}
                </div>
              );
            })}
            {eventsForDay.length > (isMobile ? 1 : 2) && (
              <div className="text-xs text-gray-500">
                +{eventsForDay.length - (isMobile ? 1 : 2)} autres
              </div>
            )}
          </div>
        )}
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

  const days = getDaysInMonth(currentDate);
  const prochainEvenement = evenements
    .filter(evt => new Date(evt.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0];

  return (
    <Card className="shadow-sm border border-pink-200">
      <CardHeader>
        <CardTitle className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-pink-500" />
            <span className={isMobile ? 'text-lg' : ''}>Calendrier couple</span>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvel événement
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Prochain événement highlight */}
        {prochainEvenement && (
          <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
            <h3 className="font-medium text-pink-800 mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Prochain événement
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{prochainEvenement.titre}</p>
                <p className="text-sm text-gray-600">
                  {new Date(prochainEvenement.dateTime).toLocaleDateString()} à{' '}
                  {new Date(prochainEvenement.dateTime).toLocaleTimeString()}
                </p>
              </div>
              <span className="text-2xl">
                {getTypeInfo(prochainEvenement.type).icon}
              </span>
            </div>
          </div>
        )}

        {/* Formulaire création */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium mb-4 text-blue-800">Créer un événement</h3>
            <div className="space-y-3">
              <Input
                value={nouvelEvenement.titre}
                onChange={(e) => setNouvelEvenement(prev => ({ ...prev, titre: e.target.value }))}
                placeholder="Titre de l'événement"
                className="border-blue-200 focus:border-blue-500"
              />
              <Textarea
                value={nouvelEvenement.description}
                onChange={(e) => setNouvelEvenement(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optionnel)"
                rows={2}
                className="border-blue-200 focus:border-blue-500"
              />
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <Input
                  type="date"
                  value={nouvelEvenement.date}
                  onChange={(e) => setNouvelEvenement(prev => ({ ...prev, date: e.target.value }))}
                  className="border-blue-200 focus:border-blue-500"
                />
                <Input
                  type="time"
                  value={nouvelEvenement.heure}
                  onChange={(e) => setNouvelEvenement(prev => ({ ...prev, heure: e.target.value }))}
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <select
                  value={nouvelEvenement.type}
                  onChange={(e) => setNouvelEvenement(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-blue-200 rounded-md focus:border-blue-500"
                >
                  {typesEvenements.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                <Input
                  value={nouvelEvenement.lieu}
                  onChange={(e) => setNouvelEvenement(prev => ({ ...prev, lieu: e.target.value }))}
                  placeholder="Lieu (optionnel)"
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rappel"
                  checked={nouvelEvenement.rappel}
                  onChange={(e) => setNouvelEvenement(prev => ({ ...prev, rappel: e.target.checked }))}
                  className="rounded border-blue-300"
                />
                <label htmlFor="rappel" className="text-sm text-blue-700">
                  Activer le rappel
                </label>
              </div>
              <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                <Button
                  onClick={handleCreateEvenement}
                  className={`bg-blue-500 hover:bg-blue-600 ${isMobile ? 'w-full' : ''}`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Créer l'événement
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNouvelEvenement({
                      titre: '',
                      description: '',
                      date: '',
                      heure: '10:00',
                      type: 'rendez_vous',
                      lieu: '',
                      rappel: true
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

        {/* Navigation du calendrier */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => naviguerMois(-1)}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {mois[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="ghost"
            onClick={() => naviguerMois(1)}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Grille du calendrier */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* En-têtes des jours */}
          <div className={`grid grid-cols-7 bg-gray-50 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {joursSemaine.map(jour => (
              <div key={jour} className="p-2 font-medium text-center border-r border-gray-200 last:border-r-0">
                {jour}
              </div>
            ))}
          </div>
          
          {/* Jours du mois */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => (
              <CalendarDay key={index} day={day} />
            ))}
          </div>
        </div>

        {/* Événements du jour sélectionné */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium mb-3">
              Événements du {selectedDate.toLocaleDateString()}
            </h3>
            <div className="space-y-3">
              {getEvenementsForDate(selectedDate).map(evt => (
                <EvenementCard key={evt._id} evenement={evt} />
              ))}
              {getEvenementsForDate(selectedDate).length === 0 && (
                <p className="text-gray-500 text-sm">Aucun événement ce jour-là</p>
              )}
            </div>
          </div>
        )}

        {/* Anniversaires importants */}
        {anniversaires.length > 0 && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-medium mb-3 text-red-800 flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              Anniversaires importants
            </h3>
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {anniversaires.map((anniversaire, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                  <div>
                    <p className="font-medium text-red-800">{anniversaire.titre}</p>
                    <p className="text-sm text-red-600">
                      {new Date(anniversaire.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-2xl">🎂</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendrierSection;