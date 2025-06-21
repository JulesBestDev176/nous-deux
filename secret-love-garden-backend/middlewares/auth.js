const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/Utilisateur');

const protegerRoutes = async (req, res, next) => {
  let token;

  // Vérifier à la fois les headers ET les cookies
  if (
    req.headers.authorization?.startsWith('Bearer') || 
    req.cookies?.token
  ) {
    token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Accès non autorisé' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = await Utilisateur.findById(decoded.id).select('-code');
    next();
  } catch (error) {
    // Gestion plus fine des erreurs d'expiration
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expirée, veuillez vous reconnecter'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

module.exports = { protegerRoutes };