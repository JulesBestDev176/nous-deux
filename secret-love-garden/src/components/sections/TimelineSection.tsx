import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Book, Loader2, Heart, MessageCircle, Camera, Target, Gift } from "lucide-react";
import histoireService from "@/services/histoire.service";

const EvenementHistoire = ({ evenement }) => {
  const getIcon = () => {
    switch (evenement.type) {
      case 'reponse_question': return <Book className="w-5 h-5 text-purple-500" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'photo': return <Camera className="w-5 h-5 text-pink-500" />;
      case 'objectif_atteint': return <Target className="w-5 h-5 text-green-500" />;
      case 'evenement': return <Gift className="w-5 h-5 text-orange-500" />;
      default: return <Heart className="w-5 h-5 text-red-500" />;
    }
  };

  const renderContenu = () => {
    switch (evenement.type) {
      case 'reponse_question':
        return <p><strong>{evenement.utilisateur.nom}</strong> a répondu à la question : <em>"{evenement.question?.texte}"</em></p>;
      case 'message':
        return <p><strong>{evenement.expediteur.nom}</strong> a envoyé un message : <em>"{evenement.contenu}"</em></p>;
      case 'photo':
        return <p><strong>{evenement.createur.nom}</strong> a ajouté une nouvelle photo à votre galerie.</p>;
      case 'objectif_atteint':
        return <p>Vous avez atteint l'objectif : <strong>{evenement.titre}</strong> !</p>;
      case 'evenement':
        return <p>Événement à venir : <strong>{evenement.titre}</strong></p>;
      default:
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
          {new Date(evenement.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

const TimelineSection = ({ isMobile }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoire();
  }, []);

  const fetchHistoire = async () => {
    setLoading(true);
    try {
      const res = await histoireService.getHistorique();
      setTimeline(res.data || []);
    } catch (error) {
      console.log("Aucune histoire trouvée", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm border border-pink-200">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
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
            <span className={isMobile ? 'text-lg' : ''}>Notre Histoire d'Amour</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-800">Votre Chronologie</h3>
          <p className="text-sm text-gray-600">Un résumé de vos moments les plus précieux.</p>
        </div>
        
        {timeline.length > 0 ? (
          <div className="space-y-4">
            {timeline.map((evenement, index) => (
              <EvenementHistoire key={`${evenement._id}-${index}`} evenement={evenement} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Votre histoire commence maintenant...</p>
            <p className="text-sm mt-2">Envoyez des messages, ajoutez des photos et des événements pour la remplir !</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineSection;