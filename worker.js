const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('passenger_request','driver_application','contact')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','driver_found','in_progress','completed','cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  passenger_name TEXT,
  passenger_mobile TEXT,
  passenger_national_id_enc TEXT,
  owner_name TEXT,
  owner_mobile TEXT,
  owner_national_id_enc TEXT,
  for_whom TEXT,
  pickup TEXT,
  car_place TEXT,
  destination TEXT,
  requested_at TEXT,
  plate TEXT,
  car_model TEXT,
  vin TEXT,
  driver_name TEXT,
  driver_mobile TEXT,
  driver_national_id_enc TEXT,
  documents_json TEXT,
  contact_name TEXT,
  contact_method TEXT,
  contact_message TEXT,
  consent_at TEXT,
  privacy_version TEXT,
  notes TEXT,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_requests_type_created ON requests(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_status_created ON requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_passenger_mobile ON requests(passenger_mobile);
CREATE INDEX IF NOT EXISTS idx_requests_driver_mobile ON requests(driver_mobile);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket_key, window_start)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

CREATE TABLE IF NOT EXISTS admin_audit (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  request_id TEXT,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit(created_at DESC);
`;

const JSON_HEADERS = { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff', 'referrer-policy':'strict-origin-when-cross-origin', 'strict-transport-security':'max-age=63072000; includeSubDomains; preload' };
function json(data, status=200, extra={}) { const h=new Headers(JSON_HEADERS); for(const [k,v] of Object.entries(extra)) h.set(k,v); return new Response(JSON.stringify(data),{status,headers:h}); }
function clean(v,max=500){return String(v??'').normalize('NFC').trim().slice(0,max)}
function digits(v){return clean(v).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)))}
function validMobile(v){return /^09\d{9}$/.test(digits(v).replace(/\s+/g,''))}
function validNational(v){const n=digits(v);if(!/^\d{10}$/.test(n)||/^([0-9])\1{9}$/.test(n))return false;let sum=0;for(let i=0;i<9;i++)sum+=Number(n[i])*(10-i);const r=sum%11;const c=Number(n[9]);return r<2?c===r:c===11-r}
function validVin(v){return /^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$/.test(clean(v))}
function validName(v){return /^[\u0600-\u06FF\u200c\sA-Za-z.\-]{2,100}$/.test(clean(v))}
function newId(prefix='DASH'){return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0,8).toUpperCase()}`}
function base64url(bytes){let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function fromBase64url(v){const b=v.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-v.length%4)%4);const s=atob(b);return Uint8Array.from(s,c=>c.charCodeAt(0))}
async function sha256(bytes){return new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))}
async function hmac(secret,text){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(text)))}
function equalBytes(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a[i]^b[i];return x===0}
async function constantTimeSecretEqual(secret,a,b){const [x,y]=await Promise.all([hmac(secret,a),hmac(secret,b)]);return equalBytes(x,y)}
async function encKey(env){if(!env.DATA_ENCRYPTION_KEY)throw new Error('DATA_ENCRYPTION_KEY missing');const raw=await sha256(new TextEncoder().encode(env.DATA_ENCRYPTION_KEY));return crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt'])}
async function encryptField(env,plaintext){const key=await encKey(env);const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(plaintext)));return `${base64url(iv)}.${base64url(ct)}`}
async function decryptField(env,packed){if(!packed)return '';const [iv,data]=String(packed).split('.');const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64url(iv)},await encKey(env),fromBase64url(data));return new TextDecoder().decode(p)}

