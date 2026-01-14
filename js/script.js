const API_KEY = "EJ6UBL2JEQGYB3AA4ENASN62J";

let isCelsius = true;
let mainTempC = 0;
let hourlyTempsC = [];
let weeklyData = [];

/* WEATHER ICONS & BACKGROUNDS */
const weatherMap = {
  "partly-cloudy-day": { icon: "https://i.ibb.co/PZQXH8V/27.png", bg: "https://i.ibb.co/qNv7NxZ/pc.webp" },
  "partly-cloudy-night": { icon: "https://i.ibb.co/Kzkk59k/15.png", bg: "https://i.ibb.co/RDfPqXz/pcn.jpg" },
  "rain": { icon: "https://i.ibb.co/kBd2NTS/39.png", bg: "https://i.ibb.co/h2p6Yhd/rain.webp" },
  "clear-day": { icon: "https://i.ibb.co/rb4rrJL/26.png", bg: "https://i.ibb.co/WGry01m/cd.jpg" },
  "clear-night": { icon: "https://i.ibb.co/1nxNGHL/10.png", bg: "https://i.ibb.co/kqtZ1Gx/cn.jpg" },
  "default": { icon: "https://i.ibb.co/rb4rrJL/26.png", bg: "https://i.ibb.co/qNv7NxZ/pc.webp" }
};

/* SEARCH - ENTER KEY */
document.getElementById("cityInput").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    let city = e.target.value.trim();
    if (!city) return alert("Please enter a city");
    fetchWeather(city);
  }
});

/* SEARCH - BUTTON CLICK */
document.getElementById("searchBtn").addEventListener("click", () => {
  let city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city");
  fetchWeather(city);
});

/* FETCH WEATHER */
function fetchWeather(city) {
  if (!city.includes(",")) city += ",IN";

  fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${API_KEY}&contentType=json`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.currentConditions) return alert("City not found");

      mainTempC = data.currentConditions.temp;
      hourlyTempsC = data.days[0].hours;
      weeklyData = data.days.slice(0, 7);

      // Main info
      document.getElementById("mainTemp").innerText = Math.round(mainTempC);
      document.getElementById("condition").innerText = data.currentConditions.conditions;
      document.getElementById("location").innerText = data.resolvedAddress;
      document.getElementById("dateTime").innerText = new Date().toLocaleString();

      // Set icon & background (with day/night detection)
      setWeatherUI(data.currentConditions.conditions, data);

      // Highlights
      document.getElementById("wind").innerText = data.currentConditions.windspeed || "--";
      document.getElementById("humidity").innerText = data.currentConditions.humidity || "--";
      document.getElementById("visibility").innerText = data.currentConditions.visibility || "--";
      document.getElementById("sunrise").innerText = `${data.days[0].sunrise} / ${data.days[0].sunset}`;
      document.getElementById("UVIndex").innerText = data.currentConditions.uvindex || "--";
      document.getElementById("AirQuality").innerText = data.currentConditions.feelslike || "--";

      updateHourly(data);
      updateWeekly(data);
    })
    .catch(err => {
      console.error(err);
      alert("City not found or API error");
    });
}

/* DETERMINE NIGHT OR DAY */
function isNight(currentEpoch, sunriseStr, sunsetStr, timezoneOffset) {
  const current = new Date(currentEpoch * 1000);

  // Adjust for timezone offset (hours)
  current.setHours(current.getUTCHours() + timezoneOffset);

  const [srH, srM] = sunriseStr.split(":").map(Number);
  const [ssH, ssM] = sunsetStr.split(":").map(Number);

  const sunrise = new Date(current);
  sunrise.setHours(srH, srM, 0, 0);

  const sunset = new Date(current);
  sunset.setHours(ssH, ssM, 0, 0);

  return current < sunrise || current > sunset;
}

/* MAP CONDITION TO ICON (WITH DAY/NIGHT) */
function mapCondition(cond, currentEpoch, sunriseStr, sunsetStr, timezoneOffset) {
  cond = cond.toLowerCase();
  const night = isNight(currentEpoch, sunriseStr, sunsetStr, timezoneOffset);

  if (cond.includes("partly cloudy")) return night ? "partly-cloudy-night" : "partly-cloudy-day";
  if (cond.includes("cloudy")) return night ? "partly-cloudy-night" : "partly-cloudy-day";
  if (cond.includes("rain") || cond.includes("drizzle")) return "rain";
  if (cond.includes("clear") || cond.includes("sunny")) return night ? "clear-night" : "clear-day";

  return "default";
}

/* SET ICON & BACKGROUND */
function setWeatherUI(condition, data) {
  const key = mapCondition(
    condition,
    data.currentConditions.datetimeEpoch,
    data.days[0].sunrise,
    data.days[0].sunset,
    data.timezone.offset
  );
  const weather = weatherMap[key] || weatherMap.default;
  document.getElementById("weatherIcon").src = weather.icon;
  document.body.style.backgroundImage = `url(${weather.bg})`;
}

/* UPDATE HOURLY */
function updateHourly(data) {
  const hourlyDiv = document.getElementById("hourly");
  hourlyDiv.innerHTML = "";

  hourlyTempsC.forEach(h => {
    const temp = isCelsius ? h.temp : (h.temp * 9/5 + 32);
    const iconKey = mapCondition(
      h.conditions,
      h.datetimeEpoch,
      data.days[0].sunrise,
      data.days[0].sunset,
      data.timezone.offset
    );
    hourlyDiv.innerHTML += `
      <div class="hour">
        <p>${h.datetime.slice(0,5)}</p>
        <img src="${weatherMap[iconKey]?.icon || weatherMap.default.icon}">
        <p>${Math.round(temp)}°</p>
      </div>
    `;
  });
}

/* UPDATE WEEKLY */
function updateWeekly(data) {
  const weeklyDiv = document.getElementById("weekly");
  weeklyDiv.innerHTML = "";

  weeklyData.forEach(day => {
    const date = new Date(day.datetime);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const temp = isCelsius ? day.temp : (day.temp * 9/5 + 32);
    const iconKey = mapCondition(
      day.conditions,
      day.datetimeEpoch,
      day.sunrise,
      day.sunset,
      data.timezone.offset
    );
    weeklyDiv.innerHTML += `
      <div class="day">
        <p>${weekday}</p>
        <img src="${weatherMap[iconKey]?.icon || weatherMap.default.icon}">
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
