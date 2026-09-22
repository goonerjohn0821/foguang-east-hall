import type {PerspectiveCamera,WebGLRenderer} from 'three';
import type {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';

export function resizeViewport(camera:PerspectiveCamera,renderer:Pick<WebGLRenderer,'setPixelRatio'|'setSize'>,composer:Pick<EffectComposer,'setPixelRatio'|'setSize'>,width:number,height:number,pixelRatio:number){
  const w=Math.max(1,width),h=Math.max(1,height);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(w,h);
  // EffectComposer retains its own DPR; a renderer change alone leaves its buffers oversized.
  composer.setPixelRatio(pixelRatio);
  composer.setSize(w,h);
}
