// weatherCard.js
console.log("weatherCard.js chargé");

// Ce fichier peut être utilisé pour isoler la logique de création des cartes météo
// Actuellement, la fonction createWeatherCard est définie dans app.js

// Il pourrait contenir des fonctionnalités supplémentaires liées aux cartes météo
// Par exemple:

// Map des codes météo aux descriptions
const weatherDescriptions = {
  0: "Soleil",
  1: "Peu nuageux",
  2: "Ciel voilé",
  3: "Nuageux",
  4: "Très nuageux",
  5: "Brouillard",
  6: "Brouillard givrant",
  7: "Pluie faible",
  8: "Pluie modérée",
  9: "Pluie forte",
  10: "Pluie faible verglaçante",
  11: "Pluie modérée verglaçante",
  12: "Pluie forte verglaçante",
  13: "Bruine",
  14: "Neige faible",
  15: "Neige modérée",
  16: "Neige forte",
  20: "Orage",
  21: "Grêle",
  22: "Neige faible",
  30: "Temps ensoleillé",
  31: "Éclaircies (jour)",
  32: "Nuageux",
  33: "Brume",
  34: "Variable"
};

// Cette fonction pourrait être utilisée pour obtenir la description du temps
function getWeatherDescription(weatherCode) {
  return weatherDescriptions[weatherCode] || "Inconnu";
}

// Cette fonction pourrait être utilisée pour convertir la direction du vent en points cardinaux
function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Exportation des fonctions pour utilisation dans app.js
// (Dans une architecture plus complexe avec des modules)
// export { getWeatherDescription, getWindDirection };