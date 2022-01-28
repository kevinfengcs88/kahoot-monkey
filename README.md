# Kahoot Monkey
Kahoot Monkey is a CLI built with Node.js for Kahoot! games. Kahoot Monkey supports several types of bots with different behaviors:
1. mainBot - The bot that your name should go under, gets a perfect score by answering each question correctly in 0.1s
2. diversionBot - Bots that answer each question randomly in less than 5.0s
3. stallBot - A bot that doesn't answer any questions, thus, stalling out each question to the time limit (or until the instructor hits 'skip')
4. More on the way!

Kahoot Monkey doesn't just flood your games with useless bots that don't answer questions; instead it uses a combination of different bots to enhance your Kahoot gameplay. Here's an example configuration:

- mainBot is entered into the game under the name 'Aragorn'
- 10 diversionBots are entered into the game with randomly generated nicknames to divert attention away from mainBot
- A stallBot is entered into the game to stall out questions, making the consistent answering behavior of the diversionBots less obvious

## How to use
1. Install [Node.js](https://nodejs.org/en/)
2. Download the files and set up the directory as such:
```
📦kahoot-monkey
 ┣ 📂monkey
 ┃ ┣ 📜kahootparse.py
 ┃ ┣ 📜monkey.js
 ┃ ┗ 📜nickname.js
 ┣ 📂node_modules
 ┣ 📜package-lock.json
 ┗ 📜package.json
 ```
3. Run the following `npm` commands:</br>
`npm install puppeteer`</br>
`npm install puppeteer-extra`</br>
`npm install puppeteer-extra-plugin-stealth`</br>
`npm install kahoot.js-updated@2.4.0`</br>
`npm install prompt-sync`

4. Change the director to the `monkey` folder which contains the main script, `monkey.js`
5. Run the script with Node.js: `node monkey`

## Limitations
Kahoot Monkey only works for public games and is designed for traditional game formats that involve multiple choice and true/false questions (which is the majority of Kahoot games). Kahoot Monkey also doesn't check game servers to determine which quiz ID and game PIN to use; this information must be obtained through manual scribing or copy pasting.


