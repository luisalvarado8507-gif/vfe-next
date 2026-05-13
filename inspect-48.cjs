const fs=require("fs"),path=require("path");
fs.readFileSync(path.join(__dirname,".env.local"),"utf8").split("\n").forEach(l=>{const m=l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);if(m){let v=m[2].trim();if(v.startsWith(`"`)&&v.endsWith(`"`))v=v.slice(1,-1);process.env[m[1]]=v;}});
const admin=require("firebase-admin");
if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert({projectId:process.env.FIREBASE_PROJECT_ID,clientEmail:process.env.FIREBASE_CLIENT_EMAIL,privateKey:process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,"\n")})});
(async()=>{
  const snap=await admin.firestore().collection("medicamentos").where("estado","==","autorizado").get();
  console.log("Total:",snap.size);
  snap.forEach(d=>{
    const top=d.data(); const data=top.data||{};
    const vtmTop=top.vtm||"(vacio)"; const vtmNested=data.vtm||"(vacio)";
    const flag=vtmTop!==vtmNested?" DESFASE":"";
    console.log(`${d.id.slice(-8)} | top="${vtmTop.slice(0,30)}" | nested="${vtmNested.slice(0,30)}" | atc=${data.atc||""}${flag}`);
  });
  process.exit(0);
})();
