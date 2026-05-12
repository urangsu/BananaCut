const fs=require('fs'); 
for (const f of ['public/images/og-image.png','public/images/twitter-image.png']) {
  const b=fs.readFileSync(f); 
  console.log(f, [...b.slice(0,8)].map(x=>x.toString(16).padStart(2,'0')).join(' ')); 
  if (b[0]!==0x89 || b[1]!==0x50 || b[2]!==0x4e || b[3]!==0x47 || b[4]!==0x0d || b[5]!==0x0a || b[6]!==0x1a || b[7]!==0x0a) process.exit(1); 
}
