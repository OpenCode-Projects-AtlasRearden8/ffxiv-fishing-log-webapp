const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function t(name, fn){
  try {
    fn();
    passed++;
    console.log('  ok - ' + name);
  } catch (e) {
    failed++;
    console.log('  FAIL - ' + name);
    console.log('       ' + (e && e.message ? e.message : e));
  }
}
function eq(actual, expected, msg){
  if (actual !== expected) {
    throw new Error((msg ? msg + ': ' : '') + 'expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  }
}
function deepEq(actual, expected, msg){
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error((msg ? msg + ': ' : '') + 'expected ' + b + ', got ' + a);
}
function ok(cond, msg){
  if (!cond) throw new Error(msg || 'expected truthy');
}

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const match = html.match(/<script id="app-js">([\s\S]*?)<\/script>/);
if (!match) {
  console.error('Could not extract app script from index.html');
  process.exit(1);
}
const appSource = match[1];

console.log('Eorzean clock conversion');
eval(appSource);
t('zero real ms is 00:00 ET', function(){ eq(eorzeanMinutesFromUTC(0), 0); });
t('one Eorzean day is 70 real minutes (wraps to 00:00)', function(){ eq(eorzeanMinutesFromUTC(4200000), 0); });
t('35 real minutes is noon ET', function(){ eq(eorzeanMinutesFromUTC(2100000), 720); });
t('one real hour advances ET by 1234 minutes', function(){ eq(eorzeanMinutesFromUTC(3600000), 1234); });
t('one real minute advances ET by 20 minutes', function(){ eq(eorzeanMinutesFromUTC(60000), 20); });
t('one ms before an ET day boundary is 23:59', function(){ eq(eorzeanMinutesFromUTC(4199999), 1439); });
t('two Eorzean days still wrap cleanly', function(){ eq(eorzeanMinutesFromUTC(8400000), 0); });
t('ET minutes are monotonic within a day', function(){
  ok(eorzeanMinutesFromUTC(1000000) < eorzeanMinutesFromUTC(2000000), 'expected increasing');
});
t('one ET hour is 175 real seconds', function(){ eq(etMinutesToRealMs(60), 175000); });
t('120 ET minutes is 350 real seconds', function(){ eq(etMinutesToRealMs(120), 350000); });

console.log('fmtEorzean and durations');
t('00:00', function(){ eq(fmtEorzean(0), '00:00'); });
t('08:15', function(){ eq(fmtEorzean(495), '08:15'); });
t('23:59', function(){ eq(fmtEorzean(1439), '23:59'); });
t('wraps 1440 to 00:00', function(){ eq(fmtEorzean(1440), '00:00'); });
t('negative input wraps', function(){ eq(fmtEorzean(-60), '23:00'); });
t('ET duration 483m is 8h 03m', function(){ eq(fmtEorzeanDur(483), '8h 03m'); });
t('ET duration 42m is 42m', function(){ eq(fmtEorzeanDur(42), '42m'); });
t('real duration 175s is 2m 55s', function(){ eq(fmtRealDur(175000), '2m 55s'); });
t('real duration 350s is 5m 50s', function(){ eq(fmtRealDur(350000), '5m 50s'); });
t('real duration 3661s is 1h 01m', function(){ eq(fmtRealDur(3661000), '1h 01m'); });
t('real duration 30s is 30s', function(){ eq(fmtRealDur(30000), '30s'); });

console.log('parseWindow');
t('normal window', function(){ deepEq(parseWindow('08:00-12:00'), { start: 480, end: 720 }); });
t('single digit hours', function(){ deepEq(parseWindow('8:00-12:00'), { start: 480, end: 720 }); });
t('spaces around dash', function(){ deepEq(parseWindow('8:00 - 12:00'), { start: 480, end: 720 }); });
t('midnight crossing', function(){ deepEq(parseWindow('20:00-04:00'), { start: 1200, end: 240 }); });
t('empty string is invalid', function(){ eq(parseWindow(''), null); });
t('missing end is invalid', function(){ eq(parseWindow('8:00'), null); });
t('equal start and end is invalid', function(){ eq(parseWindow('8:00-8:00'), null); });
t('hour 24 is invalid', function(){ eq(parseWindow('24:00-25:00'), null); });
t('minute 60 is invalid', function(){ eq(parseWindow('8:60-9:00'), null); });
t('nonsense is invalid', function(){ eq(parseWindow('fishing time'), null); });
t('non-string is invalid', function(){ eq(parseWindow(42), null); });
t('windows round-trip through fmtWindow', function(){
  eq(fmtWindow(parseWindow('22:00-2:00')), '22:00-02:00');
});

console.log('inWindow');
t('start boundary is open', function(){ eq(inWindow({ start: 480, end: 720 }, 480), true); });
t('inside is open', function(){ eq(inWindow({ start: 480, end: 720 }, 500), true); });
t('one minute before close is open', function(){ eq(inWindow({ start: 480, end: 720 }, 719), true); });
t('end boundary is closed', function(){ eq(inWindow({ start: 480, end: 720 }, 720), false); });
t('after close is closed', function(){ eq(inWindow({ start: 480, end: 720 }, 800), false); });
t('minute 1440 wraps to 00:00 and is closed', function(){ eq(inWindow({ start: 480, end: 720 }, 1440), false); });
t('wrapped window open at 23:00', function(){ eq(inWindow({ start: 1200, end: 240 }, 1380), true); });
t('wrapped window open at 01:00', function(){ eq(inWindow({ start: 1200, end: 240 }, 60), true); });
t('wrapped window closed at 05:00', function(){ eq(inWindow({ start: 1200, end: 240 }, 300), false); });
t('wrapped window closed just before start', function(){ eq(inWindow({ start: 1200, end: 240 }, 1140), false); });
t('wrapped window open at start boundary', function(){ eq(inWindow({ start: 1200, end: 240 }, 1200), true); });
t('wrapped window closed at end boundary', function(){ eq(inWindow({ start: 1200, end: 240 }, 240), false); });
t('floor of fractional ET minutes', function(){ eq(inWindow({ start: 480, end: 720 }, 480.9), true); });

console.log('minutesUntilOpen');
t('zero when open', function(){ eq(minutesUntilOpen({ start: 480, end: 720 }, 500), 0); });
t('zero at start boundary', function(){ eq(minutesUntilOpen({ start: 480, end: 720 }, 480), 0); });
t('before open same day', function(){ eq(minutesUntilOpen({ start: 480, end: 720 }, 300), 180); });
t('after close rolls to next day', function(){ eq(minutesUntilOpen({ start: 480, end: 720 }, 800), 1120); });
t('at midnight before a morning window', function(){ eq(minutesUntilOpen({ start: 480, end: 720 }, 0), 480); });
t('wrapped window before start', function(){ eq(minutesUntilOpen({ start: 1200, end: 240 }, 1100), 100); });
t('wrapped window just after close', function(){ eq(minutesUntilOpen({ start: 1200, end: 240 }, 260), 940); });

console.log('minutesUntilClose');
t('zero when closed', function(){ eq(minutesUntilClose({ start: 480, end: 720 }, 300), 0); });
t('normal window remaining', function(){ eq(minutesUntilClose({ start: 480, end: 720 }, 480), 240); });
t('one minute left', function(){ eq(minutesUntilClose({ start: 480, end: 720 }, 719), 1); });
t('wrapped window evening remaining', function(){ eq(minutesUntilClose({ start: 1200, end: 240 }, 1300), 380); });
t('wrapped window after midnight remaining', function(){ eq(minutesUntilClose({ start: 1200, end: 240 }, 60), 180); });

console.log('describeWindow');
t('open text mentions open and real-time estimate', function(){
  var d = describeWindow({ start: 480, end: 720 }, 500);
  ok(d.open === true, 'should be open');
  ok(/Open now/.test(d.text) && /real/.test(d.text), 'text should mention open and real: ' + d.text);
});
t('closed text mentions countdown', function(){
  var d = describeWindow({ start: 480, end: 720 }, 100);
  ok(d.open === false, 'should be closed');
  ok(/Closed/.test(d.text) && /opens in/.test(d.text), 'text should mention countdown: ' + d.text);
});

console.log('migrateData');
t('null input produces empty structure', function(){
  var d = migrateData(null);
  eq(d.version, 1);
  deepEq(d.spots, []);
  deepEq(d.pushList, []);
  deepEq(d.milestones, []);
});
t('window strings are normalized', function(){
  var d = migrateData({ spots: [{ id: 's1', name: 'Test', water: 'fresh', fish: [{ id: 'f1', name: 'Trout', window: '8:00-12:00' }] }] });
  eq(d.spots[0].fish[0].window, '08:00-12:00');
});
t('invalid window becomes empty string', function(){
  var d = migrateData({ spots: [{ name: 'Test', fish: [{ name: 'Trout', window: 'whenever' }] }] });
  eq(d.spots[0].fish[0].window, '');
});
t('bad rank becomes null, fractional rank floors', function(){
  var d = migrateData({ spots: [
    { name: 'A', fish: [{ name: 'x', rank: -5 }] },
    { name: 'B', fish: [{ name: 'y', rank: 2.7 }] }
  ] });
  eq(d.spots[0].fish[0].rank, null);
  eq(d.spots[1].fish[0].rank, 2);
});
t('water defaults to fresh for unknown values', function(){
  var d = migrateData({ spots: [{ name: 'A', water: 'lava', fish: [] }] });
  eq(d.spots[0].water, 'fresh');
});
t('push list is deduplicated and filtered to strings', function(){
  var d = migrateData({ pushList: ['a', 'a', 5, 'b'] });
  deepEq(d.pushList, ['a', 'b']);
});
t('milestones get timestamps and kinds', function(){
  var d = migrateData({ milestones: [{ text: 'hi' }, { ts: 123, text: 'ho', kind: 'manual' }, 'junk' ] });
  ok(typeof d.milestones[0].ts === 'number', 'missing ts should be filled');
  eq(d.milestones[0].kind, 'auto');
  eq(d.milestones[1].ts, 123);
  eq(d.milestones[1].kind, 'manual');
  eq(d.milestones.length, 2);
});
t('missing ids are generated', function(){
  var d = migrateData({ spots: [{ name: 'A', fish: [{ name: 'x' }] }] });
  ok(d.spots[0].id && d.spots[0].fish[0].id, 'ids should exist');
});

console.log('escapeHtml');
t('escapes script injection', function(){
  eq(esc('"><script>alert(1)<\/script>'), '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
});
t('escapes ampersands and quotes', function(){ eq(esc('a & "b" \'c\' <d>'), 'a &amp; &quot;b&quot; &#39;c&#39; &lt;d&gt;'); });
t('null becomes empty string', function(){ eq(esc(null), ''); });

console.log('makeId');
t('ids are unique', function(){ ok(makeId() !== makeId(), 'ids should differ'); });

console.log('DOM smoke test (stubbed browser environment)');
t('app boots, renders seed data, persists to localStorage', function(){
  const elementsById = {};
  const backingStore = {};
  function makeElement(id){
    return {
      id: id || '', style: {}, dataset: {}, children: [], files: [],
      value: '', checked: false, textContent: '', innerHTML: '',
      classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
      addEventListener(){}, removeEventListener(){},
      appendChild(){}, removeChild(){},
      setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
      closest(){ return null; }, focus(){}, blur(){}, click(){}, select(){},
      getElementsByTagName(){ return []; },
      querySelector(){ return null; }, querySelectorAll(){ return []; }
    };
  }
  global.document = {
    readyState: 'complete',
    title: '',
    body: makeElement('body'),
    addEventListener(){}, removeEventListener(){},
    getElementById(id){ if (!elementsById[id]) elementsById[id] = makeElement(id); return elementsById[id]; },
    createElement(tag){ return makeElement('created-' + tag); },
    querySelector(){ return null; },
    querySelectorAll(){ return []; }
  };
  global.window = { addEventListener(){}, removeEventListener(){} };
  global.localStorage = {
    getItem(k){ return Object.prototype.hasOwnProperty.call(backingStore, k) ? backingStore[k] : null; },
    setItem(k, v){ backingStore[k] = String(v); },
    removeItem(k){ delete backingStore[k]; }
  };
  global.confirm = function(){ return true; };

  eval(appSource);

  ok(typeof appInit === 'function', 'appInit should be defined');
  const rendered = elementsById['app-root'];
  ok(rendered && rendered.innerHTML && rendered.innerHTML.length > 100, 'app-root should have rendered content');
  ok(rendered.innerHTML.indexOf('Mazlayquar Trout') >= 0, 'seed data should be visible');
  ok(rendered.innerHTML.indexOf('Freshwater') >= 0, 'water type tags should be visible');
  ok(/data-chip-window/.test(rendered.innerHTML), 'window status chips should be present');
  ok(/^\d{2}:\d{2}$/.test(elementsById['et-clock'].textContent), 'Eorzean clock should show HH:MM, got: ' + elementsById['et-clock'].textContent);
  ok(backingStore['ffxiv-fishing-log-v1'], 'seed data should be persisted to localStorage');
  const stored = JSON.parse(backingStore['ffxiv-fishing-log-v1']);
  eq(stored.spots.length, 3, 'three sample spots should be stored');
  deepEq(stored.pushList, ['f4', 'f3'], 'push list should be seeded');
});

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
