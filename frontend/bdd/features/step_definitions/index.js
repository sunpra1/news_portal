const { expect } = require('chai');
const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { Builder, By, Key, until, sleep } = require('selenium-webdriver');
const { delay } = require('../utils/constant');

Given('Test registration functionality', { timeout: 30000 }, async function () {
    let driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://localhost:3000/register'); await driver.findElement(By.id('fullNameInput')).sendKeys('Sunil Prasai');
    await driver.findElement(By.id('phoneInput')).sendKeys('9800000002');

    await driver.sleep(delay);

    await driver.findElement(By.id('passwordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('cPasswordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('registerBtn')).click();

    await driver.wait(until.elementLocated(By.id("loggedInUser")), 30000);
    expect(await driver.findElement(By.id('loggedInUser')).getText()).to.be.equal("Sunil Prasai");
    await driver.quit();
});

Given('Test login functionality', { timeout: 30000 }, async function () {
    let driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://localhost:3000/login');

    await driver.findElement(By.id('phoneInput')).sendKeys('9849147995');
    await driver.findElement(By.id('passwordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('loginBtn')).click();

    await driver.wait(until.elementLocated(By.id("loggedInUser")), 30000);
    expect(await driver.findElement(By.id('loggedInUser')).getText()).to.be.equal("Sunil Prasai");
    await driver.quit();
});

Given('Test add category functionality', { timeout: 30000 }, async function () {
    const driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://localhost:3000/login');
    await driver.findElement(By.id('phoneInput')).sendKeys('9849147995');
    await driver.findElement(By.id('passwordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.elementLocated(By.id("loggedInUser")), 30000);

    await driver.sleep(delay);
    await driver.findElement(By.id("viewCategorySection")).click();
    await driver.sleep(delay);
    await driver.findElement(By.id("addCategoryBtn")).click();
    await driver.wait(until.urlContains("/category/add"), 30000);

    await driver.findElement(By.id("categoryInput")).sendKeys("NEW CATEGORY");
    await driver.findElement(By.id('addCategoryBtn')).click();

    await driver.sleep(delay);
    await driver.wait(until.urlIs("http://localhost:3000/categories"));
    expect(await driver.findElement(By.css("table tbody tr:last-child td:first-child")).getText()).to.be.equal("NEW CATEGORY");
    await driver.quit();
});

Given('Test update category functionality', { timeout: 30000 }, async function () {
    const driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://localhost:3000/login');
    await driver.findElement(By.id('phoneInput')).sendKeys('9849147995');
    await driver.findElement(By.id('passwordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.elementLocated(By.id("loggedInUser")), 30000);

    await driver.sleep(delay);
    await driver.findElement(By.id("viewCategorySection")).click();
    await driver.sleep(delay);

    await driver.findElement(By.css('table tbody tr:last-child td:last-child .btn:first-child')).click();
    await driver.wait(until.urlContains("/category/update"), 30000);

    await (await driver.findElement(By.id("categoryInput"))).clear();
    await driver.sleep(delay);
    await driver.findElement(By.id("categoryInput")).sendKeys("UPDATED CATEGORY");
    await driver.sleep(delay);
    await driver.findElement(By.id('updateCategoryBtn')).click();

    await driver.sleep(delay);
    await driver.wait(until.urlIs("http://localhost:3000/categories"));
    await driver.sleep(delay);
    expect(await driver.findElement(By.css("table tbody tr:last-child td:first-child")).getText()).to.be.equal("UPDATED CATEGORY");
    await driver.quit();
});


Given('Test delete category functionality', { timeout: 30000 }, async function () {
    const driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://localhost:3000/login');
    await driver.findElement(By.id('phoneInput')).sendKeys('9849147995');
    await driver.findElement(By.id('passwordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.elementLocated(By.id("loggedInUser")), 30000);

    await driver.sleep(delay);
    await driver.findElement(By.id("viewCategorySection")).click();
    await driver.sleep(delay);

    const categoryToBeDeletedName = await driver.findElement(By.css('table tbody tr:last-child td:first-child')).getText();
    await driver.findElement(By.css('table tbody tr:last-child td:last-child .btn:last-child')).click();
    await driver.sleep(delay);

    await driver.findElement(By.id("dialogPositiveBtn")).click();
    await driver.sleep(delay);

    expect(await driver.findElement(By.css('table tbody tr:last-child td:first-child')).getText()).not.to.be.equal(categoryToBeDeletedName);
    await driver.quit();
});

Given('Test add news functionality', { timeout: 30000 }, async function () {
    const driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://localhost:3000/login');
    await driver.findElement(By.id('phoneInput')).sendKeys('9849147995');
    await driver.findElement(By.id('passwordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.elementLocated(By.id("loggedInUser")), 30000);

    await driver.sleep(delay);
    await driver.findElement(By.id("viewAllNewsSection")).click();
    await driver.sleep(delay);
    await driver.findElement(By.id("addNewsBtn")).click();
    await driver.wait(until.urlContains("/news/add"), 30000);

    await driver.sleep(delay);

    await driver.findElement(By.css("#categoryInput option:last-child")).click();
    await driver.findElement(By.id("titleInput")).sendKeys("Dummy news title");
    await driver.findElement(By.id("tagsInput")).sendKeys("dummy, news");
    await driver.sleep(delay);
    await driver.findElement(By.id('addNewsBtn')).click();

    await driver.sleep(delay);
    await driver.wait(until.urlIs("http://localhost:3000/news"));
    expect(await driver.findElement(By.css("table tbody tr:last-child td:first-child")).getText()).to.be.equal("Dummy news title");
    await driver.quit();
});

Given('Test update news functionality', { timeout: 30000 }, async function () {
    const driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://localhost:3000/login');
    await driver.findElement(By.id('phoneInput')).sendKeys('9849147995');
    await driver.findElement(By.id('passwordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.elementLocated(By.id("loggedInUser")), 30000);

    await driver.sleep(delay);
    await driver.findElement(By.id("viewAllNewsSection")).click();
    await driver.sleep(delay);

    await driver.findElement(By.css('table tbody tr:first-child td:last-child .btn:first-child')).click();
    await driver.wait(until.urlContains("/news/update"), 30000);

    const updatedCategoryName = await driver.findElement(By.css("#categoryInput option:nth-child(2)")).getText();
    await driver.findElement(By.css("#categoryInput option:nth-child(2)")).click();
    await driver.findElement(By.id("titleInput")).clear();
    await driver.sleep(delay);
    await driver.findElement(By.id("titleInput")).sendKeys("Dummy news title updated");
    await driver.findElement(By.id('updateNewsBtn')).click();

    await driver.sleep(delay);
    await driver.wait(until.urlIs("http://localhost:3000/news"));
    await driver.sleep(delay);
    expect(await driver.findElement(By.css("table tbody tr:first-child td:first-child")).getText()).to.be.equal("Dummy news title updated");
    expect(await driver.findElement(By.css("table tbody tr:first-child td:nth-child(2)")).getText()).to.be.equal(updatedCategoryName);
    await driver.quit();
});


Given('Test delete news functionality', { timeout: 30000 }, async function () {
    const driver = await new Builder().forBrowser('firefox').build();
    await driver.get('http://localhost:3000/login');
    await driver.findElement(By.id('phoneInput')).sendKeys('9849147995');
    await driver.findElement(By.id('passwordInput')).sendKeys('sunpra12');
    await driver.findElement(By.id('loginBtn')).click();
    await driver.wait(until.elementLocated(By.id("loggedInUser")), 30000);

    await driver.sleep(delay);
    await driver.findElement(By.id("viewAllNewsSection")).click();
    await driver.sleep(delay);

    const newsToBeDeletedTitle = await driver.findElement(By.css('table tbody tr:first-child td:first-child')).getText();
    await driver.findElement(By.css('table tbody tr:first-child td:last-child .btn:last-child')).click();
    await driver.sleep(delay);

    await driver.findElement(By.id("dialogPositiveBtn")).click();
    await driver.sleep(delay);

    expect(await driver.findElement(By.css('table tbody tr:first-child td:first-child')).getText()).not.to.be.equal(newsToBeDeletedTitle);
    await driver.quit();
});