export const X=[-17,-12.3,-7.5,-2.6,2.6,7.5,12.3,17];
export const Z=[-8.85,-4.425,0,4.425,8.85];
export const FLOOR=2.15,COLUMN_TOP=7.55;
export interface ColumnPosition{x:number;z:number;interior:boolean;}
export const columns:ColumnPosition[]=[];
X.forEach(x=>{columns.push({x,z:-8.85,interior:false},{x,z:8.85,interior:false});});
Z.slice(1,-1).forEach(z=>{columns.push({x:-17,z,interior:false},{x:17,z,interior:false});});
X.slice(1,-1).forEach(x=>{columns.push({x,z:-4.425,interior:true},{x,z:4.425,interior:true});});
columns.push({x:-12.3,z:0,interior:true},{x:12.3,z:0,interior:true});
