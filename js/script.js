const API_KEY = "EJ6UBL2JEQGYB3AA4ENASN62J";

let isCelsius = true;
let mainTempC = 0;
let hourlyTempsC = [];
let weeklyData = [];

/* WEATHER ICONS */
const weatherMap = {
  "clear-day": "https://i.ibb.co/rb4rrJL/26.png",
  "partly-cloudy-day": "https://i.ibb.co/PZQXH8V/27.png",
  "partly-cloudy-night": "https://i.ibb.co/Kzkk59k/15.png",
  "rain": "https://i.ibb.co/kBd2NTS/39.png",
  "default": "https://i.ibb.co/rb4rrJL/26.png"
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
      hourlyTempsC = data.days[0].hours;
      weeklyData = data.days.slice(0, 7);

      document.getElementById("mainTemp").innerText = Math.round(mainTempC);
      document.getElementById("condition").innerText = data.currentConditions.conditions;
      document.getElementById("location").innerText = data.resolvedAddress;
      document.getElementById("dateTime").innerText = new Date().toLocaleString();
      document.getElementById("weatherIcon").src = weatherMap[data.currentConditions.icon] || weatherMap.default;

      document.getElementById("wind").innerText = data.currentConditions.windspeed;
      document.getElementById("humidity").innerText = data.currentConditions.humidity;
      document.getElementById("visibility").innerText = data.currentConditions.visibility;
      document.getElementById("sunrise").innerText = data.currentConditions.sunrise;

      updateHourly();
      updateWeekly();
    })
    .catch(() => alert("City not found"));
}

/* UPDATE HOURLY */
function updateHourly() {
  const hourlyDiv = document.getElementById("hourly");
  hourlyDiv.innerHTML = "";

  hourlyTempsC.forEach(h => {
    const temp = isCelsius ? h.temp : (h.temp * 9/5 + 32);
    hourlyDiv.innerHTML += `
      <div class="hour">
        <p>${h.datetime.slice(0,5)}</p>
        <img src="${weatherMap[h.icon] || weatherMap.default}">
        <p>${Math.round(temp)}°</p>
      </div>
    `;
  });
}

/* UPDATE WEEKLY */
function updateWeekly() {
  const weeklyDiv = document.getElementById("weekly");
  weeklyDiv.innerHTML = "";

  weeklyData.forEach(day => {
    const date = new Date(day.datetime);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const temp = isCelsius ? day.temp : (day.temp * 9/5 + 32);
    weeklyDiv.innerHTML += `
      <div class="day">
        <p>${weekday}</p>
        <img src="${weatherMap[day.icon] || weatherMap.default}">
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
  updateHourly();
  updateWeekly();
}

/* TAB TOGGLE */
document.getElementById("todayTab").onclick = () => {
  document.getElementById("todayTab").classList.add("active");
  document.getElementById("weekTab").classList.remove("active");
  document.getElementById("hourly").style.display = "grid";
  document.getElementById("weekly").style.display = "none";
};

document.getElementById("weekTab").onclick = () => {
  document.getElementById("weekTab").classList.add("active");
  document.getElementById("todayTab").classList.remove("active");
  document.getElementById("hourly").style.display = "none";
  document.getElementById("weekly").style.display = "grid";
};
