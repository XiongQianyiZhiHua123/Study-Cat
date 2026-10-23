// 生成一份"已经学了一阵子"的演示数据(以今天为基准),输出 JSON
import * as L from '../../js/logic.js';
const st = L.createState();
const today = L.ymd(Date.now());
st.chars.owned = ['cat']; st.chars.active = 'cat'; st.rewards.charCredits = 0;
st.scenes.owned = ['night', 'garden']; st.scenes.active = 'night'; st.rewards.sceneCredits = 0;
const mins = [45, 50, 42, 60, 41, 0, 40, 55, 0, 43, 48, 70, 44, 20];
mins.forEach((m, i) => { if (m) L.addManualSession(st, { date: L.addDays(today, -(mins.length - i)), subjectId: ['en', 'math', 'art'][i % 3], minutes: m }); });
st.rewards.pocket = [{ kind: 'small', slot: 0 }, { kind: 'small', slot: 1 }, { kind: 'big' }];
st.scenes.placed.night = [{ kind: 'small', slot: 0, x: 864, y: 120, r: 0, f: 1 }, { kind: 'small', slot: 1, x: 1344, y: 150, r: 10, f: -1 }, { kind: 'big', slot: 0, x: 924, y: 380, r: 0, f: 1 }];
st.settings.restWeekdays = [];
process.stdout.write(JSON.stringify(st));
