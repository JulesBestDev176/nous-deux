import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Check, Plus, Trash2, Edit, Target, Loader2 } from "lucide-react";
import objectifService from "@/services/objectif.service.js";

const ObjectifsSection = ({ currentUser, isMobile, toast }) => {
  const [objectifs, setObjectifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nouvelObjectif, setNouvelObjectif] = useState({
    titre: '',
    description: '',
    categorie: 'couple',
    dateCible: ''
  });

  useEffect(() => {
    fetchObjectifs();
  }, []);

  const fetchObjectifs = async () => {
    try {
      setLoading(true);
      const res = await objectifService.getObjectifs();
      setObjectifs(res.data || res);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les objectifs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateObjectif = async () => {
    if (!nouvelObjectif.titre.trim() || !nouvelObjectif.dateCible) {
      toast({
        title: "Champs requis",
        description: "Le titre et la date cible sont obligatoires",
        variant: "destructive"
      });
      return;
    }
    try {
      const res = await objectifService.creerObjectif(nouvelObjectif);
      setObjectifs(prev => [...prev, res.data || res]);
      setShowForm(false);
      setNouvelObjectif({ titre: '', description: '', categorie: 'couple', dateCible: '' });
      toast({
        title: "Objectif créé !",
        description: "Un nouveau but à atteindre ensemble.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'objectif",
        variant: "destructive",
      });
    }
  };

  const handleDeleteObjectif = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
      try {
        await objectifService.supprimerObjectif(id);
        setObjectifs(prev => prev.filter(o => o._id !== id));
        toast({
          title: "Objectif supprimé",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'objectif",
          variant: "destructive",
        });
      }
    }
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-pink-500" />
            Nos Objectifs de couple
          </div>
          <Button onClick={() => setShowForm(prev => !prev)} className="bg-pink-500 hover:bg-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? "Annuler" : "Nouvel objectif"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="p-4 mb-6 space-y-4 bg-pink-50 rounded-lg border border-pink-200">
            <Input
              value={nouvelObjectif.titre}
              onChange={(e) => setNouvelObjectif(p => ({ ...p, titre: e.target.value }))}
              placeholder="Titre de l'objectif"
            />
            <Input
              value={nouvelObjectif.description}
              onChange={(e) => setNouvelObjectif(p => ({ ...p, description: e.target.value }))}
              placeholder="Description (optionnel)"
            />
            <Input
              type="date"
              value={nouvelObjectif.dateCible}
              onChange={(e) => setNouvelObjectif(p => ({ ...p, dateCible: e.target.value }))}
            />
            <Button onClick={handleCreateObjectif} className="w-full bg-pink-500 hover:bg-pink-600">
              Ajouter l'objectif
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {objectifs.length > 0 ? (
            objectifs.map(objectif => (
              <div key={objectif._id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{objectif.titre}</h3>
                    <p className="text-sm text-gray-600">{objectif.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Date cible: {new Date(objectif.dateCible).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteObjectif(objectif._id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <div className="mt-2">
                  <Progress value={objectif.progression || 0} className="w-full" />
                  <p className="text-xs text-right mt-1">{objectif.progression || 0}%</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun objectif défini pour le moment.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectifsSection;