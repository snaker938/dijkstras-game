import { getCurrentUserName } from './currentUserDataHandling';

const { numLevels } = require('./allLevelData');
const { currentLevel } = require('./currentLevelHandling');

const agentTwo = 'Agent Jenkins';
const dialogueArry = getAllLevelDialogue();

let currentDialogueLineNumber = 0;

export function setCurrentDialogueLineNumber(num) {
  currentDialogueLineNumber = num;
}

function getAllLevelDialogue() {
  let levelDialogues = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./dialogue/level-${i}`);
    levelDialogues.push(level.dialogue);
  }
  return levelDialogues;
}

function getCurrentLevelAllDialogue() {
  let currentLevelAllDialogue = [];
  for (let i = 0; i < dialogueArry[currentLevel - 1].length; i++)
    currentLevelAllDialogue.push(dialogueArry[currentLevel - 1][i]);
  return currentLevelAllDialogue;
}

function parseCurrentDialogue(thingToParse) {
  let speaker = thingToParse[0];
  let dialogue = thingToParse[1];

  if (speaker === 1) speaker = `Agent ${getCurrentUserName()}`;
  else if (speaker === 2) speaker = agentTwo;
  else if (speaker === null) speaker = '';
  else {
    setCurrentDialogueLineNumber(0);
    getCurrentLevelDialogue();
    return;
  }

  if (dialogue.includes('{userName}'))
    dialogue = dialogue.replace('{userName}', getCurrentUserName());
  currentDialogueLineNumber = currentDialogueLineNumber + 1;
  console.log(speaker, dialogue);
}

export function getCurrentLevelDialogue() {
  let currentLevelAllDialogue = getCurrentLevelAllDialogue();
  parseCurrentDialogue(currentLevelAllDialogue[currentDialogueLineNumber]);

  return;
}

export { agentTwo };
