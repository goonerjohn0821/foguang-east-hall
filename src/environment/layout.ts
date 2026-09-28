/** Aerial-reference layout: facing the hall, left is -X and behind is -Z. Not survey coordinates. */
export const COURT={wallX:43,wallBack:-30,wallFront:35,wallHeight:2.65};
export const AUXILIARY={x:38.35,z:6.5,halfWidth:7.2,halfDepth:3.05,floor:.88,rotation:-Math.PI/2};
export const LEFT_AUXILIARY={...AUXILIARY,x:-AUXILIARY.x,rotation:Math.PI/2};
export const ERLIANG_GATE={x:-COURT.wallX,z:-6,width:1.82,height:2.23,rotation:Math.PI/2,holeWidth:.40,holeHeight:.64};
