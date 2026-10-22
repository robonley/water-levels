// Cistern level widget for Scriptable (iOS). github.com/robonley/water-levels
// Shows the Cistern % from your PTDevices sensor on your Home Screen.
//
// SETUP (once):
//  1. Install "Scriptable" from the App Store (free).
//  2. Open Scriptable, tap +, paste this whole file.
//  3. Put your PTDevices API token between the quotes on the TOKEN line below.
//     (ptdevices.com > My Account > Settings > Regenerate API Token)
//  4. Name the script "Cistern".
//  5. Home Screen: long-press > add a Scriptable widget (small) > choose "Cistern".
//
// It names the tank by matching "well" in the title, so swapping the sensor is fine.

const TOKEN = "PASTE_YOUR_PTDEVICES_TOKEN_HERE";
const MATCH = "cistern";     // which tank: title must contain this word
const LOW = 25, WARN = 50; // % thresholds: below LOW red, below WARN amber
const REFRESH_MIN = 30;    // how often iOS may refresh (minutes; iOS decides the real timing)
const OPEN_URL = "https://www.ptdevices.com/device/level/27107"; // tap target: the Cistern page (opens the PTDevices app if it claims this link, else Safari). "" = just run the script.

const BG = new Color("#0e1116"), INK = new Color("#e8edf2"), DIM = new Color("#8b95a3");
const COL = { good: new Color("#2fb36d"), warn: new Color("#e0a020"), bad: new Color("#e5484d") };

function clean(t){ return (t||"Tank").replace(/\(.*?\)/g,"").replace(/\b(19|20)\d\d\b/g,"").replace(/\s+/g," ").trim(); }
function level(p){ return p < LOW ? "bad" : (p < WARN ? "warn" : "good"); }

async function getWell(){
  const url = "https://api.ptdevices.com/token/v1/devices?api_token=" + encodeURIComponent(TOKEN);
  const r = new Request(url); r.timeoutInterval = 15;
  const body = await r.loadJSON();
  const list = Array.isArray(body.data) ? body.data : [body.data];
  return list.find(d => (d.title||"").toLowerCase().includes(MATCH)) || list[0];
}

const w = new ListWidget();
w.backgroundColor = BG;
w.setPadding(14,16,14,16);
w.refreshAfterDate = new Date(Date.now() + REFRESH_MIN*60*1000);

try {
  const d = await getWell();
  if (!d) throw new Error("no device");
  const dd = d.device_data || {};
  const p = Math.round(parseFloat(dd.percent_level));
  const ok = !isNaN(p);
  const lv = ok ? level(p) : "warn";

  const name = w.addText(clean(d.title).toUpperCase());
  name.font = Font.semiboldSystemFont(11); name.textColor = DIM;

  w.addSpacer(2);
  const pct = w.addText(ok ? p + "%" : "--");
  pct.font = Font.boldSystemFont(52); pct.textColor = COL[lv];

  w.addSpacer(2);
  const bits = [];
  if (d.status_number !== 2) bits.push(d.status || "Not reporting");
  if (dd.battery_status_number === 2) bits.push("Batt low");
  bits.push(d.last_updated_on || "");
  const sub = w.addText(bits.filter(Boolean).join(" · "));
  sub.font = Font.systemFont(10); sub.textColor = DIM; sub.lineLimit = 2;
} catch (e) {
  const t = w.addText("Cistern");
  t.font = Font.semiboldSystemFont(11); t.textColor = DIM;
  w.addSpacer(2);
  const m = w.addText("--"); m.font = Font.boldSystemFont(52); m.textColor = DIM;
  w.addSpacer(2);
  const s = w.addText(TOKEN.startsWith("PASTE") ? "Add your token" : "No connection");
  s.font = Font.systemFont(10); s.textColor = DIM;
}

if (typeof OPEN_URL === "string" && OPEN_URL) w.url = OPEN_URL;
if (config.runsInWidget) { Script.setWidget(w); }
else { w.presentSmall(); }
Script.complete();
