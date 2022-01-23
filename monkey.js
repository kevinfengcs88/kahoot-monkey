const puppeteer = require('puppeteer');
const nameGen = require('./nickname');

const spawn = require("child_process").spawn;
const prompt = require("prompt-sync")({ sigint: true });
const quizId = prompt("Enter the quiz ID of the Kahoot: ");
const pythonProcess = spawn('python',["./kahootparse.py", quizId]);
const gamePIN = prompt("Enter the game PIN of the Kahoot: ");


let answers = [];
pythonProcess.stdout.on('data', (data)=>{
    let curr = '';
    for (char of `${data}`){
        switch(char){
            case '[':
                break;
            case ']':
                answers.push(curr);
                curr = '';
                break;
            case "'":
                break;
            case ',':
                break;
            case ' ':
                answers.push(curr);
                curr = '';
                break;
            default:
                curr += char;
        }
    }
    for (item of answers){
        console.log(item);
    }
});

pythonProcess.stderr.on('data', (data)=>{
    console.log(`stderr: ${data}`);
});

pythonProcess.stderr.on('close', (code)=>{
    console.log(`Child process exited with code: ${code}`);
});

async function scrape(url){
    const browser = await puppeteer.launch(); // {headless: false}
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);    // does not solve timeout error
    await page.goto(url);

    await page.focus('input#game-input');
    await page.keyboard.type(gamePIN);    // can change this to the URL with ?=PIN
    await page.keyboard.press('Enter');

    page.waitForSelector('input#nickname').then(async function(){
        await page.focus('input#nickname');
        await page.keyboard.type(nameGen.generateNickname());
        await page.keyboard.press('Enter');
    });

    for (item of answers){
        await page.waitForXPath('//*[@id="root"]/div[1]/main/div[2]/div/div/button[1]').then(async function(){
            let option = '';
            // t/f decision here
            const [el] = await page.$x('//*[@id="root"]/div[1]/main/div[1]/div/div[2]/div/div/span');
            const txt = await el.getProperty('textContent');
            const questionType = await txt.jsonValue();

            if (questionType == 'Quiz'){
                switch (item){
                    case 'red':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[1]';
                        console.log('redclick(false)');
                        break;
                    case 'blue':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[2]';
                        console.log('blueclick(true)');
                        break;
                    case 'yellow':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[3]';
                        console.log('yellowclick');
                        break;
                    case 'green':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[4]';
                        console.log('greenclick');
                        break;
                    default:
                        console.log('not all those who wander are lost');
                        break;
                }
            }
            else if (questionType == 'True or false'){
                switch (item){
                    case 'red':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[2]';
                        console.log('redclick(false)');
                        break;
                    case 'blue':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[1]';
                        console.log('blueclick(true)');
                        break;
                    default:
                        console.log('not all those who wander are lost');
                        break;
                }
            }
            const elements = await page.$x(option);
            await elements[0].click();
        });
    }
}

scrape('https://kahoot.it/');