// 矢量素材:奖励元素库(EL)和 10 个预设场景(SCENES)。
// 所有图形都是 SVG 字符串。元素以 (0,0) 为中心、约 ±20 大小;场景画布是 744 x 500。
// 想加新场景 / 新元素:往下面的对象里加一项就行,不用改别的代码。

import { isCustomId, customCfg } from './logic.js';

const starPts = '0,-18 5.3,-7.3 17.1,-5.6 8.6,2.8 10.6,14.6 0,9 -10.6,14.6 -8.6,2.8 -17.1,-5.6 -5.3,-7.3';
const star = (fill = '#FFC93C', stroke = '#E7A100') =>
  `<polygon points="${starPts}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>`;
const rot = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');
const tree = (leaf = '#5FB36A', hi = '#7FCB7A') =>
  `<rect x="-3" y="2" width="6" height="14" fill="#8B5E3C"/><circle cy="-4" r="14" fill="${leaf}"/><circle cx="-6" cy="-8" r="5" fill="${hi}"/>`;
const dino = '<ellipse cx="0" cy="4" rx="13" ry="9" fill="#6BCB77"/><circle cx="11" cy="-6" r="6" fill="#6BCB77"/><path d="M-12 4 L-21 9 L-12 10Z" fill="#6BCB77"/><rect x="-7" y="10" width="4" height="7" rx="2" fill="#4FA85C"/><rect x="3" y="10" width="4" height="7" rx="2" fill="#4FA85C"/><circle cx="13" cy="-7" r="1.5" fill="#2B2140"/>';