function toHex(bytes){return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function sha256Hex(input){const bytes=typeof input==='string'?new TextEncoder().encode(input):new Uint8Array(input);return toHex(await sha256(bytes))}
async function hmacRawBytes(keyBytes,msg){const key=await crypto.subtle.importKey('raw',keyBytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',key,typeof msg==='string'?new TextEncoder().encode(msg):msg))}
function arvanConfigured(env){return !!(clean(env.ARVAN_ACCESS_KEY,200)&&clean(env.ARVAN_SECRET_KEY,200)&&clean(env.ARVAN_S3_ENDPOINT,200))}
async function s3Request(env,method,key,opts={}){
  const accessKey=clean(env.ARVAN_ACCESS_KEY,200),secretKey=clean(env.ARVAN_SECRET_KEY,200);
  const endpointHost=clean(env.ARVAN_S3_ENDPOINT,200).replace(/^https?:\/\//,'').replace(/\/$/,'');
  const bucket=clean(env.ARVAN_S3_BUCKET,100)||'dash-driver-docs';
  const region=clean(env.ARVAN_S3_REGION,60)||'ir-thr-at1';
  if(!accessKey||!secretKey||!endpointHost)throw new Error('Arvan object storage not configured');
  const host=`${bucket}.${endpointHost}`;
  const canonicalUri='/'+key.split('/').map(encodeURIComponent).join('/');
  const url=`https://${host}${canonicalUri}`;
  const now=new Date(),amzDate=now.toISOString().replace(/[:-]|\.\d{3}/g,''),dateStamp=amzDate.slice(0,8);
  const bodyBytes=opts.body?new Uint8Array(opts.body):new Uint8Array();
  const payloadHash=await sha256Hex(bodyBytes);
  const headers={host,'x-amz-content-sha256':payloadHash,'x-amz-date':amzDate};
  if(opts.contentType)headers['content-type']=opts.contentType;
  const signedKeys=Object.keys(headers).sort();
  const canonicalHeaders=signedKeys.map(k=>`${k}:${headers[k]}\n`).join('');
  const signedHeaders=signedKeys.join(';');
  const canonicalRequest=[method,canonicalUri,'',canonicalHeaders,signedHeaders,payloadHash].join('\n');
  const credentialScope=`${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign=['AWS4-HMAC-SHA256',amzDate,credentialScope,await sha256Hex(canonicalRequest)].join('\n');
  const kDate=await hmacRawBytes(new TextEncoder().encode('AWS4'+secretKey),dateStamp);
  const kRegion=await hmacRawBytes(kDate,region);
  const kService=await hmacRawBytes(kRegion,'s3');
  const kSigning=await hmacRawBytes(kService,'aws4_request');
  const signature=toHex(await hmacRawBytes(kSigning,stringToSign));
  const authorization=`AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const fetchHeaders={'x-amz-content-sha256':payloadHash,'x-amz-date':amzDate,'Authorization':authorization};
  if(opts.contentType)fetchHeaders['content-type']=opts.contentType;
  return fetch(url,{method,headers:fetchHeaders,body:method==='PUT'?bodyBytes:undefined});
}
async function s3PutObject(env,key,buffer,contentType){const r=await s3Request(env,'PUT',key,{body:buffer,contentType});if(!r.ok)throw new Error(`Arvan upload failed (${r.status})`)}
async function s3GetObject(env,key){const r=await s3Request(env,'GET',key);return r.ok?r:null}
async function s3DeleteObject(env,key){try{await s3Request(env,'DELETE',key)}catch{}}

let schemaReady=false;
async function ensureSchema(env){
  if(!env.DB) return false;
  if(schemaReady) return true;
  await env.DB.exec(SCHEMA);
  const info=await env.DB.prepare('PRAGMA table_info(requests)').all();
  const existing=new Set((info.results||[]).map(r=>r.name));
  const additions={
    requested_at:'TEXT', consent_at:'TEXT', privacy_version:'TEXT', notes:'TEXT'
  };
  for(const [name,type] of Object.entries(additions)) if(!existing.has(name)) await env.DB.prepare(`ALTER TABLE requests ADD COLUMN ${name} ${type}`).run();
  schemaReady=true;
  return true;
}
function allowedOrigins(env){return new Set([clean(env.SITE_ORIGIN||''),clean(env.SITE_ORIGIN_2||''),'https://dashh.ir','https://www.dashh.ir'].filter(Boolean).map(x=>x.replace(/\/$/,'')))}
function originAllowed(request,env){const origin=request.headers.get('Origin'); if(!origin)return true; return allowedOrigins(env).has(origin.replace(/\/$/,''))}
function browserCrossSiteBlocked(request){const s=(request.headers.get('Sec-Fetch-Site')||'').toLowerCase();return s==='cross-site'}
function noStore(){return {'Cache-Control':'private, no-store, max-age=0'}}

function notificationConfigured(env){return !!(clean(env.BALE_BOT_TOKEN,300)&&clean(env.BALE_CHAT_ID,120))}
async function notifyBale(env,text){
  if(!notificationConfigured(env)) return;
  const token=clean(env.BALE_BOT_TOKEN,300),chatId=clean(env.BALE_CHAT_ID,120);
  try{
    const r=await fetch(`https://tapi.bale.ai/bot${token}/sendMessage`,{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({chat_id:chatId,text})
    });
    const data=await r.json().catch(()=>null);
    if(!r.ok || data?.ok===false) throw new Error(`Bale notification failed (${r.status})`);
  }catch(e){console.error('dash_bale_notification_error',e?.message||e)}
}
function notifyRequest(ctx,env,text){
  if(notificationConfigured(env)) ctx.waitUntil(notifyBale(env,text));
}
function passengerNotification(f,id){
  const lines=['🔔 درخواست جدید دش','',`شناسه: ${id}`,`نوع: درخواست راننده`,`نام: ${clean(f.passengerName,100)}`,`موبایل: ${digits(f.passengerMobile)}`,`مسیر: ${clean(f.pickup,180)} ← ${clean(f.destination,180)}`,`محل خودرو: ${clean(f.carPlace,180)}`,`زمان: ${clean(f.requestedAt,80)||'تعیین نشده'}`,`خودرو: ${clean(f.carModel,120)}`,`پلاک: ${clean(f.plate,40)}`];
  if(clean(f.forWhom)==='other') lines.push(`برای: ${clean(f.ownerName,100)}`);
  return lines.join('\\n');
}
function driverNotification(f,id){return ['🚗 درخواست جدید همکاری راننده دش','',`شناسه: ${id}`,`نام: ${clean(f.driverName,100)}`,`موبایل: ${digits(f.driverMobile)}`,'مدارک راننده در پنل مدیریت ذخیره شده است.'].join('\\n')}
function contactNotification(f,id){return ['📩 پیام جدید از سایت دش','',`شناسه: ${id}`,`نام: ${clean(f.name,100)}`,`راه ارتباطی: ${clean(f.contact,100)}`,`پیام: ${clean(f.message,1800)}`].join('\\n')}


async function clientKey(request,env){
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const ua=clean(request.headers.get('User-Agent')||'',180);
  const secret=env.RATE_LIMIT_SECRET||env.ADMIN_SESSION_SECRET||env.DATA_ENCRYPTION_KEY;
  if(!secret)return 'anon';
  return base64url(await hmac(secret,`${ip}|${ua}`)).slice(0,48);
}
async function nativeRateLimit(env,binding,key){
  if(!binding||typeof binding.limit!=='function')return null;
  const result=await binding.limit({key});
  return {allowed:!!result.success,retryAfter:60};
}
async function rateLimit(request,env,bucket,limitOverride=null,windowOverride=null){
  const key=`${bucket}:${await clientKey(request,env)}`;
  const binding=bucket==='admin-login'?env.ADMIN_LOGIN_LIMITER:env.PUBLIC_WRITE_LIMITER;
  const native=await nativeRateLimit(env,binding,key);
  if(native)return native;
  if(!env.DB)return {allowed:false,retryAfter:600};
  const limit=Math.max(1,Number(limitOverride||env.RATE_LIMIT_PER_WINDOW||6));
  const windowSeconds=Math.max(60,Number(windowOverride||env.RATE_LIMIT_WINDOW_SECONDS||600));
  const now=Math.floor(Date.now()/1000), start=now-(now%windowSeconds);
  await env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now-86400).run();
  await env.DB.prepare(`INSERT INTO rate_limits(bucket_key,window_start,count) VALUES(?,?,1) ON CONFLICT(bucket_key,window_start) DO UPDATE SET count=count+1`).bind(key,start).run();
  const row=await env.DB.prepare('SELECT count FROM rate_limits WHERE bucket_key=? AND window_start=?').bind(key,start).first();
  const count=Number(row?.count||0); return {allowed:count<=limit,retryAfter:Math.max(1,start+windowSeconds-now)};
}
async function requirePublicWrite(request,env){
  if(!originAllowed(request,env)||browserCrossSiteBlocked(request))return json({ok:false,error:'درخواست نامعتبر است.'},403);
  await ensureSchema(env);
  const rl=await rateLimit(request,env,'public-write');
  if(!rl.allowed)return json({ok:false,error:'تعداد درخواست‌ها زیاد شده است. چند دقیقه بعد دوباره تلاش کنید.'},429,{'Retry-After':String(rl.retryAfter)});
  return null;
}

async function verifyTurnstile(request,env,token){
  if(String(env.TURNSTILE_ENABLED||'').toLowerCase()!=='true')return true;
  if(!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY||!token)return false;
  const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:String(token)});
  const ip=request.headers.get('CF-Connecting-IP');
  if(ip)body.set('remoteip',ip);
  const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!r.ok)return false;
  const d=await r.json().catch(()=>null);
  return !!d?.success;
}

