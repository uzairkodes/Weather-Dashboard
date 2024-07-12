let input = document.getElementById("input");
let button = document.getElementById("button");
let forecastContainer = document.getElementById("forecast");
let alertsElement = document.getElementById("alerts");
let units = "metric";
let celsiusBtn = document.getElementById("celsius-btn");
let fahrenheitBtn = document.getElementById("fahrenheit-btn");

const api_key = "f547c9653ef64e491261e8004b7f51cc";

function toFahrenheit(celsius) {
  return ((celsius * 9 / 5) + 32).toFixed(2); 
}

function toCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5 / 9).toFixed(2); 
}

function updateTemperature(data) {
  let tempElement = document.getElementById("temp");
  let highTempElement = document.getElementById("high-temp");
  let lowTempElement = document.getElementById("low-temp");

  let tempValue = data.main.temp;
  let highTempValue = data.main.temp_max;
  let lowTempValue = data.main.temp_min;

  if (units === "metric") {
    tempElement.innerHTML = `${(tempValue - 273.15).toFixed(2)}&deg;C`;
    highTempElement.innerHTML = `High ${(highTempValue - 273.15).toFixed(2)}&deg;C`;
    lowTempElement.innerHTML = `Low ${(lowTempValue - 273.15).toFixed(2)}&deg;C`;
  } else {
    tempElement.innerHTML = `${toFahrenheit(tempValue - 273.15)}&deg;F`;
    highTempElement.innerHTML = `High ${toFahrenheit(highTempValue - 273.15)}&deg;F`;
    lowTempElement.innerHTML = `Low ${toFahrenheit(lowTempValue - 273.15)}&deg;F`;
  }
}

function weatherDetail(name, lat, lon, country) {
    let forecast_api_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`;
    let weather_api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
  
    let days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    let months = [
      "January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"
    ];
  
    fetch(weather_api_url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let date = new Date();
        document.getElementById("location").innerHTML = `Forecast in <b>${name}, ${country}</b>`;
        document.getElementById("date-time").innerHTML = `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} at ${date.toLocaleTimeString()}`;
  
        updateTemperature(data);
  
        document.getElementById("description").innerHTML = data.weather[0].description;
        document.getElementById("feel-like").innerHTML = `Feels Like ${(data.main.feels_like - 273.15).toFixed(2)}&deg;C`;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  
        document.getElementById("visibility").innerHTML = `${(data.visibility / 1000).toFixed(2)} km`;
        document.getElementById("wind-speed").innerHTML = `${data.wind.speed} m/s`;
        document.getElementById("humidity").innerHTML = `${data.main.humidity}%`;
        document.getElementById("cloudiness").innerHTML = `${data.clouds.all}%`;
  
        let sunrise = new Date(data.sys.sunrise * 1000);
        let sunset = new Date(data.sys.sunset * 1000);
        document.getElementById("sunrise-time").innerHTML = sunrise.toLocaleTimeString();
        document.getElementById("sunset-time").innerHTML = sunset.toLocaleTimeString();
        
        let weatherDescription = data.weather[0].description.toLowerCase();
  
        if (weatherDescription.includes("rain") || weatherDescription.includes("storm")) {
          alertsElement.innerHTML = `Weather Alert:</strong> Heavy rain or storm expected.`;
        } else {
          alertsElement.innerHTML = "No weather alerts currently.";
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  
    fetch(forecast_api_url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        forecastContainer.innerHTML = "";
        for (let i = 0; i < data.list.length; i += 8) {
          let forecast = data.list[i];
          let forecastDate = new Date(forecast.dt * 1000);
          let day = days[forecastDate.getDay()];
          let temp = (forecast.main.temp - 273.15).toFixed(2);
          let minTemp = (forecast.main.temp_min - 273.15).toFixed(2);
          let icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
  
          let forecastCard = `
            <div class="card">
              <h6>${day}</h6>
              <img src="${icon}" alt="">
              <h6>${units === "metric" ? temp + "&deg;C" : toFahrenheit(temp) + "&deg;F"}</h6>
              <h6>${units === "metric" ? minTemp + "&deg;C" : toFahrenheit(minTemp) + "&deg;F"}</h6>
            </div>
          `;
  
          forecastContainer.innerHTML += forecastCard;
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
function cityName() {
  let cityName = input.value.trim();
  input.value = "";
  if (!cityName) return;
  let api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

  fetch(api_url)
    .then((res) => res.json())
    .then((data) => {
      let { name, lat, lon, country} = data[0];
      weatherDetail(name, lat, lon, country);
    })
    .catch(() => {
      alert("Failed to fetch city name");
    });
}

button.addEventListener("click", cityName);

function currentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      let api_url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${api_key}`;

      fetch(api_url)
        .then((res) => res.json())
        .then((data) => {
          let { name, lat, lon, country } = data[0];
          weatherDetail(name, lat, lon, country);
        })
        .catch(() => {
          alert("Failed to fetch data");
        });
    }, (error) => {
      alert(`Error: ${error.message}`);
    });
  }
}

currentLocation();

celsiusBtn.addEventListener("click", () => {
  if (units !== "metric") {
    units = "metric";
    cityName();
  }
});

fahrenheitBtn.addEventListener("click", () => {
  if (units !== "imperial") {
    units = "imperial";
    cityName(); 
  }
});