const API_KEY = "EJ6UBL2JEQGYB3AA4ENASN62J";

let isCelsius = true;
let mainTempC = 0;
let hourlyTempsC = [];

/* WEATHER MAP */
const weatherMap = {
  "partly-cloudy-day": {
    icon: "https://i.ibb.co/PZQXH8V/27.png",
    bg: "https://i.ibb.co/qNv7NxZ/pc.webp"
  },
  "partly-cloudy-night": {
    icon: "https://i.ibb.co/Kzkk59k/15.png",
    bg: "https://i.ibb.co/RDfPqXz/pcn.jpg"
  },
  "rain": {
    icon: "https://i.ibb.co/kBd2NTS/39.png",
    bg: "https://i.ibb.co/h2p6Yhd/rain.webp"
  },
  "clear-day": {
    icon: "https://i.ibb.co/rb4rrJL/26.png",
    bg: "https://i.ibb.co/WGry01m/cd.jpg"
  },
  "clear-night": {
    icon: "https://i.ibb.co/1nxNGHL/10.png",
    bg: "https://i.ibb.co/kqtZ1Gx/cn.jpg"
  },
  "default": {
    icon: "https://i.ibb.co/rb4rrJL/26.png",
    bg: "https://i.ibb.co/qNv7NxZ/pc.webp"
  }
};

/* SEARCH */
document.getElementById("cityInput").addEventListener("keypress", e => {
  if (e.key === "Enter") fetchWeather(e.target.value);
});

/* FETCH WEATHER */
function fetchWeather(city) {
  fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${API_KEY}&contentType=json`)
    .then(res => res.json())
    .then(data => {

      mainTempC = data.currentConditions.temp;
      hourlyTempsC = data.days[0].hours.map(h => h.temp);

      document.getElementById("condition").innerText = data.currentConditions.conditions;
      document.getElementById("location").innerText = data.resolvedAddress;
      document.getElementById("humidity").innerText = data.currentConditions.humidity;
      document.getElementById("wind").innerText = data.currentConditions.windspeed;
      document.getElementById("visibility").innerText = data.currentConditions.visibility;
      document.getElementById("sunrise").innerText = data.currentConditions.sunrise;
      document.getElementById("dateTime").innerText = new Date().toLocaleString();

      setWeatherUI(data.currentConditions.icon);
      updateMainTemp();
      updateHourly();
    })
    .catch(() => alert("City not found"));
}

/* UI UPDATE */
function setWeatherUI(condition) {
  const weather = weatherMap[condition] || weatherMap.default;
  document.getElementById("weatherIcon").src = weather.icon;
  document.body.style.backgroundImage = `url(${weather.bg})`;
}

function updateMainTemp() {
  const temp = isCelsius ? mainTempC : (mainTempC * 9/5 + 32);
  document.getElementById("mainTemp").innerText = Math.round(temp);
}

function updateHourly() {
  const hourlyDiv = document.getElementById("hourly");
  hourlyDiv.innerHTML = "";

  hourlyTempsC.slice(0, 12).forEach((t, i) => {
    const temp = isCelsius ? t : (t * 9/5 + 32);

    hourlyDiv.innerHTML += `
      <div class="hour">
        <p>${i}:00</p>
        <img src="https://i.ibb.co/rb4rrJL/26.png">
        <p>${Math.round(temp)}°</p>
      </div>
    `;
  });
}

/* DEGREE TOGGLE */
document.getElementById("cBtn").onclick = () => toggleUnit(true);
document.getElementById("fBtn").onclick = () => toggleUnit(false);

function toggleUnit(celsius) {
  isCelsius = celsius;
  document.getElementById("cBtn").classList.toggle("active", celsius);
  document.getElementById("fBtn").classList.toggle("active", !celsius);
  updateMainTemp();
  updateHourly();
}
