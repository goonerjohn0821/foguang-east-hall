import * as THREE from 'three';
import {Batch,boxGeometry,cylinderGeometry,v} from '../geometry';
import {FLOOR,PLATFORM} from '../buildings/config';

export const VISITORS=[
  {x:2.9,z:9.86,height:1.73,angle:-.5,shirt:0x69706b},
  {x:16.05,z:10.12,height:1.65,angle:2.3,shirt:0x988878},
  {x:-1.12,z:PLATFORM.halfZ+PLATFORM.tread*2.5,height:1.78,angle:.45,shirt:0x707d86}
];
export function platformHeight(x:number,z:number){
  if(Math.abs(x)<=PLATFORM.halfX&&Math.abs(z)<=PLATFORM.halfZ)return FLOOR;
  if(Math.abs(x)<=PLATFORM.stairWidth/2&&z>PLATFORM.halfZ&&z<PLATFORM.halfZ+PLATFORM.steps*PLATFORM.tread){
    return FLOOR/PLATFORM.steps*(PLATFORM.steps-Math.floor((z-PLATFORM.halfZ)/PLATFORM.tread));
  }return .02;
}
export function buildVisitors(parent:THREE.Object3D){
  const group=new THREE.Group();group.name='尺度参照人物';parent.add(group);
  const neutral=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.96}),skin=new THREE.MeshStandardMaterial({color:0xae8d71,roughness:1}),hairMat=new THREE.MeshStandardMaterial({color:0x3e3932,roughness:1});
  const limb=new Batch(cylinderGeometry,neutral,'visitor'),shoes=new Batch(boxGeometry,neutral,'visitor');
  const torsoGeometry=new THREE.LatheGeometry([new THREE.Vector2(.15,0),new THREE.Vector2(.17,.20),new THREE.Vector2(.215,.37),new THREE.Vector2(.15,.43),new THREE.Vector2(.07,.46)],10);
  const torso=new Batch(torsoGeometry,neutral,'visitor'),heads=new Batch(new THREE.SphereGeometry(1,12,9),skin,'visitor');
  const hair=new Batch(new THREE.SphereGeometry(1,12,7,0,Math.PI*2,0,Math.PI*.60),hairMat,'visitor');
  for(const person of VISITORS){
    const scale=person.height/1.73,base=platformHeight(person.x,person.z),q=new THREE.Quaternion().setFromAxisAngle(v(0,1,0),person.angle);
    const p=(x:number,y:number,z:number)=>v(x,y,z).multiplyScalar(scale).applyQuaternion(q).add(v(person.x,base,person.z));
    const rot=new THREE.Euler(0,person.angle,0),shirt=new THREE.Color(person.shirt),pants=new THREE.Color(0x4e514e);
    torso.add(p(0,.92,0),v(scale,scale,scale*.65),rot,shirt);
    for(const s of [-1,1]){
      const knee=p(s*.087,.49,s*.025),hip=p(s*.085,.95,0),ankle=p(s*.092,.095,s*.045);
      const first=limb.matrices.length;limb.beam(hip,knee,.078*scale,.086*scale);limb.beam(knee,ankle,.06*scale,.069*scale);limb.colors[first]=pants;limb.colors[first+1]=pants;
      shoes.add(p(s*.092,.055,.055+s*.045),v(.14*scale,.10*scale,.25*scale),rot,new THREE.Color(0x3d3c38));
      const shoulder=p(s*.195,1.29,0),elbow=p(s*.245,1.03,.025),wrist=p(s*.235,.81,.04);
      const a=limb.matrices.length;limb.beam(shoulder,elbow,.064*scale,.064*scale);limb.beam(elbow,wrist,.049*scale,.049*scale);limb.colors[a]=shirt;limb.colors[a+1]=shirt;
      heads.add(p(s*.235,.79,.04),v(.040*scale,.065*scale,.033*scale),rot);
    }
    heads.add(p(0,1.39,0),v(.052*scale,.076*scale,.051*scale),rot);
    heads.add(p(0,1.575,0),v(.102*scale,.145*scale,.113*scale),rot);
    hair.add(p(0,1.594,-.008),v(.106*scale,.136*scale,.116*scale),rot);
  }
  for(const b of [limb,shoes,torso,heads,hair])b.finish(group);
  group.userData.heights=VISITORS.map(p=>p.height);return group;
}
