// Browser fixture helper; executing it requires the supported browser workflow.
module.exports=async function solveMission(page){
 const id=await page.evaluate(()=>senState.play.id);
 if(id==='canal'){for(const object of ['duck','parcel']){await page.locator(`[data-pp-canal="${object}"]`).click();await page.locator('[data-pp-canal="boat"]').click();}for(let i=0;i<2;i++)await page.locator('[data-pp-canal="pump"]').click();await page.locator('[data-pp-canal="gate"]').click();await page.locator('[data-pp-canal="boat"]').click();await page.locator('[data-pp-canal="dock"]').click();for(const object of ['duck','parcel']){await page.locator(`[data-pp-canal="${object}"]`).click();await page.locator('[data-pp-canal="dock"]').click();}}
 else if(id==='trip'){await page.locator('[data-pp-trip="moon"]').click();await page.locator('[data-pp-trip-object="rocket"]').click();await page.locator('[data-pp-trip-object="teddy"]').click();await page.locator('[data-pp-trip-object="rocket"]').click();await page.locator('[data-pp-trip-place="pad"]').click();}
 else if(id==='workshop')for(const part of ['wheel0','wheel1','window']){await page.locator(`[data-pp-tool="${part==='window'?'sponge':'wheel'}"]`).click();await page.locator(`[data-pp-part="${part}"]`).click();}
 else if(id==='marble')for(const cell of [1,1,4,4,5])await page.locator(`[data-pp-pipe="${cell}"]`).click();
 if(!await page.evaluate(()=>senState.done))throw Error('Mission did not finish: '+id);
 if(await page.locator('#ppContinue').count())await page.locator('#ppContinue').click();else await page.waitForTimeout(1700);
};
