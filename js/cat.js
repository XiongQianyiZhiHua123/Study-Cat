// 猫咪角色。动画全部在 css/cat.css 里,由外层元素的 ph-idle / ph-learn / ph-done 三个状态类控制。
// 猫咪坐在画布正中(x=372),前景山坡会盖住它的下半身。

export function catBack() {
  return `<g class="cat-all ch-cat">
    <g class="tail">
      <path d="M426 452 C476 452 502 414 480 374" fill="none" stroke="#F6A04D" stroke-width="22" stroke-linecap="round"/>
      <path d="M470 408 L492 398 M476 392 L496 380" fill="none" stroke="#D9822B" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g class="breath">
      <ellipse cx="372" cy="442" rx="64" ry="58" fill="#F6A04D"/>
      <ellipse cx="372" cy="454" rx="38" ry="36" fill="#FFE2BD"/>
      <path d="M320 436 Q332 428 328 414 M424 436 Q412 428 416 414" fill="none" stroke="#D9822B" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g class="paw-up">
      <path d="M332 430 L308 388" fill="none" stroke="#F6A04D" stroke-width="24" stroke-linecap="round"/><circle cx="305" cy="383" r="13" fill="#FFE2BD"/>
      <path d="M412 430 L436 388" fill="none" stroke="#F6A04D" stroke-width="24" stroke-linecap="round"/><circle cx="439" cy="383" r="13" fill="#FFE2BD"/>
    </g>
    <g class="head">
      <g class="ear-l">
        <path d="M326 344 L322 298 L362 324 Z" fill="#F6A04D" stroke="#F6A04D" stroke-width="10" stroke-linejoin="round"/>
        <path d="M333 334 L331 312 L350 324 Z" fill="#FFB3C7" stroke="#FFB3C7" stroke-width="4" stroke-linejoin="round"/>
      </g>
      <path d="M418 344 L422 298 L382 324 Z" fill="#F6A04D" stroke="#F6A04D" stroke-width="10" stroke-linejoin="round"/>
      <path d="M411 334 L413 312 L394 324 Z" fill="#FFB3C7" stroke="#FFB3C7" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="372" cy="374" r="56" fill="#F6A04D"/>
      <path d="M372 322 V337 M357 325 L360 338 M387 325 L384 338" fill="none" stroke="#D9822B" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="336" cy="394" rx="11" ry="7" fill="#FF9DB5" opacity=".85"/><ellipse cx="408" cy="394" rx="11" ry="7" fill="#FF9DB5" opacity=".85"/>
      <g class="eyes-open">
        <g class="blink"><ellipse cx="352" cy="376" rx="7" ry="9.5" fill="#2B2140"/><ellipse cx="392" cy="376" rx="7" ry="9.5" fill="#2B2140"/></g>
        <circle cx="354.5" cy="372" r="2.8" fill="#fff"/><circle cx="394.5" cy="372" r="2.8" fill="#fff"/>
      </g>
      <g class="eyes-learn">
        <ellipse cx="352" cy="381" rx="7" ry="4.5" fill="#2B2140"/><ellipse cx="392" cy="381" rx="7" ry="4.5" fill="#2B2140"/>
        <path d="M343 377 Q352 371 361 377 M383 377 Q392 371 401 377" fill="none" stroke="#D9822B" stroke-width="3.5" stroke-linecap="round"/>
      </g>
      <g class="eyes-happy"><path d="M343 381 Q352 367 361 381 M383 381 Q392 367 401 381" fill="none" stroke="#2B2140" stroke-width="4.5" stroke-linecap="round"/></g>
      <polygon points="366,392 378,392 372,399" fill="#E8467C" stroke="#E8467C" stroke-width="3" stroke-linejoin="round"/>
      <path d="M372 399 Q366 408 359 403 M372 399 Q378 408 385 403" fill="none" stroke="#2B2140" stroke-width="2.8" stroke-linecap="round"/>
      <ellipse class="mouth-open" cx="372" cy="409" rx="7" ry="6" fill="#B3274F"/>
      <path d="M326 394 L298 388 M326 402 L300 408 M418 394 L446 388 M418 402 L444 408" fill="none" stroke="#FFF6E8" stroke-width="2.8" stroke-linecap="round"/>
    </g>
  </g>`;
}

/** 前景:书和前爪(画在山坡之上) */
export function catFront(paw = '#FFE2BD') {
  return `<g class="book-closed"><rect x="282" y="456" width="48" height="32" rx="5" fill="#FFD166"/><path d="M296 456 V488" stroke="#E7A100" stroke-width="3"/></g>
  <g class="book-open">
    <path d="M306 452 L370 462 L370 494 L306 484 Z" fill="#FFFDF5" stroke="#E7C98A" stroke-width="3" stroke-linejoin="round"/>
    <path d="M438 452 L374 462 L374 494 L438 484 Z" fill="#FFFDF5" stroke="#E7C98A" stroke-width="3" stroke-linejoin="round"/>
    <path d="M318 466 L358 472 M318 476 L358 482 M390 472 L430 466 M390 482 L430 476" stroke="#C9B58A" stroke-width="3" stroke-linecap="round"/>
  </g>
  ${paw ? `<ellipse cx="344" cy="462" rx="16" ry="12" fill="${paw}"/><ellipse cx="400" cy="462" rx="16" ry="12" fill="${paw}"/>` : ''}`;
}

/** 完成时的闪光和飞进口袋的大星星 */
export function catFx() {
  const p = '0,-14 4.1,-5.6 13.3,-4.3 6.7,2.2 8.2,11.3 0,7 -8.2,11.3 -6.7,2.2 -13.3,-4.3 -4.1,-5.6';
  return `<polygon class="spark" points="${p}" transform="translate(300 300) scale(.7)" fill="#FFF6C9"/>
  <polygon class="spark" style="animation-delay:.3s" points="${p}" transform="translate(448 306) scale(.8)" fill="#FFE27A"/>
  <polygon class="spark" style="animation-delay:.6s" points="${p}" transform="translate(372 262) scale(.6)" fill="#FFF6C9"/>
  <g class="dropwrap" transform="translate(372 300)"><g class="dropstar"><polygon points="${p}" fill="#FFC93C" stroke="#E7A100" stroke-width="2"/></g></g>`;
}
