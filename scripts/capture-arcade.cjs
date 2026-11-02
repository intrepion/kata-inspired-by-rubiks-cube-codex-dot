'use strict';
const {chromium}=require(process.env.CAPTURE_PLAYWRIGHT||'playwright');const {mkdir,readFile,writeFile}=require('node:fs/promises');const {createHash}=require('node:crypto');const path=require('node:path');
(async()=>{const output=process.env.CAPTURE_OUTPUT||'/tmp/chromatic-captures',site=process.env.CAPTURE_SITE||'capture-site';await mkdir(output,{recursive:true});const inputs={};for(const f of ['index.html','styles.css','game.js','model.js','session.js','icon.svg'])inputs[f]=createHash('sha256').update(await readFile(path.join(site,f))).digest('hex');const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1,locale:'en-US',reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4192/',{waitUntil:'domcontentloaded'});await page.locator('#scramble').click();await page.waitForTimeout(1200);
 await page.locator('main').screenshot({path:path.join(output,'chromatic-01.png'),animations:'disabled'});
 await page.keyboard.press('r');await page.waitForTimeout(500);await page.keyboard.press('u');await page.waitForTimeout(500);
 await page.keyboard.press('ArrowLeft');await page.waitForTimeout(500);
 await page.locator('main').screenshot({path:path.join(output,'chromatic-02.png'),animations:'disabled'});
 await writeFile(path.join(output,'capture.json'),JSON.stringify({schemaVersion:1,workflowCommit:process.env.GITHUB_SHA||null,sourceCommit:process.env.GAME_SOURCE_COMMIT||null,runId:process.env.GITHUB_RUN_ID||null,url:'http://127.0.0.1:4192/',inputs,browser:browser.version(),viewport:{width:1280,height:1000},screenshots:['chromatic-01.png','chromatic-02.png']},null,2)+'\n');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
