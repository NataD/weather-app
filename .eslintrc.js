module.exports = {
  "extends": ["airbnb-base"],
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  },
  "rules" : {
    "import/extensions": 0,
    "no-param-reassign": [2, {"props": false}],
    "class-methods-use-this": "warn",
    "no-undef": "warn",
    "vars-on-top": "warn",
    "no-var": "warn",
    "dot-notation": "warn",
    "block-scoped-var": "warn",
    "prefer-const": "warn",
    "prefer-destructuring": "warn",
    "no-redeclare": "warn",
    "no-shadow": "warn"
  }
}
