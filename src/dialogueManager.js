import { numLevels } from './allLevelData';
import {
  currentLevel,
  getCurrentLevelEndDistance,
} from './currentLevelHandling';
import { getCurrentUserName } from './currentUserDataHandling';

const agentTwo = '<Agent Jenkins>';
const agentThree = '<Agent Pembroke>';
const agentFour = '<Agent Leonard>';
const agentFive = '<Officer Harold>';
const agentSix = '<Agent Rick>';
const agentSeven = '<Commander Reese>';
const agentEight = '<Director Finch>';
const mrSmith = '<Mr Smith>';

const agentThreeShort = 'Agent Pembroke';
const agentTwoShort = 'Agent Jenkins';
const agentFourShort = 'Agent Leonard';
const agentFiveShort = 'Officer Harold';
const agentSixShort = 'Agent Rick';
const agentSevenShort = 'Command Reese';
const agentEightShort = 'Director Finch';

const mrSmithShort = 'Mr Smith';

let sceneBreaker =
  '<------------------------------------------------------------------------------------------------------------------------------------------>';

const dialogueArry = getAllLevelDialogue();

let currentDialogueLineNumber = 0;

let hasShownDialogueMenu = false;

let hasDialogueEnded = false;

export function setHasDialogueEnded(value) {
  hasDialogueEnded = value;
}

export function getHasDialogueEnded() {
  return hasDialogueEnded;
}

// let currentDialogueLineNumberEnd = getCurrentDialogueLineNumerEnd();

export function getCurrentDialogueLineNumberEnd() {
  let currentLevelAllDialogue = getCurrentLevelAllDialogue();
  let index = 0;
  for (let element of currentLevelAllDialogue) {
    if (element[0] === 0) {
      return index;
    }
    index++;
  }
}

export function getSceneNextPageIndexes() {
  let indexes = [];
  let index = 0;
  for (let element of getCurrentLevelAllDialogue()) {
    if (element[0] === 1000) indexes.push(index);
    index++;
  }
  return indexes;
}

export function getSceneBreakerIndexes() {
  let indexes = [];
  let index = 0;
  for (let element of getCurrentLevelAllDialogue()) {
    if (element[0] === 999) indexes.push(index);
    index++;
  }
  return indexes;
}

export function getCurrentLevelSpeakerPosition() {
  let currentLevelAllSpeakers = [];
  for (let i = 0; i < dialogueArry[currentLevel - 1].length - 1; i++)
    currentLevelAllSpeakers.push(dialogueArry[currentLevel - 1][i][2]);
  return currentLevelAllSpeakers;
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

function getAllLevelDialogue() {
  let levelDialogues = [];
  for (let i = 1; i <= numLevels; i++) {
    let level = require(`./dialogue/level-${i}`);
    levelDialogues.push(level.dialogue);
  }
  return levelDialogues;
}

export function setCurrentDialogueLineNumber(num) {
  currentDialogueLineNumber = num;
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

  if (speaker === 1) speaker = `<${getCurrentUserName()}>`;
  else if (speaker === 2) speaker = agentTwo;
  else if (speaker === 3) speaker = agentThree;
  else if (speaker === 4) speaker = agentFour;
  else if (speaker === 5) speaker = agentFive;
  else if (speaker === 6) speaker = agentSix;
  else if (speaker === 7) speaker = agentSeven;
  else if (speaker === 8) speaker = agentEight;
  else if (speaker === 20) speaker = mrSmith;
  else if (speaker === null) speaker = '';
  else if (speaker === 999) {
    speaker = '';
    dialogue = sceneBreaker;
  } else if (speaker === 1000) {
    speaker = '';
    dialogue = '';
  } else {
  }

  if (dialogue.includes('{userName}'))
    dialogue = dialogue.replace('{userName}', getCurrentUserName());
  if (dialogue.includes('{endDistance}'))
    dialogue = dialogue.replace('{endDistance}', getCurrentLevelEndDistance());
  if (dialogue.includes('{2}'))
    dialogue = dialogue.replace('{2}', agentTwoShort);
  if (dialogue.includes('{3}'))
    dialogue = dialogue.replace('{3}', agentThreeShort);
  if (dialogue.includes('{4}'))
    dialogue = dialogue.replace('{4}', agentFourShort);
  if (dialogue.includes('{5}'))
    dialogue = dialogue.replace('{5}', agentFiveShort);
  if (dialogue.includes('{6}'))
    dialogue = dialogue.replace('{6}', agentSixShort);
  if (dialogue.includes('{7}'))
    dialogue = dialogue.replace('{7}', agentSevenShort);
  if (dialogue.includes('{8}'))
    dialogue = dialogue.replace('{8}', agentEightShort);
  if (dialogue.includes('{20}'))
    dialogue = dialogue.replace('{20}', mrSmithShort);

  //   if (shouldChange) currentDialogueLineNumber = currentDialogueLineNumber + 1;

  return [speaker, dialogue];
}

export function getCurrentLevelDialogue() {
  let currentLevelAllDialogue = getCurrentLevelAllDialogue();

  let parsedDialogue = [];
  for (let dialogue of currentLevelAllDialogue) {
    parsedDialogue.push(parseCurrentDialogue(dialogue));
  }

  return parsedDialogue;
}

export { agentTwo, hasShownDialogueMenu };
