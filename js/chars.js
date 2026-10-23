// 8 个可选角色。每个都是同一套"部件"(尾巴 tail / 身体 breath / 举手 paw-up / 头 head / 耳朵 ear-l / 眨眼 blink /
// 三种眼睛 eyes-open|learn|happy / 张嘴 mouth-open),所以 css 的动画状态类对所有角色通用,
// 再在 css 里用 .ch-xxx 给每个角色加上自己的特色动作。
// 想加新角色:在下面 CHARS 里加一项,再往 locales 里加 char.<id> 和 chars.sub.<id> 就行。
import { catBack, catFront } from './cat.js';

const D = '#2B2140';
const eyesDefault = (y = 376) => ({
  open: `<g class="eyes-open"><g class="blink"><ellipse cx="352" cy="${y}" rx="7" ry="9.5" fill="${D}"/><ellipse cx="392" cy="${y}" rx="7" ry="9.5" fill="${D}"/></g><circle cx="354.5" cy="${y - 4}" r="2.8" fill="#fff"/><circle cx="394.5" cy="${y - 4}" r="2.8" fill="#fff"/></g>`,
  learn: `<g class="eyes-learn"><ellipse cx="352" cy="${y + 5}" rx="7" ry="4.5" fill="${D}"/><ellipse cx="392" cy="${y + 5}" rx="7" ry="4.5" fill="${D}"/><path d="M343 ${y + 1} Q352 ${y - 5} 361 ${y + 1} M383 ${y + 1} Q392 ${y - 5} 401 ${y + 1}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="3.5" stroke-linecap="round"/></g>`,
  happy: `<g class="eyes-happy"><path d="M343 ${y + 5} Q352 ${y - 9} 361 ${y + 5} M383 ${y + 5} Q392 ${y - 9} 401 ${y + 5}" fill="none" stroke="${D}" stroke-width="4.5" stroke-linecap="round"/></g>`
});

function animal(o) {
  const eyes = o.eyes || eyesDefault(o.eyeY);
  const arms = o.noArms ? '' : `<g class="paw-up">
      <path d="M332 430 L308 388" fill="none" stroke="${o.arm || o.body}" stroke-width="24" stroke-linecap="round"/><circle cx="305" cy="383" r="13" fill="${o.hand}"/>
      <path d="M412 430 L436 388" fill="none" stroke="${o.arm || o.body}" stroke-width="24" stroke-linecap="round"/><circle cx="439" cy="383" r="13" fill="${o.hand}"/></g>`;
  return `<g class="cat-all ch-${o.id}">
    ${o.tail ? `<g class="tail">${o.tail}</g>` : ''}
    <g class="breath">${o.bodyShape || `<ellipse cx="372" cy="442" rx="64" ry="58" fill="${o.body}"/>`}
      <ellipse cx="372" cy="454" rx="38" ry="36" fill="${o.belly}"/>${o.bodyMarks || ''}</g>
    ${arms}
    <g class="head">
      ${o.earsL ? `<g class="ear-l">${o.earsL}</g>` : ''}${o.earsR || ''}
      ${o.headShape || `<circle cx="372" cy="374" r="56" fill="${o.head || o.body}"/>`}
      ${o.marks || ''}
      ${o.cheek === false ? '' : `<ellipse cx="336" cy="394" rx="11" ry="7" fill="#FF9DB5" opacity=".8"/><ellipse cx="408" cy="394" rx="11" ry="7" fill="#FF9DB5" opacity=".8"/>`}
      ${eyes.open}${eyes.learn}${eyes.happy}
      ${o.face || ''}
      <g class="mouth-open">${o.mouthOpen || `<ellipse cx="372" cy="410" rx="7" ry="6" fill="#B3274F"/>`}</g>
    </g></g>`;
}

const ear = (pts, fill, tip) => `<path d="${pts}" fill="${fill}" stroke="${fill}" stroke-width="10" stroke-linejoin="round"/>${tip || ''}`;
const mirrorX = (d) => d; // 右耳单独写,不做自动镜像,便于微调

