const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const nameGen = require('./nickname');
const Kahoot = require('kahoot.js-updated');
let bots = [];

const spawn = require("child_process").spawn;
const prompt = require("prompt-sync")({ sigint: true });

console.log('----------------------------------------');
console.log('Welcome to Kahoot Monkey!');
console.log('----------------------------------------');
console.log('Kahoot Monkey supports several types of bots with different behaviors:');
console.log('1. mainBot - The bot that your name should go under, gets a perfect score by answering each question correctly in 0.1s');
console.log('2. diversionBot - Bots that answer each question randomly in less than 5.0s');
console.log("3. stallBot - A bot that doesn't answer any questions, thus, stalling out each question to the time limit (or until the instructor hits 'skip')");
console.log('----------------------------------------');
const quizId = prompt('Enter the quiz ID of the Kahoot: ');
const gamePIN = prompt('Enter the game PIN of the Kahoot: ');
const realName = prompt('Enter the nickname YOU would like to use: ');
const botCount = prompt('Enter the number of diversion bots you would like: ');
const stallBotString = prompt('Would you like to include a stallBot [y/n]? ');
console.log('----------------------------------------');
const pythonProcess = spawn('python',["./kahootparse.py", quizId]);

let stallBotBool;
if (stallBotString.toUpperCase() == 'Y'){
    stallBotBool = true;
}
else{   // assumes that invalid inputs should also not include a stallBot
    stallBotBool = false;
}

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
    console.log('Cheatsheet (remember that red and blue switch sides on true/false questions):');
    let questionNumber = 0;
    for (item of answers){
        console.log(++questionNumber + '. ' + item);
    }
    console.log('----------------------------------------');
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
    await page.setDefaultTimeout(0);
    await page.goto(url);

    await page.focus('input#game-input');
    await page.keyboard.type(gamePIN);
    await page.keyboard.press('Enter');

    page.waitForSelector('input#nickname').then(async function(){
        await page.focus('input#nickname');
        await page.keyboard.type(realName);
        await page.keyboard.press('Enter');
    });

    console.log('mainBot successfully joined game');

    for (item of answers){
        await page.waitForXPath('//*[@id="root"]/div[1]/main/div[2]/div/div/button[1]').then(async function(){
            let option = '';
            const [el] = await page.$x('//*[@id="root"]/div[1]/main/div[1]/div/div[2]/div/div/span');
            const txt = await el.getProperty('textContent');
            const questionType = await txt.jsonValue();

            if (questionType == 'Quiz'){
                switch (item){
                    case 'red':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[1]';
                        break;
                    case 'blue':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[2]';
                        break;
                    case 'yellow':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[3]';
                        break;
                    case 'green':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[4]';
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
                        break;
                    case 'blue':
                        option = '//*[@id="root"]/div[1]/main/div[2]/div/div/button[1]';
                        break;
                    default:
                        console.log('not all those who wander are lost');
                        break;
                }
            }
            const elements = await page.$x(option);
            await elements[0].click();  // weird bug here
        });
    }
}

function diversionBots(pin){
    for (let i = 0; i < botCount; i++){
        bots.push(new Kahoot);
        bots[i].join(pin, nameGen.generateNickname()).catch(error=>{
            console.log('Join failed ' + error.description + ' ' + error.status);
        });
        bots[i].on('Joined', ()=>{
            console.log("1 diversionBot successfully joined game");
        });
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

let indexedAnswers = [];
for (item of answers){
    switch (item){
        case 'red':
            indexedAnswers.push(0);
            break;
        case 'blue':
            indexedAnswers.push(1);
            break;
        case 'yellow':
            indexedAnswers.push(2);
            break;
        case 'green':
            indexedAnswers.push(3);
            break;
        default:
            console.log('not all those who wander are lost');
            break;
    }
}

let idx = 0;
function humanBots(pin){    // just like a human, they get all true/false questions wrong :)
    for (let i = 0; i < botCount; i++){ // change botCount here later
        bots.push(new Kahoot);
        bots[i].join(pin, nameGen.generateNickname()).catch(error=>{
            console.log('Join failed ' + error.description + ' ' + error.status);
        });
        bots[i].on('Joined', ()=>{
            console.log("1 humanBot successfully joined game");
        });
        bots[i].on('QuestionStart', (question)=>{
            setTimeout(function(){
                question.answer(indexedAnswers[idx]);
            }, Math.floor(Math.random() * 5000) + 1);
            console.log(idx);
            console.log(indexedAnswers[idx]);
            idx++;
        });
        bots[i].on('Disconnect', (reason)=>{
            console.log('Disconnected due to ' + reason);
        })
    }
}

function stallBot(pin){
    bots.push(new Kahoot);
    bots[bots.length - 1].join(pin, nameGen.generateNickname()).catch(error=>{
        console.log('Join failed ' + error.description + ' ' + error.status);
    });
    bots[bots.length - 1].on('Joined', ()=>{
        console.log('1 stallBot successfully joined game');
    });
    bots[bots.length - 1].on('Disconnect', (reason)=>{
        console.log('Disconnected due to ' + reason);
    })
}


mainBot('https://kahoot.it/');
diversionBots(gamePIN);
// humanBots(gamePIN);
(stallBotBool) ? stallBot(gamePIN) : {};