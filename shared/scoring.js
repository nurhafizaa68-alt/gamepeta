import { worlds } from './content.js';
export function scoreMission(id, answers) {
 const world=worlds.find(w=>w.id===id);
 if(!world || !Array.isArray(answers) || answers.length!==5 || answers.some(a=>!Number.isInteger(a)||a<0||a>3)) throw new Error('Jawaban tidak valid');
 const expected=[0,1,2,3,world.answer];
 const correct=answers.reduce((n,a,i)=>n+Number(a===expected[i]),0);
 return {correct,total:5,stars:correct===5?3:correct>=4?2:correct>=3?1:0};
}
