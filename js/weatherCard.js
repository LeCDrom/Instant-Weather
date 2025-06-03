// weatherCard.js
console.log("weatherCard.js chargé");

// Cartes météo
function createWeatherCard(city, forecast, opts) {
  const article = document.createElement("article");
  article.className = "weather-card";

  const date = new Date(forecast.datetime).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long"
  });

  const weatherIcon = getWeatherIcon(forecast.weather);

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

  if (opts.showLat && city.latitude) {
    html += `<p class="info-row"><span class="material-symbols-rounded">map</span> Latitude : ${city.latitude}</p>`;
  }

  if (opts.showLon && city.longitude) {
    html += `<p class="info-row"><span class="material-symbols-rounded">map</span> Longitude : ${city.longitude}</p>`;
  }

  if (opts.showRain) {
    html += `<p class="info-row"><span class="material-symbols-rounded">water_drop</span> Pluie : ${forecast.rr10} mm</p>`;
  }

  if (opts.showWind) {
    html += `<p class="info-row"><span class="material-symbols-rounded">air</span> Vent : ${forecast.wind10m} km/h</p>`;
  }

  if (opts.showDir) {
    html += `<p class="info-row"><span class="material-symbols-rounded">navigation</span> Direction : ${forecast.dirwind10m}°</p>`;
  }

  article.innerHTML = html;
  return article;
}