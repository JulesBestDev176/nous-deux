import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Heart, Calendar, User, Loader2, Image as ImageIcon, Plus, X } from "lucide-react";
import gallerieService from "@/services/gallerie.service";

interface Partenaire {
  _id: string;
  nom: string;
  // Ajoutez d'autres propriétés si nécessaire
}

interface GallerieSectionProps {
  currentUser: string;
  partenaire: Partenaire;
  isMobile: boolean;
  toast: (options: { title: string; description?: string; variant?: string }) => void;
  onLogout: () => void;
}

interface Image {
  _id: string;
  url: string;
  legende?: string;
  createur: {
    _id: string;
    nom: string;
  };
  dateCreation: string;
}

const GalerieSection = ({ currentUser, partenaire, isMobile, toast }: GallerieSectionProps) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [legende, setLegende] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await gallerieService.getImages();
      setImages(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Fichier trop volumineux",
          description: "La taille maximum est de 5MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner une image",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Créer une preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Aucune image sélectionnée",
        description: "Veuillez choisir une image",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (legende.trim()) {
        formData.append('legende', legende.trim());
      }

      await gallerieService.uploadImage(formData);
      
      toast({
        title: "Image partagée !",
        description: "Votre souvenir a été ajouté à la galerie 💕",
      });

      // Reset du formulaire
      setSelectedFile(null);
      setLegende("");
      setPreviewUrl("");
      setShowUploadForm(false);
      
      // Recharger les images
      loadImages();
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'ajouter l'image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setLegende("");
    setPreviewUrl("");
    setShowUploadForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos souvenirs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">
                💕 Galerie d'amour
              </CardTitle>
              <p className="text-pink-100">
                Vos plus beaux souvenirs ensemble
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{images.length}</p>
              <p className="text-pink-100 text-sm">photo{images.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bouton d'ajout */}
      {!showUploadForm && (
        <Card className="border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors">
          <CardContent className="p-8 text-center">
            <Button
              onClick={() => setShowUploadForm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 h-auto rounded-xl"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-3" />
              Ajouter un souvenir
            </Button>
            <p className="text-gray-500 mt-3 text-sm">
              Partagez vos moments précieux
            </p>
          </CardContent>
        </Card>
      )}

      {/* Formulaire d'upload */}
      {showUploadForm && (
        <Card className="border-pink-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">
                📸 Nouveau souvenir
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelUpload}
                className="hover:bg-gray-100 rounded-full p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Zone de drop */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Choisir une image
              </Label>
              
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-gray-600 font-medium mb-2">
                      Cliquez pour choisir une image
                    </span>
                    <span className="text-gray-400 text-sm">
                      PNG, JPG jusqu'à 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                    }}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Légende */}
            <div className="space-y-2">
              <Label htmlFor="legende" className="text-sm font-medium text-gray-700">
                Légende (optionnel)
              </Label>
              <Textarea
                id="legende"
                placeholder="Décrivez ce moment spécial..."
                value={legende}
                onChange={(e) => setLegende(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white h-12 rounded-xl"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? "Envoi..." : "Partager le souvenir"}
              </Button>
              <Button
                variant="outline"
                onClick={cancelUpload}
                className="px-6 h-12 rounded-xl"
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Galerie d'images */}
      {images.length === 0 ? (
        <Card className="border-pink-200">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun souvenir pour le moment
            </h3>
            <p className="text-gray-500 mb-6">
              Commencez à créer votre galerie d'amour en ajoutant votre première photo !
            </p>
            <Button
              onClick={() => setShowUploadForm(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {images.map((image) => (
            <Card key={image._id} className="overflow-hidden hover:shadow-lg transition-shadow border-pink-100">
              <div className="aspect-square relative">
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${image.url}`}
                  alt={image.legende || "Souvenir"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center text-sm space-x-2">
                      <User className="w-4 h-4" />
                      <span>{image.createur.nom}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                {image.legende && (
                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {image.legende}
                  </p>
                )}
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(image.dateCreation)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalerieSection;