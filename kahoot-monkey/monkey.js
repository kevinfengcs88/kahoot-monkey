const puppeteer = require('puppeteer');
const nameGen = require('./nickname');

// function delay(time){
//     return new Promise(function(resolve){ 
//         setTimeout(resolve, time);
//     });
// }

async function scrape(url){
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);

    // const[el] = await page.$x('/html/body/h1');
    // const txt = await el.getProperty('textContent');
    // const rawTxt = await txt.jsonValue();
    // console.log(rawTxt);

    await page.focus('input#game-input');
    await page.keyboard.type('1222667');
    await page.keyboard.press('Enter');

    page.waitForSelector('input#nickname').then(async function(){
        await page.focus('input#nickname');
        await page.keyboard.type(nameGen.generateNickname());
        await page.keyboard.press('Enter');
    })

    page.waitForXPath('//*[@id="root"]/div[1]/main/div[2]/div/div/button[1]').then(async function(){
        const elements = await page.$x('//*[@id="root"]/div[1]/main/div[2]/div/div/button[3]');
        await elements[0].click();
    })
}

scrape('https://kahoot.it/');