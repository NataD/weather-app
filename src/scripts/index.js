import Translator from './translation.js';
import ImageGenerator from './imageGenerator.js';
import WeatherGenerator from './weatherGenerator.js';

window.onload = () => {
  const apiKey = 'd8c520bfeb8d48c9bbe43303fc1e3e92';
  const openCageApiKey = '059f7622609c40dbb2eb03ea4d95d840';
  const input = document.querySelector('.search-input');
  const list = document.querySelector('.current-weather');
  const msg = document.querySelector('.msg');
  const cityOptionsList = document.querySelector('.city-options');
  const forecastList = document.querySelector('.forecast-list');
  const form = document.querySelector('.search-form');
  const btnSearch = document.querySelector('.btn-search');
  const btnClose = document.querySelector('.btn-close');
  const btnChangeImg = document.querySelector('.btn-change-image');
  const locationErrorContainer = document.querySelector('.location-disabled-content');
  const cityName = document.querySelector('.weather-city');
  const btnShowMap = document.querySelector('.btn-show-map');
  const btnMenu = document.querySelector('.btn-menu');
  const dateContainer = document.querySelector('.date');
  const loaderContainer = document.querySelector('.loader-container');
  const weatherContentContainer = document.querySelector('.weather-content');
  const imageGenerator = new ImageGenerator();
  const weatherGenerator = new WeatherGenerator();
  const translator = new Translator();

  function setDateTime() {
    const lang = localStorage.getItem('language') === 'en' ? 'en-GB' : 'uk-UA';
    const date = new Date().toLocaleString(lang, { weekday: 'short', day: 'numeric', month: 'short' });
    const time = new Date().toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    dateContainer.innerHTML = `${date} | ${time}`;
  }

  function clearSideMenu() {
    btnMenu.classList.remove('open');
    document.querySelector('.sidebar').classList.remove('opened');
    document.querySelector('.main').classList.remove('minimized');
    input.value = '';
    cityOptionsList.innerHTML = '';
    btnSearch.classList.remove('active');
    btnClose.classList.remove('visible');
  }

  function translateWeatherLabels(lang) {
    const feelsLikeLabel = lang === 'en' ? 'Feels like' : 'Відчувається як';
    const cloudsLabel = lang === 'en' ? 'Clouds' : 'Хмарність';
    const precipLabel = lang === 'en' ? 'Precipitation' : 'Опади';
    const windLabel = lang === 'en' ? 'Wind' : 'Вітер';
    const visibilityLabel = lang === 'en' ? 'Visibility' : 'Видимість';
    const humidityLabel = lang === 'en' ? 'Humidity' : 'Вологість';
    document.querySelector('.label-app-temp').innerHTML = feelsLikeLabel;
    document.querySelector('.label-clouds').innerHTML = cloudsLabel;
    document.querySelector('.label-precip').innerHTML = precipLabel;
    document.querySelector('.label-wind').innerHTML = windLabel;
    document.querySelector('.label-visibility').innerHTML = visibilityLabel;
    document.querySelector('.label-humidity').innerHTML = humidityLabel;
  }

  function setLanguage(language) {
    localStorage.setItem('language', language);
  }

  function getLanguage() {
    let language = 'en';
    if (!localStorage.getItem('language')) {
      setLanguage(language);
      document.getElementById('en').checked = true;
      document.getElementById('ua').checked = false;
    } else {
      language = localStorage.getItem('language');

      if (language === 'en') {
        document.getElementById('en').checked = true;
        document.getElementById('ua').checked = false;
      }
      if (language === 'ua') {
        document.getElementById('en').checked = false;
        document.getElementById('ua').checked = true;
      }
    }
    return language;
  }

  function getCityName(location) {
    const lang = getLanguage() === 'ua' ? 'uk' : 'en';
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lng}&localityLanguage=${lang}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const city = data.city.length ? data.city : data.localityInfo.administrative[2].name;
        cityName.innerHTML = `${city}, ${data.countryName}`;
      })
      .catch(() => {
        msg.textContent = 'Please search for a valid city 😩';
      });
  }

  setDateTime();
  setInterval(setDateTime, 1000 * 60);

  document.querySelector('.btn-close-sm').addEventListener('click', () => {
    btnMenu.classList.toggle('open');
    document.querySelector('.sidebar').classList.toggle('opened');
    document.querySelector('.main').classList.toggle('minimized');
  }, false);

  function setWeatherUnit(unit) {
    localStorage.setItem('unit', unit);
  }

  function getWeatherUnit() {
    let unit = 'c';
    if (!localStorage.getItem('unit')) {
      setWeatherUnit(unit);
      document.getElementById('celsius').checked = true;
      document.getElementById('fahrenheit').checked = false;
    } else {
      unit = localStorage.getItem('unit');

      if (unit === 'c') {
        document.getElementById('celsius').checked = true;
        document.getElementById('fahrenheit').checked = false;
      }
      if (unit === 'f') {
        document.getElementById('celsius').checked = false;
        document.getElementById('fahrenheit').checked = true;
      }
    }
    return unit;
  }

  getWeatherUnit();

  function switchLanguage(language) {
    setLanguage(language);
    translator.load(language);
    translateWeatherLabels(language);
  }

  const currentLanguage = getLanguage();
  translator.load(currentLanguage);

  function switchToCUnits() {
    if (localStorage.getItem('unit') === 'c') {
      return;
    }

    const currentTempContainer = document.querySelector('.temp');
    const tempUnit = document.querySelector('.temp-unit');
    const forecastTemp = document.querySelectorAll('.forecast-temp');
    const cTemp = currentTempContainer.innerHTML;
    currentTempContainer.innerHTML = `${Math.round((5 / 9) * (cTemp - 32))}`;
    Array.from(forecastTemp).map((el) => {
      const fTemp = el.innerHTML;
      el.innerHTML = `${Math.round((5 / 9) * (fTemp - 32))}`;
      return el.innerHTML;
    });
    tempUnit.innerHTML = '°C';
    setWeatherUnit('c');
  }

  function switchToFUnits() {
    if (localStorage.getItem('unit') === 'f') {
      return;
    }

    const currentTempContainer = document.querySelector('.temp');
    const tempUnit = document.querySelector('.temp-unit');
    const forecastTemp = document.querySelectorAll('.forecast-temp');
    const temp = currentTempContainer.innerHTML;
    currentTempContainer.innerHTML = `${Math.round((temp * 9) / 5 + 32)}`;
    Array.from(forecastTemp).map((el) => {
      const fTemp = el.innerHTML;
      el.innerHTML = `${Math.round((fTemp * 9) / 5 + 32)}`;
      return el.innerHTML;
    });
    tempUnit.innerHTML = '°F';
    setWeatherUnit('f');
  }

  function getCityWeather(geolocation) {
    const lang = getLanguage() === 'ua' ? 'uk' : 'en';
    const unit = getWeatherUnit() === 'f' ? 'I' : 'M';
    const url = `https://api.weatherbit.io/v2.0/current?lat=${geolocation.lat}&lon=${geolocation.lng}&key=${apiKey}&units=${unit}&lang=${lang}`;
    const forecastUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${geolocation.lat}&lon=${geolocation.lng}&units=${unit}&lang=${lang}&days=3&key=${apiKey}`;

    weatherGenerator.getWeather(url, list, msg, loaderContainer);
    weatherGenerator.getForecast(forecastUrl, forecastList, msg);
    imageGenerator.getKeys(weatherGenerator.config[0]);
  }

  function getCity(url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const cities = data.results;
        const array = cities.map((item) => item);

        let filtered = [];
        filtered = array.reduce((el, item) => {
          if (!el.some((filtItem) => filtItem.components.state_code === item.components.state_code
            && filtItem.components.country_code === item.components.country_code)) {
            el.push(item);
          }
          return el;
        }, []);

        if (filtered.length === 1) {
          const geolocation = filtered[0].geometry;
          getCityWeather(geolocation);
          getCityName(geolocation);
          clearSideMenu();
        } else if (!filtered.length) {
          msg.textContent = 'Please search for a valid city 😩';
        } else {
          filtered.forEach((item) => {
            const li = document.createElement('li');
            li.classList.add('option');
            const markup = `
              <h2>
                ${item.formatted}
              </h2>
            `;
            li.addEventListener('click', () => {
              clearSideMenu();
              getCityWeather(item.geometry);
              getCityName(item.geometry);
            }, false);
            li.innerHTML = markup;
            cityOptionsList.appendChild(li);
          });
        }
      })
      .catch(() => {
        msg.textContent = 'Please search for a valid city 😩';
      });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputVal = input.value;
    console.log('val', inputVal);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${inputVal}&key=${openCageApiKey}`;
    getCity(url);
  });

  input.addEventListener('input', () => {
    if (input.value.length) {
      btnSearch.classList.add('active');
      btnClose.classList.add('visible');
    } else {
      btnSearch.classList.remove('active');
      btnClose.classList.remove('visible');
    }
  });


  btnClose.addEventListener('click', () => {
    input.value = '';
    btnSearch.classList.remove('active');
    btnClose.classList.remove('visible');
    cityOptionsList.innerHTML = '';
  }, false);


  btnChangeImg.addEventListener('click', () => {
    imageGenerator.getImage(document.querySelector('.main'));
  }, false);

  const radios = document.forms['temperature-form'].elements['temperature'];
  for (var i = 0, max = radios.length; i < max; i += 1) {
    radios[i].addEventListener('click', function () {
      if (this.value === 'celsius') {
        switchToCUnits();
      }
      if (this.value === 'fahrenheit') {
        switchToFUnits();
      }
    }, false);
  }

  const languageRadios = document.forms['language-form'].elements['language'];
  for (var i = 0, max = languageRadios.length; i < max; i += 1) {
    languageRadios[i].addEventListener('click', function () {
      if (this.value === 'en') {
        switchLanguage('en');
      }
      if (this.value === 'ua') {
        switchLanguage('ua');
      }
    }, false);
  }

  btnShowMap.addEventListener('click', () => {
    document.querySelector('#mapid').classList.toggle('shown');

    if (!localStorage.getItem('language')) {
      btnShowMap.innerHTML = btnShowMap.innerHTML === 'Show map' ? 'Hide map' : 'Show map';
    } else {
      let language = localStorage.getItem('language');
      if (language === 'ua') {
        btnShowMap.innerHTML = btnShowMap.innerHTML === 'Показати на карті' ? 'Сховати карту' : 'Показати на карті';
      }
      if (language === 'en') {
        btnShowMap.innerHTML = btnShowMap.innerHTML === 'Show map' ? 'Hide map' : 'Show map';
      }
    }
  }, false);

  btnMenu.addEventListener('click', () => {
    btnMenu.classList.toggle('open');
    document.querySelector('.sidebar').classList.toggle('opened');
    document.querySelector('.main').classList.toggle('minimized');
  }, false);

  // initialize Leaflet
  let map = L.map('mapid').setView([0, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);
  L.control.scale().addTo(map);
  // L.marker({lon: 52.237049, lat: 21.017532}).bindPopup('The center of the world').addTo(map);
  const coordinatesContainer = document.querySelector('.coordinates-details');
  function getUserLocation(position) {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    map.setZoom(9);
    map.panTo(new L.LatLng(pos.lat, pos.lng));
    // get city name
    getCityName(pos);
    const coordinatesMarkup = `
      <span class="coordinates">Latitude: ${pos.lat}</span>
      <span class="separator">|</span>
      <span class="coordinates">Longitude: ${pos.lng}</span>
    `;
    coordinatesContainer.innerHTML = coordinatesMarkup;
    getCityWeather(pos);
  }

  function getLocationError() {
    locationErrorContainer.style.display = 'block';
    loaderContainer.style.display = 'none';
    weatherContentContainer.style.display = 'none';
    // renderMap(0, 0);
  }

  function initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getUserLocation, getLocationError);
      console.log('geolocation', navigator.geolocation);
      locationErrorContainer.style.display = 'none';
      weatherContentContainer.style.display = 'block';
    } else {
    // Browser doesn't support Geolocation
      locationErrorContainer.style.display = 'block';
      loaderContainer.style.display = 'none';
      console.log('location error');
    }
  }

  initMap();

  // function renderMap(lat, lng) {
  //   var map = L.map('mapid').setView([lat, lng], 2);
  //   // add the OpenStreetMap tiles
  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     maxZoom: 19,
  //     attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  //   }).addTo(map);
  //
  //   // show the scale bar on the lower left corner
  //   L.control.scale().addTo(map);
  //  // show a marker on the map
  //  // L.marker({lon: 52.237049, lat: 21.017532}).bindPopup('The center of the world').addTo(map);
  // }

  function getVoiceCommand() {
    if ('SpeechRecognition' || webkitSpeechRecognition) {
      var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
      var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
      // var recognition = new window.webkitSpeechRecognition();
      const recognition = new SpeechRecognition();
      // This will run when the speech recognition service returns a result
      recognition.onstart = function () {
        console.log('Voice recognition started. Try speaking into the microphone.');
      };

      recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        getCity(`https://api.opencagedata.com/geocode/v1/json?q=${transcript}&key=059f7622609c40dbb2eb03ea4d95d840`);
      };

      recognition.onnomatch = function () {
        console.log('I didnt recognize the word');
      };
      recognition.start();
      recognition.addEventListener('end', recognition.start);
    } else {
      console.log('Speech recognition not supported 😢');
    }
  }

  const voiceRecognitionBtn = document.querySelector('.voice-recognition');
  voiceRecognitionBtn.addEventListener('click', () => {
    getVoiceCommand();
  }, false);

  msg.textContent = '';
  form.reset();
  // input.focus();
};
