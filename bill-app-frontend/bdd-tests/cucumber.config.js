// bdd-tests/cucumber.config.js
import { defineConfig } from '@cucumber/cucumber';

export default defineConfig({
  default: {
    require: ['bdd-tests/step-definitions/**/*.js'],
    paths: ['bdd-tests/features/**/*.feature']
  }
});
