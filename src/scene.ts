import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {createMaterials} from './materials';
import {createEnvironment} from './environment';
import {FoguangTemple} from './buildings/FoguangTemple';
import {TempleView} from './view';
import {resizeViewport} from './viewport';
export function createScene(container:HTMLElement){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xb6ced5);scene.fog=new THREE.FogExp2(0xb7cbd0,.0035);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'default',alpha:false});renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(container.clientWidth,container.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.info.autoReset=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-label','佛光寺东大殿交互式三维场景，拖动旋转，滚轮缩放');renderer.domElement.tabIndex=0;container.appendChild(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(42,container.clientWidth/container.clientHeight,.25,600);camera.position.set(42,20,57);
  const controls=new OrbitControls(camera,renderer.domElement);const view=new TempleView(camera,controls,()=>container.clientWidth);
  const hemisphere=new THREE.HemisphereLight(0xd5e5ef,0x7e7059,1.8);scene.add(hemisphere);scene.add(new THREE.AmbientLight(0xffedd6,.32));
  const sun=new THREE.DirectionalLight(0xffebc9,3.2);sun.position.set(-30,48,30);sun.target.position.set(0,4,0);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-49,right:49,top:42,bottom:-42,near:5,far:130});sun.shadow.bias=-.0002;sun.shadow.normalBias=.035;sun.shadow.radius=3;scene.add(sun,sun.target);
  const materials=createMaterials();const temple=new FoguangTemple(materials);scene.add(temple.group);const environment=createEnvironment(scene,materials);
  const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const ao=new SSAOPass(scene,camera,container.clientWidth,container.clientHeight);ao.kernelRadius=1.4;ao.minDistance=.003;ao.maxDistance=.12;ao.enabled=container.clientWidth>1000&&(navigator.hardwareConcurrency??4)>=8;composer.addPass(ao);composer.addPass(new OutputPass());
  let maxDPR=2;
  const resize=()=>resizeViewport(camera,renderer,composer,container.clientWidth,container.clientHeight,Math.min(window.devicePixelRatio||1,maxDPR));const observer=new ResizeObserver(resize);observer.observe(container);
  let clock=0,samples=0,totalDt=0,optimized=false;
  const api={scene,renderer,camera,controls,temple,environment,ao,home:(exploded=false)=>view.home(exploded),
    setAuto:(value:boolean)=>view.setAuto(value),get auto(){return view.auto;},get orbiting(){return view.orbiting;},
    setInteractionHandler:(fn:()=>void)=>view.setInteractionHandler(fn),
    focus:(position:THREE.Vector3,target:THREE.Vector3)=>view.focus(position,target),
    update(dt:number){clock+=dt;temple.update(dt);view.update(dt);
      renderer.info.reset();composer.render();if(clock>8&&!optimized){samples++;totalDt+=dt;if(samples>=100){if(totalDt/samples>.04){ao.enabled=false;maxDPR=1.25;resize();}optimized=true;}}
    },
    dispose(){observer.disconnect();view.dispose();controls.dispose();composer.passes.forEach(pass=>pass.dispose());composer.dispose();sun.shadow.dispose();const geometries=new Set<THREE.BufferGeometry>(),mats=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();scene.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>mats.add(m));}});geometries.forEach(g=>g.dispose());mats.forEach(m=>{Object.values(m).forEach(x=>{if(x instanceof THREE.Texture)textures.add(x);});m.dispose();});textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();}
  };return api;
}
export type SceneController=ReturnType<typeof createScene>;
