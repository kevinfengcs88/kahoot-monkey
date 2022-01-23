const puppeteer = require('puppeteer');
const nameGen = require('./nickname');
const Kahoot = require('kahoot.js-updated');
let bots = [];

const spawn = require("child_process").spawn;
const prompt = require("prompt-sync")({ sigint: true });
const quizId = prompt("Enter the quiz ID of the Kahoot: ");
const gamePIN = prompt("Enter the game PIN of the Kahoot: ");
const botCount = prompt("Enter the number of bots you would like: ");
const realName = prompt("Enter the nickname YOU would like to use: ");

const pythonProcess = spawn('python',["./kahootparse.py", quizId]);

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

async function mainBot(url){
    const browser = await puppeteer.launch(); // {headless: false}
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);    // does not solve timeout error
    await page.goto(url);

    await page.focus('input#game-input');
    await page.keyboard.type(gamePIN);    // can change this to the URL with ?=PIN
    await page.keyboard.press('Enter');

    page.waitForSelector('input#nickname').then(async function(){
        await page.focus('input#nickname');
        await page.keyboard.type(realName);
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

// additional bot types

function diversionBots(pin){
    for (let i = 0; i < botCount; i++){
        bots.push(new Kahoot);
        bots[i].join(pin, nameGen.generateNickname()).catch(error=>{
            console.log('Join failed ' + error.description + ' ' + error.status);
        });
        bots[i].on('Joined', ()=>{
            console.log("1 diversion bot successfully joined game");
        });
        console.log(successes);
        bots[i].on('QuestionStart', (question)=>{
            setTimeout(function(){
                question.answer(Math.floor(Math.random() * question.quizQuestionAnswers[question.questionIndex]));
            }, Math.floor(Math.random() * 5000) + 1);
        });
        bots[i].on('Disconnect', (reason)=>{
            console.log('Disconnected due to ' + reason);
        })
    }
}

function stallBot(pin){
    bots.push(new Kahoot);
    bots[bots.length - 1].join(pin, 'slowSnail69').catch(error=>{
        console.log('Join failed ' + error.description + ' ' + error.status);
    });
    bots[bots.length - 1].on('Joined', ()=>{
        console.log('1 stall bot successfully joined game');
    });
    bots[bots.length - 1].on('Disconnect', (reason)=>{
        console.log('Disconnected due to ' + reason);
    })
}

mainBot('https://kahoot.it/');
diversionBots(gamePIN);
stallBot(gamePIN);