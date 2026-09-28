import * as THREE from 'three';
import {smooth} from '../explosion';

/** Authored Dog.obj: Quaternius, Animal Pack Vol.2 (2017 OpenGameArt CC0 edition).
 * No generated animal primitives, rig or mesh substitution. Only normalization,
 * a restrained coat colour and rigid peeking motion are applied here.
 */
export function prepareErliang(model:THREE.Group){
  const material=new THREE.MeshStandardMaterial({color:0x62554a,roughness:.94,flatShading:true});
  model.traverse(o=>{
    if(!(o instanceof THREE.Mesh))return;
    const original=Array.isArray(o.material)?o.material:[o.material];original.forEach(m=>m.dispose());
    o.material=material;o.castShadow=true;o.receiveShadow=true;
    o.geometry.translate(0,.095376,.35);o.geometry.rotateY(-Math.PI/2);
    o.userData.kind='erliang';
  });
  model.scale.setScalar(.13);model.name='二亮（授权低面数狗模型）';return model;
}
/** A quiet 29-second cycle: 18 seconds absent, gentle emergence, brief stay. */
export function peekAmount(seconds:number){
  const phase=((seconds%29)+29)%29;
  if(phase<18||phase>=24)return 0;
  if(phase<19.3)return smooth((phase-18)/1.3);
  if(phase<22.4)return 1;
  return 1-smooth((phase-22.4)/1.6);
}
export function poseErliang(model:THREE.Group,amount:number,seconds=0){
  model.visible=amount>.001;model.position.z=-.58*(1-amount);
  model.rotation.y=Math.sin(seconds*1.4)*.035*amount;
}
export class ErliangPeek{
  private clock=10;private model:THREE.Group|null=null;private disposed=false;
  private abort=new AbortController();private world=new THREE.Vector3();
  constructor(private anchor:THREE.Group){}
  async load(){
    try{
      const [{OBJLoader},response]=await Promise.all([
        import('three/addons/loaders/OBJLoader.js'),
        fetch(`${import.meta.env.BASE_URL}models/erliang-dog.obj`,{signal:this.abort.signal})
      ]);
      if(!response.ok)throw new Error(`Dog asset: HTTP ${response.status}`);
      const source=await response.text();if(this.disposed)return;
      this.model=prepareErliang(new OBJLoader().parse(source));this.anchor.add(this.model);
      poseErliang(this.model,0);this.anchor.userData.assetStatus='loaded';
    }catch(error){
      if(this.disposed)return;
      this.anchor.userData.assetStatus='unavailable';
      console.warn('二亮模型暂未加载；门与真实洞口仍然可用。',error);
    }
  }
  update(dt:number,camera:THREE.Vector3){
    this.clock+=dt;if(!this.model)return;
    this.anchor.getWorldPosition(this.world);
    poseErliang(this.model,this.world.distanceToSquared(camera)<32*32?peekAmount(this.clock):0,this.clock);
  }
  dispose(){
    this.disposed=true;this.abort.abort();if(!this.model)return;
    const materials=new Set<THREE.Material>();
    this.model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});
    materials.forEach(m=>m.dispose());this.model.removeFromParent();this.model=null;
  }
}
