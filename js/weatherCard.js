// weatherCard.js
console.log("weatherCard.js chargé");

// Cartes météo
function createWeatherCard(city, forecast, opts) {
  // Création de l'élément principal de la carte
  const article = document.createElement("article");
  article.className = "weather-card";

  // Formatage de la date au format français
  const date = new Date(forecast.datetime).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long"
  });

  // Récupération de l’icône météo correspondante (de app.js)
  const weatherIcon = getWeatherIcon(forecast.weather);

  // Contenu HTML principal de la carte
  let html = `
    <div class="weather-icon">
      <span class="material-symbols-rounded">${weatherIcon}</span>
    </div>
    <h3>${city.name} — ${date}</h3>
    <div class="temp-info">
      <span class="temp-container"><span class="material-symbols-rounded" id="temp-down">thermostat_arrow_down</span> ${forecast.tmin}°C</span>
      <span class="temp-container"><span class="material-symbols-rounded" id="temp-up">thermostat_arrow_up</span> ${forecast.tmax}°C</span>
    </div>
  `;

  // Informations optionnelles en fonction des paramètres 'opts'
  if (opts.showLat && city.latitude) {
    html += `<p class="info-row"><span class="material-symbols-rounded">map</span><strong> Latitude</strong> : ${city.latitude}</p>`;
  }

  if (opts.showLon && city.longitude) {
    html += `<p class="info-row"><span class="material-symbols-rounded">map</span><strong> Longitude</strong> : ${city.longitude}</p>`;
  }

  if (opts.showSun) {
    html += `<p class="info-row"><span class="material-symbols-rounded">wb_sunny</span><strong> Ensoleillement</strong> : ${forecast.sun_hours} h</p>`;
  }
  
  if (opts.showRain) {
    html += `<p class="info-row"><span class="material-symbols-rounded">water_drop</span><strong> Pluie</strong> : ${forecast.rr10} mm</p>`;
  }

  if (opts.showWind) {
    html += `<p class="info-row"><span class="material-symbols-rounded">air</span><strong> Vent</strong> : ${forecast.wind10m} km/h</p>`;
  }

  if (opts.showDir) {
    html += `<p class="info-row"><span class="material-symbols-rounded">navigation</span><strong> Direction</strong> : ${forecast.dirwind10m}°</p>`;
  }

  // Injection du HTML dans l'article
  article.innerHTML = html;
  return article;
}