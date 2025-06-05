// app.js
console.log("app.js chargé");

const apiKey = "222d0d26fe75c52249049d41500dbda856ccad03b7d06bf0dbf0fc551ece254e";
const meteoBaseUrl = "https://api.meteo-concept.com/api";
const geoBaseUrl = "https://geo.api.gouv.fr/communes";

// Récupération des éléments du DOM
const postalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const validationButton = document.getElementById("validationButton");
const weatherInfoSection = document.getElementById("weatherInformation");
const nbDaysInput = document.getElementById("nbDays");
const daysCount = document.getElementById("daysCount");
const toggleDarkMode = document.getElementById("toggleDarkMode");

// Initialisation du mode sombre persistant
document.addEventListener("DOMContentLoaded", () => {
  // Appliquer le thème sauvegardé
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme === "enabled") {
    document.body.classList.add("dark-mode");
    toggleDarkMode.querySelector(".material-symbols-rounded").textContent = "light_mode";
  }

  // Mise à jour de l'apparence du slider
  updateSliderBackground();
  daysCount.textContent = nbDaysInput.value;
});

// Gestionnaire du dark mode
toggleDarkMode.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
  toggleDarkMode.querySelector(".material-symbols-rounded").textContent = isDark ? "light_mode" : "dark_mode";
  updateSliderBackground();
});

// Slider dynamique
function updateSliderBackground() {
  const isDark = document.body.classList.contains("dark-mode");
  const computedStyles = getComputedStyle(document.documentElement);
  const activeColor = computedStyles.getPropertyValue('--primary').trim() || "#1e88e5";
  const inactiveColor = isDark ? "#212121" : "#dddddd";

  const min = parseInt(nbDaysInput.min, 10);
  const max = parseInt(nbDaysInput.max, 10);
  const value = parseInt(nbDaysInput.value, 10);
  const ratio = ((value - min) / (max - min)) * 100;

  nbDaysInput.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
}

// Gestion slider
nbDaysInput.addEventListener("input", () => {
  daysCount.textContent = nbDaysInput.value;
  updateSliderBackground();
});

// Recherche des communes via Geo API Gouv
postalInput.addEventListener("input", debounce(async () => {
  const code = postalInput.value.trim();

  // Test du format du code postal
  if (!/^\d{5}$/.test(code)) {
    let message = "Code postal invalide";

    if (code.length < 5) {
      message = "Code postal trop court";
    } else if (code.length > 5) {
      message = "Code postal trop long";
    }

    communeSelect.innerHTML = `<option value="">${message}</option>`;
    return;
  }

  try {
    communeSelect.innerHTML = "<option value=''>Chargement des communes...</option>";

    const res = await fetch(`${geoBaseUrl}?codePostal=${code}`);
    if (!res.ok) throw new Error(res.status);
    const communes = await res.json();

    if (communes.length === 0) {
      communeSelect.innerHTML = "<option value=''>Aucune commune trouvée</option>";
      return;
    }

    communeSelect.innerHTML = "<option value=''>Sélectionnez une commune</option>";
    communes.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.nom;

      if (c.centre && Array.isArray(c.centre.coordinates) && c.centre.coordinates.length >= 2) {
        const lon = c.centre.coordinates[0];
        const lat = c.centre.coordinates[1];
        if (!isNaN(lat) && !isNaN(lon)) {
          opt.setAttribute("data-latitude", lat);
          opt.setAttribute("data-longitude", lon);
        }
      }
      communeSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Erreur Geo API :", err);
    communeSelect.innerHTML = "<option value=''>Erreur de chargement</option>";
  }
}, 300));

// Empêcher la validation avec Entrée dans champ code postal
postalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

