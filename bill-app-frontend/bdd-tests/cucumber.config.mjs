export default {
  default: {
    require: ['bdd-tests/step-definitions/**/*.js'],
    paths: ['bdd-tests/features/**/*.feature'],
    publishQuiet: true
  }
};