export const EL = {
  star: star(),
  bigstar: '<circle r="22" fill="#FFE27A" opacity=".35"/>' + star('#FFD84D'),
  planet: '<circle r="11" fill="#7FD6FF" stroke="#2E9AD1" stroke-width="2"/><ellipse rx="19" ry="5.5" fill="none" stroke="#FFE27A" stroke-width="3" transform="rotate(-20)"/>',
  comet: '<path d="M-18 14 L2 -4 L8 2Z" fill="#FFF6C9" opacity=".7"/><circle cx="6" cy="-2" r="7" fill="#fff" stroke="#BFD9FF" stroke-width="2"/>',
  crescent: '<path d="M8 -16 A16 16 0 1 0 14 8 A13 13 0 0 1 8 -16Z" fill="#FFF1B8" stroke="#E7C95A" stroke-width="2"/>',
  flower: '<g fill="#FF8FB8"><circle cx="-8" r="7"/><circle cx="8" r="7"/><circle cy="-8" r="7"/><circle cy="8" r="7"/></g><circle r="5" fill="#FFD166"/>',
  butterfly: '<ellipse cx="-8" cy="-4" rx="8" ry="11" fill="#B58CFF" transform="rotate(-25 -8 -4)"/><ellipse cx="8" cy="-4" rx="8" ry="11" fill="#FF8FB8" transform="rotate(25 8 -4)"/><ellipse cx="-5" cy="9" rx="5" ry="7" fill="#9A6BE0"/><ellipse cx="5" cy="9" rx="5" ry="7" fill="#FF6FA5"/><rect x="-1.5" y="-10" width="3" height="22" rx="1.5" fill="#2B2140"/>',
  mushroom: '<path d="M-16 2 A16 14 0 0 1 16 2Z" fill="#E5484D"/><rect x="-6" y="2" width="12" height="14" rx="4" fill="#FFF3E0"/><circle cx="-6" cy="-5" r="3" fill="#fff"/><circle cx="5" cy="-3" r="2.5" fill="#fff"/>',
  sunflower: rot(8, (i) => `<ellipse cy="-12" rx="5" ry="9" fill="#FFC93C" transform="rotate(${i * 45})"/>`) + '<circle r="8" fill="#8B5E3C"/>',
  rainbow: ['#FF6B6B', '#FFB347', '#FFE066', '#6BCB77', '#4D96FF'].map((c, i) => `<path d="M${-20 + i * 3} 12 A${20 - i * 3} ${20 - i * 3} 0 0 1 ${20 - i * 3} 12" fill="none" stroke="${c}" stroke-width="3.2"/>`).join(''),
  fish: '<ellipse rx="14" ry="9" fill="#FFB347"/><polygon points="-12,0 -22,-8 -22,8" fill="#FFB347"/><circle cx="7" cy="-2" r="2.2" fill="#2B2140"/>',
  coral: '<path d="M0 16 V-4 M0 6 L-9 -6 M0 2 L9 -8" stroke="#FF7A8A" stroke-width="5" fill="none" stroke-linecap="round"/>',
  jellyfish: '<path d="M-13 2 A13 13 0 0 1 13 2Z" fill="#E7A8FF"/><path d="M-8 2 Q-10 10 -7 16 M0 2 Q2 10 -1 17 M8 2 Q10 10 7 15" stroke="#C57CE8" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  starfish: star('#FF9A5A', '#D9682B'),
  chest: '<rect x="-15" y="-4" width="30" height="18" rx="3" fill="#B07A4A" stroke="#7A4E2A" stroke-width="2"/><path d="M-15 -4 A15 11 0 0 1 15 -4Z" fill="#C58A52" stroke="#7A4E2A" stroke-width="2"/><rect x="-3" y="2" width="6" height="7" fill="#FFC93C"/>',
  tree: tree(),
  firefly: '<circle r="12" fill="#FFE680" opacity=".35"/><circle r="5" fill="#FFF3A8"/>',
  acorn: '<ellipse cy="4" rx="9" ry="11" fill="#C98B5A"/><path d="M-11 -2 A11 9 0 0 1 11 -2Z" fill="#8B5E3C"/>',
  owl: '<ellipse rx="13" ry="15" fill="#A9855E"/><circle cx="-5" cy="-3" r="5" fill="#fff"/><circle cx="5" cy="-3" r="5" fill="#fff"/><circle cx="-5" cy="-3" r="2.2" fill="#2B2140"/><circle cx="5" cy="-3" r="2.2" fill="#2B2140"/><polygon points="-2,3 2,3 0,7" fill="#FF9F1C"/>',
  pinebig: '<rect x="-3" y="8" width="6" height="10" fill="#6B4A2B"/><polygon points="-16,10 0,-14 16,10" fill="#2E7D4F"/><polygon points="-12,-2 0,-18 12,-2" fill="#3F9A63"/>',
  lollipop: '<rect x="-1.5" y="2" width="3" height="16" fill="#fff" stroke="#E7A3C2"/><circle cy="-6" r="12" fill="#FF6FA5"/><circle cy="-6" r="7.5" fill="#FFD6EC"/><circle cy="-6" r="3.5" fill="#FF6FA5"/>',
  cupcake: '<path d="M-11 16 L-8 2 H8 L11 16Z" fill="#7CC6F2"/><circle cy="-2" r="10" fill="#FFB3D1"/><circle cy="-10" r="6" fill="#FF8FB8"/><circle cy="-15" r="2.5" fill="#D4336F"/>',
  icecream: '<polygon points="-8,0 8,0 0,18" fill="#E0A458"/><circle cy="-5" r="9" fill="#FFB3D1"/><circle cx="-5" cy="-1" r="6" fill="#FFF3C9"/>',
  candy: '<ellipse rx="8" ry="6" fill="#FF6FA5"/><polygon points="-8,0 -17,-6 -17,6" fill="#FFD6EC"/><polygon points="8,0 17,-6 17,6" fill="#FFD6EC"/>',
  cake: '<rect x="-16" y="2" width="32" height="14" rx="3" fill="#FFB3D1"/><rect x="-11" y="-8" width="22" height="11" rx="3" fill="#FFF3C9"/><circle cy="-14" r="3.5" fill="#D4336F"/><path d="M-16 6 Q-12 12 -8 6 Q-4 12 0 6 Q4 12 8 6 Q12 12 16 6" fill="none" stroke="#fff" stroke-width="2.5"/>',
  gingerhouse: '<rect x="-14" y="-2" width="28" height="18" fill="#C98B5A"/><polygon points="-18,-2 0,-16 18,-2" fill="#fff" stroke="#F4D6E0" stroke-width="2"/><rect x="-4" y="6" width="8" height="10" fill="#8B5E3C"/><circle cx="-8" cy="4" r="2" fill="#FF6FA5"/><circle cx="8" cy="4" r="2" fill="#7CC6F2"/>',
  cloud: '<ellipse cy="4" rx="16" ry="8" fill="#fff"/><circle cx="-6" cy="-2" r="8" fill="#fff"/><circle cx="5" cy="-4" r="10" fill="#fff"/>',
  bird: '<path d="M-14 0 Q-7 -10 0 0 Q7 -10 14 0" stroke="#2B2140" stroke-width="3" fill="none" stroke-linecap="round"/>',
  balloon: '<ellipse cy="-4" rx="10" ry="12" fill="#FF6FA5"/><path d="M0 8 Q-3 14 0 20" stroke="#5A4C78" stroke-width="2" fill="none"/>',
  hotair: '<ellipse cy="-6" rx="15" ry="16" fill="#FF8A3D"/><path d="M-15 -6 Q0 12 15 -6" fill="#FFD166" opacity=".8"/><rect x="-6" y="14" width="12" height="7" rx="2" fill="#8B5E3C"/><path d="M-8 9 L-5 14 M8 9 L5 14" stroke="#5A4C78" stroke-width="1.5"/>',
  snowflake: '<g stroke="#8CC8F5" stroke-width="3" stroke-linecap="round"><path d="M-14 0H14"/><path d="M-7 -12L7 12"/><path d="M-7 12L7 -12"/></g>',
  snowman: '<circle cy="8" r="11" fill="#fff" stroke="#C9DDF0" stroke-width="2"/><circle cy="-8" r="8" fill="#fff" stroke="#C9DDF0" stroke-width="2"/><polygon points="0,-8 9,-6 0,-4" fill="#FF8A3D"/><circle cx="-3" cy="-10" r="1.4" fill="#2B2140"/><circle cx="3" cy="-10" r="1.4" fill="#2B2140"/>',
  pine: '<rect x="-2.5" y="8" width="5" height="9" fill="#6B4A2B"/><polygon points="-14,10 0,-14 14,10" fill="#2E7D4F"/><polygon points="-7,-3 0,-14 7,-3" fill="#fff"/>',
  penguin: '<ellipse rx="11" ry="15" fill="#2B2140"/><ellipse cy="3" rx="7" ry="10" fill="#fff"/><polygon points="-3,-5 3,-5 0,-1" fill="#FF9F1C"/><circle cx="-4" cy="-8" r="1.6" fill="#fff"/><circle cx="4" cy="-8" r="1.6" fill="#fff"/>',
  igloo: '<path d="M-18 14 A18 18 0 0 1 18 14Z" fill="#fff" stroke="#C9DDF0" stroke-width="2"/><path d="M-6 14 A6 7 0 0 1 6 14Z" fill="#7BA7D1"/>',
  egg: '<ellipse rx="10" ry="13" fill="#FFF6E0" stroke="#D9C79B" stroke-width="2"/><circle cx="-3" cy="-3" r="2.6" fill="#8ED081"/><circle cx="3" cy="4" r="3" fill="#8ED081"/>',
  goldegg: '<ellipse rx="10" ry="13" fill="#FFD84D" stroke="#E7A100" stroke-width="2"/><path d="M-5 -5 Q-2 -9 2 -8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
  fern: '<path d="M0 16 Q-4 0 4 -14 M0 16 Q6 4 14 -2 M0 16 Q-8 6 -14 4" stroke="#3E8E4F" stroke-width="4" fill="none" stroke-linecap="round"/>',
  dino,
  bigdino: dino + '<polygon points="-6,-4 -2,-10 2,-4" fill="#4FA85C"/><polygon points="2,-5 6,-11 10,-5" fill="#4FA85C"/>',
  volcano: '<polygon points="-18,16 -5,-10 5,-10 18,16" fill="#8B5E3C"/><path d="M-5 -10 Q0 -18 5 -10Z" fill="#FF6B3D"/>',
  flag: '<rect x="-1.5" y="-16" width="3" height="32" fill="#8B5E3C"/><polygon points="1,-16 17,-10 1,-4" fill="#FF6FA5"/>',
  house: '<rect x="-11" y="-2" width="22" height="16" fill="#FFE0B3" stroke="#C77B30" stroke-width="2"/><polygon points="-14,-2 0,-14 14,-2" fill="#FF8F8F" stroke="#C24B4B" stroke-width="2"/><rect x="-3" y="5" width="6" height="9" fill="#B07A4A"/>',
  castle: '<rect x="-16" y="-4" width="32" height="20" fill="#F7E7FF" stroke="#B79AE8" stroke-width="2"/><rect x="-21" y="-10" width="9" height="26" fill="#F7E7FF" stroke="#B79AE8" stroke-width="2"/><rect x="12" y="-10" width="9" height="26" fill="#F7E7FF" stroke="#B79AE8" stroke-width="2"/><polygon points="-23,-10 -16.5,-22 -10,-10" fill="#FF8FB8"/><polygon points="10,-10 16.5,-22 23,-10" fill="#FF8FB8"/><rect x="-4" y="5" width="8" height="11" rx="4" fill="#B79AE8"/>',
  crown: '<path d="M-14 8 L-14 -6 L-7 2 L0 -10 L7 2 L14 -6 L14 8Z" fill="#FFC93C" stroke="#E7A100" stroke-width="2" stroke-linejoin="round"/><circle cy="-10" r="2.4" fill="#E5484D"/>',
  chick: '<circle r="11" fill="#FFD84D"/><polygon points="9,0 16,3 9,6" fill="#FF8A3D"/><circle cx="4" cy="-3" r="1.8" fill="#2B2140"/>',
  appletree: tree() + '<circle cx="-5" cy="-2" r="2.6" fill="#E5484D"/><circle cx="6" cy="-7" r="2.6" fill="#E5484D"/><circle cx="4" cy="3" r="2.6" fill="#E5484D"/>',
  sheep: '<circle cx="-6" cy="2" r="8" fill="#fff" stroke="#E5E0D8" stroke-width="2"/><circle cx="3" cy="-2" r="9" fill="#fff" stroke="#E5E0D8" stroke-width="2"/><circle cx="12" cy="3" r="5.5" fill="#3A2A1A"/><circle cx="13.5" cy="1.5" r="1.2" fill="#fff"/>',
  barn: '<rect x="-16" y="-4" width="32" height="20" fill="#D9534F"/><polygon points="-20,-4 0,-20 20,-4" fill="#8B2E2B"/><rect x="-5" y="4" width="10" height="12" fill="#F7E7E0"/>'
};

