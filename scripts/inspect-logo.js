const fs = require('fs');
const zlib = require('zlib');

function getPngColorInfo(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25]; // 6 is RGBA
  
  // Extract IDAT chunks
  let pos = 8;
  const idats = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IDAT') {
      idats.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idats));
  
  // Look at some non-transparent pixels
  // Each scanline: 1 filter byte + width * 4
  const stride = 1 + width * 4;
  let whiteCount = 0;
  let redCount = 0;
  let sampleCount = 0;
  
  for (let y = Math.floor(height * 0.2); y < height * 0.8; y += 10) {
    const rowStart = y * stride + 1;
    for (let x = 0; x < width; x += 10) {
      const idx = rowStart + x * 4;
      const r = decompressed[idx];
      const g = decompressed[idx + 1];
      const b = decompressed[idx + 2];
      const a = decompressed[idx + 3];
      if (a > 100) {
        sampleCount++;
        if (r > 200 && g > 200 && b > 200) whiteCount++;
        if (r > 120 && g < 50 && b < 50) redCount++;
      }
    }
  }
  console.log(`${filePath}: width=${width}, height=${height}, samples=${sampleCount}, white=${whiteCount}, red=${redCount}`);
}

getPngColorInfo('assets/logo/logo.png');
getPngColorInfo('assets/logo/logo1.png');
getPngColorInfo('assets/logo/logo2.png');
getPngColorInfo('assets/logo/logo3.png');
