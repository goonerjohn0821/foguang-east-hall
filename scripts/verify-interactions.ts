/** DOM and Three.js logic checks, without WebGL rendering or a browser layout engine. */
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {FoguangTemple} from '../src/buildings/FoguangTemple';
import {TempleView} from '../src/view';
import {resizeViewport} from '../src/viewport';
import {createUI} from '../src/ui';
import {registerViewerTools} from '../src/webmcp';
import type {Materials} from '../src/materials';
import type {SceneController} from '../src/scene';

const dom=new Window({url:'http://localhost/'});
for(const key of ['window','document','navigator','HTMLElement','Element','Event','PointerEvent','KeyboardEvent','WheelEvent','AbortController'])Object.defineProperty(globalThis,key,{configurable:true,value:key==='window'?dom:(dom as any)[key]});
Object.defineProperty(globalThis,'requestAnimationFrame',{configurable:true,value:dom.requestAnimationFrame.bind(dom)});
const app=document.createElement('div'),canvas=document.createElement('canvas');document.body.append(app);app.append(canvas);
let width=1200,height=800;
Object.defineProperties(canvas,{clientWidth:{get:()=>width},clientHeight:{get:()=>height}});
canvas.getBoundingClientRect=()=>({left:0,top:0,right:width,bottom:height,x:0,y:0,width,height,toJSON(){return {};}});
// DOM simulation has no physical pointer capture; model the capture state only.
const captured=new Set<number>();
canvas.setPointerCapture=id=>{captured.add(id);};canvas.releasePointerCapture=id=>{captured.delete(id);};canvas.hasPointerCapture=id=>captured.has(id);
const names=['column','beam','fang','dougong','purlin','rafter','door','tile','ridge','stone','plaster','paving','earth','bark','leaves','grass','dark','metal'];
// Texture pixels and shader compilation are intentionally outside these tests.
const materials=Object.fromEntries(names.map(key=>[key,new THREE.MeshStandardMaterial({color:0x705034})])) as Materials;
const temple=new FoguangTemple(materials),camera=new THREE.PerspectiveCamera(42,width/height,.25,600);camera.position.set(42,20,57);
const controls=new OrbitControls(camera,canvas),view=new TempleView(camera,controls,()=>width);
const controller={camera,controls,temple,renderer:{domElement:canvas,info:{render:{calls:0,triangles:0}}},ao:{enabled:true},
  home:(exploded=false)=>view.home(exploded),focus:(p:THREE.Vector3,t:THREE.Vector3)=>view.focus(p,t),
  setAuto:(on:boolean)=>view.setAuto(on),get auto(){return view.auto;},get orbiting(){return view.orbiting;},
  setInteractionHandler:(fn:()=>void)=>view.setInteractionHandler(fn)
} as unknown as SceneController;
const ui=createUI(app,controller);
function advance(seconds:number){for(let i=0;i<Math.ceil(seconds*60);i++){ui.update(1/60);temple.update(1/60);view.update(1/60);}temple.group.updateMatrixWorld(true);camera.updateMatrixWorld(true);}
function el<T extends HTMLElement=HTMLElement>(id:string){return app.querySelector<T>('#'+id)!;}
function click(id:string){el(id).click();}
function pointer(type:string,x:number,y:number,button=0,buttons=type==='pointerup'?0:1,id=1,primary=true){canvas.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'mouse',isPrimary:primary,pointerId:id,clientX:x,clientY:y,pageX:x,pageY:y,button,buttons}));}
function drag(button=0){pointer('pointerdown',600,400,button,button===2?2:1);pointer('pointermove',710,450,button,button===2?2:1);pointer('pointerup',710,450,button);}
function reset(){ui.assemble();view.setAuto(false);el('knowledge').hidden=true;el<HTMLDialogElement>('about-dialog').close();advance(5);}
const results:{name:string;status:string;error?:string}[]=[];
async function test(name:string,fn:()=>void|Promise<void>){try{reset();await fn();results.push({name,status:'passed'});}catch(error){results.push({name,status:'failed',error:String(error)});}}