/** 画布上可选的"自己的场景"元素(在画画页里挑) */
export const CUSTOM_CHOICES = ['star', 'flower', 'butterfly', 'fish', 'firefly', 'snowflake', 'balloon', 'cupcake', 'mushroom', 'chick', 'bird', 'egg'];
export const CUSTOM_BIG = ['bigstar', 'sunflower', 'cake', 'hotair', 'snowman', 'castle', 'barn'];
export const CUSTOM_RARE = ['rainbow', 'crown', 'goldegg', 'chest', 'igloo', 'gingerhouse'];

export const KIND_SCALE = { small: 1.15, big: 2.1, rare: 2.4 };

/* ---------- 场景 ---------- */
const FG_PATH = 'M0 458 Q190 424 372 466 T744 444 V500 H0Z';
const grad = (id, stops) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const sky = (id, stops) => `<defs>${grad(id, stops)}</defs><rect width="744" height="500" fill="url(#${id})"/>`;
const dots = (pts, r, fill, op = 1) => pts.map(([x, y, k = 1]) => `<circle cx="${x}" cy="${y}" r="${r * k}" fill="${fill}" opacity="${op}"/>`).join('');
const hill = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
const cloud = (x, y, s = 1, c = '#fff') => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="8" rx="38" ry="14"/><circle cx="-14" cy="-2" r="16"/><circle cx="10" cy="-8" r="20"/></g>`;
const pineBg = (x, y, s, c = '#2E7D4F', hi = '#3F9A63') => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="40" width="10" height="24" fill="#6B4A2B"/><polygon points="-34,46 0,-30 34,46" fill="${c}"/><polygon points="-26,16 0,-44 26,16" fill="${hi}"/></g>`;

