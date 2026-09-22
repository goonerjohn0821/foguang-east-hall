import * as THREE from 'three';
import type {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {v} from './geometry';

/** Renderer-independent camera behaviour, shared by the page and input checks. */
export class TempleView {
  private clock=0;
  private lastInteraction=-10;
  private interacting=false;
  private automatic=false;
  private positionTarget:THREE.Vector3|null=null;
  private viewTarget:THREE.Vector3|null=null;
  private onInteract=()=>{};
  private start=()=>{this.interacting=true;this.lastInteraction=this.clock;this.positionTarget=this.viewTarget=null;this.onInteract();};
  private end=()=>{this.interacting=false;this.lastInteraction=this.clock;};

  constructor(private camera:THREE.PerspectiveCamera,private controls:OrbitControls,private width:()=>number){
    controls.target.set(0,7,0);
    Object.assign(controls,{enableDamping:true,dampingFactor:.06,minDistance:12,maxDistance:145,maxPolarAngle:Math.PI*.482,minPolarAngle:.14,zoomSpeed:.75,rotateSpeed:.55,panSpeed:.65,screenSpacePanning:false,autoRotateSpeed:.23});
    controls.addEventListener('start',this.start);
    controls.addEventListener('end',this.end);
    this.home();
  }
  get auto(){return this.automatic;}
  get orbiting(){return this.controls.autoRotate;}
  setAuto(value:boolean){this.automatic=value;this.lastInteraction=-10;}
  setInteractionHandler(fn:()=>void){this.onInteract=fn;}
  focus(position:THREE.Vector3,target:THREE.Vector3){this.positionTarget=position.clone();this.viewTarget=target.clone();}
  home(exploded=false){
    const narrow=this.width()<700;
    this.focus(exploded?v(narrow?56:49,narrow?42:34,narrow?90:68):v(narrow?60:42,narrow?29:20,narrow?90:57),v(0,exploded?12:7,0));
  }
  update(dt:number){
    this.clock+=dt;
    const {camera,controls}=this;
    controls.autoRotate=this.automatic&&controls.enabled&&!this.interacting&&this.clock-this.lastInteraction>4&&!this.positionTarget;
    if(controls.enabled&&this.positionTarget&&this.viewTarget){
      const amount=1-Math.exp(-dt*2.25);
      camera.position.lerp(this.positionTarget,amount);
      controls.target.lerp(this.viewTarget,amount);
      if(camera.position.distanceTo(this.positionTarget)<.045){camera.position.copy(this.positionTarget);controls.target.copy(this.viewTarget);this.positionTarget=this.viewTarget=null;}
    }
    controls.target.x=THREE.MathUtils.clamp(controls.target.x,-27,27);
    controls.target.z=THREE.MathUtils.clamp(controls.target.z,-24,24);
    controls.target.y=THREE.MathUtils.clamp(controls.target.y,1,30);
    if(controls.enabled)controls.update(dt);
    if(camera.position.y<.8)camera.position.y=.8;
  }
  dispose(){this.controls.removeEventListener('start',this.start);this.controls.removeEventListener('end',this.end);}
}
