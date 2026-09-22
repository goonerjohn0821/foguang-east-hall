import * as THREE from 'three';
import assert from 'node:assert/strict';
import {Explosion} from '../src/explosion';
import {roofPoint,roofGeometry} from '../src/buildings/Roof';
import {columns,X,Z} from '../src/buildings/config';
export function verifyGeometry(){
  assert.equal(X.length-1,7);assert.equal(Z.length-1,4);assert.equal(columns.length,36);assert.equal(new Set(columns.map(c=>`${c.x},${c.z}`)).size,36);
  let maxSeamError=0;
  for(let t=0;t<=1;t+=.0125)for(let side of [-1,1])for(let front of [-1,1]){
    const a=roofPoint(front>0?0:1,side,t),b=roofPoint(side>0?2:3,front,t);maxSeamError=Math.max(maxSeamError,a.distanceTo(b));
  }assert(maxSeamError<1e-8);
  for(let face=0;face<4;face++){const g=roofGeometry(face);const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)));if(i>49)assert(n.getY(i)>-.01,'Roof normals face upwards');}g.dispose();}
  const e=new Explosion(),root=new THREE.Group();for(let i=0;i<12;i++){const g=new THREE.Group();g.position.set(i*.4,3+i*.1,-i);g.rotation.set(.1,.2,.3);g.scale.set(1.2,1.1,.95);root.add(g);e.register(g,i%2?'dougong':'roof',new THREE.Vector3(2,5,-3),i%9,i);}
  for(let cycle=0;cycle<50;cycle++){e.to(1);for(let n=0;n<270;n++)e.update(1/60);assert(Math.abs(e.progress-1)<1e-10);e.to(0);for(let n=0;n<270;n++)e.update(1/60);assert(e.restored,'No transform drift after reassembly');}
  e.to(1);for(let n=0;n<70;n++)e.update(1/60);e.to(0);for(let n=0;n<270;n++)e.update(1/60);assert(e.restored,'Reversing a running explosion restores transforms');
  e.to(1,['dougong']);for(let n=0;n<270;n++)e.update(1/60);assert(e.parts.filter(p=>p.kind==='roof').every(p=>p.object.position.equals(p.position)));assert(e.parts.filter(p=>p.kind==='dougong').every(p=>p.object.position.distanceTo(p.position)>1));e.to(0);for(let n=0;n<270;n++)e.update(1/60);assert(e.restored);
  return {bays:[7,4],columns:columns.length,maxSeamError,cycles:50,interruptReversal:'passed',selectiveDougong:'passed',roofNormals:'passed'};
}
console.log(JSON.stringify(verifyGeometry(),null,2));
