const apiKey = "66cff00f6577a411ad7d905508f66d74"; 

const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-button");
const micBtn = document.querySelector(".mic-button");
const locateBtn = document.querySelector(".locate-button");
const errorMessage = document.getElementById("error-message");
const weatherCard = document.getElementById("weather-card");
const forecastContainer = document.getElementById("forecast");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const description = document.getElementById("description");
const icon = document.getElementById("weather-icon");

searchBtn.addEventListener("click", () => getWeather(cityInput.value));
micBtn.addEventListener("click", startVoice);
locateBtn.addEventListener("click", detectLocation);
cityInput.addEventListener("input", showSuggestions);

function getWeather(city) {
  if (!city) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) throw new Error(data.message);
      displayWeather(data);
      getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(err => {
      errorMessage.textContent = "City not found.";
      weatherCard.classList.remove("show");
    });
}

function displayWeather(data) {
  errorMessage.textContent = "";
  cityName.textContent = data.name;
  temperature.textContent = `${data.main.temp}°C`;
  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${data.wind.speed} m/s`;
  description.textContent = data.weather[0].description;
  icon.className = `wi ${mapIcon(data.weather[0].main.toLowerCase())}`;
  weatherCard.classList.add("show");
}

function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      forecastContainer.innerHTML = "";
      data.daily.slice(1, 8).forEach((day, i) => {
        const d = new Date(day.dt * 1000);
        forecastContainer.innerHTML += `
          <div class="forecast-day">
            <span>${d.toDateString().split(' ').slice(0, 3).join(' ')}</span>
            <span>🌡️ ${day.temp.day}°C</span>
            <span>💧 ${day.humidity}%</span>
          </div>`;
      });
    });
}

function mapIcon(type) {
  switch (type) {
    case "clear": return "wi-day-sunny";
    case "clouds": return "wi-cloudy";
    case "rain": return "wi-rain";
    case "drizzle": return "wi-sprinkle";
    case "snow": return "wi-snow";
    case "thunderstorm": return "wi-thunderstorm";
    case "mist":
    case "fog": return "wi-fog";
    default: return "wi-na";
  }
}

function startVoice() {
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    alert("Voice search not supported.");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event) => {
    const city = event.results[0][0].transcript;
    cityInput.value = city;
    getWeather(city);
  };
}

function detectLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          cityInput.value = data.name;
          displayWeather(data);
          getForecast(latitude, longitude);
        });
    });
  }
}

function showSuggestions() {
  const suggestions = document.getElementById("suggestions");
  const query = cityInput.value.toLowerCase();

  if (query.length < 2) {
    suggestions.style.display = "none";
    return;
  }

  const popularCities = ["New York", "London", "Tokyo", "Mumbai", "Sydney", "Paris", "Moscow", "Dubai"];
  const filtered = popularCities.filter(c => c.toLowerCase().includes(query));
  suggestions.innerHTML = filtered.map(c => `<div>${c}</div>`).join("");
  suggestions.style.display = filtered.length ? "block" : "none";

  suggestions.querySelectorAll("div").forEach(item => {
    item.addEventListener("click", () => {
      cityInput.value = item.textContent;
      suggestions.style.display = "none";
      getWeather(item.textContent);
    });
  });
}
