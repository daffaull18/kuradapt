/* Generator icon PNG untuk PWA (tanpa dependensi, murni Node.js) */
const zlib = require("zlib"), fs = require("fs"), path = require("path");

function crc32(buf){
  let c, t = crc32.t;
  if(!t){ t = crc32.t = new Int32Array(256);
    for(let n=0;n<256;n++){ c=n; for(let k=0;k<8;k++) c = c&1 ? 0xEDB88320 ^ (c>>>1) : c>>>1; t[n]=c; } }
  let crc = -1;
  for(let i=0;i<buf.length;i++) crc = (crc>>>8) ^ t[(crc ^ buf[i]) & 0xFF];
  return (crc ^ -1) >>> 0;
}
function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(w, h, rgba){
  const raw = Buffer.alloc((w*4+1)*h);
  for(let y=0;y<h;y++){ raw[y*(w*4+1)] = 0; rgba.copy(raw, y*(w*4+1)+1, y*w*4, (y+1)*w*4); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4);
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, {level:9})),
    chunk("IEND", Buffer.alloc(0))
  ]);
}
// titik dalam poligon (bintang 4 sudut)
function inStar(x, y, cx, cy, R, r){
  const pts = [];
  for(let k=0;k<8;k++){
    const rad = (k%2===0) ? R : r, a = -Math.PI/2 + k*Math.PI/4;
    pts.push([cx + rad*Math.cos(a), cy + rad*Math.sin(a)]);
  }
  let inside = false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const [xi,yi]=pts[i], [xj,yj]=pts[j];
    if(((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi)+xi)) inside = !inside;
  }
  return inside;
}
function render(size){
  const buf = Buffer.alloc(size*size*4);
  const bg1=[240,205,148], bg2=[201,130,63], star=[255,255,255];
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    const t = (x+y)/(size*2), i = (y*size+x)*4;
    const inS = inStar(x, y, size/2, size/2, size*0.30, size*0.115);
    const c = inS ? star : [bg1[0]+(bg2[0]-bg1[0])*t, bg1[1]+(bg2[1]-bg1[1])*t, bg1[2]+(bg2[2]-bg1[2])*t];
    buf[i]=c[0]|0; buf[i+1]=c[1]|0; buf[i+2]=c[2]|0; buf[i+3]=255;
  }
  return png(size, size, buf);
}
const dir = path.join(__dirname, "icons");
fs.mkdirSync(dir, {recursive:true});
for(const s of [192, 512]) fs.writeFileSync(path.join(dir, `icon-${s}.png`), render(s));
console.log("icon-192.png & icon-512.png dibuat");
