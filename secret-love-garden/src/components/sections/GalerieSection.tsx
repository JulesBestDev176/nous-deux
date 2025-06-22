import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Heart, Calendar, User, Loader2, Image as ImageIcon, Plus, X, AlertCircle, ChevronLeft, ChevronRight, Download, Maximize2, Wifi, WifiOff, RefreshCw } from "lucide-react";
import gallerieService from "@/services/gallerie.service";

interface Partenaire {
  _id: string;
  nom: string;
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
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());
  
  // États pour le lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // États pour PWA
  const [isPWA, setIsPWA] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [imageLoadingStates, setImageLoadingStates] = useState<Map<string, 'loading' | 'loaded' | 'error'>>(new Map());
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    loadImages();
    detectPWA();
    setupNetworkListeners();
  }, []);

  // Fonction pour ajouter des logs de debug
  const addDebugLog = (message: string) => {
    console.log(`🔍 PWA Debug: ${message}`);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Détection PWA améliorée
  const detectPWA = () => {
    interface NavigatorStandalone extends Navigator {
      standalone?: boolean;
    }
    const nav = window.navigator as NavigatorStandalone;

    const isPWAMode = window.matchMedia('(display-mode: standalone)').matches ||
                     nav.standalone ||
                     document.referrer.includes('android-app://') ||
                     window.location.href.includes('?pwa=true');
    
    setIsPWA(isPWAMode);
    
    if (isPWAMode) {
      addDebugLog('Mode PWA détecté');
      addDebugLog(`User Agent: ${navigator.userAgent.substring(0, 50)}...`);
      addDebugLog(`Display mode: ${window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'}`);
    } else {
      addDebugLog('Mode navigateur normal');
    }
  };

  // Gestion réseau pour PWA
  const setupNetworkListeners = () => {
    const handleOnline = () => {
      setIsOnline(true);
      addDebugLog('Connexion réseau rétablie');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      addDebugLog('Connexion réseau perdue');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  // Gestion des touches clavier pour la navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (event.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentImageIndex]);

  // Prévenir le scroll du body quand le lightbox est ouvert
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [lightboxOpen]);

  const loadImages = async () => {
    try {
      setLoading(true);
      addDebugLog('Début chargement des images');
      
      const response = await gallerieService.getImages();
      const imageList = response.data || [];
      
      addDebugLog(`${imageList.length} images récupérées de l'API`);
      if (imageList.length > 0) {
        addDebugLog(`Première image URL: ${imageList[0].url}`);
      }
      
      setImages(imageList);
      
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      addDebugLog(`Erreur chargement: ${error}`);
      toast({
        title: "Erreur",
        description: "Impossible de charger les images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction optimisée pour l'URL des images en PWA
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) {
      addDebugLog('URL image vide');
      return '';
    }
    
    let finalUrl = imageUrl;
    
    // Si c'est déjà une URL complète
    if (imageUrl.startsWith('http')) {
      // Force HTTPS pour PWA
      finalUrl = imageUrl.replace('http://', 'https://');
      addDebugLog(`URL Cloudinary transformée: ${finalUrl}`);
    } else {
      // Construction URL locale
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const secureBaseUrl = isPWA ? baseUrl.replace('http://', 'https://') : baseUrl;
      
      finalUrl = imageUrl.startsWith('/') ? 
        `${secureBaseUrl}${imageUrl}` : 
        `${secureBaseUrl}/${imageUrl}`;
      
      addDebugLog(`URL locale construite: ${finalUrl}`);
    }
    
    return finalUrl;
  };

  // Composant d'image amélioré avec diagnostic PWA
  const PWAImage = ({
    src,
    alt,
    className,
    onError,
    onLoad,
    imageId,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt?: string;
    className?: string;
    onError?: (error?: unknown) => void;
    onLoad?: () => void;
    imageId: string;
  }) => {
    const [imageSrc, setImageSrc] = useState<string>(src);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
      setImageLoadingStates(prev => new Map(prev).set(imageId, 'loading'));
      loadImageWithFallbacks();
    }, [src, retryCount]);

    const loadImageWithFallbacks = async () => {
      setIsLoading(true);
      setHasError(false);
      
      const urls = [
        src,
        src.replace('http://', 'https://'),
        // Ajout de paramètres Cloudinary pour forcer le refresh
        src.includes('cloudinary.com') ? `${src}?_=${Date.now()}` : null
      ].filter(Boolean) as string[];
      
      addDebugLog(`Tentative de chargement image ${imageId} avec ${urls.length} URLs`);
      
      for (let i = 0; i < urls.length; i++) {
        try {
          const testUrl = urls[i];
          addDebugLog(`Test URL ${i + 1}/${urls.length}: ${testUrl}`);
          
          // Test avec fetch pour vérifier l'accessibilité
          const response = await fetch(testUrl, {
            method: 'HEAD',
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (response.ok) {
            addDebugLog(`✅ URL valide trouvée pour image ${imageId}`);
            setImageSrc(testUrl);
            setImageLoadingStates(prev => new Map(prev).set(imageId, 'loaded'));
            setIsLoading(false);
            return;
          }
          
        } catch (error) {
          addDebugLog(`❌ Échec URL ${i + 1}: ${error}`);
          continue;
        }
      }
      
      // Toutes les URLs ont échoué
      addDebugLog(`❌ Toutes les URLs ont échoué pour image ${imageId}`);
      setHasError(true);
      setImageLoadingStates(prev => new Map(prev).set(imageId, 'error'));
      setIsLoading(false);
      onError?.();
    };

    const handleRetry = () => {
      addDebugLog(`🔄 Retry image ${imageId} (tentative ${retryCount + 1})`);
      setRetryCount(prev => prev + 1);
    };

    if (hasError) {
      return (
        <div className={`${className} bg-gray-100 flex flex-col items-center justify-center p-4`}>
          <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm text-center mb-3">
            Image non disponible
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Réessayer
          </Button>
          {isPWA && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Mode PWA - Vérifiez la connexion
            </p>
          )}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={`${className} bg-gray-100 flex items-center justify-center`}>
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      );
    }

    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        onLoad={() => {
          addDebugLog(`✅ Image ${imageId} chargée avec succès`);
          onLoad?.();
        }}
        onError={(e) => {
          addDebugLog(`❌ Erreur chargement image ${imageId}: ${e}`);
          setHasError(true);
          onError?.();
        }}
        loading="lazy"
        {...props}
      />
    );
  };

  // Fonctions pour le lightbox
  const openLightbox = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Gestion du swipe pour mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Fonction pour télécharger une image (optimisée PWA)
  const downloadImage = async (imageUrl: string, imageName: string) => {
    try {
      const fullUrl = getImageUrl(imageUrl);
      addDebugLog(`Tentative téléchargement: ${fullUrl}`);
      
      // Fallback classique
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `souvenir-${imageName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addDebugLog('✅ Téléchargement réussi');
      toast({
        title: "Image téléchargée !",
        description: "L'image a été sauvegardée",
      });
    } catch (error) {
      addDebugLog(`❌ Erreur téléchargement: ${error}`);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
    }
  };

  const handleImageError = (imageId: string, imageUrl: string) => {
    addDebugLog(`❌ Erreur image ${imageId}: ${imageUrl}`);
    setImageLoadErrors(prev => new Set(prev).add(imageId));
  };

  const retryImageLoad = (imageId: string) => {
    addDebugLog(`🔄 Retry manuel image ${imageId}`);
    setImageLoadErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
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

    if (!isOnline) {
      toast({
        title: "Pas de connexion",
        description: "Vérifiez votre connexion internet",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      addDebugLog('Début upload image');
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (legende.trim()) {
        formData.append('legende', legende.trim());
      }

      await gallerieService.uploadImage(formData);
      
      addDebugLog('✅ Upload réussi');
      toast({
        title: "Image partagée !",
        description: "Votre souvenir a été ajouté à la galerie 💕",
      });

      setSelectedFile(null);
      setLegende("");
      setPreviewUrl("");
      setShowUploadForm(false);
      
      loadImages();
      
    } catch (error) {
      addDebugLog(`❌ Erreur upload: ${error}`);
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
          {isPWA && (
            <p className="text-xs text-gray-500 mt-2">Mode PWA - Optimisation en cours...</p>
          )}
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="space-y-6">
      {/* Header avec indicateur PWA */}
      <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
                💕 Galerie d'amour
                {isPWA && <span className="text-xs bg-white/20 px-2 py-1 rounded">PWA</span>}
              </CardTitle>
              <p className="text-pink-100 flex items-center gap-2">
                Vos plus beaux souvenirs ensemble
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{images.length}</p>
              <p className="text-pink-100 text-sm">photo{images.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Debug info pour PWA */}
      {isPWA && debugInfo.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Debug PWA
            </h4>
            <div className="text-xs text-blue-700 space-y-1 max-h-32 overflow-y-auto">
              {debugInfo.map((log, index) => (
                <div key={index} className="font-mono">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerte mode hors ligne */}
      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm font-medium">Mode hors ligne - Certaines images peuvent ne pas être disponibles</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bouton d'ajout */}
      {!showUploadForm && (
        <Card className="border-2 border-dashed border-pink-200 hover:border-pink-300 transition-colors">
          <CardContent className="p-8 text-center">
            <Button
              onClick={() => setShowUploadForm(true)}
              disabled={!isOnline}
              className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 h-auto rounded-xl disabled:opacity-50"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-3" />
              Ajouter un souvenir
            </Button>
            <p className="text-gray-500 mt-3 text-sm">
              {isOnline ? "Partagez vos moments précieux" : "Connexion requise pour ajouter"}
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

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || !isOnline}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white h-12 rounded-xl disabled:opacity-50"
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
              disabled={!isOnline}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {images.map((image, index) => (
            <Card key={image._id} className="overflow-hidden hover:shadow-lg transition-shadow border-pink-100 group cursor-pointer">
              <div 
                className="aspect-square relative"
                onClick={() => openLightbox(index)}
              >
                {imageLoadErrors.has(image._id) ? (
                  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm text-center mb-3">
                      Impossible de charger l'image
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        retryImageLoad(image._id);
                      }}
                      className="text-xs"
                    >
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <PWAImage
                    src={getImageUrl(image.url)}
                    alt={image.legende || "Souvenir"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={() => handleImageError(image._id, image.url)}
                    imageId={image._id}
                  />
                )}
                
                {/* Overlay avec icône de zoom */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <p className="text-gray-700 mb-3 line-clamp-2 text-sm">
                    {image.legende}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{formatDate(image.dateCreation)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && currentImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Bouton de fermeture */}
          <Button
            variant="ghost"
            size="sm"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Compteur d'images */}
          <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Navigation précédente */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full p-3"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Navigation suivante */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20 rounded-full p-3"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Bouton de téléchargement/partage */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(currentImage.url, currentImage._id);
            }}
            className="absolute bottom-4 right-4 z-10 text-white hover:bg-white/20 rounded-full p-2"
            title="Télécharger"
          >
            <Download className="w-5 h-5" />
          </Button>

          {/* Image principale avec gestion du swipe */}
          <div 
            className="relative max-w-full max-h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <PWAImage
              src={getImageUrl(currentImage.url)}
              alt={currentImage.legende || "Souvenir"}
              className="max-w-full max-h-full object-contain"
              imageId={`lightbox-${currentImage._id}`}
            />
            
            {/* Informations de l'image */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              {currentImage.legende && (
                <p className="text-lg mb-2">
                  {currentImage.legende}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{currentImage.createur.nom}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(currentImage.dateCreation)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalerieSection;