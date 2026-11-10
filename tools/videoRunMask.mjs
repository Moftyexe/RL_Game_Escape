// Deterministic silhouette extraction for the inspected black-background clip.
// Edge barriers keep black outlines/clothing opaque; a black color-key cannot.
export function silhouetteMask(rgba,width,height,threshold=8){
 const n=width*height;let edge=new Uint8Array(n);
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
  const p=y*width+x;let delta=0;
  for(const offset of [-width,-1,1,width])for(let c=0;c<3;c++)delta=Math.max(delta,Math.abs(rgba[p*4+c]-rgba[(p+offset)*4+c]));
  if(delta>=threshold)edge[p]=1;
 }
 const morph=(a,dilate)=>{const b=new Uint8Array(n);for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){let v=dilate?0:1;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)v=dilate?(v|a[(y+dy)*width+x+dx]):(v&a[(y+dy)*width+x+dx]);b[y*width+x]=v;}return b;};
 for(let i=0;i<4;i++)edge=morph(edge,true);
 const outside=new Uint8Array(n),queue=new Int32Array(n);let h=0,t=0;
 const push=p=>{if(p>=0&&p<n&&!edge[p]&&!outside[p]){outside[p]=1;queue[t++]=p;}};
 for(let x=0;x<width;x++){push(x);push((height-1)*width+x);}for(let y=0;y<height;y++){push(y*width);push(y*width+width-1);}
 while(h<t){const p=queue[h++],x=p%width;if(x)push(p-1);if(x<width-1)push(p+1);push(p-width);push(p+width);}
 let mask=Uint8Array.from(outside,v=>1-v);
 for(let i=0;i<4;i++)mask=morph(mask,false);
 // Only the main silhouette; discard isolated compression/edge artifacts.
 const seen=new Uint8Array(n);let largest=[];
 for(let p=0;p<n;p++)if(mask[p]&&!seen[p]){h=0;t=1;queue[0]=p;seen[p]=1;while(h<t){const a=queue[h++],x=a%width;for(const b of [x?a-1:-1,x<width-1?a+1:-1,a-width,a+width])if(b>=0&&b<n&&mask[b]&&!seen[b]){seen[b]=1;queue[t++]=b;}}if(t>largest.length)largest=Array.from(queue.subarray(0,t));}
 mask=new Uint8Array(n);for(const p of largest)mask[p]=1;return mask;
}
