class WeatherApp {
  constructor() {
    this.apiKey = "YOUR_API_KEY_HERE"; // Replace with your OpenWeatherMap API key
    this.currentLocationData = null;
    this.initializeApp();
  }

  initializeApp() {
    this.bindEvents();
    this.updateDateTime();
    this.checkTimeOfDay();

    // Try to get user's location on page load
    this.getCurrentLocation();

    // Update time every minute
    setInterval(() => this.updateDateTime(), 60000);
  }

  bindEvents() {
    const searchBtn = document.getElementById("searchBtn");
    const locationBtn = document.getElementById("locationBtn");
    const locationInput = document.getElementById("locationInput");
    const retryBtn = document.getElementById("retryBtn");

    searchBtn.addEventListener("click", () => this.searchWeather());
    locationBtn.addEventListener("click", () => this.getCurrentLocation());
    retryBtn.addEventListener("click", () => this.retryLastSearch());

    locationInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.searchWeather();
      }
    });

    // Add input animation
    locationInput.addEventListener("focus", () => {
      locationInput.parentElement.style.transform = "scale(1.02)";
    });

    locationInput.addEventListener("blur", () => {
      locationInput.parentElement.style.transform = "scale(1)";
    });
  }

  async getCurrentLocation() {
    if (!navigator.geolocation) {
      this.showError("Geolocation is not supported by this browser.");
      return;
    }

    this.showLoading();

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
        });
      });

      const { latitude, longitude } = position.coords;
      await this.fetchWeatherByCoords(latitude, longitude);
    } catch (error) {
      console.error("Geolocation error:", error);
      this.showError(
        "Unable to get your location. Please search for a city manually."
      );
    }
  }

  async searchWeather() {
    const location = document.getElementById("locationInput").value.trim();
    if (!location) {
      this.showError("Please enter a city name.");
      return;
    }

    this.showLoading();
    await this.fetchWeatherByCity(location);
  }

  async fetchWeatherByCity(city) {
    try {
      // Using a demo API response since we can't use real API keys in this environment
      // In production, replace this with actual API calls
      const mockData = this.generateMockWeatherData(city);
      await this.simulateAPIDelay();
      this.displayWeather(mockData);
    } catch (error) {
      console.error("Weather fetch error:", error);
      this.showError("Unable to fetch weather data. Please try again.");
    }
  }

  async fetchWeatherByCoords(lat, lon) {
    try {
      // Using mock data for demonstration
      const mockData = this.generateMockWeatherData("Your Location", lat, lon);
      await this.simulateAPIDelay();
      this.displayWeather(mockData);
    } catch (error) {
      console.error("Weather fetch error:", error);
      this.showError("Unable to fetch weather data. Please try again.");
    }
  }

  // Simulate API delay for realistic loading experience
  simulateAPIDelay() {
    return new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000)
    );
  }

  generateMockWeatherData(location, lat = null, lon = null) {
    const conditions = [
      { main: "Clear", description: "clear sky", icon: "01d", temp: 25 },
      { main: "Clouds", description: "few clouds", icon: "02d", temp: 22 },
      { main: "Rain", description: "light rain", icon: "10d", temp: 18 },
      { main: "Snow", description: "light snow", icon: "13d", temp: -2 },
      {
        main: "Thunderstorm",
        description: "thunderstorm",
        icon: "11d",
        temp: 20,
      },
    ];

    const randomCondition =
      conditions[Math.floor(Math.random() * conditions.length)];
    const baseTemp = randomCondition.temp;

    return {
      name: location === "Your Location" ? "Current Location" : location,
      sys: { country: "US" },
      coord: { lat: lat || 40.7128, lon: lon || -74.006 },
      main: {
        temp: baseTemp,
        feels_like: baseTemp + Math.floor(Math.random() * 6) - 3,
        humidity: 50 + Math.floor(Math.random() * 40),
        pressure: 1000 + Math.floor(Math.random() * 50),
      },
      weather: [
        {
          main: randomCondition.main,
          description: randomCondition.description,
          icon: randomCondition.icon,
        },
      ],
      wind: {
        speed: Math.floor(Math.random() * 20) + 5,
      },
      visibility: 8000 + Math.floor(Math.random() * 7000),
      clouds: { all: Math.floor(Math.random() * 100) },
      dt: Date.now() / 1000,
      // Mock hourly forecast
      hourly: this.generateHourlyForecast(baseTemp),
    };
  }

  generateHourlyForecast(baseTemp) {
    const forecast = [];
    const now = new Date();

    for (let i = 1; i <= 12; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000);
      const tempVariation = Math.floor(Math.random() * 10) - 5;

      forecast.push({
        dt: time.getTime() / 1000,
        main: {
          temp: baseTemp + tempVariation,
        },
        weather: [
          {
            main: "Clear",
            description: "clear sky",
            icon: this.getIconForTime(time),
          },
        ],
      });
    }

    return forecast;
  }

  getIconForTime(date) {
    const hour = date.getHours();
    if (hour >= 6 && hour < 18) {
      return "01d"; // day
    } else {
      return "01n"; // night
    }
  }

  displayWeather(data) {
    this.currentLocationData = data;

    // Hide loading and error, show weather card
    document.getElementById("loading").style.display = "none";
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("weatherCard").style.display = "block";

    // Animate card appearance
    const weatherCard = document.getElementById("weatherCard");
    weatherCard.style.opacity = "0";
    weatherCard.style.transform = "translateY(30px)";

    setTimeout(() => {
      weatherCard.style.transition = "all 0.6s ease";
      weatherCard.style.opacity = "1";
      weatherCard.style.transform = "translateY(0)";
    }, 100);

    // Update weather information
    document.getElementById("cityName").textContent = data.name;
    document.getElementById("country").textContent = data.sys.country;
    document.getElementById("temperature").textContent = Math.round(
      data.main.temp
    );
    document.getElementById("feelsLike").textContent = Math.round(
      data.main.feels_like
    );
    document.getElementById("weatherDescription").textContent =
      data.weather[0].description;

    // Update weather icon
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    document.getElementById("weatherIcon").src = iconUrl;
    document.getElementById("weatherIcon").alt = data.weather[0].description;

    // Update weather details
    document.getElementById("visibility").textContent = `${(
      data.visibility / 1000
    ).toFixed(1)} km`;
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("windSpeed").textContent = `${data.wind.speed} m/s`;
    document.getElementById(
      "pressure"
    ).textContent = `${data.main.pressure} hPa`;
    document.getElementById("uvIndex").textContent = Math.floor(
      Math.random() * 11
    ); // Mock UV index
    document.getElementById("cloudCover").textContent = `${data.clouds.all}%`;

    // Update forecast
    this.displayForecast(data.hourly || []);

    // Add stagger animation to detail items
    this.animateDetailItems();
  }

  displayForecast(hourlyData) {
    const forecastContainer = document.getElementById("forecastContainer");
    forecastContainer.innerHTML = "";

    hourlyData.slice(0, 12).forEach((item, index) => {
      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";
      forecastItem.style.animationDelay = `${index * 0.1}s`;

      const time = new Date(item.dt * 1000);
      const timeString = time.getHours().toString().padStart(2, "0") + ":00";

      forecastItem.innerHTML = `
                <div class="forecast-time">${timeString}</div>
                <img class="forecast-icon" 
                     src="https://openweathermap.org/img/wn/${
                       item.weather[0].icon
                     }.png" 
                     alt="${item.weather[0].description}">
                <div class="forecast-temp">${Math.round(item.main.temp)}°C</div>
                <div class="forecast-desc">${item.weather[0].description}</div>
            `;

      forecastContainer.appendChild(forecastItem);
    });
  }

  animateDetailItems() {
    const detailItems = document.querySelectorAll(".detail-item");
    detailItems.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateX(-30px)";

      setTimeout(() => {
        item.style.transition = "all 0.5s ease";
        item.style.opacity = "1";
        item.style.transform = "translateX(0)";
      }, index * 100);
    });
  }

  showLoading() {
    document.getElementById("loading").style.display = "block";
    document.getElementById("weatherCard").style.display = "none";
    document.getElementById("errorMessage").style.display = "none";
  }

  showError(message) {
    document.getElementById("loading").style.display = "none";
    document.getElementById("weatherCard").style.display = "none";
    document.getElementById("errorMessage").style.display = "block";
    document.getElementById("errorText").textContent = message;

    // Animate error message
    const errorMsg = document.getElementById("errorMessage");
    errorMsg.style.opacity = "0";
    errorMsg.style.transform = "scale(0.8)";

    setTimeout(() => {
      errorMsg.style.transition = "all 0.4s ease";
      errorMsg.style.opacity = "1";
      errorMsg.style.transform = "scale(1)";
    }, 100);
  }

  retryLastSearch() {
    const locationInput = document.getElementById("locationInput");
    if (locationInput.value.trim()) {
      this.searchWeather();
    } else {
      this.getCurrentLocation();
    }
  }

  updateDateTime() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    const dateTimeString = now.toLocaleDateString("en-US", options);
    const dateTimeElement = document.getElementById("dateTime");
    if (dateTimeElement) {
      dateTimeElement.textContent = dateTimeString;
    }
  }

  checkTimeOfDay() {
    const hour = new Date().getHours();
    const body = document.body;

    if (hour >= 18 || hour < 6) {
      body.classList.add("night-mode");
    } else {
      body.classList.remove("night-mode");
    }
  }

  // Add smooth scrolling for forecast container
  initializeForecastScroll() {
    const forecastContainer = document.getElementById("forecastContainer");
    let isDown = false;
    let startX;
    let scrollLeft;

    forecastContainer.addEventListener("mousedown", (e) => {
      isDown = true;
      forecastContainer.style.cursor = "grabbing";
      startX = e.pageX - forecastContainer.offsetLeft;
      scrollLeft = forecastContainer.scrollLeft;
    });

    forecastContainer.addEventListener("mouseleave", () => {
      isDown = false;
      forecastContainer.style.cursor = "grab";
    });

    forecastContainer.addEventListener("mouseup", () => {
      isDown = false;
      forecastContainer.style.cursor = "grab";
    });

    forecastContainer.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - forecastContainer.offsetLeft;
      const walk = (x - startX) * 2;
      forecastContainer.scrollLeft = scrollLeft - walk;
    });
  }

  // Add particle effect for weather conditions
  createWeatherParticles(weatherCondition) {
    const particleContainer = document.createElement("div");
    particleContainer.className = "weather-particles";
    particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;

    document.body.appendChild(particleContainer);

    if (weatherCondition === "Rain") {
      this.createRainEffect(particleContainer);
    } else if (weatherCondition === "Snow") {
      this.createSnowEffect(particleContainer);
    }
  }

  createRainEffect(container) {
    for (let i = 0; i < 50; i++) {
      const drop = document.createElement("div");
      drop.style.cssText = `
                position: absolute;
                width: 2px;
                height: 20px;
                background: rgba(174, 194, 224, 0.6);
                left: ${Math.random() * 100}%;
                animation: rain 1s linear infinite;
                animation-delay: ${Math.random() * 1}s;
            `;
      container.appendChild(drop);
    }

    const rainKeyframes = `
            @keyframes rain {
                0% { transform: translateY(-100vh); }
                100% { transform: translateY(100vh); }
            }
        `;

    if (!document.getElementById("rain-styles")) {
      const style = document.createElement("style");
      style.id = "rain-styles";
      style.textContent = rainKeyframes;
      document.head.appendChild(style);
    }
  }

  createSnowEffect(container) {
    for (let i = 0; i < 30; i++) {
      const flake = document.createElement("div");
      flake.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                animation: snow 3s linear infinite;
                animation-delay: ${Math.random() * 3}s;
                opacity: 0.8;
            `;
      container.appendChild(flake);
    }

    const snowKeyframes = `
            @keyframes snow {
                0% { 
                    transform: translateY(-100vh) translateX(0px); 
                }
                100% { 
                    transform: translateY(100vh) translateX(100px); 
                }
            }
        `;

    if (!document.getElementById("snow-styles")) {
      const style = document.createElement("style");
      style.id = "snow-styles";
      style.textContent = snowKeyframes;
      document.head.appendChild(style);
    }
  }

  // Add temperature unit conversion
  toggleTemperatureUnit() {
    const tempElement = document.getElementById("temperature");
    const feelsLikeElement = document.getElementById("feelsLike");
    const unitElement = document.querySelector(".temp-unit");

    if (unitElement.textContent === "°C") {
      // Convert to Fahrenheit
      const celsius = parseInt(tempElement.textContent);
      const feelsLikeCelsius = parseInt(feelsLikeElement.textContent);

      tempElement.textContent = Math.round((celsius * 9) / 5 + 32);
      feelsLikeElement.textContent = Math.round(
        (feelsLikeCelsius * 9) / 5 + 32
      );
      unitElement.textContent = "°F";
    } else {
      // Convert to Celsius
      const fahrenheit = parseInt(tempElement.textContent);
      const feelsLikeFahrenheit = parseInt(feelsLikeElement.textContent);

      tempElement.textContent = Math.round(((fahrenheit - 32) * 5) / 9);
      feelsLikeElement.textContent = Math.round(
        ((feelsLikeFahrenheit - 32) * 5) / 9
      );
      unitElement.textContent = "°C";
    }
  }

  // Add voice search functionality
  initializeVoiceSearch() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      const voiceBtn = document.createElement("button");
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      voiceBtn.className = "voice-btn";
      voiceBtn.style.cssText = `
                background: linear-gradient(135deg, #667eea, #764ba2);
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                margin: 0 5px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.1rem;
            `;

      document.querySelector(".search-box").appendChild(voiceBtn);

      voiceBtn.addEventListener("click", () => {
        recognition.start();
        voiceBtn.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a52)";
      });

      recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("locationInput").value = transcript;
        this.searchWeather();
      });

      recognition.addEventListener("end", () => {
        voiceBtn.style.background = "linear-gradient(135deg, #667eea, #764ba2)";
      });
    }
  }
}

// Initialize the weather app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const weatherApp = new WeatherApp();

  // Add click event for temperature unit toggle
  document.addEventListener("click", (e) => {
    if (e.target.closest(".temp-unit")) {
      weatherApp.toggleTemperatureUnit();
    }
  });

  // Initialize additional features
  setTimeout(() => {
    weatherApp.initializeForecastScroll();
    weatherApp.initializeVoiceSearch();
  }, 1000);
});

// Add service worker for offline functionality (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "l":
        e.preventDefault();
        document.getElementById("locationInput").focus();
        break;
      case "r":
        e.preventDefault();
        if (document.getElementById("weatherCard").style.display !== "none") {
          location.reload();
        }
        break;
    }
  }
});