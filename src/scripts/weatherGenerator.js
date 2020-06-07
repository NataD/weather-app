export default class {
  constructor() {
    this.config = {};
    this.currentTemperature = 0;
  }

  getWeather(url, container, msgContainer) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        this.config = [...data.data];
        this.currentTemperature = data.data[0].temp;
        console.log('CONFIG in weather API', this.config);

        console.log('weather data', data);
        const icon = `https://www.weatherbit.io/static/img/icons/${
          data.data[0].weather.icon}.png`;

        const markup = `
          <div class="weather-details">
            <div class="temp-details">
              <div class="temp">
                ${Math.round(data.data[0].temp)}
              </div>
              <div class="temp-measures">
                <p><sup class="temp-unit">°C</sup></p>
                <div>
                  <img src=${icon} alt=${data.data[0].weather.description} class="temp-icon">
                  <p class="description">${data.data[0].weather.description}</p>
                </div>
              </div>
            </div>
            <div class="details">
              <div class="item">
                <p class="label" data-i18n="labels.feelsLike">Feels like</p>
                <p class="value">${data.data[0].app_temp}</p>
              </div>
              <div class="item">
                <p class="label" data-i18n="labels.clouds">Clouds</p>
                <p class="value">${data.data[0].clouds}</p>
              </div>
              <div class="item">
                <p class="label" data-i18n="labels.precipitation">Precipitation</p>
                <p class="value">${data.data[0].precip}</p>
              </div>
            </div>
            <div class="details">
              <div class="item">
                <p class="label" data-i18n="labels.wind">Wind</p>
                <p class="value">${data.data[0].wind_spd}</p>
              </div>
              <div class="item">
                <p class="label" data-i18n="labels.visibility">Visibility</p>
                <p class="value">${data.data[0].vis}</p>
              </div>
              <div class="item">
                <p class="label" data-i18n="labels.humidity">Humidity</p>
                <p class="value">${data.data[0].rh}</p>
              </div>
            </div>
          </div>
        `;
        container.innerHTML = markup;
      })
      .catch((error) => {
        console.log('ERROR IN getWeather', error);
        msgContainer.textContent = 'Something went wrong. Please try again later 😩';
      });
  }

  getForecast(url, container, msgContainer) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        container.innerHTML = '';

        data.data.forEach((item) => {
          const icon = `https://www.weatherbit.io/static/img/icons/${item.weather.icon}.png`;
          const forecastItem = document.createElement('div');
          forecastItem.classList.add('forecast-item');
          // toDo add language insteat od default
          const day = new Date(item.datetime).toLocaleString('default', { weekday: 'short', day: 'numeric', month: 'short' });
          const markup = `
            <p class="item-date">${day}</p>
            <div class="item-weather">
              <p class="item-temp">
                <span class="forecast-temp">${Math.round(item.temp)}</span><sup>°</sup>
              </p>
              <img class="item-icon" src=${icon} alt=${data.data[0].weather.description}>
            </div>
          `;
          forecastItem.innerHTML = markup;
          container.appendChild(forecastItem);
          return this;
        });
      })
      .catch((error) => {
        console.log('ERROR IN GET FORECAST', error);
        msgContainer.textContent = 'Something went wrong 😩';
      });
  }

  convertToF() {
    const fahrenheit = (this.currentTemperature * 9) / 5 + 32;
    return fahrenheit;
  }
}
