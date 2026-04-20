const fs = require('fs');
const path = require('path');

const pAndIdl = fs.readFileSync('C:\\\\Users\\\\HANA\\\\.gemini\\\\antigravity\\\\brain\\\\804dc91f-6672-4242-b861-f691b79d7a84\\\\panda_idle_1776319913329.png').toString('base64');
const pAndJmp = fs.readFileSync('C:\\\\Users\\\\HANA\\\\.gemini\\\\antigravity\\\\brain\\\\804dc91f-6672-4242-b861-f691b79d7a84\\\\panda_jump_1776319927202.png').toString('base64');
const tGrIdl = fs.readFileSync('C:\\\\Users\\\\HANA\\\\.gemini\\\\antigravity\\\\brain\\\\804dc91f-6672-4242-b861-f691b79d7a84\\\\tiger_idle_1776319941070.png').toString('base64');
const tGrJmp = fs.readFileSync('C:\\\\Users\\\\HANA\\\\.gemini\\\\antigravity\\\\brain\\\\804dc91f-6672-4242-b861-f691b79d7a84\\\\tiger_jump_1776319955779.png').toString('base64');
const bgBb = fs.readFileSync('C:\\\\Users\\\\HANA\\\\.gemini\\\\antigravity\\\\brain\\\\804dc91f-6672-4242-b861-f691b79d7a84\\\\bg_bamboo_1776319969962.png').toString('base64');
const bgLk = fs.readFileSync('C:\\\\Users\\\\HANA\\\\.gemini\\\\antigravity\\\\brain\\\\804dc91f-6672-4242-b861-f691b79d7a84\\\\bg_lake_1776319982825.png').toString('base64');

let assetsData = fs.readFileSync('assetsData.js', 'utf8');

assetsData = assetsData.replace('};', 
  ',\n"panda_idle": "data:image/png;base64,' + pAndIdl + '",\n' +
  '"panda_jump": "data:image/png;base64,' + pAndJmp + '",\n' +
  '"tiger_idle": "data:image/png;base64,' + tGrIdl + '",\n' +
  '"tiger_jump": "data:image/png;base64,' + tGrJmp + '",\n' +
  '"bg_bamboo": "data:image/png;base64,' + bgBb + '",\n' +
  '"bg_lake": "data:image/png;base64,' + bgLk + '"\n};'
);

fs.writeFileSync('assetsData.js', assetsData);
console.log('Update complete');
