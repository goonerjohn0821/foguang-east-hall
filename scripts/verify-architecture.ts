/** Actual model geometry checks, with a no-pixel canvas stub; not a WebGL/FPS test. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import type {Materials} from '../src/materials';
import {FoguangTemple} from '../src/buildings/FoguangTemple';
import {BAY_WIDTHS,FRONT_BAYS,columns,FLOOR,HALF_DEPTH,HALF_WIDTH,ROOF} from '../src/buildings/config';
import {roofPoint,roofLaneStart,roofLanePoint} from '../src/buildings/Roof';
import {createEnvironment} from '../src/environment';
import {AUXILIARY,LEFT_AUXILIARY,COURT,ERLIANG_GATE} from '../src/environment/layout';
import {VISITORS,platformHeight} from '../src/environment/Visitors';
import {prepareErliang,poseErliang,peekAmount} from '../src/environment/Erliang';

const context=new Proxy({},{get:()=>()=>{},set:()=>true});
Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({width:0,height:0,getContext:()=>context})}});
const names=['column','beam','fang','dougong','purlin','rafter','door','wallRed','tile','ridge','stone','plaster','paving','earth','bark','leaves','grass','dark','metal'];
const materials=Object.fromEntries(names.map(key=>[key,new THREE.MeshStandardMaterial()])) as Materials;
const scene=new THREE.Scene(),temple=new FoguangTemple(materials);scene.add(temple.group);
const environment=createEnvironment(scene,materials);scene.updateMatrixWorld(true);
const results:{name:string;status:string}[]=[];
function test(name:string,fn:()=>void){fn();results.push({name,status:'passed'});}

test('七开间、五板门两直棂窗、22 外柱 + 14 内柱',()=>{
  assert.equal(FRONT_BAYS.length,7);assert.equal(FRONT_BAYS.filter(b=>b.door).length,5);
  assert(FRONT_BAYS.slice(1,6).every(b=>b.door));assert(!FRONT_BAYS[0].door&&!FRONT_BAYS[6].door);
  assert(BAY_WIDTHS[0]<BAY_WIDTHS[1]&&BAY_WIDTHS[6]<BAY_WIDTHS[5]);
  assert.equal(columns.filter(c=>!c.interior).length,22);assert.equal(columns.filter(c=>c.interior).length,14);
  assert(Math.abs(HALF_WIDTH*2-34.15)<1e-8);assert(ROOF.halfZ-HALF_DEPTH>3.7);
});
test('瓦垄沿固定平面轴线铺设，止于四坡交界',()=>{
  for(let face=0;face<4;face++)for(const lateral of [-.8,0,.8].map(u=>u*(face<2?ROOF.halfX:ROOF.halfZ))){
    const start=roofLaneStart(face,lateral);
    for(let j=0;j<=10;j++){
      const p=roofLanePoint(face,lateral,start+(1-start)*j/10);
      assert(Math.abs((face<2?p.x:p.z)-lateral)<1e-7);
    }
  }
});
test('柱头、补间、转角、内槽四种样板，13 个实例化批次',()=>{
  assert.deepEqual(temple.group.userData.brackets,{columnHead:18,corner:4,intercolumn:22,inner:14,courses:7});
  const sets:THREE.InstancedMesh[]=[];
  temple.group.traverse(o=>{if(o instanceof THREE.InstancedMesh&&o.userData.kind==='dougong')sets.push(o);});
  assert.equal(sets.length,13);assert.equal(new Set(sets.map(s=>s.geometry)).size,4);
  assert.equal(sets.reduce((n,s)=>n+s.count,0),58);
});

let maxPenetration=-Infinity,checkedTimberVertices=0;
test('梁、昂尾、檩、椽没有穿出瓦面（容差 2 cm）',()=>{
  const kinds=new Set(['beam','frame','dougong','purlin','rafter']);
  const p=new THREE.Vector3(),im=new THREE.Matrix4(),matrix=new THREE.Matrix4();
  temple.group.traverse(o=>{
    if(!(o instanceof THREE.Mesh)||!kinds.has(o.userData.kind))return;
    const attr=o.geometry.getAttribute('position');
    for(let instance=0;instance<(o instanceof THREE.InstancedMesh?o.count:1);instance++){
      if(o instanceof THREE.InstancedMesh)o.getMatrixAt(instance,im);else im.identity();
      matrix.multiplyMatrices(o.matrixWorld,im);
      for(let i=0;i<attr.count;i++){
        p.fromBufferAttribute(attr,i).applyMatrix4(matrix);
        if(Math.abs(p.x)>ROOF.halfX-.25||Math.abs(p.z)>ROOF.halfZ-.25)continue;
        const tz=Math.abs(p.z)/ROOF.halfZ,tx=(Math.abs(p.x)-ROOF.ridgeHalf)/(ROOF.halfX-ROOF.ridgeHalf),t=Math.max(tz,tx);
        const front=tz>=tx,u=front?p.x/(ROOF.ridgeHalf+(ROOF.halfX-ROOF.ridgeHalf)*t):p.z/(ROOF.halfZ*t);
        const roofY=roofPoint(front?(p.z>=0?0:1):(p.x>=0?2:3),Number.isFinite(u)?u:0,t).y;
        const delta=p.y-roofY;maxPenetration=Math.max(maxPenetration,delta);checkedTimberVertices++;
        assert(delta<.02,`${o.userData.kind} penetrates roof by ${delta.toFixed(3)} m at ${p.toArray()}`);
      }
    }
  });
});
test('当前真实建筑 20 次拆解重组以及中途反向，所有变换精确复位',()=>{
  for(let cycle=0;cycle<20;cycle++){
    temple.explosion.to(1);for(let i=0;i<270;i++)temple.explosion.update(1/60);
    assert(temple.explosion.progress>.999);environment.update(0,temple.explosion.progress);
    assert.equal(environment.getObjectByName('尺度参照人物')!.visible,false);
    temple.explosion.to(0);for(let i=0;i<270;i++)temple.explosion.update(1/60);assert(temple.explosion.restored);
  }
  temple.explosion.to(1);for(let i=0;i<50;i++)temple.explosion.update(1/60);
  temple.explosion.to(0);for(let i=0;i<270;i++)temple.explosion.update(1/60);assert(temple.explosion.restored);
  environment.update(0,0);assert(environment.getObjectByName('尺度参照人物')!.visible);
});
test('3 人符合常人身高，脚底位于真实台基或踏步',()=>{
  assert.equal(VISITORS.length,3);
  VISITORS.forEach(p=>{assert(p.height>=1.6&&p.height<=1.85);assert(platformHeight(p.x,p.z)>0);assert(platformHeight(p.x,p.z)<=FLOOR);});
  assert.equal(platformHeight(VISITORS[2].x,VISITORS[2].z),.36);
});
test('左右小建筑复用相同模型、朝向院内；门在左墙且位于左建筑后方',()=>{
  assert(AUXILIARY.x+AUXILIARY.halfDepth<COURT.wallX);
  const facing=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),AUXILIARY.rotation);
  assert(facing.x<-.99);assert.equal(ERLIANG_GATE.x,-COURT.wallX);
  assert(LEFT_AUXILIARY.x-LEFT_AUXILIARY.halfDepth>-COURT.wallX);
  assert(new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),LEFT_AUXILIARY.rotation).x>.99);
  assert(ERLIANG_GATE.z+ERLIANG_GATE.width/2<LEFT_AUXILIARY.z-LEFT_AUXILIARY.halfWidth-1);
  assert.equal(ERLIANG_GATE.rotation,LEFT_AUXILIARY.rotation);
  const right=environment.getObjectByName('右侧小建筑 · 保持原位')!,left=environment.getObjectByName('左侧小建筑 · 复用右侧样式')!;
  assert.deepEqual(right.position.toArray(),[38.35,0,6.5]);assert.equal(right.rotation.y,-Math.PI/2);
  assert.deepEqual(left.position.toArray(),[LEFT_AUXILIARY.x,0,LEFT_AUXILIARY.z]);
  assert.equal(environment.children.filter(o=>o.name.includes('侧小建筑')).length,2);
  const meshes=(root:THREE.Object3D)=>{const list:THREE.Mesh[]=[];root.traverse(o=>{if(o instanceof THREE.Mesh)list.push(o);});return list;};
  const original=meshes(right),copy=meshes(left);assert.equal(copy.length,original.length);
  copy.forEach((mesh,i)=>{assert.equal(mesh.geometry,original[i].geometry);assert.equal(mesh.material,original[i].material);});
});
const anchor=environment.userData.erliangAnchor as THREE.Group,gate=anchor.parent!;
test('门叶和院墙均留有真实洞口，射线可穿过而旁边木板不可穿过',()=>{
  scene.updateMatrixWorld(true);
  const leaves=gate.children.filter(o=>o.name==='风化木门与真实狗洞');assert.equal(leaves.length,2);
  const wall=environment.getObjectByName('院墙 · 二亮门洞已留空')!;
  function hits(x:number,y:number){
    const start=gate.localToWorld(new THREE.Vector3(x,y,.7));
    const direction=new THREE.Vector3(0,0,-1).transformDirection(gate.matrixWorld);
    return new THREE.Raycaster(start,direction,0,1.2).intersectObjects([...leaves,wall],false);
  }
  assert.equal(hits(.12,.5).length,0);assert(hits(-.45,.5).length>0);assert(hits(.12,1.3).length>0);
  assert(new THREE.Raycaster(new THREE.Vector3(41.8,.5,24),new THREE.Vector3(1,0,0),0,2).intersectObject(wall,false).length>0,'former right-wall gate must be closed');
});
const obj=readFileSync('public/models/erliang-dog.obj','utf8');
const dog=prepareErliang(new OBJLoader().parse(obj));anchor.add(dog);poseErliang(dog,1);
test('授权狗模型足够轻量，尺寸适合洞口且身体大部在门后',()=>{
  assert(Buffer.byteLength(obj)<40000);assert(readFileSync('public/models/LICENSE-erliang.txt','utf8').includes('CC0'));
  let triangles=0;dog.traverse(o=>{if(o instanceof THREE.Mesh)triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;});assert(triangles<1000);
  dog.updateMatrix();const bounds=new THREE.Box3();
  dog.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.computeBoundingBox();bounds.union(o.geometry.boundingBox!.clone().applyMatrix4(dog.matrix));}});
  assert(bounds.max.y<.65);assert(bounds.max.z+anchor.position.z>.02);assert(bounds.getCenter(new THREE.Vector3()).z+anchor.position.z<-.2);
});
test('探头进入、停留、退出周期正确，重复动作无累计偏移',()=>{
  assert.equal(peekAmount(0),0);assert.equal(peekAmount(18),0);assert(peekAmount(18.6)>0&&peekAmount(18.6)<1);
  assert.equal(peekAmount(20),1);assert(peekAmount(23)>0&&peekAmount(23)<1);assert.equal(peekAmount(25),0);assert.equal(peekAmount(49),1);
  for(let i=0;i<50;i++){poseErliang(dog,1,20);poseErliang(dog,0,25);}
  assert.equal(dog.position.z,-.58);assert(Math.abs(dog.rotation.y)<1e-10);assert.equal(dog.visible,false);poseErliang(dog,1);
});
test('结构模式不会使独立小建筑和门一起透明',()=>{
  temple.setStructure(true);for(let i=0;i<270;i++)temple.update(1/60);
  const right=environment.getObjectByName('右侧小建筑 · 保持原位')!,left=environment.getObjectByName('左侧小建筑 · 复用右侧样式')!;
  for(const group of [right,left,gate])group.traverse(o=>{if(o instanceof THREE.Mesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>assert.equal(m.opacity,1));});
  temple.setStructure(false);for(let i=0;i<270;i++)temple.update(1/60);
});
scene.updateMatrixWorld(true);
let meshes=0,instances=0,triangles=0;
scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;const count=o instanceof THREE.InstancedMesh?o.count:1;instances+=count;triangles+=count*(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
test('完整场景几何预算：少于 60 万三角形 / 140 网格批次',()=>{assert(triangles<600000);assert(meshes<140);});
console.log(JSON.stringify({suite:'Actual revised architecture / environment (no WebGL)',results,checkedTimberVertices,maxPenetration,meshes,instances,triangles},null,2));
temple.dispose();
