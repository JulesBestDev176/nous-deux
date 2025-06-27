import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Youtube, Instagram, Image, Clock, Phone, DollarSign, Lightbulb, ExternalLink, ArrowLeft, Globe, Star, Utensils, Coffee, Film, ShoppingBag, TreePine, Mountain, Building2, Tag, Users, Award, Calendar, Heart, Music, Palette, Target, Zap, Sunrise, Moon, Play } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface LieuData {
  id: string;
  pays: string;
  ville: string;
  categorie: string;
  nom: string;
  type?: string;
  description: string;
  specialites?: string[];
  budget?: string;
  horaires?: string;
  contact?: string;
  note?: string;
  avis?: string;
  decor?: string;
  animation?: string;
  special?: string;
  service?: string;
  public?: string;
  fraicheur?: string;
  ideal?: string;
  conseils?: string;
  activites?: string[];
  images?: string[];
  videos?: string[];
  details?: string;
  liens?: {
    maps?: string;
    instagram?: string;
    site?: string;
    youtube?: string;
    tiktok?: string;
    applemaps?: string;
  };
}

interface LieuPresentationPageProps {
  lieu: LieuData;
  ville?: string;
  onBack: () => void;
}

export default function LieuPresentationPage({ lieu, ville, onBack }: LieuPresentationPageProps) {
  if (!lieu) return null;

  const getCategoryIcon = (categorie: string) => {
    const icons: { [key: string]: LucideIcon } = {
      'restaurant': Utensils,
      'cafe': Coffee,
      'cinema': Film,
      'shopping': ShoppingBag,
      'nature': TreePine,
      'montagne': Mountain,
      'monument': Building2,
      'default': MapPin
    };
    const IconComponent = icons[categorie] || icons.default;
    return <IconComponent className="w-5 h-5" />;
  };

  const getCategoryColor = (categorie: string) => {
    const colors: { [key: string]: string } = {
      'restaurant': 'text-orange-600',
      'cafe': 'text-amber-600', 
      'cinema': 'text-purple-600',
      'shopping': 'text-pink-600',
      'nature': 'text-green-600',
      'montagne': 'text-blue-600',
      'monument': 'text-gray-600',
      'default': 'text-gray-600'
    };
    return colors[categorie] || colors.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-6">
          <Button 
            onClick={onBack} 
            variant="ghost"
            className="flex items-center text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Retour {ville ? `à ${ville}` : "aux destinations"}
          </Button>
        </div>

        {/* Card principale */}
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-6 space-y-6">
            {/* En-tête du lieu */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg bg-gray-100 mr-3 ${getCategoryColor(lieu.categorie)}`}>
                      {getCategoryIcon(lieu.categorie)}
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {lieu.nom}
                      </h1>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="font-medium">{lieu.ville}, {lieu.pays}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tags catégorie et type */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                      <Tag className="w-3 h-3 mr-1 inline" />
                      {lieu.categorie}
                    </span>
                    {lieu.type && (
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-200">
                        {lieu.type}
                      </span>
                    )}
                  </div>

                  {/* Description principale */}
                  <p className="text-gray-700 leading-relaxed text-base">
                    {lieu.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Spécialités */}
            {lieu.specialites && lieu.specialites.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-amber-500" />
                  Spécialités
                </h2>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex flex-wrap gap-2">
                    {lieu.specialites.map((specialite: string, index: number) => (
                      <span 
                        key={index} 
                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm font-medium border border-amber-300"
                      >
                        {specialite}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Informations pratiques - Grid amélioré */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations pratiques
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Budget */}
                {lieu.budget && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <DollarSign className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-yellow-800 mb-1">Budget</div>
                        <div className="text-yellow-700 text-sm">{lieu.budget}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Horaires */}
                {lieu.horaires && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Clock className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-blue-800 mb-1">Horaires</div>
                        <div className="text-blue-700 text-sm">{lieu.horaires}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact */}
                {lieu.contact && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-green-800 mb-1">Contact</div>
                        <div className="text-green-700 text-sm">{lieu.contact}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Note/Avis */}
                {lieu.note && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-start">
                      <Star className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-purple-800 mb-1">Note</div>
                        <div className="text-purple-700 text-sm">{lieu.note}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Avis clients */}
                {lieu.avis && (
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <div className="flex items-start">
                      <Heart className="w-5 h-5 text-pink-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-pink-800 mb-1">Avis clients</div>
                        <div className="text-pink-700 text-sm">{lieu.avis}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Décoration/Ambiance */}
                {lieu.decor && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-start">
                      <Palette className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-indigo-800 mb-1">Ambiance</div>
                        <div className="text-indigo-700 text-sm">{lieu.decor}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Animations/Spectacles */}
                {lieu.animation && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-start">
                      <Music className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-orange-800 mb-1">Animations</div>
                        <div className="text-orange-700 text-sm">{lieu.animation}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spécialités particulières */}
                {lieu.special && (
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-start">
                      <Award className="w-5 h-5 text-teal-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-teal-800 mb-1">Spécialité</div>
                        <div className="text-teal-700 text-sm">{lieu.special}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Type de service */}
                {lieu.service && (
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <div className="flex items-start">
                      <Zap className="w-5 h-5 text-cyan-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-cyan-800 mb-1">Service</div>
                        <div className="text-cyan-700 text-sm">{lieu.service}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Public cible */}
                {lieu.public && (
                  <div className="bg-lime-50 p-4 rounded-lg border border-lime-200">
                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-lime-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-lime-800 mb-1">Public</div>
                        <div className="text-lime-700 text-sm">{lieu.public}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fraîcheur des produits */}
                {lieu.fraicheur && (
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-start">
                      <Sunrise className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-emerald-800 mb-1">Fraîcheur</div>
                        <div className="text-emerald-700 text-sm">{lieu.fraicheur}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Moment idéal */}
                {lieu.ideal && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-amber-800 mb-1">Moment idéal</div>
                        <div className="text-amber-700 text-sm">{lieu.ideal}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conseils */}
                {lieu.conseils && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 md:col-span-2">
                    <div className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-purple-800 mb-1">Conseils</div>
                        <div className="text-purple-700 text-sm">{lieu.conseils}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Activités proposées */}
            {lieu.activites && lieu.activites.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Activités proposées
                </h2>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex flex-wrap gap-2">
                    {lieu.activites.map((activite: string, index: number) => (
                      <span 
                        key={index} 
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium border border-green-300"
                      >
                        {activite}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Liens et réseaux sociaux */}
            {(lieu.liens?.maps || lieu.liens?.instagram || lieu.liens?.site || lieu.liens?.youtube || lieu.liens?.tiktok || lieu.liens?.applemaps) && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Liens utiles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Google Maps */}
                  {lieu.liens?.maps && (
                    <a 
                      href={lieu.liens.maps} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all duration-200 group"
                    >
                      <MapPin className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                      <span className="text-blue-700 font-medium text-sm">Google Maps</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </a>
                  )}

                  {/* Apple Maps */}
                  {lieu.liens?.applemaps && (
                    <a 
                      href={lieu.liens.applemaps} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 group"
                    >
                      <Globe className="w-4 h-4 mr-3 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium text-sm">Apple Maps</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </a>
                  )}

                  {/* Instagram */}
                  {lieu.liens?.instagram && (
                    <a 
                      href={lieu.liens.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-pink-50 hover:bg-pink-100 rounded-lg border border-pink-200 transition-all duration-200 group"
                    >
                      <Instagram className="w-4 h-4 mr-3 text-pink-600 flex-shrink-0" />
                      <span className="text-pink-700 font-medium text-sm">Instagram</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </a>
                  )}

                  {/* YouTube */}
                  {lieu.liens?.youtube && (
                    <a 
                      href={lieu.liens.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all duration-200 group"
                    >
                      <Youtube className="w-4 h-4 mr-3 text-red-600 flex-shrink-0" />
                      <span className="text-red-700 font-medium text-sm">YouTube</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </a>
                  )}

                  {/* TikTok */}
                  {lieu.liens?.tiktok && (
                    <a 
                      href={lieu.liens.tiktok} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-black hover:bg-gray-800 rounded-lg border border-gray-300 transition-all duration-200 group"
                    >
                      <Play className="w-4 h-4 mr-3 text-white flex-shrink-0" />
                      <span className="text-white font-medium text-sm">TikTok</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </a>
                  )}

                  {/* Site web */}
                  {lieu.liens?.site && (
                    <a 
                      href={lieu.liens.site} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 group"
                    >
                      <Globe className="w-4 h-4 mr-3 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium text-sm">Site web</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Galerie d'images (si disponibles) */}
            {lieu.images && lieu.images.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-gray-600" />
                  Galerie ({lieu.images.length} photos)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {lieu.images.map((img: string, i: number) => (
                    <a 
                      key={i} 
                      href={img} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                    >
                      <img 
                        src={img} 
                        alt={`${lieu.nom} - Image ${i + 1}`} 
                        className="w-full h-24 md:h-32 object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Section vidéos (si disponibles) */}
            {lieu.videos && lieu.videos.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Youtube className="w-5 h-5 mr-2 text-red-500" />
                  Vidéos
                </h2>
                <div className="space-y-3">
                  {lieu.videos.map((url: string, i: number) => (
                    <a 
                      key={i} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors duration-200 group"
                    >
                      <Youtube className="w-4 h-4 mr-3 text-red-600 flex-shrink-0" />
                      <span className="text-red-700 font-medium text-sm">
                        Vidéo {i + 1}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-auto text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Détails supplémentaires (si disponibles) */}
            {lieu.details && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Description détaillée
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{lieu.details}</p>
                </div>
              </section>
            )}

            {/* Bouton retour */}
            <div className="pt-6 border-t border-gray-200">
              <Button 
                onClick={onBack} 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour {ville ? `à ${ville}` : "aux destinations"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}