const BUILD = {
  dog: () => animal({
    id: 'dog', body: '#E8B26A', belly: '#FFF1DC', hand: '#FFF1DC',
    tail: '<path d="M428 450 C468 452 488 424 478 386" fill="none" stroke="#E8B26A" stroke-width="20" stroke-linecap="round"/>',
    earsL: '<path d="M328 338 C294 334 288 394 318 408 C332 394 334 362 336 346Z" fill="#8B5A2B" stroke="#8B5A2B" stroke-width="6" stroke-linejoin="round"/>',
    earsR: '<path d="M416 338 C450 334 456 394 426 408 C412 394 410 362 408 346Z" fill="#8B5A2B" stroke="#8B5A2B" stroke-width="6" stroke-linejoin="round"/>',
    marks: '<ellipse cx="398" cy="368" rx="17" ry="19" fill="#8B5A2B" opacity=".9"/><ellipse cx="372" cy="398" rx="25" ry="19" fill="#FFF1DC"/>',
    face: `<ellipse cx="372" cy="387" rx="9.5" ry="6.5" fill="${D}"/><path d="M372 393 V402 M372 402 Q364 410 357 404 M372 402 Q380 410 387 404" fill="none" stroke="${D}" stroke-width="2.8" stroke-linecap="round"/>`,
    mouthOpen: '<ellipse cx="372" cy="411" rx="9" ry="8" fill="#B3274F"/><ellipse cx="372" cy="416" rx="6" ry="5" fill="#FF8FA3"/>',
    cheek: false
  }),
  fox: () => animal({
    id: 'fox', body: '#F07F2D', belly: '#FFF3E6', hand: '#3A2A1A',
    tail: '<path d="M424 456 C500 466 524 408 486 358 C474 398 452 420 424 430Z" fill="#F07F2D" stroke="#F07F2D" stroke-width="8" stroke-linejoin="round"/><path d="M486 358 C498 374 504 392 500 410 C488 404 478 388 486 358Z" fill="#FFF3E6"/>',
    earsL: ear('M324 346 L318 290 L364 324Z', '#F07F2D', '<path d="M320 318 L318 292 L338 306Z" fill="#3A2A1A"/>'),
    earsR: ear('M420 346 L426 290 L380 324Z', '#F07F2D', '<path d="M424 318 L426 292 L406 306Z" fill="#3A2A1A"/>'),
    marks: '<path d="M318 392 Q372 446 426 392 Q400 378 372 392 Q344 378 318 392Z" fill="#FFF3E6"/>',
    face: `<polygon points="365,392 379,392 372,400" fill="${D}" stroke="${D}" stroke-width="3" stroke-linejoin="round"/><path d="M372 400 Q366 408 359 404 M372 400 Q378 408 385 404" fill="none" stroke="${D}" stroke-width="2.8" stroke-linecap="round"/>`
  }),
  wolf: () => animal({
    id: 'wolf', body: '#8C97A8', belly: '#E4E9F0', hand: '#E4E9F0',
    tail: '<path d="M426 456 C476 470 502 440 498 398" fill="none" stroke="#8C97A8" stroke-width="22" stroke-linecap="round"/><path d="M498 398 C497 410 495 420 490 430" fill="none" stroke="#E4E9F0" stroke-width="22" stroke-linecap="round"/>',
    earsL: ear('M324 346 L314 286 L366 326Z', '#8C97A8', '<path d="M324 330 L318 300 L344 320Z" fill="#55607A"/>'),
    earsR: ear('M420 346 L430 286 L378 326Z', '#8C97A8', '<path d="M420 330 L426 300 L400 320Z" fill="#55607A"/>'),
    marks: '<path d="M372 322 V338 M360 325 L363 339 M384 325 L381 339" fill="none" stroke="#6C768A" stroke-width="5" stroke-linecap="round"/><path d="M318 388 L302 398 L322 404 Z M426 388 L442 398 L422 404Z" fill="#8C97A8" stroke="#8C97A8" stroke-width="4" stroke-linejoin="round"/><ellipse cx="372" cy="400" rx="27" ry="19" fill="#E4E9F0"/>',
    face: `<ellipse cx="372" cy="388" rx="9.5" ry="6.5" fill="${D}"/><path d="M372 394 V402 M372 402 Q364 410 357 404 M372 402 Q380 410 387 404" fill="none" stroke="${D}" stroke-width="2.8" stroke-linecap="round"/>`,
    mouthOpen: '<ellipse cx="372" cy="412" rx="9" ry="9" fill="#7A2A3E"/>',
    cheek: false
  }),
  snake: () => animal({
    id: 'snake', body: '#5FBF6B', belly: '#E5F7C8', noArms: true, hand: '#5FBF6B',
    tail: '<path d="M436 462 C474 470 498 446 484 420 C478 410 464 416 470 428" fill="none" stroke="#5FBF6B" stroke-width="16" stroke-linecap="round"/>',
    bodyShape: '<ellipse cx="372" cy="446" rx="74" ry="54" fill="#5FBF6B"/><path d="M312 436 Q372 472 432 436 M322 452 Q372 482 422 452" fill="none" stroke="#3E9A4B" stroke-width="6" stroke-linecap="round" opacity=".7"/>',
    headShape: '<ellipse cx="372" cy="376" rx="54" ry="48" fill="#5FBF6B"/><path d="M372 332 L385 346 L372 360 L359 346Z" fill="#3E9A4B"/>',
    face: `<path d="M358 396 Q372 407 386 396" fill="none" stroke="${D}" stroke-width="3" stroke-linecap="round"/><path class="tongue" d="M372 402 V418 M372 418 L365 427 M372 418 L379 427" fill="none" stroke="#E5484D" stroke-width="3" stroke-linecap="round"/>`,
    mouthOpen: '<ellipse cx="372" cy="408" rx="10" ry="9" fill="#B3274F"/>'
  }),
  duck: () => animal({
    id: 'duck', body: '#FFD84D', belly: '#FFF3B8', hand: '#F2C230', arm: '#F2C230',
    tail: '<path d="M428 436 L458 414 L446 452Z" fill="#F2C230" stroke="#F2C230" stroke-width="8" stroke-linejoin="round"/>',
    bodyMarks: '<ellipse cx="318" cy="450" rx="13" ry="27" fill="#F2C230" transform="rotate(12 318 450)"/><ellipse cx="426" cy="450" rx="13" ry="27" fill="#F2C230" transform="rotate(-12 426 450)"/>',
    marks: '<path d="M372 318 Q364 304 374 300 M378 320 Q390 308 398 313" fill="none" stroke="#F2C230" stroke-width="5" stroke-linecap="round"/>',
    eyeY: 372,
    face: '<ellipse cx="372" cy="396" rx="25" ry="12" fill="#FF9F1C"/><path d="M349 396 Q372 403 395 396" fill="none" stroke="#E07F00" stroke-width="3" stroke-linecap="round"/><circle cx="364" cy="392" r="1.8" fill="#C2410C"/><circle cx="380" cy="392" r="1.8" fill="#C2410C"/>',
    mouthOpen: '<ellipse cx="372" cy="403" rx="15" ry="7" fill="#C2410C"/>'
  }),
  capybara: () => animal({
    id: 'capybara', body: '#A9744A', belly: '#C99A6B', hand: '#8A5A36',
    bodyShape: '<ellipse cx="372" cy="442" rx="70" ry="60" fill="#A9744A"/>',
    earsL: '<circle cx="332" cy="334" r="12" fill="#A9744A" stroke="#8A5A36" stroke-width="3"/><circle cx="332" cy="334" r="5" fill="#8A5A36"/>',
    earsR: '<circle cx="412" cy="334" r="12" fill="#A9744A" stroke="#8A5A36" stroke-width="3"/><circle cx="412" cy="334" r="5" fill="#8A5A36"/>',
    headShape: '<rect x="318" y="328" width="108" height="96" rx="48" fill="#A9744A"/>',
    marks: '<ellipse cx="372" cy="398" rx="27" ry="19" fill="#8A5A36"/><g class="yuzu"><circle cx="372" cy="322" r="14" fill="#FFB627"/><path d="M372 308 Q378 299 388 301 Q384 309 372 309Z" fill="#4FA85C"/></g>',
    eyeY: 372,
    eyes: {
      open: `<g class="eyes-open"><g class="blink"><ellipse cx="346" cy="372" rx="5.5" ry="5" fill="${D}"/><ellipse cx="398" cy="372" rx="5.5" ry="5" fill="${D}"/></g><path d="M339 366 Q346 361 353 366 M391 366 Q398 361 405 366" fill="none" stroke="#6B4423" stroke-width="3" stroke-linecap="round"/></g>`,
      learn: `<g class="eyes-learn"><path d="M339 374 Q346 370 353 374 M391 374 Q398 370 405 374" fill="none" stroke="${D}" stroke-width="4" stroke-linecap="round"/></g>`,
      happy: `<g class="eyes-happy"><path d="M338 376 Q346 364 354 376 M390 376 Q398 364 406 376" fill="none" stroke="${D}" stroke-width="4.5" stroke-linecap="round"/></g>`
    },
    face: `<ellipse cx="363" cy="392" rx="3.4" ry="2.6" fill="#3A2A1A"/><ellipse cx="381" cy="392" rx="3.4" ry="2.6" fill="#3A2A1A"/><path d="M360 404 Q372 411 384 404" fill="none" stroke="#3A2A1A" stroke-width="3" stroke-linecap="round"/>`,
    mouthOpen: '<ellipse cx="372" cy="410" rx="9" ry="6" fill="#5A2A1A"/>'
  }),
  croc: () => animal({
    id: 'croc', body: '#6DBB5A', belly: '#E9F5B0', hand: '#6DBB5A',
    tail: '<path d="M426 454 C480 464 508 432 498 396" fill="none" stroke="#6DBB5A" stroke-width="26" stroke-linecap="round"/><path d="M470 430 L476 418 L484 430 M488 416 L496 406 L500 420" fill="#4E9A41" stroke="#4E9A41" stroke-width="4" stroke-linejoin="round"/>',
    bodyMarks: '<path d="M338 392 L344 382 L350 392 M360 386 L366 376 L372 386 M382 386 L388 376 L394 386" fill="#4E9A41" stroke="#4E9A41" stroke-width="3" stroke-linejoin="round"/>',
    headShape: '<ellipse cx="372" cy="372" rx="56" ry="44" fill="#5BAA48"/><circle cx="346" cy="336" r="20" fill="#5BAA48"/><circle cx="398" cy="336" r="20" fill="#5BAA48"/><rect x="322" y="372" width="100" height="58" rx="28" fill="#6DBB5A"/><circle cx="354" cy="376" r="8" fill="#6DBB5A"/><circle cx="390" cy="376" r="8" fill="#6DBB5A"/><path d="M366 318 L372 306 L378 318 M352 322 L358 311 L364 322 M380 322 L386 311 L392 322" fill="#4E9A41" stroke="#4E9A41" stroke-width="3" stroke-linejoin="round"/>',
    cheek: false,
    eyes: {
      open: `<g class="eyes-open"><circle cx="346" cy="336" r="11" fill="#fff"/><circle cx="398" cy="336" r="11" fill="#fff"/><g class="blink"><circle cx="348" cy="337" r="6" fill="${D}"/><circle cx="396" cy="337" r="6" fill="${D}"/></g><circle cx="350" cy="334" r="2" fill="#fff"/><circle cx="398" cy="334" r="2" fill="#fff"/></g>`,
      learn: `<g class="eyes-learn"><circle cx="346" cy="338" r="11" fill="#fff"/><circle cx="398" cy="338" r="11" fill="#fff"/><circle cx="346" cy="342" r="6" fill="${D}"/><circle cx="398" cy="342" r="6" fill="${D}"/><path d="M334 334 H358 M386 334 H410" stroke="#4E9A41" stroke-width="9"/></g>`,
      happy: `<g class="eyes-happy"><path d="M335 340 Q346 324 357 340 M387 340 Q398 324 409 340" fill="none" stroke="${D}" stroke-width="4.5" stroke-linecap="round"/></g>`
    },
    face: `<circle cx="354" cy="376" r="2.6" fill="#2B6B2A"/><circle cx="390" cy="376" r="2.6" fill="#2B6B2A"/><path d="M332 408 Q372 428 412 408" fill="none" stroke="#2B6B2A" stroke-width="4" stroke-linecap="round"/><path d="M344 414 l4 7 l4 -5 M392 414 l4 -5 l4 7" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`,
    mouthOpen: '<path d="M330 404 Q372 450 414 404Z" fill="#B3274F" stroke="#2B6B2A" stroke-width="3" stroke-linejoin="round"/><path d="M342 406 l4 8 l4 -7 M392 406 l4 -7 l4 8" fill="#fff"/>'
  })
};
void mirrorX;