// Validation et affichage météo
validationButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const insee = communeSelect.value;

  if (!insee) {
    return;
  }

  weatherInfoSection.innerHTML = "<div class='loading'><span class='material-symbols-rounded'>hourglass_top</span> Chargement des prévisions...</div>";

  const nbDays = parseInt(nbDaysInput.value, 10);
  const showLat = document.getElementById("lat").checked;
  const showLon = document.getElementById("lon").checked;
  const showSun = document.getElementById("sun").checked;
  const showRain = document.getElementById("rain").checked;
  const showWind = document.getElementById("wind").checked;
  const showDir = document.getElementById("dir").checked;

  const selectedOption = communeSelect.selectedOptions[0];
  const city = {
    name: selectedOption.textContent,
    latitude: selectedOption.getAttribute("data-latitude"),
    longitude: selectedOption.getAttribute("data-longitude")
  };

  // Requête API vers open meteo concept
  try {
    const resF = await fetch(`${meteoBaseUrl}/forecast/daily?token=${apiKey}&insee=${insee}&day=${nbDays}`);
    console.log(resF)
    if (!resF.ok) throw new Error(`Erreur API: ${resF.status}`);

    const jsonF = await resF.json();
    const forecasts = jsonF.forecast.slice(0, nbDays);

    if ((!city.latitude || !city.longitude) && jsonF.city) {
      city.latitude = jsonF.city.latitude;
      city.longitude = jsonF.city.longitude;
    }

    weatherInfoSection.innerHTML = "";
    forecasts.forEach(f => {
      const card = createWeatherCard(city, f, { showLat, showLon, showSun, showRain, showWind, showDir });
      weatherInfoSection.appendChild(card);
    });
  } catch (err) {
    console.error("Erreur Météo API :", err);
    weatherInfoSection.innerHTML = "<div class='error-message'><span class='material-symbols-rounded'>error</span> Impossible de récupérer les prévisions.</div>";
  }
});

// Debounce
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

