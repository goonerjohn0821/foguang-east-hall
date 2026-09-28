import * as THREE from 'three';
import { Batch,box,boxGeometry,v } from '../geometry';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {columns,FLOOR,BASE_HEIGHT,PLATFORM} from './config';
export function buildFoundation(parent:THREE.Group,m:Materials,e:Explosion){
  const base=new THREE.Group();parent.add(base);
  base.name='低石台基';
  box(base,m.stone,v(0,.25,0),v(PLATFORM.halfX*2-.2,.5,PLATFORM.halfZ*2-.2),'foundation');
  box(base,m.stone,v(0,.55,0),v(PLATFORM.halfX*2+.12,.1,PLATFORM.halfZ*2+.12),'foundation');
  box(base,m.stone,v(0,(FLOOR+.6)/2,0),v(PLATFORM.halfX*2,FLOOR-.6,PLATFORM.halfZ*2),'foundation');
  e.register(base,'foundation',v(0,-.5,0),8);
  const stairs=new THREE.Group();parent.add(stairs);const steps=new Batch(boxGeometry,m.stone,'foundation');
  for(let i=0;i<PLATFORM.steps;i++){
    const h=FLOOR*(i+1)/PLATFORM.steps,z=PLATFORM.halfZ+(PLATFORM.steps-i-.5)*PLATFORM.tread;
    steps.add(v(0,h/2,z),v(PLATFORM.stairWidth,h,PLATFORM.tread+.012));
  }steps.finish(stairs);
  const curb=new Batch(boxGeometry,m.stone,'foundation');
  for(let s of [-1,1])curb.beam(v(s*(PLATFORM.stairWidth/2+.14),.18,PLATFORM.halfZ+PLATFORM.steps*PLATFORM.tread),v(s*(PLATFORM.stairWidth/2+.14),FLOOR+.04,PLATFORM.halfZ),.23,.28);curb.finish(stairs);e.register(stairs,'foundation',v(0,-.35,2.5),8,1);
  const bases=new THREE.Group();parent.add(bases);
  const stone=new Batch(new THREE.CylinderGeometry(.53,.62,BASE_HEIGHT,12),m.stone,'base');
  columns.forEach(c=>stone.add(v(c.x,FLOOR+BASE_HEIGHT/2,c.z)));stone.finish(bases);e.register(bases,'base',v(0,.26,0),7);
}
