import * as THREE from 'three';
import type {Materials} from '../materials';
import {structureColors} from '../materials';
import {Explosion,smooth} from '../explosion';
import {buildFoundation} from './Foundation';
import {buildTimberFrame} from './TimberFrame';
import {buildDougong} from './Dougong';
import {buildRoof} from './Roof';
import {buildFacade} from './Facade';
export class FoguangTemple {
  group=new THREE.Group();explosion=new Explosion();roofMaterials:THREE.MeshStandardMaterial[];pickables:THREE.Object3D[]=[];
  private structureAmount=0;private structureTarget=0;private originals=new Map<THREE.MeshStandardMaterial,THREE.Color>();
  constructor(public materials:Materials){
    this.group.name='佛光寺东大殿';
    buildFoundation(this.group,materials,this.explosion);buildTimberFrame(this.group,materials,this.explosion);buildDougong(this.group,materials,this.explosion);buildFacade(this.group,materials,this.explosion);this.roofMaterials=buildRoof(this.group,materials,this.explosion);
    Object.entries(structureColors).forEach(([key])=>{const mat=materials[key as keyof Materials];this.originals.set(mat,mat.color.clone());});
    this.group.traverse(o=>{if(o instanceof THREE.Mesh&&o.userData.kind)this.pickables.push(o);});
  }
  setStructure(on:boolean){this.structureTarget=on?1:0;}
  update(dt:number){
    this.explosion.update(dt);this.structureAmount=THREE.MathUtils.damp(this.structureAmount,this.structureTarget,5,dt);const amount=smooth(this.structureAmount);
    this.roofMaterials.forEach((m,index)=>{if(m.transparent!==(amount>.002)){m.transparent=amount>.002;m.needsUpdate=true;}m.opacity=1-amount*(index===0?.992:.93);m.depthWrite=amount<.15;});
    for(let key of ['plaster','door','dark'] as const){const mat=this.materials[key];if(mat.transparent!==(amount>.002)){mat.transparent=amount>.002;mat.needsUpdate=true;}mat.opacity=1-amount*.9;mat.depthWrite=amount<.15;}
    Object.entries(structureColors).forEach(([key,color])=>{const mat=this.materials[key as keyof Materials];mat.color.copy(this.originals.get(mat)!).lerp(new THREE.Color(color),amount*.7);mat.emissive.setHex(color).multiplyScalar(amount*.1);});
    this.group.traverse(o=>{if(o instanceof THREE.Mesh&&['roof','ridge','wall','window'].includes(o.userData.kind))o.castShadow=amount<.15;});
  }
  dispose(){const g=new Set<THREE.BufferGeometry>(),m=new Set<THREE.Material>(),t=new Set<THREE.Texture>();this.group.traverse(o=>{if(o instanceof THREE.Mesh){g.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(mat=>m.add(mat));}});g.forEach(x=>x.dispose());m.forEach(x=>{for(const value of Object.values(x))if(value instanceof THREE.Texture)t.add(value);x.dispose();});t.forEach(x=>x.dispose());}
}
