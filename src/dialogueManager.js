import { getCurrentUserName } from './currentUserDataHandling';

import { numLevels } from './allLevelData';
import { currentLevel } from './currentLevelHandling';

const agentTwo = 'Agent Jenkins';
const dialogueArry = getAllLevelDialogue();

let hasShownDialogueMenu = false;

let currentDialogueLineNumber = 0;

let currentDialogueLineNumberEnd = getCurrentDialogueLineNumerEnd();

export function setCurrentDialogueLineNumber(num) {
  currentDialogueLineNumber = num;
}

export function toggleDialogueMenu() {
  hasShownDialogueMenu = !hasShownDialogueMenu;
}

export function setHasShownDialogueMenu(value) {
  hasShownDialogueMenu = value;
}

export function getCurrentDialogueStatus() {
  return hasShownDialogueMenu;
}

export function getCurrentDialogueLineNumerEnd() {
  let currentLevelAllDialogue = getCurrentLevelAllDialogue();
  let index = 0;
  for (let element of currentLevelAllDialogue) {
    if (element[0] === 0) {
      return index;
    }
    index++;
  }
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
    return false;
  }

  if (dialogue.includes('{userName}'))
    dialogue = dialogue.replace('{userName}', getCurrentUserName());

  return [speaker, dialogue];
}

export function getCurrentLevelDialogue() {
  let currentLevelAllDialogue = getCurrentLevelAllDialogue();

  let parsedDialogue = [];
  for (let dialogue of currentLevelAllDialogue) {
    parsedDialogue.push(parseCurrentDialogue(dialogue));
  }

  // console.log(parsedDialogue);
  return parsedDialogue;
}

export { agentTwo, hasShownDialogueMenu, currentDialogueLineNumberEnd };
