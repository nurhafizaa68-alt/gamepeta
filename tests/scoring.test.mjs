import test from 'node:test';import assert from 'node:assert/strict';
import {scoreMission} from '../shared/scoring.js';import {worlds}from'../shared/content.js';import{handler}from'../netlify/functions/progress.mjs';
test('All worlds can earn 3 stars with correct answers',()=>{for(const w of worlds)assert.equal(scoreMission(w.id,[0,1,2,3,w.answer]).stars,3)});
test('Three correct unlocks location; fewer gets no star',()=>{assert.equal(scoreMission('fruit',[0,1,2,0,0]).stars,1);assert.equal(scoreMission('fruit',[1,2,3,0,0]).stars,0)});
test('Reject unknown worlds, missing, noninteger and out-of-range answers',()=>{for(const [id,a]of[['bad',[0,1,2,3,1]],['fruit',[]],['fruit',[0,1,2,3,4]],['fruit',[0,1,2,3,'1']]])assert.throws(()=>scoreMission(id,a))});
test('Backend rejects unsupported methods and unconfigured service',async()=>{assert.equal((await handler({httpMethod:'DELETE'})).statusCode,405);assert.equal((await handler({httpMethod:'GET',headers:{}})).statusCode,503)});
