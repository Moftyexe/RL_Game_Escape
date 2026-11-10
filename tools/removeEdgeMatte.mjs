// Remove only edge-connected near-black matte from an inspected opaque source.
// Interior dark clothing/hair is retained; never use global black transparency.
export function removeEdgeMatte(data, width, height, tolerance = 8) {
    const seen = new Uint8Array(width * height), queue = new Int32Array(seen.length);
    let head=0,tail=0;
    const add = p => {
        if(seen[p])return;seen[p]=1;
        const i=p*4;
        if(Math.max(data[i],data[i+1],data[i+2])<=tolerance){queue[tail++]=p;data[i+3]=0;}
    };
    for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}
    for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
    while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);if(x)add(p-1);if(x+1<width)add(p+1);if(y)add(p-width);if(y+1<height)add(p+width);}
    return tail;
}
