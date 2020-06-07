export default class {
  constructor() {
    this.keys = [];
    this.url = '';
    this.defaultImg = './../src/images/night_sky.jpg';
    this.defaultKeys = ['city', 'weather'];
    this.getImage();
  }

  getKeys(config) {
    if (config.pod === 'd') {
      this.keys.push('day');
    }

    if (config.pod === 'n') {
      this.keys.push('night');
    }

    if (config.clouds >= 50) {
      this.keys.push('clouds');
    }

    if (config.clouds <= 50) {
      this.keys.push('sun');
    }

    if (config.snow > 0) {
      this.keys.push('snow');
    }

    if (config.precip > 0) {
      this.keys.push('rain');
    }
    // return this;
    return this.keys;
  }

  getImage(container) {
    let parameters;
    if (this.keys.length) {
      parameters = this.keys.join(',');
    } else {
      parameters = this.defaultKeys.join(',');
    }

    this.url = `https://source.unsplash.com/featured/1600x900/?${parameters}`;
    console.log('parameters in getImage()', parameters);
    fetch('https://source.unsplash.com/1600x900/?city,clouds')
    // fetch(`https://source.unsplash.com/featured/1600x900/?${parameters}`)
      .then((response) => {
        console.log('-=-=-=-=-=', response);
        console.log(response.url);
        if (container) {
          container.style.backgroundImage = `url(${response.url})`;
        }
        // response.json()
      })
      .then((data) => {
        console.log('DATA in fetch images', data);
        // testImgContainer.style.backgroundImage = "url('img_tree.png')";
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}
