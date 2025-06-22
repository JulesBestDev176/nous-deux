import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, Heart, Calendar, Clock, Star, Plus, Filter, Search, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import messageService from "@/services/message.service";

const MessagesSection = ({ currentUser, partenaire, isMobile, toast }) => {
  const [messages, setMessages] = useState([]);
  const [messagesProgrammes, setMessagesProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('conversation');
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [messageProgramme, setMessageProgramme] = useState({
    contenu: '',
    dateEnvoi: '',
    heureEnvoi: '09:00',
    type: 'surprise'
  });
  const [filtreType, setFiltreType] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');

  const typesMessages = [
    { value: 'surprise', label: 'Message surprise', color: 'pink', icon: '💕' },
    { value: 'encouragement', label: 'Encouragement', color: 'green', icon: '💪' },
    { value: 'anniversaire', label: 'Anniversaire', color: 'purple', icon: '🎉' },
    { value: 'quotidien', label: 'Message quotidien', color: 'blue', icon: '☀️' },
    { value: 'excuse', label: 'Excuse/Réconciliation', color: 'red', icon: '🙏' },
    { value: 'gratitude', label: 'Gratitude', color: 'yellow', icon: '🙏' },
    { value: 'romantique', label: 'Romantique', color: 'rose', icon: '🌹' }
  ];

  const citationsAmour = [
    "Tu es ma plus belle découverte et mon plus grand amour.",
    "Chaque jour avec toi est un cadeau précieux.",
    "Tu illumines ma vie comme personne d'autre ne le fait.",
    "Mon cœur bat pour toi, aujourd'hui et pour toujours.",
    "Tu es mon refuge, ma joie et mon bonheur.",
    "Avec toi, chaque moment devient magique.",
    "Tu es la mélodie de mon cœur et la poésie de mon âme.",
    "Dans tes bras, j'ai trouvé mon chez-moi."
  ];

  useEffect(() => {
    fetchMessages();
    fetchMessagesProgrammes();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await messageService.getMessages();
      setMessages(res.data || res);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesProgrammes = async () => {
    try {
      const res = await messageService.getMessagesProgrammes();
      setMessagesProgrammes(res.data || res);
    } catch (error) {
      console.log("Erreur lors du chargement des messages programmés");
    }
  };

  const handleSendMessage = async () => {
    if (!nouveauMessage.trim()) return;

    try {
      const res = await messageService.envoyerMessage({ contenu: nouveauMessage });
      setMessages(prev => [res.data || res, ...prev]);
      setNouveauMessage("");
      toast({
        title: "Message envoyé !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  };

  const handleScheduleMessage = async () => {
    if (!messageProgramme.contenu.trim() || !messageProgramme.dateEnvoi) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le contenu et la date",
        variant: "destructive",
      });
      return;
    }

    try {
      const dateTimeEnvoi = new Date(`${messageProgramme.dateEnvoi}T${messageProgramme.heureEnvoi}`);
      
      const res = await messageService.programmerMessage({
        contenu: messageProgramme.contenu,
        dateEnvoi: dateTimeEnvoi,
        type: messageProgramme.type
      });
      
      setMessagesProgrammes(prev => [res.data || res, ...prev]);
      setMessageProgramme({
        contenu: '',
        dateEnvoi: '',
        heureEnvoi: '09:00',
        type: 'surprise'
      });
      setShowScheduleForm(false);
      
      toast({
        title: "Message programmé",
        description: "Votre message sera envoyé automatiquement !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de programmer le message",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await messageService.marquerCommeLu(messageId);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, lu: true } : msg
      ));
    } catch (error) {
      console.log("Erreur lors du marquage comme lu");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      try {
        await messageService.supprimerMessage(messageId);
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        toast({
          title: "Message supprimé",
          description: "Le message a été supprimé avec succès",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le message",
          variant: "destructive",
        });
      }
    }
  };

  const getMessageIcon = (type) => {
    const typeInfo = typesMessages.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : '💌';
  };

  const getMessageColor = (type) => {
    const typeInfo = typesMessages.find(t => t.value === type);
    return typeInfo ? typeInfo.color : 'gray';
  };

  const filteredMessages = messages.filter(message => {
    const matchesType = filtreType === 'tous' || message.type === filtreType;
    const matchesSearch = message.contenu.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const MessageCard = ({ message, isProgramme = false }) => {
    const isFromCurrentUser = message.expediteur?.nom === currentUser;
    const messageColor = getMessageColor(message.type);
    
    return (
      <div className={`p-4 rounded-lg border ${
        isFromCurrentUser 
          ? `bg-pink-50 border-pink-200 ml-8` 
          : `bg-blue-50 border-blue-200 mr-8`
      } ${isMobile ? 'mx-2' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getMessageIcon(message.type)}</span>
            <span className={`text-sm font-medium ${
              isFromCurrentUser ? 'text-pink-800' : 'text-blue-800'
            }`}>
              {isFromCurrentUser ? 'Vous' : (partenaire?.nom || 'Votre partenaire')}
            </span>
            {!message.lu && !isFromCurrentUser && (
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs bg-${messageColor}-100 text-${messageColor}-800`}>
              {typesMessages.find(t => t.value === message.type)?.label || message.type}
            </span>
            {isFromCurrentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteMessage(message._id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        
        <p className={`mb-3 ${isMobile ? 'text-sm' : ''} ${
          isFromCurrentUser ? 'text-pink-700' : 'text-blue-700'
        }`}>
          {message.contenu}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {isProgramme ? (
              `Programmé pour le ${new Date(message.dateEnvoi).toLocaleDateString()} à ${new Date(message.dateEnvoi).toLocaleTimeString()}`
            ) : (
              new Date(message.dateEnvoi).toLocaleDateString() + ' à ' + new Date(message.dateEnvoi).toLocaleTimeString()
            )}
          </span>
          
          {!isFromCurrentUser && !message.lu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsRead(message._id)}
              className="text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              Marquer comme lu
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-pink-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="w-5 h-5 mr-2 text-pink-500" />
          Messages d'amour
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto p-4 mb-4 border rounded-lg">
          {messages.length > 0 ? (
            messages.map(message => (
              <div
                key={message._id}
                className={`flex items-end gap-2 ${message.expediteur?.nom === currentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                    message.expediteur?.nom === currentUser
                      ? "bg-pink-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p>{message.contenu}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.dateEnvoi).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun message. Commencez la conversation !</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={nouveauMessage}
            onChange={(e) => setNouveauMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1"
            rows={1}
          />
          <Button onClick={handleSendMessage} className="bg-pink-500 hover:bg-pink-600">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesSection;