import Translator from './translation.js';
import ImageGenerator from './imageGenerator.js';
import WeatherGenerator from './weatherGenerator.js';

window.onload = () => {
  console.log('Hello world');

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

  const imageGenerator = new ImageGenerator();
  const weatherGenerator = new WeatherGenerator();
  const translator = new Translator();

  // translations
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

  function switchLanguage(language) {
    setLanguage(language);
    translator.load(language);
  }

  const currentLanguage = getLanguage();
  translator.load(currentLanguage);

  function switchToCUnits() {
    const currentTempContainer = document.querySelector('.temp');
    const tempUnit = document.querySelector('.temp-unit');
    const forecastTemp = document.querySelectorAll('.forecast-temp');
    currentTempContainer.innerHTML = `${Math.round(weatherGenerator.currentTemperature)}`;
    Array.from(forecastTemp).map((el) => {
      const fTemp = el.innerHTML;
      return el.innerHTML = `${Math.round((5/9) * (el.innerHTML - 32))}`;
    });
    tempUnit.innerHTML = '°C';
  }

  function switchToFUnits() {
    const currentTempContainer = document.querySelector('.temp');
    const tempUnit = document.querySelector('.temp-unit');
    const forecastTemp = document.querySelectorAll('.forecast-temp');
    const temp = weatherGenerator.convertToF();
    currentTempContainer.innerHTML = `${Math.round(temp)}`;
    console.log(forecastTemp);
    Array.from(forecastTemp).map((el) => {
      const fTemp = el.innerHTML;
      return el.innerHTML = `${Math.round((el.innerHTML * 9) / 5 + 32)}`;
    });
    tempUnit.innerHTML = '°F';
  }

  function getCityWeather(geolocation) {
    const url = `https://api.weatherbit.io/v2.0/current?lat=${geolocation.lat}&lon=${geolocation.lng}&key=${apiKey}&units=[M, I]`;
    const forecastUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${geolocation.lat}&lon=${geolocation.lng}&days=3&key=${apiKey}`;

    weatherGenerator.getWeather(url, list, msg);
    weatherGenerator.getForecast(forecastUrl, forecastList, msg);
  };

  function getCity(url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const cities = data.results;
        const array = cities.map((item) => item);

        let filtered = [];
        filtered = array.reduce((el, item) => {
          if (!el.some((filtItem) => filtItem.components.country_code === item.components.country_code
            && filtItem.components.state_code === item.components.state_code)) {
            el.push(item);
          }
          return el;
        }, []);

        if (filtered.length === 1) {
          const geolocation = filtered[0].geometry;
          getCityWeather(geolocation);
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
            li.addEventListener('click', function() {
              getCityWeather(item.geometry);
            }, false);
            li.innerHTML = markup;
            cityOptionsList.appendChild(li);
          });
        }
      })
      .catch((error) => {
        msg.textContent = "Please search for a valid city 😩";
      });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputVal = input.value;
    console.log('val', inputVal);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${inputVal}&key=${openCageApiKey}`;
    getCity(url);
  });

  input.addEventListener('input', function() {
    if (input.value.length) {
      btnSearch.classList.add('active');
      btnClose.classList.add('visible');
    } else {
        btnSearch.classList.remove('active');
        btnClose.classList.remove('visible');
    }
  });


  btnClose.addEventListener('click', function() {
    input.value = '';
    btnSearch.classList.remove('active');
    btnClose.classList.remove('visible');
    cityOptionsList.innerHTML = '';
  }, false);


  btnChangeImg.addEventListener('click', function() {
    imageGenerator.getImage(document.querySelector('.main'));
  }, false);

  let radios = document.forms["temperature-form"].elements["temperature"];
  for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].addEventListener('click', function() {
      if (this.value === 'celsius') {
        switchToCUnits();
      }
      if (this.value === 'fahrenheit') {
        switchToFUnits();
      }
    }, false);
  }

  let languageRadios = document.forms["language-form"].elements["language"];
  for(var i = 0, max = languageRadios.length; i < max; i++) {
    languageRadios[i].addEventListener('click', function() {
      if (this.value === 'en') {
        switchLanguage('en');
      }
      if (this.value === 'ua') {
        switchLanguage('ua');
      }
    }, false);
  }

  btnShowMap.addEventListener('click', function() {
    document.querySelector('#mapid').classList.toggle('shown');
    btnShowMap.innerHTML = btnShowMap.innerHTML === 'Show map' ? `Hide map` : `Show map`;
  }, false);

  btnMenu.addEventListener('click', function() {
    btnMenu.classList.toggle('open');
    document.querySelector('.sidebar').classList.toggle('opened');
    document.querySelector('.main').classList.toggle('minimized');
  }, false);

  // initialize Leaflet
  // var map = L.map('mapid').setView([52.237049, 21.017532], 8);
  let map = L.map('mapid').setView([0, 0], 2);
  // add the OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
   maxZoom: 19,
   attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  }).addTo(map);
  // show the scale bar on the lower left corner
  L.control.scale().addTo(map);
  // show a marker on the map
  // L.marker({lon: 52.237049, lat: 21.017532}).bindPopup('The center of the world').addTo(map);
  const coordinatesContainer = document.querySelector(".coordinates-details");
  initMap();

  function initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getUserLocation, getLocationError);
      console.log('geolocation', navigator.geolocation);
      locationErrorContainer.style.display = 'none';
    } else {
    // Browser doesn't support Geolocation
    //  handleLocationError(false, infoWindow, map.getCenter());
      locationErrorContainer.style.display = 'block';
      console.log('location error');
    }
  };

  function renderMap(lat, lng) {
    var map = L.map('mapid').setView([lat, lng], 2);
    // add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);

    // show the scale bar on the lower left corner
    L.control.scale().addTo(map);
    // show a marker on the map
    // L.marker({lon: 52.237049, lat: 21.017532}).bindPopup('The center of the world').addTo(map);
  };

  function getUserLocation(position) {
    console.log('position', position);
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    console.log('opopopopop', pos);
    map.setZoom(9);
    map.panTo(new L.LatLng(pos.lat, pos.lng));
    // get city name
    const lang = getLanguage() === 'ua' ? 'uk' : 'en';
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.lat}&longitude=${pos.lng}&localityLanguage=${lang}`;
    const locationDetails = getCityName(url);
    const coordinatesMarkup = `
      <span class="coordinates">Latitude: ${pos.lat}</span>
      <span class="coordinates">Longitude: ${pos.lng}</span>
    `;

    const latitude = document.createElement('span');
    latitude.classList.add("coordinates");
    latitude.innerHTML = `Latitude: ${pos.lat}`;
    const longitude = document.createElement('span');
    longitude.classList.add('coordinates');
    longitude.innerHTML = `Longitude: ${pos.lng}`;
    // coordinatesContainer.innerHtml = coordinatesMarkup;
    coordinatesContainer.appendChild(latitude);
    coordinatesContainer.appendChild(longitude);

    const weatherPosition = pos;
    Object.keys(weatherPosition).forEach(function (key) {
      return weatherPosition[key] = weatherPosition[key].toFixed(2)
    });
    console.log('edited position', weatherPosition);
    getCityWeather(weatherPosition);
  };

  function getLocationError(error) {
    //  handleLocationError(true, infoWindow, map.getCenter());
    console.log('location error', error);
    locationErrorContainer.style.display = 'block';
    //  renderMap(0, 0);
  }

  function getCityName(url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        //  return data;
        cityName.innerHTML = `${data.city}, ${data.countryName}`;
      })
      .catch(() => {
        msg.textContent = 'Please search for a valid city 😩';
      });
  }

  function getVoiceCommand() {
    if ('SpeechRecognition' || webkitSpeechRecognition) {
      console.log('Speech recognition supported 😊');
      const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      // const SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
      // const SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
      // var recognition = new window.webkitSpeechRecognition();
      const recognition = new SpeechRecognition();
      // This will run when the speech recognition service returns a result
      recognition.onstart = function () {
        console.log('Voice recognition started. Try speaking into the microphone.');
      };

      recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        console.log(event.results);
        const city = transcript.split(' ').slice(2).join(' ');
        console.log('CITY in voice recognition', city);
        // getCity(city);
        console.log(transcript);
        input.value = transcript;
        getCity(`https://api.opencagedata.com/geocode/v1/json?q=${transcript}&key=059f7622609c40dbb2eb03ea4d95d840`);
      };

      recognition.onnomatch = function () {
        console.log('I didnt recognize the word');
      };
      // start recognition
      recognition.start();
      recognition.addEventListener('end', recognition.start);
      // code to handle recognition here
    } else {
      console.log('Speech recognition not supported 😢');
      // code to handle error
    }
  }

  const voiceRecognitionBtn = document.querySelector('.voice-recognition');
  voiceRecognitionBtn.addEventListener('click', function () {
    getVoiceCommand();
  }, false);

  msg.textContent = '';
  form.reset();
  // input.focus();
};
