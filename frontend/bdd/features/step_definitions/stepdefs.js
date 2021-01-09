const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const { Builder, By, Key, until } = require('selenium-webdriver');


Given('today is Sunday', { timeout: 15000 }, async function () {
    let driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://www.google.com');
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google Search'), 10000);
});

