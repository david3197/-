const {onSchedule}=require("firebase-functions/v2/scheduler");
const admin=require("firebase-admin");admin.initializeApp();
const db=admin.firestore();
exports.tick=onSchedule({schedule:"0 * * * *",timeZone:"Africa/Cairo"},async()=>{
  const c=new Date(new Date().toLocaleString("en-US",{timeZone:"Africa/Cairo"}));
  const h=c.getHours(),S=(await db.doc("settings/main").get()).data()||{},tokens=S.tokens||[];
  if(!tokens.length)return;
  const send=(title,body)=>admin.messaging().sendEachForMulticast({tokens,notification:{title,body}});
  const short=n=>(n||"").trim().split(/\s+/).slice(0,2).join(" ");
  const people=(await db.collection("people").get()).docs.map(d=>d.data());
  if(h===(S.birthdayHour??8))for(const p of people){
    if(!p.birthday)continue;const b=new Date(p.birthday);
    if(b.getDate()===c.getDate()&&b.getMonth()===c.getMonth())await send("🎂 عيد ميلاد","النهارده عيد ميلاد "+short(p.name));}
  const f=S.statsFreq;
  if(f&&f!=="off"&&h===(S.statsHour??9)&&(f==="daily"||(f==="weekly"&&c.getDay()===0)||(f==="monthly"&&c.getDate()===1))){
    const m=S.statsMonths??3;
    const n=people.filter(p=>{const l=(p.confessions||[]).sort().slice(-1)[0]||p.created;return l&&(Date.now()-new Date(l))/864e5/30.44>=m}).length;
    if(n)await send("📊 المعترفين الغايبين",`${n} شخص بقالهم ${m} شهور أو أكتر`);}
  const due=await db.collection("tasks").where("done","==",false).where("notified","==",false).where("due","<=",new Date().toISOString()).get();
  for(const d of due.docs){const t=d.data();if(!t.due)continue;await send("⏰ فكرني",t.text);await d.ref.update({notified:true});}
});