function magicMatches(type,bytes){const b=new Uint8Array(bytes).slice(0,16);if(type==='image/jpeg')return b[0]===255&&b[1]===216&&b[2]===255;if(type==='image/png')return b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71;if(type==='image/webp')return String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';return false}
const DOC_FIELDS=[['idFront','روی کارت ملی'],['idBack','پشت کارت ملی'],['licFront','روی گواهینامه'],['licBack','پشت گواهینامه']];

async function savePassenger(env,fields,ctx){
  const required=[['passengerName','نام مسافر'],['passengerMobile','موبایل مسافر'],['passengerNationalId','کد ملی مسافر'],['pickup','مبدأ مسافر'],['carPlace','مبدأ خودرو'],['destination','مقصد'],['plate','پلاک خودرو'],['carModel','نام و مدل خودرو'],['vin','VIN خودرو']];
  for(const [k,l] of required)if(!clean(fields[k]))return json({ok:false,error:`${l} را وارد کنید.`},400);
  if(!validName(fields.passengerName)||!validMobile(fields.passengerMobile)||!validNational(fields.passengerNationalId)||!validVin(fields.vin))return json({ok:false,error:'اطلاعات هویتی، تماس یا VIN معتبر نیست.'},400);
  if(clean(fields.requestedAt)){const t=Date.parse(fields.requestedAt);if(!Number.isFinite(t)||t < Date.now()-15*60*1000)return json({ok:false,error:'زمان درخواست معتبر نیست. زمان آینده را انتخاب کنید.'},400)}
  const other=clean(fields.forWhom)==='other';
  if(other&&(!validName(fields.ownerName)||!validMobile(fields.ownerMobile)||!validNational(fields.ownerNationalId)))return json({ok:false,error:'اطلاعات صاحب خودرو کامل یا معتبر نیست.'},400);
  if(clean(fields.consent)!=='on')return json({ok:false,error:'برای ثبت درخواست، تأیید اطلاعات را انجام دهید.'},400);
  const idem=clean(fields.idempotencyKey,100)||newId('IDEM');
  const existing=await env.DB.prepare('SELECT id FROM requests WHERE idempotency_key=?').bind(idem).first();
  if(existing)return json({ok:true,requestId:existing.id,duplicate:true,message:'درخواست شما قبلاً دریافت شده است.'});
  const id=newId('REQ'),now=new Date().toISOString();
  const pNat=await encryptField(env,digits(fields.passengerNationalId));
  const oNat=other?await encryptField(env,digits(fields.ownerNationalId)):pNat;
  const ownerName=other?clean(fields.ownerName):clean(fields.passengerName),ownerMobile=other?digits(fields.ownerMobile):digits(fields.passengerMobile);
  const requestedAt=clean(fields.requestedAt,80)||null;
  await env.DB.prepare(`INSERT INTO requests(id,type,status,created_at,updated_at,idempotency_key,passenger_name,passenger_mobile,passenger_national_id_enc,owner_name,owner_mobile,owner_national_id_enc,for_whom,pickup,car_place,destination,requested_at,plate,car_model,vin,consent_at,privacy_version,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,'passenger_request','new',now,now,idem,clean(fields.passengerName),digits(fields.passengerMobile),pNat,ownerName,ownerMobile,oNat,clean(fields.forWhom,20),clean(fields.pickup),clean(fields.carPlace),clean(fields.destination),requestedAt,clean(fields.plate,40),clean(fields.carModel,120),clean(fields.vin).toUpperCase(),now,'v1',JSON.stringify({source:'website'})).run();
  notifyRequest(ctx,env,passengerNotification(fields,id));
  return json({ok:true,requestId:id,message:'درخواست شما ثبت شد. برای هماهنگی با شما تماس می‌گیریم.'});
}
async function saveDriver(env,parsed,ctx){
  const f=parsed.fields;if(!validName(f.driverName)||!validMobile(f.driverMobile)||!validNational(f.driverNationalId))return json({ok:false,error:'نام، موبایل و کد ملی راننده معتبر نیست.'},400);if(clean(f.consent)!=='on')return json({ok:false,error:'برای ثبت‌نام، تأیید اطلاعات را انجام دهید.'},400);
  const byKey=new Map(parsed.files.map(f=>[f.key,f]));for(const [key,label] of DOC_FIELDS){const file=byKey.get(key);if(!file)return json({ok:false,error:`${label} را اضافه کنید.`},400);if(!['image/jpeg','image/png','image/webp'].includes(file.type))return json({ok:false,error:`فرمت ${label} باید JPG، PNG یا WebP باشد.`},400);if(file.size<1||file.size>5*1024*1024)return json({ok:false,error:`حجم ${label} باید حداکثر ۵ مگابایت باشد.`},400);if(!magicMatches(file.type,file.buffer))return json({ok:false,error:`محتوای ${label} با فرمت اعلام‌شده سازگار نیست.`},400)}
  const idem=clean(f.idempotencyKey,100)||newId('IDEM');const existing=await env.DB.prepare('SELECT id FROM requests WHERE idempotency_key=?').bind(idem).first();if(existing)return json({ok:true,requestId:existing.id,duplicate:true,message:'درخواست همکاری شما قبلاً دریافت شده است.'});
  const id=newId('DRV'),now=new Date().toISOString(),docs=[];try{
    for(const [key,label] of DOC_FIELDS){const file=byKey.get(key),ext=file.type.split('/')[1].replace('jpeg','jpg'),objectKey=`driver/${id}/${crypto.randomUUID()}.${ext}`;await s3PutObject(env,objectKey,file.buffer,file.type);docs.push({label,key:objectKey,type:file.type,size:file.size})}
    const nat=await encryptField(env,digits(f.driverNationalId));await env.DB.prepare(`INSERT INTO requests(id,type,status,created_at,updated_at,idempotency_key,driver_name,driver_mobile,driver_national_id_enc,documents_json,consent_at,privacy_version,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,'driver_application','new',now,now,idem,clean(f.driverName),digits(f.driverMobile),nat,JSON.stringify(docs),now,'v1',JSON.stringify({source:'website',document_count:docs.length})).run();
    notifyRequest(ctx,env,driverNotification(f,id));
    return json({ok:true,requestId:id,message:'درخواست همکاری و مدارک شما دریافت شد. برای ادامه با شما تماس می‌گیریم.'});
  }catch(e){for(const d of docs){await s3DeleteObject(env,d.key)}throw e}
}
async function saveContact(env,fields,ctx){if(!clean(fields.name,100)||!clean(fields.message,2000)||!clean(fields.contact,100))return json({ok:false,error:'نام، راه ارتباطی و پیام را کامل کنید.'},400);if(clean(fields.website))return json({ok:false,error:'درخواست نامعتبر است.'},400);const idem=clean(fields.idempotencyKey,100)||newId('IDEM');const ex=await env.DB.prepare('SELECT id FROM requests WHERE idempotency_key=?').bind(idem).first();if(ex)return json({ok:true,requestId:ex.id,duplicate:true,message:'پیام شما قبلاً دریافت شده است.'});const id=newId('MSG'),now=new Date().toISOString();await env.DB.prepare(`INSERT INTO requests(id,type,status,created_at,updated_at,idempotency_key,contact_name,contact_method,contact_message,consent_at,privacy_version,metadata_json) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,'contact','new',now,now,idem,clean(fields.name,100),clean(fields.contact,100),clean(fields.message,2000),now,'v1',JSON.stringify({source:'website'})).run();notifyRequest(ctx,env,contactNotification(fields,id));return json({ok:true,requestId:id,message:'پیامتان دریافت شد. با شما تماس می‌گیریم.'})}

function sessionCookie(v,maxAge){return `dash_admin_session=${v}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`}
function clearSessionCookie(){return 'dash_admin_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict'}
async function createSession(env){if(!env.ADMIN_SESSION_SECRET)throw new Error('ADMIN_SESSION_SECRET missing');const exp=Math.floor(Date.now()/1000)+8*60*60,csrf=base64url(crypto.getRandomValues(new Uint8Array(24)));const payload=base64url(new TextEncoder().encode(JSON.stringify({exp,csrf,v:1}))),sig=base64url(await hmac(env.ADMIN_SESSION_SECRET,payload));return {token:`${payload}.${sig}`,csrf,exp}}
async function getSession(request,env){if(!env.ADMIN_SESSION_SECRET)return null;const m=(request.headers.get('Cookie')||'').match(/(?:^|;\s*)dash_admin_session=([^;]+)/);if(!m)return null;const [payload,sig]=m[1].split('.');if(!payload||!sig)return null;if(!equalBytes(await hmac(env.ADMIN_SESSION_SECRET,payload),fromBase64url(sig)))return null;try{const o=JSON.parse(new TextDecoder().decode(fromBase64url(payload)));return o?.exp&&o.exp>Math.floor(Date.now()/1000)?{...o,token:m[1]}:null}catch{return null}}
async function requireAdmin(request,env,write=false){const s=await getSession(request,env);if(!s)return {ok:false,response:json({ok:false,error:'Unauthorized'},401)};if(write&&(!originAllowed(request,env)||browserCrossSiteBlocked(request)||(request.headers.get('X-CSRF-Token')||'')!==s.csrf))return {ok:false,response:json({ok:false,error:'Forbidden'},403)};return {ok:true,session:s}}
async function audit(env,event,requestId,meta={}){try{await env.DB.prepare('INSERT INTO admin_audit(id,event,request_id,created_at,metadata_json) VALUES(?,?,?,?,?)').bind(newId('AUD'),event,requestId||null,new Date().toISOString(),JSON.stringify(meta)).run()}catch{}}

async function login(request,env){if(!originAllowed(request,env)||browserCrossSiteBlocked(request))return json({ok:false,error:'Origin نامعتبر است.'},403);const rl=await rateLimit(request,env,'admin-login',5,900);if(!rl.allowed)return json({ok:false,error:'تعداد تلاش‌های ورود زیاد شده است. بعداً دوباره تلاش کنید.'},429,{'Retry-After':String(rl.retryAfter)});const body=await request.json().catch(()=>null),pw=clean(body?.password,200);if(!pw||!env.ADMIN_PASSWORD||!env.ADMIN_SESSION_SECRET)return json({ok:false,error:'ورود مدیریت هنوز کامل پیکربندی نشده است.'},503);if(!(await constantTimeSecretEqual(env.ADMIN_SESSION_SECRET,env.ADMIN_PASSWORD,pw)))return json({ok:false,error:'رمز عبور اشتباه است.'},401);const s=await createSession(env);await audit(env,'admin_login_success',null);return json({ok:true,csrfToken:s.csrf,expiresAt:s.exp},200,{'Set-Cookie':sessionCookie(s.token,8*60*60)})}
async function adminList(request,env){
  const g=await requireAdmin(request,env,false);if(!g.ok)return g.response;
  const u=new URL(request.url),type=clean(u.searchParams.get('type'),40),status=clean(u.searchParams.get('status'),30),q=clean(u.searchParams.get('q'),120);
  let sql='SELECT * FROM requests',where=[],binds=[];
  if(type){where.push('type=?');binds.push(type)}
  if(status){where.push('status=?');binds.push(status)}
  if(q){where.push('(id LIKE ? OR passenger_name LIKE ? OR passenger_mobile LIKE ? OR owner_name LIKE ? OR owner_mobile LIKE ? OR driver_name LIKE ? OR driver_mobile LIKE ?)');const p=`%${q}%`;binds.push(p,p,p,p,p,p,p)}
  if(where.length)sql+=' WHERE '+where.join(' AND ');
  sql+=' ORDER BY created_at DESC LIMIT 300';
  const r=await env.DB.prepare(sql).bind(...binds).all(),rows=[];
  for(const row of r.results||[]){
    const out={...row};
    delete out.passenger_national_id_enc; delete out.owner_national_id_enc; delete out.driver_national_id_enc;
    out.passenger_national_id_masked=await maskedNational(env,row.passenger_national_id_enc);
    out.owner_national_id_masked=await maskedNational(env,row.owner_national_id_enc);
    out.driver_national_id_masked=await maskedNational(env,row.driver_national_id_enc);
    rows.push(out);
  }
  return json({ok:true,requests:rows},200,noStore());
}
async function maskedNational(env,packed){
  try{const n=await decryptField(env,packed);return n?`••••••${n.slice(-4)}`:''}catch{return ''}
}
async function adminStatus(request,env){const g=await requireAdmin(request,env,true);if(!g.ok)return g.response;const body=await request.json().catch(()=>null),id=clean(body?.id,80),status=clean(body?.status,30);const allowed=new Set(['new','contacted','driver_found','in_progress','completed','cancelled']);if(!id||!allowed.has(status))return json({ok:false,error:'وضعیت نامعتبر است.'},400);const now=new Date().toISOString(),r=await env.DB.prepare('UPDATE requests SET status=?,updated_at=? WHERE id=?').bind(status,now,id).run();if(!r.meta?.changes)return json({ok:false,error:'درخواست پیدا نشد.'},404);await audit(env,'status_change',id,{status});return json({ok:true})}
async function adminNotes(request,env){const g=await requireAdmin(request,env,true);if(!g.ok)return g.response;const b=await request.json().catch(()=>null),id=clean(b?.id,80),notes=clean(b?.notes,3000);if(!id)return json({ok:false,error:'درخواست نامعتبر است.'},400);const r=await env.DB.prepare('UPDATE requests SET notes=?,updated_at=? WHERE id=?').bind(notes,new Date().toISOString(),id).run();if(!r.meta?.changes)return json({ok:false,error:'درخواست پیدا نشد.'},404);await audit(env,'notes_update',id);return json({ok:true})}
async function adminDelete(request,env){const g=await requireAdmin(request,env,true);if(!g.ok)return g.response;const b=await request.json().catch(()=>null),id=clean(b?.id,80);if(!id)return json({ok:false,error:'شناسه نامعتبر است.'},400);const row=await env.DB.prepare('SELECT documents_json FROM requests WHERE id=?').bind(id).first();if(!row)return json({ok:false,error:'درخواست پیدا نشد.'},404);if(row.documents_json&&arvanConfigured(env)){for(const d of JSON.parse(row.documents_json)||[]){await s3DeleteObject(env,d.key)}}await env.DB.prepare('DELETE FROM requests WHERE id=?').bind(id).run();await audit(env,'request_delete',id);return json({ok:true})}
async function adminDocument(request,env){const g=await requireAdmin(request,env,false);if(!g.ok)return g.response;if(!arvanConfigured(env))return json({ok:false,error:'فضای مدارک متصل نیست.'},503);const key=new URL(request.url).searchParams.get('key')||'';if(!/^driver\/[^/]+\/[A-Za-z0-9-]+\.(jpg|png|webp)$/.test(key))return json({ok:false,error:'کلید فایل نامعتبر است.'},400);const o=await s3GetObject(env,key);if(!o)return json({ok:false,error:'مدرک پیدا نشد.'},404);const h=new Headers();const ct=o.headers.get('content-type');if(ct)h.set('Content-Type',ct);h.set('Cache-Control','private, no-store, max-age=0');h.set('Content-Disposition','inline');return new Response(o.body,{headers:h})}

export default {async fetch(request,env,ctx){const u=new URL(request.url);try{
  const method=request.method;
  if(request.method==='GET' && u.hostname==='www.dashh.ir') return new Response(null,{status:301,headers:{'Location':`https://dashh.ir${u.pathname}${u.search}`,'Strict-Transport-Security':'max-age=63072000; includeSubDomains; preload'}});
  if(request.method==='GET'){
    const legacy={
      '/after-surgery-driving.html':'/after-surgery.html',
      '/elderly-driver-safety.html':'/elderly-driver.html',
      '/fatigue-and-driving.html':'/fatigue-driving.html',
      '/personal-car-replacement-driver.html':'/replacement-driver.html',
      '/illness.html':'/driving-while-sick.html'
    };
    if(legacy[u.pathname]) return new Response(null,{status:301,headers:{'Location':`https://dashh.ir${legacy[u.pathname]}${u.search}`,'Strict-Transport-Security':'max-age=63072000; includeSubDomains; preload'}});
  }
  if(u.pathname==='/api/config'&&method==='GET'){return json({ok:true,turnstileEnabled:String(env.TURNSTILE_ENABLED||'').toLowerCase()==='true',turnstileSiteKey:env.TURNSTILE_SITE_KEY||'',privacyVersion:'v1'},200,{'Cache-Control':'public, max-age=300'});}
  if(u.pathname==='/api/health'&&method==='GET'){const db=!!(env.DB&&await ensureSchema(env));return json({ok:true,ready:db&&!!env.DATA_ENCRYPTION_KEY&&!!env.ADMIN_SESSION_SECRET&&!!env.ADMIN_PASSWORD,turnstile: String(env.TURNSTILE_ENABLED||'').toLowerCase()==='true' ? !!env.TURNSTILE_SECRET&&!!env.TURNSTILE_SITE_KEY : false});}
  if(u.pathname==='/api/admin/login'&&method==='POST'){await ensureSchema(env);return login(request,env)}
  if(u.pathname==='/api/admin/session'&&method==='GET'){const s=await getSession(request,env);return s?json({ok:true,csrfToken:s.csrf,expiresAt:s.exp},200,noStore()):json({ok:false},401)}
  if(u.pathname==='/api/admin/logout'&&method==='POST'){const g=await requireAdmin(request,env,true);if(!g.ok)return g.response;await audit(env,'admin_logout');return json({ok:true},200,{'Set-Cookie':clearSessionCookie()})}
  if(u.pathname==='/api/requests'&&method==='POST'){
    const guard=await requirePublicWrite(request,env);if(guard)return guard;
    const len=Number(request.headers.get('Content-Length')||0);if(len&&len>26*1024*1024)return json({ok:false,error:'حجم اطلاعات ارسالی بیش از حد مجاز است.'},413);
    const parsed=await readMultipart(request);if(clean(parsed.fields.website))return json({ok:false,error:'درخواست نامعتبر است.'},400);
    if(!(await verifyTurnstile(request,env,clean(parsed.fields.turnstileToken,500))))return json({ok:false,error:'تأیید امنیتی انجام نشد. صفحه را تازه کنید و دوباره تلاش کنید.'},403);
    const type=clean(parsed.fields.type,40);
    if(type==='driver_application'){if(!arvanConfigured(env))return json({ok:false,error:'فضای امن دریافت مدارک هنوز متصل نشده است.'},503);return saveDriver(env,parsed,ctx)}
    if(type==='contact')return saveContact(env,parsed.fields,ctx);return savePassenger(env,parsed.fields,ctx)
  }
  if(u.pathname==='/api/admin/requests'&&method==='GET'){await ensureSchema(env);return adminList(request,env)}
  if(u.pathname==='/api/admin/status'&&method==='POST'){await ensureSchema(env);return adminStatus(request,env)}
  if(u.pathname==='/api/admin/notes'&&method==='POST'){await ensureSchema(env);return adminNotes(request,env)}
  if(u.pathname==='/api/admin/delete'&&method==='POST'){await ensureSchema(env);return adminDelete(request,env)}
  if(u.pathname==='/api/admin/document'&&method==='GET'){await ensureSchema(env);return adminDocument(request,env)}
  const assetResponse=await env.ASSETS.fetch(request);
  const h=new Headers(assetResponse.headers);
  if(u.hostname!=='dashh.ir' && u.hostname!=='www.dashh.ir' && (h.get('content-type')||'').includes('text/html')) h.set('X-Robots-Tag','noindex, nofollow, noarchive');
  return new Response(assetResponse.body,{status:assetResponse.status,statusText:assetResponse.statusText,headers:h});
}catch(e){console.error('dash_api_error',e?.stack||e?.message||e);return json({ok:false,error:'در پردازش درخواست مشکلی پیش آمد. لطفاً دوباره تلاش کنید.'},500)}}};
