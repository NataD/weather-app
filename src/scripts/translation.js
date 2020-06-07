class Translator {
  constructor() {
    // this.options = Object.assign({}, this.defaultConfig, options);
    this.options = { ...this.defaultConfig };
    this.elements = document.querySelectorAll('[data-i18n]');
    this.cache = new Map();

    if (
      this.options.defaultLanguage
      && typeof this.options.defaultLanguage === 'string'
    ) {
      this.getResource(this.options.defaultLanguage);
    }
  }

  detectLanguage() {
    if (!this.options.detectLanguage) {
      return this.options.defaultLanguage;
    }

    const stored = localStorage.getItem('language');

    if (this.options.persist && stored) {
      return stored;
    }

    const lang = navigator.languages
      ? navigator.languages[0]
      : navigator.language;

    return lang.substr(0, 2);
  }

  fetchPaths(path) {
    return fetch(path)
      .then((response) => response.json())
      .catch(() => {
        console.error(
          `Could not load ${path}. Please make sure that the file exists.`,
        );
      });
  }

  async getResource(lang) {
    if (this.cache.has(lang)) {
      return JSON.parse(this.cache.get(lang));
    }

    const translation = await this.fetchPaths(
      `${this.options.filesLocation}/${lang}.json`,
    );

    if (!this.cache.has(lang)) {
      this.cache.set(lang, JSON.stringify(translation));
    }

    return translation;
  }

  async load(lang) {
    if (!this.options.languages.includes(lang)) {
      return;
    }

    this.translate(await this.getResource(lang));

    document.documentElement.lang = lang;

    if (this.options.persist) {
      localStorage.setItem('language', lang);
    }
  }

  async getTranslationByKey(lang, key) {
    if (!key) throw new Error('Expected a key to translate, got nothing.');

    if (typeof key !== 'string') {
      throw new Error(
        `Expected a string for the key parameter, got ${typeof key} instead.`,
      );
    }

    const translation = await this.getResource(lang);

    return this.getValueFromJSON(key, translation, true);
  }

  getValueFromJSON(key, json, fallback) {
    let text = key.split('.').reduce((obj, i) => obj[i], json);

    if (!text && this.options.defaultLanguage && fallback) {
      const fallbackTranslation = JSON.parse(
        this.cache.get(this.options.defaultLanguage),
      );

      text = this.getValueFromJSON(key, fallbackTranslation, false);
    } else if (!text) {
      text = key;
      console.warn(`Could not find text for attribute '${key}'.`);
    }

    return text;
  }

  translate(translation) {
    const replace = (element) => {
      const key = element.getAttribute('data-i18n');
      const property = element.getAttribute('data-i18n-attr') || 'innerHTML';
      const text = this.getValueFromJSON(key, translation, true);

      if (text) {
        element[property] = text;
      } else {
        console.error(`Could not find text for attribute '${key}'.`);
      }
    };

    this.elements.forEach(replace);
  }

  get defaultConfig() {
    return {
      persist: false,
      languages: ['en', 'ua'],
      defaultLanguage: '',
      detectLanguage: true,
      filesLocation: './assets/i18n',
    };
  }
}

export default Translator;
