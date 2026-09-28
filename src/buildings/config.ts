/** Metres; proportional reconstruction from the three supplied reference batches.
 * Column axes, platform edges and roof edges are deliberately separate datums.
 * These rounded dimensions are not a conservation survey. Front faces +Z.
 */
export const BAY_WIDTHS=[4.45,5.05,5.05,5.05,5.05,5.05,4.45];
export const HALF_WIDTH=BAY_WIDTHS.reduce((a,b)=>a+b,0)/2;
export const HALF_DEPTH=8.83;
export const X=[-HALF_WIDTH];
for(const width of BAY_WIDTHS)X.push(X[X.length-1]+width);
export const Z=[-HALF_DEPTH,-HALF_DEPTH/2,0,HALF_DEPTH/2,HALF_DEPTH];
export const FLOOR=.72,COLUMN_TOP=6.15,BASE_HEIGHT=.22;
export const PLATFORM={halfX:19.15,halfZ:10.85,stairWidth:5.4,steps:4,tread:.38};
export const ROOF={halfX:20.85,halfZ:12.66,ridgeHalf:8.4,ridgeY:13.95,eaveY:8.8};
export const FRONT_BAYS=BAY_WIDTHS.map((width,index)=>({index,width,center:(X[index]+X[index+1])/2,door:index>0&&index<6}));
export interface ColumnPosition{x:number;z:number;interior:boolean;}
export const columns:ColumnPosition[]=[];
X.forEach(x=>{columns.push({x,z:-HALF_DEPTH,interior:false},{x,z:HALF_DEPTH,interior:false});});
Z.slice(1,-1).forEach(z=>{columns.push({x:-HALF_WIDTH,z,interior:false},{x:HALF_WIDTH,z,interior:false});});
X.slice(1,-1).forEach(x=>{columns.push({x,z:-HALF_DEPTH/2,interior:true},{x,z:HALF_DEPTH/2,interior:true});});
columns.push({x:X[1],z:0,interior:true},{x:X[6],z:0,interior:true});
