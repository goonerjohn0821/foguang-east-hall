import * as THREE from 'three';
import type {SceneController} from './scene';
import {v} from './geometry';
import {HALF_WIDTH,HALF_DEPTH} from './buildings/config';
import {platformHeight} from './environment/Visitors';
import {AUXILIARY} from './environment/layout';
export class Walkthrough {
  active=false;
  keys=new Set<string>();
  private yaw=0;
  private pitch=0;
  private pointer:{id:number;x:number;y:number}|null=null;
  private cleanup:(()=>void)[]=[];
  constructor(private scene:SceneController){
    const canvas=scene.renderer.domElement;
    const down=(event:PointerEvent)=>{
      if(!this.active||event.button!==0||event.isPrimary===false)return;
      this.pointer={id:event.pointerId,x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);
    };
    const move=(event:PointerEvent)=>{
      if(!this.active||!this.pointer||event.pointerId!==this.pointer.id)return;
      this.yaw-=(event.clientX-this.pointer.x)*.004;
      this.pitch=THREE.MathUtils.clamp(this.pitch-(event.clientY-this.pointer.y)*.003,-.75,.9);
      this.pointer={id:event.pointerId,x:event.clientX,y:event.clientY};
    };
    const up=(event:PointerEvent)=>{if(event.pointerId===this.pointer?.id)this.pointer=null;};
    const keydown=(event:KeyboardEvent)=>{
      if(!this.active||!['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright','shift'].includes(event.key.toLowerCase()))return;
      if(document.querySelector('dialog[open]')||(event.target instanceof Element&&event.target.closest('input,textarea,select,[contenteditable]')))return;
      event.preventDefault();this.keys.add(event.key.toLowerCase());
    };
    const keyup=(event:KeyboardEvent)=>{this.keys.delete(event.key.toLowerCase());};
    const blur=()=>this.clearInput();
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
    this.cleanup.push(()=>{
      canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('lostpointercapture',up);
      window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);
    });
  }
  clearInput(){
    this.keys.clear();
    const id=this.pointer?.id;this.pointer=null;
    const canvas=this.scene.renderer.domElement;
    if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
  }
  toggle(on:boolean){this.clearInput();this.active=on;this.scene.controls.enabled=!on;if(on){this.scene.setAuto(false);this.scene.camera.position.set(0,1.72,29);this.yaw=0;this.pitch=.1;}else{this.scene.controls.target.set(0,7,0);this.scene.home();}}
  update(dt:number){if(!this.active)return;const x=(this.keys.has('d')||this.keys.has('arrowright')?1:0)-(this.keys.has('a')||this.keys.has('arrowleft')?1:0),z=(this.keys.has('s')||this.keys.has('arrowdown')?1:0)-(this.keys.has('w')||this.keys.has('arrowup')?1:0);const next=this.scene.camera.position.clone();
    if(x||z){const delta=v(x,0,z).normalize().applyAxisAngle(v(0,1,0),this.yaw).multiplyScalar(dt*(this.keys.has('shift')?6:3.8));next.add(delta);next.x=THREE.MathUtils.clamp(next.x,-41.9,41.9);next.z=THREE.MathUtils.clamp(next.z,-28.8,42);
      const insideHall=Math.abs(next.x)<HALF_WIDTH+.55&&Math.abs(next.z)<HALF_DEPTH+.55;
      const insideAux=Math.abs(next.x-AUXILIARY.x)<AUXILIARY.halfDepth+.4&&Math.abs(next.z-AUXILIARY.z)<AUXILIARY.halfWidth+.4;
      const insideWestAux=next.x<-34&&next.z>-15.5&&next.z<-2.5;
      if(!insideHall&&!insideAux&&!insideWestAux){this.scene.camera.position.x=next.x;this.scene.camera.position.z=next.z;}}
    const p=this.scene.camera.position;p.y=THREE.MathUtils.damp(p.y,platformHeight(p.x,p.z)+1.72,9,dt);this.scene.camera.rotation.set(this.pitch,this.yaw,0,'YXZ');
  }
  dispose(){this.clearInput();this.cleanup.forEach(fn=>fn());}
}