await test('真实页面按钮：完整拆解、重组与中途反向',()=>{
  click('explode');advance(4.5);assert(temple.explosion.progress>.999);assert(!temple.explosion.restored);assert.equal(el('explode').getAttribute('aria-pressed'),'true');
  click('assemble');advance(4.5);assert(temple.explosion.restored);
  click('explode');advance(.9);assert(temple.explosion.progress>0);click('assemble');advance(4.5);assert(temple.explosion.restored);
});
await test('结构模式：屋面透明、梁柱着色、图例和退出恢复',()=>{
  const initial=materials.column.color.clone();click('structure');advance(2);
  assert(!el('legend').hidden);assert(temple.roofMaterials.every(m=>m.transparent&&m.opacity<.11&&!m.depthWrite));assert(!materials.column.color.equals(initial));
  click('structure');advance(3);assert(el('legend').hidden);assert(temple.roofMaterials.every(m=>!m.transparent&&m.opacity>.999&&m.depthWrite));assert(materials.column.color.toArray().every((c,i)=>Math.abs(c-initial.toArray()[i])<1e-5));
});
await test('37 秒六段演示：斗拱独立分离、完整拆解和最终复位',()=>{
  click('demo');assert(ui.demo.active);assert.equal(ui.demo.chapter,0);
  advance(6.1);assert.equal(ui.demo.chapter,1);assert(!el('legend').hidden);
  advance(6);assert.equal(ui.demo.chapter,2);
  advance(10.4);assert.equal(ui.demo.chapter,3);
  assert(temple.explosion.parts.filter(p=>p.kind==='dougong').every(p=>p.object.position.distanceTo(p.position)>1));
  assert(temple.explosion.parts.filter(p=>p.kind!=='dougong').every(p=>p.object.position.equals(p.position)));
  advance(6);assert.equal(ui.demo.chapter,4);assert(temple.explosion.progress>.99);
  advance(3);assert.equal(ui.demo.chapter,5);
  advance(6);assert(!ui.demo.active);assert(el('demo-panel').hidden);assert(temple.explosion.restored);assert.equal(el('structure').getAttribute('aria-pressed'),'false');
});
await test('OrbitControls：鼠标旋转、右键平移和滚轮缩放',()=>{
  const initial=camera.position.clone();drag();advance(1);assert(camera.position.distanceTo(initial)>1);
  const target=controls.target.clone();drag(2);advance(1);assert(controls.target.distanceTo(target)>.1);
  const distance=camera.position.distanceTo(controls.target);canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:100,clientX:600,clientY:400,bubbles:true,cancelable:true}));advance(1);assert(camera.position.distanceTo(controls.target)>distance);
});
await test('自动环绕：输入暂停，松手 4 秒后恢复',()=>{
  click('orbit');advance(.2);assert(view.orbiting);const before=camera.position.clone();advance(.5);assert(camera.position.distanceTo(before)>.01);
  pointer('pointerdown',600,400);pointer('pointermove',640,420);advance(.2);assert(!view.orbiting);
  pointer('pointerup',640,420);advance(3.8);assert(!view.orbiting);advance(.3);assert(view.orbiting);
});
await test('手动相机输入中断自动演示',()=>{click('demo');advance(8);drag();assert(!ui.demo.active);assert(el('demo-panel').hidden);});
await test('知识卡片：图例点击、靠近观察与关闭',()=>{
  click('structure');(app.querySelector('[data-kind="dougong"]') as HTMLButtonElement).click();assert(!el('knowledge').hidden);assert(el('card-title').textContent?.includes('斗拱'));
  click('focus-part');advance(5);assert(camera.position.distanceTo(new THREE.Vector3(12,12,23))<.05);click('close-card');assert(el('knowledge').hidden);
});
function roofScreenPoint(){camera.updateMatrixWorld(true);const p=new THREE.Vector3(0,12,5).project(camera);return [(p.x+1)/2*width,(1-p.y)/2*height];}
await test('实际几何 Raycaster：单击构件打开卡片',()=>{
  const [x,y]=roofScreenPoint();pointer('pointerdown',x,y);pointer('pointerup',x,y);assert(!el('knowledge').hidden);
});
await test('右键平移结束不会误开知识卡片',()=>{
  const [x,y]=roofScreenPoint();pointer('pointerdown',x,y,2,2);pointer('pointerup',x,y,2);assert(el('knowledge').hidden);
});
await test('拖动离开又回到起点不会误判为单击',()=>{
  controls.enabled=false;const [x,y]=roofScreenPoint();pointer('pointerdown',x,y);pointer('pointermove',x+30,y);pointer('pointermove',x,y);pointer('pointerup',x,y);controls.enabled=true;assert(el('knowledge').hidden);
});
await test('取消触点后不会触发构件单击',()=>{
  const [x,y]=roofScreenPoint();pointer('pointerdown',x,y);pointer('pointercancel',x,y);pointer('pointerup',x,y);assert(el('knowledge').hidden);
});
await test('步行：键盘移动、碰撞边界、失焦停止和退出',()=>{
  click('walk');assert(ui.walk.active);assert(!controls.enabled);
  document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true,cancelable:true}));advance(1);assert(camera.position.z<26);
  advance(8);assert(camera.position.z>=10.1);assert(camera.position.y>3);
  window.dispatchEvent(new Event('blur'));assert.equal(ui.walk.keys.size,0);
  document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));advance(5);assert(!ui.walk.active);assert(controls.enabled);assert(el('walk-pad').hidden);
});
await test('步行说明弹窗不会保留移动按键',()=>{
  click('walk');document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true}));click('about');const before=camera.position.clone();advance(1);assert.equal(ui.walk.keys.size,0);assert.equal(camera.position.z,before.z);click('close-about');
});
await test('步行拖动退出重进后不残留上一次触点',()=>{
  click('walk');pointer('pointerdown',600,400);click('walk');click('walk');advance(.1);const initial=camera.quaternion.clone();pointer('pointermove',700,440);advance(.1);assert(camera.quaternion.angleTo(initial)<1e-6);pointer('pointerup',700,440);
});
await test('DPR 降级及尺寸变化同步真实 EffectComposer 缓冲区',()=>{
  let pixelRatio=2,w=1200,h=800;
  const adapter={getPixelRatio:()=>pixelRatio,getSize:(v:THREE.Vector2)=>v.set(w,h),setPixelRatio:(r:number)=>{pixelRatio=r;},setSize:(a:number,b:number)=>{w=a;h=b;}};
  const composer=new EffectComposer(adapter as unknown as THREE.WebGLRenderer);
  resizeViewport(camera,adapter,composer,1200,800,1.25);assert.equal(composer.renderTarget1.width,1500);assert.equal(composer.renderTarget2.height,1000);
  resizeViewport(camera,adapter,composer,390,844,2);assert.equal(camera.aspect,390/844);assert.equal(composer.renderTarget1.width,780);assert.equal(composer.renderTarget2.height,1688);
  resizeViewport(camera,adapter,composer,0,0,1);assert(Number.isFinite(camera.aspect));assert.equal(composer.renderTarget1.width,1);composer.dispose();
  camera.aspect=width/height;camera.updateProjectionMatrix();
});
await test('全屏不支持时显示可理解的提示',()=>{click('fullscreen');assert(el('toast').textContent?.includes('不支持全屏'));});
await test('结构化工具：即时状态、参数拒绝与注销',async()=>{
  const tools=new Map<string,any>();let lifecycle:AbortSignal|undefined;
  (document as any).modelContext={registerTool(tool:any,options:{signal:AbortSignal}){tools.set(tool.name,tool);lifecycle=options.signal;}};
  const unregister=registerViewerTools(app,ui);assert.equal(tools.size,3);
  try{
    const read=tools.get('read_temple_view');assert.throws(()=>read.execute([]));assert.throws(()=>read.execute({extra:true}));
    await tools.get('set_temple_view').execute({mode:'structure'});const state=read.execute({});assert.equal(state.mode,'structure');assert.equal(typeof state.restored,'boolean');assert(Array.isArray(state.camera));
    const before=JSON.stringify(state);await assert.rejects(async()=>tools.get('set_temple_view').execute({mode:'invalid'}));assert.equal(JSON.stringify(read.execute({})),before);
    tools.get('show_component_card').execute({kind:'column'});assert(!el('knowledge').hidden);assert(el('card-title').textContent?.includes('柱'));
  }finally{unregister();assert(lifecycle?.aborted);delete (document as any).modelContext;}
});

ui.dispose();view.dispose();controls.dispose();temple.dispose();dom.happyDOM.abort();
console.log(JSON.stringify({suite:'DOM + actual Three.js objects (no WebGL)',results},null,2));
if(results.some(r=>r.status==='failed'))process.exitCode=1;
