import * as THREE from 'three';
export type PartKind = 'ridge'|'roof'|'rafter'|'purlin'|'frame'|'dougong'|'wall'|'column'|'base'|'foundation';
export interface Explodable {object:THREE.Group; kind:PartKind; offset:THREE.Vector3; delay:number; position:THREE.Vector3;quaternion:THREE.Quaternion;scale:THREE.Vector3;}
export const smooth=(t:number)=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
export class Explosion {
  parts:Explodable[]=[];progress=0;target=0;private elapsed=0;private from:number[]=[];private amounts:number[]=[];private goals:number[]=[];moving=false;
  register(object:THREE.Group,kind:PartKind,offset:THREE.Vector3,order:number,index=0){this.parts.push({object,kind,offset,delay:order*.085+(index%3)*.06,position:object.position.clone(),quaternion:object.quaternion.clone(),scale:object.scale.clone()});this.amounts.push(0);}
  to(value:number,only?:PartKind[]){this.target=THREE.MathUtils.clamp(value,0,1);this.goals=this.parts.map(p=>!only||only.includes(p.kind)?this.target:0);this.elapsed=0;this.from=[...this.amounts];this.moving=true;}
  update(dt:number){if(!this.moving)return;this.elapsed+=dt;let complete=true;this.parts.forEach((p,i)=>{const goal=this.goals[i];const delay=goal>this.from[i]?p.delay:.78-p.delay;const t=smooth((this.elapsed-Math.max(0,delay))/3.15);const amount=THREE.MathUtils.lerp(this.from[i],goal,t);this.amounts[i]=amount;this.apply(p,amount);if(t<1)complete=false;});this.progress=this.amounts.reduce((a,b)=>a+b,0)/this.amounts.length;if(complete)this.moving=false;}
  private apply(p:Explodable,amount:number){p.object.position.copy(p.position).addScaledVector(p.offset,amount);p.object.quaternion.copy(p.quaternion);p.object.scale.copy(p.scale);}
  reset(){this.to(0);}
  get restored(){return this.parts.every(p=>p.object.position.distanceTo(p.position)<1e-8&&p.object.quaternion.equals(p.quaternion)&&p.object.scale.distanceTo(p.scale)<1e-8);}
}
