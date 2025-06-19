const { Builder, By, until } = require('selenium-webdriver');

async function loginTest() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    console.log('Opening main page...');
    await driver.get('http://localhost:3000/');

    console.log('Navigating to login page...');
    // Option 1: If you have a login link/button on homepage
    // await driver.findElement(By.linkText('Login')).click();

    // Option 2: If you want to navigate directly using JS
    await driver.executeScript("window.history.pushState({}, '', '/login');");

    // Wait a moment for React to render login form
    await driver.sleep(1000);

    console.log('Waiting for email input...');
    const emailInput = await driver.wait(until.elementLocated(By.name('email')), 15000);
    await driver.wait(until.elementIsVisible(emailInput), 5000);

    console.log('Typing email...');
    await emailInput.sendKeys('mersigurmu@gmail.com');

    const passwordInput = await driver.wait(until.elementLocated(By.name('password')), 5000);
    await driver.wait(until.elementIsVisible(passwordInput), 5000);

    console.log('Typing password...');
    await passwordInput.sendKeys('password123');

    const submitButton = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);
    await driver.wait(until.elementIsEnabled(submitButton), 5000);

    console.log('Clicking submit button...');
    await submitButton.click();

    // Wait for dashboard URL or some element unique to dashboard
    await driver.wait(until.urlIs('http://localhost:3000/dashboard'), 15000);

    console.log('Login test passed ✅');
  } catch (error) {
    console.error('Login test failed ❌', error);
  } finally {
    await driver.quit();
  }
}

loginTest();
