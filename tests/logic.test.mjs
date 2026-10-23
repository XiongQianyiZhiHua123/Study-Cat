import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState, normalize, ymd, addDays, diffDays, dayStatus, streakInfo, startSession, finishSession,
  canUseMakeup, useMakeup, chooseScene, placeFromPocket, monthData, addManualSession, dayMinutes, subjectSlot, subjectName,
  chooseChar, screensOpen, canPlaceAt, checkMilestones
} from '../js/logic.js';

// 与设计稿同一份示例数据:[英语,数学,画画] 分钟,'r' 为休息日(周三)
const D = [[25,15,0],[30,10,0],[20,0,25],[15,10,0],[25,15,0],[30,0,15],'r',[20,20,0],[25,10,10],[20,0,0],[20,0,30],[25,15,0],[30,15,0],'r',[25,15,0],[30,0,0],[20,20,0],[40,0,0],[42,0,0],[0,0,45],'r',[0,45,0],[24,0,0]];
function demo() {
  const s = createState();
  s.settings.restWeekdays = [3];
  const ids = ['en', 'math', 'art'];
  D.forEach((v, i) => {
    if (v === 'r') return;
    const date = '2026-10-' + String(i + 1).padStart(2, '0');
    v.forEach((m, k) => { if (m) addManualSession(s, { date, subjectId: ids[k], minutes: m }); });
  });
  return s;
}
const TODAY = '2026-10-23';

test('日期工具', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
  assert.equal(diffDays('2026-10-23', '2026-10-20'), 3);
  assert.equal(ymd(new Date(2026, 9, 3)), '2026-10-03');
});

test('每天状态:达标/没达标/休息/今天', () => {
  const s = demo();
  assert.equal(dayStatus(s, '2026-10-01', TODAY), 'goal');
  assert.equal(dayStatus(s, '2026-10-04', TODAY), 'part');
  assert.equal(dayStatus(s, '2026-10-07', TODAY), 'rest');
  assert.equal(dayStatus(s, TODAY, TODAY), 'today');
  assert.equal(dayStatus(s, '2026-10-24', TODAY), 'future');
});

test('连续天数:休息日不断开,没达标会断开,今天未达标不影响昨天', () => {
  const s = demo();
  const info = streakInfo(s, TODAY);
  assert.equal(info.current, 5); // 10/17,18,19,20,22
  assert.equal(info.start, '2026-10-17');
  assert.equal(info.best, 5);
});

test('完成今天的目标后连续变 6,并得到小奖励+大奖励', () => {
  const s = demo();
  const t0 = new Date(2026, 9, 23, 17, 0).getTime();
  startSession(s, 'en', t0);
  const r = finishSession(s, t0 + 16 * 60000); // 再学 16 分钟 => 40
  assert.equal(r.ok, true);
  assert.equal(dayMinutes(s, TODAY), 40);
  assert.equal(streakInfo(s, TODAY).current, 6);
  assert.deepEqual(r.events.map((e) => e.type), ['small', 'big']);
  assert.equal(s.rewards.pocket.length, 2);
});

test('太短的学习不算,也不给奖励', () => {
  const s = createState();
  const t0 = new Date(2026, 9, 23, 17, 0).getTime();
  startSession(s, 'en', t0);
  const r = finishSession(s, t0 + 2 * 60000);
  assert.equal(r.ok, false);
  assert.equal(s.sessions.length, 0);
  assert.equal(s.rewards.pocket.length, 0);
  assert.equal(s.active, null);
});

test('每天小奖励有上限,忘记点结束会封顶 180 分钟', () => {
  const s = createState();
  let t = new Date(2026, 9, 23, 8, 0).getTime();
  for (let i = 0; i < 5; i++) {
    startSession(s, 'math', t);
    finishSession(s, t + 6 * 60000);
    t += 3600000;
  }
  assert.equal(s.rewards.pocket.filter((p) => p.kind === 'small').length, 3);
  startSession(s, 'art', t);
  const r = finishSession(s, t + 9 * 3600000);
  assert.equal(r.minutes, 180);
});

test('连续满 7 天解锁一次选新场景,满 3 天得稀有奖励', () => {
  const s = createState();
  assert.equal(s.rewards.sceneCredits, 1); // 第一次可以自选
  assert.equal(chooseScene(s, 'night'), true);
  assert.equal(s.rewards.sceneCredits, 0);
  assert.equal(chooseScene(s, 'garden'), false); // 没有资格
  const all = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(2026, 9, 1 + i, 17, 0).getTime();
    startSession(s, 'en', day);
    all.push(...finishSession(s, day + 40 * 60000).events);
  }
  assert.ok(all.some((e) => e.type === 'rare' && e.streak === 3));
  assert.ok(all.some((e) => e.type === 'rare' && e.streak === 7));
  assert.equal(all.filter((e) => e.type === 'unlock').length, 1);
  assert.equal(s.rewards.sceneCredits, 1);
  assert.equal(s.rewards.makeupCards, 1);
  assert.equal(chooseScene(s, 'garden'), true);
  assert.deepEqual(s.scenes.owned, ['night', 'garden']);
  assert.equal(s.scenes.active, 'garden');
  assert.equal(chooseScene(s, 'night'), true); // 已拥有的可以随时切换,不花资格
  assert.equal(s.rewards.sceneCredits, 0);
});