export const CHARS = {
  cat: { id: 'cat', sound: 'meow', back: () => catBack(), front: () => catFront('#FFE2BD') },
  dog: { id: 'dog', sound: 'bark', back: BUILD.dog, front: () => catFront('#FFF1DC') },
  fox: { id: 'fox', sound: 'yip', back: BUILD.fox, front: () => catFront('#3A2A1A') },
  wolf: { id: 'wolf', sound: 'howl', back: BUILD.wolf, front: () => catFront('#E4E9F0') },
  snake: { id: 'snake', sound: 'hiss', back: BUILD.snake, front: () => catFront('') },
  duck: { id: 'duck', sound: 'quack', back: BUILD.duck, front: () => catFront('#F2C230') },
  capybara: { id: 'capybara', sound: 'squeak', back: BUILD.capybara, front: () => catFront('#8A5A36') },
  croc: { id: 'croc', sound: 'chomp', back: BUILD.croc, front: () => catFront('#6DBB5A') }
};
export const CHAR_ORDER = ['cat', 'dog', 'fox', 'wolf', 'snake', 'duck', 'capybara', 'croc'];
export const charOf = (id) => CHARS[id] || CHARS.cat;

/** 选角色页里的头像小图:角色加书,背景由 css 决定 */
export function charThumb(id) {
  const c = charOf(id);
  return `<svg viewBox="262 270 220 230" aria-hidden="true" class="ch-thumb ph-idle">${c.back()}${c.front()}</svg>`;
}