export const SCENES = [
  {
    id: 'night', fg: '#2C2766', thumb: '#5B45A3',
    elements: { small: ['star', 'planet', 'comet'], big: 'bigstar', rare: 'crescent' },
    bg: () => sky('g-night', ['#25236A', '#5B45A3', '#9A6BC0']) +
      '<circle cx="610" cy="120" r="46" fill="#FFF1B8"/><circle cx="595" cy="108" r="8" fill="#F2DE9A"/><circle cx="626" cy="136" r="6" fill="#F2DE9A"/>' +
      dots([[80, 70], [150, 140], [250, 60], [330, 150], [450, 80], [520, 200], [690, 60], [700, 240], [60, 250], [200, 230], [400, 40]], 2.2, '#FFF6C9', 0.9) +
      hill('M0 410 Q190 340 372 420 T744 390 V500 H0Z', '#3B3585')
  },
  {
    id: 'garden', fg: '#4FA55B', thumb: '#8ED081',
    elements: { small: ['flower', 'butterfly', 'mushroom'], big: 'sunflower', rare: 'rainbow' },
    bg: () => sky('g-garden', ['#BFE9FF', '#E8F8FF', '#F2FFE0']) + '<circle cx="640" cy="90" r="44" fill="#FFD166"/>' + cloud(150, 90, 1) + cloud(470, 60, 0.8) +
      hill('M0 400 Q160 330 340 396 T744 380 V500 H0Z', '#8ED081') + hill('M0 440 Q200 400 420 440 T744 420 V500 H0Z', '#6EC27A')
  },
  {
    id: 'sea', fg: '#E3C77E', thumb: '#2E97D0',
    elements: { small: ['fish', 'coral', 'jellyfish'], big: 'starfish', rare: 'chest' },
    bg: () => sky('g-sea', ['#6AD4EE', '#2E97D0', '#1E6FB0']) +
      '<g fill="#fff" opacity=".12"><polygon points="120,0 180,0 300,420 200,420"/><polygon points="360,0 400,0 480,420 410,420"/><polygon points="560,0 610,0 700,420 620,420"/></g>' +
      dots([[90, 360, 1.4], [110, 300], [640, 340, 1.6], [660, 280], [590, 200, 1.2], [200, 160], [160, 110, 0.8]], 7, 'none', 1).replace(/fill="none"/g, 'fill="none" stroke="#fff" stroke-width="2.5"') +
      hill('M0 430 Q180 390 380 436 T744 420 V500 H0Z', '#EBD28D') +
      '<path d="M70 440 V380 M70 410 L50 385 M70 400 L92 372" stroke="#FF7A8A" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M660 440 V390 M660 415 L642 392 M660 405 L680 384" stroke="#FFB347" stroke-width="9" fill="none" stroke-linecap="round"/>'
  },
  {
    id: 'forest', fg: '#1B3B2C', thumb: '#2E7D4F',
    elements: { small: ['firefly', 'acorn', 'owl'], big: 'pinebig', rare: 'goldegg' },
    bg: () => sky('g-forest', ['#1F4D3A', '#2E7050', '#3E8B5A']) + '<circle cx="610" cy="100" r="36" fill="#F2F6C9" opacity=".9"/>' +
      pineBg(70, 330, 1.5, '#1F6A44', '#2A8556') + pineBg(180, 360, 1.1, '#256B49', '#2F8E5C') + pineBg(660, 330, 1.5, '#1F6A44', '#2A8556') + pineBg(560, 370, 1.0, '#256B49', '#2F8E5C') +
      dots([[130, 220], [260, 280], [500, 230], [610, 290], [300, 160]], 5, '#FFF3A8', 0.9) + hill('M0 420 Q190 380 372 430 T744 410 V500 H0Z', '#2B5E43')
  },
  {
    id: 'candy', fg: '#FF8FB8', thumb: '#FFB3D1',
    elements: { small: ['candy', 'lollipop', 'cupcake'], big: 'cake', rare: 'gingerhouse' },
    bg: () => sky('g-candy', ['#FFD6EC', '#FFE8F3', '#FFF6FA']) + cloud(160, 100, 1, '#fff') + cloud(560, 80, 1, '#fff') +
      hill('M0 410 Q150 350 320 405 T744 385 V500 H0Z', '#FFB3D1') +
      '<path d="M0 410 Q40 440 80 410 Q120 440 160 408 Q200 436 240 408 Q280 436 320 405 Q360 428 400 408 Q440 436 480 404 Q520 432 560 400 Q600 428 640 396 Q680 424 744 386 V380 H0Z" fill="#fff" opacity=".9"/>' +
      '<g transform="translate(110 330)"><rect x="-3" y="0" width="6" height="70" fill="#fff"/><circle cy="-4" r="30" fill="#FF6FA5"/><circle cy="-4" r="19" fill="#FFD6EC"/><circle cy="-4" r="8" fill="#FF6FA5"/></g>' +
      '<g transform="translate(640 340)"><rect x="-3" y="0" width="6" height="64" fill="#fff"/><circle cy="-4" r="26" fill="#7CC6F2"/><circle cy="-4" r="16" fill="#D8F0FF"/><circle cy="-4" r="7" fill="#7CC6F2"/></g>'
  },
  {
    id: 'sky', fg: '#7FBF6A', thumb: '#8FD3FF',
    elements: { small: ['cloud', 'bird', 'balloon'], big: 'hotair', rare: 'rainbow' },
    bg: () => sky('g-sky', ['#8FD3FF', '#C4E8FF', '#E6F6FF']) +
      ['#FF6B6B', '#FFB347', '#FFE066', '#6BCB77', '#4D96FF'].map((c, i) => `<path d="M${80 + i * 14} 430 A${292 - i * 14} ${292 - i * 14} 0 0 1 ${664 - i * 14} 430" fill="none" stroke="${c}" stroke-width="14" opacity=".9"/>`).join('') +
      cloud(90, 410, 1.5) + cloud(650, 410, 1.6) + cloud(560, 90, 0.9) + cloud(150, 80, 0.8) + hill('M0 430 Q200 400 400 436 T744 424 V500 H0Z', '#A9DB8E')
  },
  {
    id: 'snow', fg: '#FFFFFF', thumb: '#BFE1FF',
    elements: { small: ['snowflake', 'pine', 'penguin'], big: 'snowman', rare: 'igloo' },
    bg: () => sky('g-snow', ['#BFE1FF', '#DCEEFF', '#EAF4FF']) + dots([[90, 60], [200, 130], [310, 50], [430, 110], [540, 60], [640, 150], [700, 80], [120, 220], [600, 250], [60, 300]], 4, '#fff') +
      pineBg(90, 320, 1.2, '#2E7D4F', '#3F9A63') + pineBg(650, 330, 1.4, '#2E7D4F', '#3F9A63') +
      hill('M0 420 Q190 380 372 430 T744 410 V500 H0Z', '#F4FAFF') + '<g fill="#fff"><polygon points="42,330 90,284 138,330" opacity="0"/></g>'
  },
  {
    id: 'dino', fg: '#6FAF5C', thumb: '#CDEBA5',
    elements: { small: ['egg', 'fern', 'dino'], big: 'bigdino', rare: 'volcano' },
    bg: () => sky('g-dino', ['#FFE9B0', '#F2EDB0', '#CDEBA5']) + '<circle cx="110" cy="100" r="40" fill="#FFB347" opacity=".9"/>' +
      '<polygon points="520,420 600,230 640,230 720,420" fill="#9A6A44"/><path d="M600 230 Q620 205 640 230Z" fill="#FF6B3D"/><circle cx="630" cy="190" r="16" fill="#8B7A6A" opacity=".5"/><circle cx="650" cy="160" r="22" fill="#8B7A6A" opacity=".35"/>' +
      '<path d="M60 430 Q50 360 90 320 M60 430 Q90 370 140 360 M60 430 Q20 380 10 350" stroke="#3E8E4F" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      hill('M0 420 Q190 390 372 430 T744 408 V500 H0Z', '#86C26C')
  },
  {
    id: 'castle', fg: '#7DCB86', thumb: '#D9C6FF',
    elements: { small: ['flag', 'house', 'tree'], big: 'castle', rare: 'crown' },
    bg: () => sky('g-castle', ['#D9C6FF', '#F0D9FF', '#FFE3F1']) + cloud(140, 100, 1, '#fff') + cloud(600, 130, 0.9, '#fff') +
      '<g transform="translate(600 250)"><rect x="-60" y="30" width="120" height="120" fill="#F7E7FF" stroke="#B79AE8" stroke-width="4"/><rect x="-80" y="0" width="34" height="150" fill="#F7E7FF" stroke="#B79AE8" stroke-width="4"/><rect x="46" y="0" width="34" height="150" fill="#F7E7FF" stroke="#B79AE8" stroke-width="4"/><polygon points="-86,0 -63,-50 -40,0" fill="#FF8FB8"/><polygon points="40,0 63,-50 86,0" fill="#FF8FB8"/><rect x="-14" y="80" width="28" height="70" rx="14" fill="#B79AE8"/></g>' +
      hill('M0 410 Q200 370 400 420 T744 400 V500 H0Z', '#A8E0A0')
  },
  {
    id: 'farm', fg: '#8CC85E', thumb: '#DFF5C0',
    elements: { small: ['chick', 'appletree', 'sheep'], big: 'barn', rare: 'goldegg' },
    bg: () => sky('g-farm', ['#BFE6FF', '#DCF0FF', '#DFF5C0']) + cloud(160, 90, 1) + cloud(520, 70, 0.8) + '<circle cx="690" cy="70" r="34" fill="#FFD166"/>' +
      '<g transform="translate(110 340)"><rect x="-60" y="0" width="120" height="90" fill="#D9534F"/><polygon points="-72,0 0,-50 72,0" fill="#8B2E2B"/><rect x="-16" y="30" width="32" height="60" fill="#F7E7E0"/></g>' +
      hill('M0 420 Q200 390 420 430 T744 410 V500 H0Z', '#A8D872') +
      '<g fill="#fff" stroke="#E5E0D8" stroke-width="2"><rect x="560" y="400" width="8" height="46"/><rect x="600" y="400" width="8" height="46"/><rect x="640" y="400" width="8" height="46"/><rect x="680" y="400" width="8" height="46"/><rect x="552" y="412" width="144" height="8"/><rect x="552" y="430" width="144" height="8"/></g>'
  }
];