test('解锁天数可自定义', () => {
  const s = createState();
  s.settings.unlockDays = 2;
  const ev = [];
  for (let i = 0; i < 4; i++) {
    const day = new Date(2026, 9, 1 + i, 17, 0).getTime();
    startSession(s, 'en', day);
    ev.push(...finishSession(s, day + 40 * 60000).events);
  }
  assert.equal(ev.filter((e) => e.type === 'unlock').length, 2);
});

test('补签卡:只能补最近几天、只能补没达标的日子,补完连续接上', () => {
  const s = demo();
  s.rewards.makeupCards = 1;
  const t0 = new Date(2026, 9, 23, 17, 0).getTime();
  assert.equal(canUseMakeup(s, '2026-10-16', TODAY), false); // 超过 3 天
  s.settings.makeupWindow = 7;
  assert.equal(canUseMakeup(s, '2026-10-16', TODAY), true);
  assert.equal(canUseMakeup(s, '2026-10-21', TODAY), false); // 休息日不用补
  const r = useMakeup(s, '2026-10-16', TODAY);
  assert.equal(r.ok, true);
  assert.equal(s.rewards.makeupCards, 0);
  assert.equal(dayStatus(s, '2026-10-16', TODAY), 'makeup');
  // 10/13,15 + 补的 16 + 17...22 接上了
  assert.ok(streakInfo(s, TODAY).current >= 9);
  void t0;
});

test('放置奖励:从口袋移到当前场景', () => {
  const s = createState();
  chooseScene(s, 'night');
  s.rewards.pocket.push({ kind: 'small', slot: 1 }, { kind: 'big' });
  const el = placeFromPocket(s, 0, 800.4, 200.6, () => 0.5);
  assert.deepEqual([el.kind, el.slot, el.x, el.y], ['small', 1, 800, 201]);
  assert.equal(placeFromPocket(s, 0, 100, 200), null); // 左边一屏还没出现
  assert.equal(s.rewards.pocket.length, 1);
  assert.equal(s.rewards.pocket.length, 1);
  assert.equal(s.scenes.placed.night.length, 1);
  assert.equal(placeFromPocket(s, 5, 0, 0), null);
});

test('月度统计与设计稿一致', () => {
  const s = demo();
  const m = monthData(s, 2026, 10, TODAY);
  assert.equal(m.days.length, 31);
  assert.equal(m.offset, 3); // 10/1 是周四
  assert.equal(m.goalDays, 16);
  assert.equal(m.studyDays, 20);
  assert.equal(m.best, 5);
  assert.equal(m.max, 50);
});

test('normalize 能补齐旧数据,科目名与科目对应的奖励类型', () => {
  const s = normalize({ lang: 'en', settings: { goalMin: 30 } });
  assert.equal(s.settings.goalMin, 30);
  assert.equal(s.settings.unlockDays, 7);
  assert.equal(subjectName(s.subjects[0], 'en'), 'English');
  assert.equal(subjectName({ name: '钢琴' }, 'en'), '钢琴');
  s.subjects.push({ id: 'x', name: '钢琴', color: '#000' });
  assert.equal(subjectSlot(s, 'x'), 0); // 第 4 个科目循环回第 1 种
  assert.equal(normalize(null).v, 2);
});

test('全景:放得多了左右两屏才出现;旧数据元素右移到中间屏', () => {
  const s = createState();
  chooseScene(s, 'night');
  assert.deepEqual(screensOpen(s, 'night'), { left: false, right: false, leftNeed: 20, rightNeed: 8 });
  s.scenes.placed.night = Array.from({ length: 8 }, () => ({ kind: 'small', slot: 0, x: 800, y: 300, r: 0, f: 1 }));
  assert.equal(canPlaceAt(s, 'night', 1600), true);
  assert.equal(canPlaceAt(s, 'night', 100), false);
  s.scenes.placed.night.push(...Array.from({ length: 12 }, () => ({ kind: 'small', slot: 0, x: 800, y: 300, r: 0, f: 1 })));
  assert.equal(canPlaceAt(s, 'night', 100), true);
  const old = normalize({ v: 1, scenes: { owned: ['night'], active: 'night', placed: { night: [{ kind: 'big', slot: 0, x: 100, y: 200, r: 0, f: 1 }] }, custom: { bgColor: '#123456' } } });
  assert.equal(old.scenes.placed.night[0].x, 844);
  assert.equal(old.scenes.customs.custom.bgColor, '#123456');
});

test('角色:第一次自选;每连续 charDays 天再得一次;自己的第一张画布免费', () => {
  const s = createState();
  assert.equal(chooseChar(s, 'dog'), true);
  assert.equal(s.chars.active, 'dog');
  assert.equal(s.rewards.charCredits, 0);
  assert.equal(chooseChar(s, 'fox'), false);
  assert.equal(chooseChar(s, 'dog'), true);
  assert.equal(chooseChar(s, 'nope'), false);
  s.settings.charDays = 3;
  const today = '2026-10-23';
  [2, 1, 0].forEach((k) => addManualSession(s, { date: addDays(today, -k), subjectId: 'en', minutes: 50 }));
  const ev = checkMilestones(s, today);
  assert.ok(ev.some((e) => e.type === 'unlockChar'));
  assert.equal(s.rewards.charCredits, 1);
  assert.equal(chooseScene(s, 'custom'), true); // 免费
  assert.equal(s.rewards.sceneCredits, 1);
  assert.equal(chooseScene(s, 'custom2'), true); // 第二张要消耗一次机会
  assert.equal(s.rewards.sceneCredits, 0);
  assert.equal(chooseScene(s, 'custom3'), false);
});