//  Icone météo selon code météo
function getWeatherIcon(weatherCode) {
  const weatherIcons = {
    // Conditions ensoleillées
    0: "wb_sunny",             // Soleil
    1: "partly_cloudy_day",    // Peu nuageux
    2: "partly_cloudy_day",    // Ciel voilé
    3: "cloud",                // Nuageux
    4: "cloud",                // Très nuageux
    5: "cloud",                // Couvert
    6: "foggy",                // Brouillard
    7: "foggy",                // Brouillard givrant

    // Pluie
    10: "rainy",               // Pluie faible
    11: "rainy",               // Pluie modérée
    12: "rainy_heavy",         // Pluie forte
    13: "rainy_snow",          // Pluie faible verglaçante
    14: "rainy_snow",          // Pluie modérée verglaçante
    15: "rainy_snow",          // Pluie forte verglaçante
    16: "grain",               // Bruine

    // Neige
    20: "weather_snowy",       // Neige faible
    21: "snowing",             // Neige modérée
    22: "snowing_heavy",       // Neige forte

    // Pluie et neige mêlées
    30: "rainy_snow",          // Pluie et neige mêlées faibles
    31: "rainy_snow",          // Pluie et neige mêlées modérées
    32: "rainy_snow",          // Pluie et neige mêlées fortes

    // Averses de pluie
    40: "rainy",               // Averses de pluie locales et faibles
    41: "rainy",               // Averses de pluie locales
    42: "rainy_heavy",         // Averses locales et fortes
    43: "rainy",               // Averses de pluie faibles
    44: "rainy",               // Averses de pluie
    45: "rainy_heavy",         // Averses de pluie fortes
    46: "rainy",               // Averses de pluie faibles et fréquentes
    47: "rainy",               // Averses de pluie fréquentes
    48: "rainy_heavy",         // Averses de pluie fortes et fréquentes

    // Averses de neige
    60: "weather_snowy",       // Averses de neige localisées et faibles
    61: "snowing",             // Averses de neige localisées
    62: "snowing_heavy",       // Averses de neige localisées et fortes
    63: "weather_snowy",       // Averses de neige faibles
    64: "snowing",             // Averses de neige
    65: "snowing_heavy",       // Averses de neige fortes
    66: "weather_snowy",       // Averses de neige faibles et fréquentes
    67: "snowing",             // Averses de neige fréquentes
    68: "snowing_heavy",       // Averses de neige fortes et fréquentes

    // Averses de pluie et neige mêlées
    70: "rainy_snow",         // Averses de pluie et neige mêlées localisées et faibles
    71: "rainy_snow",         // Averses de pluie et neige mêlées localisées
    72: "rainy_snow",         // Averses de pluie et neige mêlées localisées et fortes
    73: "rainy_snow",         // Averses de pluie et neige mêlées faibles
    74: "rainy_snow",         // Averses de pluie et neige mêlées
    75: "rainy_snow",         // Averses de pluie et neige mêlées fortes
    76: "rainy_snow",         // Averses de pluie et neige mêlées faibles et nombreuses
    77: "rainy_snow",         // Averses de pluie et neige mêlées fréquentes
    78: "rainy_snow",         // Averses de pluie et neige mêlées fortes et fréquentes

    // Orages
    100: "thunderstorm",       // Orages faibles et locaux
    101: "thunderstorm",       // Orages locaux
    102: "thunderstorm",       // Orages forts et locaux
    103: "thunderstorm",       // Orages faibles
    104: "thunderstorm",       // Orages
    105: "thunderstorm",       // Orages forts
    106: "thunderstorm",       // Orages faibles et fréquents
    107: "thunderstorm",       // Orages fréquents
    108: "thunderstorm",       // Orages forts et fréquents

    // Orages de neige ou grésil
    120: "thunderstorm",       // Orages faibles et locaux de neige ou grésil
    121: "thunderstorm",       // Orages locaux de neige ou grésil
    122: "thunderstorm",       // Orages forts et locaux de neige ou grésil
    123: "thunderstorm",       // Orages faibles de neige ou grésil
    124: "thunderstorm",       // Orages de neige ou grésil
    125: "thunderstorm",       // Orages forts de neige ou grésil
    126: "thunderstorm",       // Orages faibles et fréquents de neige ou grésil
    127: "thunderstorm",       // Orages fréquents de neige ou grésil
    128: "thunderstorm",       // Orages forts et fréquents de neige ou grésil

    // Orages de pluie et neige mêlées ou grésil
    130: "thunderstorm",       // Orages faibles et locaux de pluie et neige mêlées ou grésil
    131: "thunderstorm",       // Orages locaux de pluie et neige mêlées ou grésil
    132: "thunderstorm",       // Orages forts et locaux de pluie et neige mêlées ou grésil
    133: "thunderstorm",       // Orages faibles de pluie et neige mêlées ou grésil
    134: "thunderstorm",       // Orages de pluie et neige mêlées ou grésil
    135: "thunderstorm",       // Orages forts de pluie et neige mêlées ou grésil
    136: "thunderstorm",       // Orages faibles et fréquents de pluie et neige mêlées ou grésil
    137: "thunderstorm",       // Orages fréquents de pluie et neige mêlées ou grésil
    138: "thunderstorm",       // Orages forts et fréquents de pluie et neige mêlées ou grésil

    // Pluies orageuses
    140: "thunderstorm",       // Pluies orageuses
    141: "thunderstorm",       // Pluie et neige mêlées à caractère orageux
    142: "thunderstorm",       // Neige à caractère orageux

    // Pluies intermittentes
    210: "rainy",              // Pluie faible intermittente
    211: "rainy",              // Pluie modérée intermittente
    212: "rainy_heavy",        // Pluie forte intermittente

    // Pluies intermittentes
    220: "weather_snowy",      // Neige faible intermittente
    221: "snowing",            // Neige modérée intermittente
    222: "snowing_heavy",      // Neige forte intermittente

    // Autres
    230: "rainy_snow",         // Pluie et neige mêlées
    231: "rainy_snow",         // Pluie et neige mêlées
    232: "rainy_snow",         // Pluie et neige mêlées
    235: "weather_hail"        // Averses de grêle
  };

  return weatherIcons[weatherCode] || "help_outline";
}