export const SCENE_BY_ID = Object.fromEntries(SCENES.map((s) => [s.id, s]));
export const CUSTOM_ID = 'custom';
export const fgPath = (fill) => `<path d="${FG_PATH}" fill="${fill}"/>`;

/** 一个场景会长出哪些东西:{ small:[3 个], big, rare } */
export function sceneElements(sceneId, state) {
  if (isCustomId(sceneId)) {
    const c = customCfg(state, sceneId);
    const mine = (key) => (c.useIcon[key] && c.icons[key] ? `img:${sceneId}:${key}` : null);
    return { small: [0, 1, 2].map((i) => mine('s' + i) || (c.map && c.map[i]) || CUSTOM_CHOICES[i]), big: mine('big') || c.big, rare: mine('rare') || c.rare };
  }
  return (SCENE_BY_ID[sceneId] || SCENE_BY_ID.night).elements;
}

export function elementType(sceneId, state, el) {
  const e = sceneElements(sceneId, state);
  return el.kind === 'small' ? e.small[el.slot] : e[el.kind];
}

/** 元素类型 → SVG。'img:<场景id>:<s0|s1|s2|big|rare>' 表示自己画的小图 */
export function typeMarkup(type, state) {
  if (typeof type === 'string' && type.startsWith('img:')) {
    const [, sid, key] = type.split(':');
    const c = state.scenes.customs[sid];
    const href = c && c.icons && c.icons[key];
    return href ? `<image href="${href}" x="-24" y="-24" width="48" height="48"/>` : EL.star;
  }
  return EL[type] || EL.star;
}
export function elementMarkup(sceneId, state, el) {
  const e = sceneElements(sceneId, state);
  return typeMarkup(el.kind === 'small' ? e.small[el.slot] : e[el.kind], state);
}

/** 描绘一个物品栏里的奖励小图标(给口袋用) */
export function pocketIcon(sceneId, state, item) {
  return `<svg viewBox="-24 -24 48 48" aria-hidden="true">${elementMarkup(sceneId, state, item)}</svg>`;
}
