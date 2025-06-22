import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, User, Bell, Shield, Palette, Globe, Camera, Heart, LogOut, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import userService from "@/services/user.service";
import authService from "@/services/auth.service";

const SettingsSection = ({ currentUser, partenaire, isMobile, toast, onLogout }) => {
  const [activeTab, setActiveTab] = useState("profil");
  const [loading, setLoading] = useState(false);
  const [showCodeChange, setShowCodeChange] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  // États pour changement de code
  const [oldCode, setOldCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [showOldCode, setShowOldCode] = useState(false);
  const [showNewCode, setShowNewCode] = useState(false);

  // États pour changement de mot de passe
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // États pour le profil
  const [profileData, setProfileData] = useState({
    nom: currentUser || '',
    email: '',
    avatar: null
  });

  // États pour les préférences
  const [preferences, setPreferences] = useState({
    notifications: true,
    notificationsEmail: false,
    notificationsSMS: false,
    theme: 'auto',
    langue: 'fr',
    uniteDistance: 'km',
    formatDate: 'dd/mm/yyyy'
  });

  // États pour la confidentialité
  const [privacy, setPrivacy] = useState({
    profilPublic: false,
    statistiquesVisibles: true,
    partageLocalisation: false,
    sauvegardeDonnees: true
  });

  const tabs = [
    { id: "profil", label: "Profil", icon: User },
    { id: "securite", label: "Sécurité", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "apparence", label: "Apparence", icon: Palette },
    { id: "confidentialite", label: "Confidentialité", icon: Eye },
    { id: "compte", label: "Compte", icon: Settings }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await userService.getProfil();
      const data = userData.data || userData;
      
      setProfileData({
        nom: data.nom || currentUser,
        email: data.email || '',
        avatar: data.avatar || null
      });

      if (data.preferences) {
        setPreferences(prev => ({ ...prev, ...data.preferences }));
      }
    } catch (error) {
      console.log("Erreur lors du chargement des données utilisateur");
    }
  };

  const handleCodeChange = async () => {
    if (!oldCode || !newCode || !confirmCode) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (newCode !== confirmCode) {
      toast({
        title: "Erreur",
        description: "Les nouveaux codes ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (newCode.length < 4) {
      toast({
        title: "Code trop court",
        description: "Le code doit contenir au moins 4 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await userService.modifierCode(oldCode, newCode);
      setOldCode("");
      setNewCode("");
      setConfirmCode("");
      setShowCodeChange(false);
      
      toast({
        title: "Code modifié",
        description: "Votre code d'accès a été modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await userService.mettreAJourProfil(profileData);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setLoading(true);
    try {
      await userService.mettreAJourPreferences(preferences);
      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences ont été mises à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar: { url: e.target.result, file } }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutConfirm = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      onLogout();
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("⚠️ ATTENTION ⚠️\n\nCette action supprimera définitivement votre compte et toutes vos données. Cette action est irréversible.\n\nÊtes-vous absolument sûr de vouloir continuer ?")) {
      // Ici vous appelleriez l'API de suppression de compte
      toast({
        title: "Fonctionnalité à venir",
        description: "La suppression de compte sera bientôt disponible",
      });
    }
  };

  return (
    <Card className="shadow-sm border border-pink-200">
      <CardHeader>
        <CardTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
          <Settings className="w-5 h-5 mr-2 text-pink-500" />
          Paramètres
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Onglets */}
        <div className={`mb-6 ${isMobile ? 'space-y-2' : 'flex space-x-2 overflow-x-auto'}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id ? 'bg-pink-500 text-white' : 'text-gray-700'
                } ${isMobile ? 'w-full justify-start' : 'whitespace-nowrap'}`}
                size="sm"
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {/* Onglet Profil */}
          {activeTab === "profil" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Informations personnelles</h3>
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center overflow-hidden">
                      {profileData.avatar ? (
                        <img 
                          src={profileData.avatar.url} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-pink-500" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarChange(e.target.files[0])}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Changer la photo</span>
                      </label>
                    </div>
                  </div>

                  <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom</label>
                      <Input
                        value={profileData.nom}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nom: e.target.value }))}
                        className="border-pink-200 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="border-pink-200 focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Sauvegarder
                  </Button>
                </div>
              </div>

              {/* Informations du couple */}
              {partenaire && (
                <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <h4 className="font-medium text-pink-800 mb-3">Informations du couple</h4>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <span className="text-pink-700">
                      En couple avec {partenaire.nom}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === "securite" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Modifier le code d'accès</h3>
                {!showCodeChange ? (
                  <Button
                    onClick={() => setShowCodeChange(true)}
                    variant="outline"
                    className={`border-pink-200 hover:bg-pink-50 ${isMobile ? 'w-full' : ''}`}
                  >
                    Changer le code d'accès
                  </Button>
                ) : (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ancien code</label>
                      <div className="relative">
                        <Input
                          type={showOldCode ? "text" : "password"}
                          value={oldCode}
                          onChange={(e) => setOldCode(e.target.value)}
                          placeholder="Saisissez votre ancien code"
                          className="border-pink-200 focus:border-pink-500 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowOldCode(!showOldCode)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          {showOldCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nouveau code</label>
                      <div className="relative">
                        <Input
                          type={showNewCode ? "text" : "password"}
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                          placeholder="Nouveau code (minimum 4 caractères)"
                          className="border-pink-200 focus:border-pink-500 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewCode(!showNewCode)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          {showNewCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirmer le nouveau code</label>
                      <Input
                        type="password"
                        value={confirmCode}
                        onChange={(e) => setConfirmCode(e.target.value)}
                        placeholder="Confirmez le nouveau code"
                        className="border-pink-200 focus:border-pink-500"
                      />
                    </div>
                    <div className={`flex space-x-2 ${isMobile ? 'flex-col space-x-0 space-y-2' : ''}`}>
                      <Button
                        onClick={handleCodeChange}
                        disabled={loading || !oldCode || !newCode || !confirmCode}
                        className={`bg-pink-500 hover:bg-pink-600 ${isMobile ? 'w-full' : ''}`}
                      >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Modifier le code
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCodeChange(false);
                          setOldCode("");
                          setNewCode("");
                          setConfirmCode("");
                        }}
                        className={isMobile ? 'w-full' : ''}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sessions actives */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Sessions actives</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Vous êtes connecté sur cet appareil depuis {new Date().toLocaleDateString()}
                </p>
                <Button
                  onClick={handleLogoutConfirm}
                  variant="outline"
                  size="sm"
                  className="border-blue-200 hover:bg-blue-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter de tous les appareils
                </Button>
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Préférences de notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications push</p>
                      <p className="text-sm text-gray-600">Recevoir les notifications dans l'application</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                      className="rounded border-gray-300 text-pink-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifications par email</p>
                      <p className="text-sm text-gray-600">Recevoir un résumé quotidien par email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notificationsEmail}
                      onChange={(e) => setPreferences(prev => ({ ...prev, notificationsEmail: e.target.checked }))}
                      className="rounded border-gray-300 text-pink-600"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePreferencesUpdate}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Sauvegarder les préférences
              </Button>
            </div>
          )}

          {/* Onglet Apparence */}
          {activeTab === "apparence" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Thème</h3>
                <div className="space-y-3">
                  {[
                    { value: 'auto', label: 'Automatique', desc: 'Suit les préférences du système' },
                    { value: 'clair', label: 'Clair', desc: 'Thème lumineux' },
                    { value: 'sombre', label: 'Sombre', desc: 'Thème sombre' }
                  ].map(theme => (
                    <div key={theme.value} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={theme.value}
                        name="theme"
                        checked={preferences.theme === theme.value}
                        onChange={() => setPreferences(prev => ({ ...prev, theme: theme.value }))}
                        className="text-pink-600"
                      />
                      <label htmlFor={theme.value} className="flex-1">
                        <p className="font-medium">{theme.label}</p>
                        <p className="text-sm text-gray-600">{theme.desc}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Langue</h3>
                <select
                  value={preferences.langue}
                  onChange={(e) => setPreferences(prev => ({ ...prev, langue: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <Button
                onClick={handlePreferencesUpdate}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Sauvegarder
              </Button>
            </div>
          )}

          {/* Onglet Confidentialité */}
          {activeTab === "confidentialite" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Paramètres de confidentialité</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Statistiques visibles</p>
                      <p className="text-sm text-gray-600">Permettre à votre partenaire de voir vos statistiques</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.statistiquesVisibles}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, statistiquesVisibles: e.target.checked }))}
                      className="rounded border-gray-300 text-pink-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sauvegarde des données</p>
                      <p className="text-sm text-gray-600">Sauvegarder automatiquement vos données</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.sauvegardeDonnees}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, sauvegardeDonnees: e.target.checked }))}
                      className="rounded border-gray-300 text-pink-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Compte */}
          {activeTab === "compte" && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Zone de danger</h4>
                <p className="text-sm text-yellow-700 mb-4">
                  Ces actions sont irréversibles. Assurez-vous de comprendre les conséquences.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleLogoutConfirm}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Supprimer le compte
                  </Button>
                </div>
              </div>

              {/* Informations du compte */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium mb-3">Informations du compte</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Compte créé : {new Date().toLocaleDateString()}</p>
                  <p>Dernière connexion : {new Date().toLocaleDateString()}</p>
                  <p>Version de l'application : 1.0.0</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsSection;