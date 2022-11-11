const { numLevels } = require('./allLevelData');
const { currentLevel } = require('./currentLevelHandling');

const agentTwo = 'Jenkins';
const dialogueArry = getAllLevelDialogue();

let currentDialogueLineNumber = 0;

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

export function getCurrentLevelDialogue() {
  let currentLevelAllDialogue = getCurrentLevelAllDialogue();
  console.log(currentLevelAllDialogue[currentDialogueLineNumber]);
  currentDialogueLineNumber = currentDialogueLineNumber + 1;

  return;
}

export { agentTwo };
