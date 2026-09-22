import * as THREE from 'three';
import { Batch,box,boxGeometry,v } from '../geometry';
import type {Materials} from '../materials';
import type {Explosion} from '../explosion';
import {columns,FLOOR} from './config';
export function buildFoundation(parent:THREE.Group,m:Materials,e:Explosion){
  const base=new THREE.Group();parent.add(base);
  box(base,m.stone,v(0,.86,0),v(40,1.72,24),'foundation');
  box(base,m.stone,v(0,1.81,0),v(40.5,.18,24.5),'foundation');
  box(base,m.stone,v(0,2,0),v(40.2,.3,24.2),'foundation');
  e.register(base,'foundation',v(0,-.5,0),8);
  const stairs=new THREE.Group();parent.add(stairs);const steps=new Batch(boxGeometry,m.stone,'foundation');
  for(let i=0;i<11;i++)steps.add(v(0,(FLOOR/11)*(i+.5),17.5-i*.49),v(8,FLOOR/11,.53));steps.finish(stairs);
  const curb=new Batch(boxGeometry,m.stone,'foundation');
  for(let s of [-1,1])curb.beam(v(s*4.18,.3,17.65),v(s*4.18,2.18,12.4),.33,.4);curb.finish(stairs);e.register(stairs,'foundation',v(0,-.35,2.5),8,1);
  const bases=new THREE.Group();parent.add(bases);
  const stone=new Batch(new THREE.CylinderGeometry(.52,.64,.28,12),m.stone,'base');
  columns.forEach(c=>stone.add(v(c.x,FLOOR+.14,c.z)));stone.finish(bases);e.register(bases,'base',v(0,.26,0),7);
}
