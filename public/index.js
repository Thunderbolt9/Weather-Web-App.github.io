// Variables for current data
const loc = document.getElementById("location");
const temp = document.getElementById("temp");
const day = document.getElementById("day");
const desc = document.getElementById("description");
const windSpeed = document.getElementById("windSpeed");
const cloudPercent = document.getElementById("cloudPercent");
const visibility = document.getElementById("visibility");
const humidity = document.getElementById("humidity");


// Variables for chart
let hourlyPop = [];
let timePop = [];


// Getting Location of user
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(getWeatherData);

} else {
  alert("Can't access the location, Please turn on GPS")
}



async function getWeatherData(position) {
  const lat = position.coords.latitude;
  const long = position.coords.longitude;
  const location = { lat, long };

  const options = {
    method: "POST",
    body: JSON.stringify(location),
    headers: {
      "Content-Type": "application/json",
      'Accept': 'application/json'
    }
  };

  // Client request for weather data to server
  const response = await fetch('/', options);
  const result = await response.json();

  showWeather(result);
};

function dateTime(unix_timestamp) {
  var date = new Date(unix_timestamp * 1000);

  // Get day
  var d = date.getDay();

  // Hours part from the timestamp to IST
  var h = date.getHours() + 5;

  // Minutes part from the timestamp
  var m = date.getMinutes() + 30;

  // Will display time in 10:30:23 format
  var _time = (h > 12) ? (h - 12 + ':' + m + ' PM') : (h + ':' + m + ' AM');

  return [_time, d];
}



function getWeatherIcon(icon, eachDayImg) {
  const thunderstorm = ["11d", "11n"];
  const rain = ["10d", "09d", "10n", "09n"];
  const snow = ["13d", "13n"];
  const haze = ["50d", "50n"];
  const sun = ["01d", "01n"];
  const clouds = ["02d", "02n", "03d", "03n", "04d", "04n", "04d", "04n"];
  if (clouds.includes(icon)) {
    eachDayImg.src = "weatherIcons/cloud.svg";
    document.body.style.backgroundColor = "#75D6FF";

  } else if (sun.includes(icon)) {
    eachDayImg.src = "weatherIcons/sun.svg";
    document.body.style.backgroundColor = "#FFAC33";

  } else if (haze.includes(icon)) {
    eachDayImg.src = "weatherIcons/haze.svg";
    document.body.style.backgroundColor = "#545454";

  } else if (rain.includes(icon)) {
    eachDayImg.src = "weatherIcons/rain.svg";
    document.body.style.backgroundColor = "#6E62ED";

  } else if (snow.includes(icon)) {
    eachDayImg.src = "weatherIcons/snow.svg";
    document.body.style.backgroundColor = "#AFE3FF";

  } else if (thunderstorm.includes(icon)) {
    eachDayImg.src = "weatherIcons/thunder.svg";
    document.body.style.backgroundColor = "#E4EAEE";

  } else {
    eachDayImg.src = "#";
  }
}




function showWeather(result) {

  //Set background and mainImg
  const mainImg = document.getElementById("mainImg");
  getWeatherIcon(result.data.current.weather[0].icon, mainImg);

  // Set temperature
  const tempCalc = Math.round(result.data.current.temp);
  temp.innerHTML = `${tempCalc}°<sup>c</sup>`;

  // Set day and date
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dtResult = dateTime(result.data.current.dt);
  const dayinfo = weekdays[dtResult[1]];
  day.innerHTML = `${dayinfo},<a class="styleTime"> ${dtResult[0].replace('PM', '')}</a>`;

  // Set Descriptions
  desc.innerText = result.data.current.weather[0].main;
  cloudPercent.innerText = result.data.current.clouds + '%';
  visibility.innerText = result.data.current.visibility / 1000 + 'Km';
  windSpeed.innerText = result.data.current.wind_speed + 'm/s';
  humidity.innerText = result.data.current.humidity + '%';

  // Set 7 day forecast
  for (var i = 0; i < 7; i++) {
    document.getElementById("temp" + (i + 1)).innerText = Math.round(result.data.daily[i].temp.max) + '°';

    let forecastDays = dateTime(result.data.daily[i].dt);
    forecastDays = weekdays[forecastDays[1]];
    document.getElementById("day" + (i + 1)).innerText = forecastDays.substring(0, 3);
  }

  // Setting Weather Icons of each day
  for (var i = 0; i < 7; i++) {
    const eachDayImg = document.getElementById("img" + (i + 1));
    getWeatherIcon(result.data.daily[i].weather[0].icon, eachDayImg);
  }

  for (var i = 0; i < 12; i++) {
    hourlyPop[i] = result.data.hourly[i].pop * 100;
    timePop[i] = dateTime(result.data.hourly[i].dt)[0];
  }

  createChart(hourlyPop, timePop);
}



// Creating Chart
function createChart(hourlyPop) {
  var ctx = document.getElementById('myChart').getContext("2d");
  var gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
  gradientFill.addColorStop(0, "rgba(0, 133, 255, 1)");
  gradientFill.addColorStop(1, "rgba(0, 194, 255, 0.42)");
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timePop,
      datasets: [{
        label: "Precipitation %",
        fill: true,
        backgroundColor: gradientFill,
        borderColor: 'rgba(0, 133, 255, 1)',
        borderWidth: 2,
        data: hourlyPop
      }]
    },
    options: {
      animation: {
        easing: "easeInOutBack"
      },
      legend: {
        position: "bottom"
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: "rgba(0,0,0,0.5)",
            fontStyle: "bold",
            beginAtZero: true,
            maxTicksLimit: 5,
            padding: 20
          },
          gridLines: {
            drawTicks: false,
            display: false
          }

        }],
        xAxes: [{
          gridLines: {
            zeroLineColor: "transparent"
          },
          ticks: {
            padding: 20,
            fontColor: "rgba(0,0,0,0.5)",
            fontStyle: "bold"
          }
        }]
      }
    }
  });
}
