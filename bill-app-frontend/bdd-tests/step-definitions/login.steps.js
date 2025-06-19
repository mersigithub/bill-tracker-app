import { Given, When, Then } from '@cucumber/cucumber';

Given('I open the login page', async function () {
  // code to open login page
  console.log('Opening login page');
});

When('I enter {string} and {string}', async function (email, password) {
  // code to enter email and password
  console.log(`Entering email: ${email} and password: ${password}`);
});

When('I click the login button', async function () {
  // code to click login
  console.log('Clicking login button');
});

Then('I should see the dashboard', async function () {
  // code to check dashboard presence
  console.log('Checking dashboard');
});
