(() => {
  const cardLibrary = {
    strike: { name: 'Quick Slash', type: 'ATTACK', cost: 1, icon: '⚔', desc: '<strong>7 damage</strong> + power · hit on 2+', threshold: 2, damage: 7, attack: true, tag: 'D6 ROLL' },
    heavy: { name: 'Cinder Cleave', type: 'ATTACK', cost: 2, icon: '⚔', desc: '<strong>11 damage</strong> + power · hit on 4+', threshold: 4, damage: 11, attack: true, tag: 'D6 ROLL' },
    aim: { name: 'True Aim', type: 'ATTACK', cost: 1, icon: '➶', desc: '<strong>4 damage</strong> + power · hit on 2+', threshold: 2, damage: 4, attack: true, tag: 'D6 ROLL' },
    guard: { name: 'Iron Guard', type: 'SKILL', cost: 1, icon: '⬟', desc: 'Gain <strong>8 guard</strong> this round.', block: 8, tag: 'DEFEND' },
    mend: { name: 'Quiet Resolve', type: 'SKILL', cost: 1, icon: '✦', desc: 'Restore <strong>5 vitality.</strong>', heal: 5, tag: 'RESTORE' },
    feint: { name: 'Ashen Feint', type: 'ATTACK', cost: 0, icon: '〰', desc: '<strong>3 damage</strong> + power · hit on 2+', threshold: 2, damage: 3, attack: true, tag: 'D6 ROLL' },
    brace: { name: 'Stone Stance', type: 'SKILL', cost: 1, icon: '⛨', desc: 'Gain <strong>5 guard</strong> and draw 1.', block: 5, draw: 1, tag: 'DEFEND' },
  };
  const encounters = [
    { name: 'A Quiet Ambush', enemy: 'The Ashen Stalker', type: 'HOLLOW SCOUT · UNDEAD', hp: 34, intent: 8, quote: 'A shape stirs in the ash…', journal: "The dead don't sleep here. Keep your guard high.", reward: 18 },
    { name: 'The Broken Watch', enemy: 'Cinderbound Raider', type: 'ROAD THIEF · CINDERKIN', hp: 42, intent: 10, quote: 'Steel flashes in the gloom.', journal: 'The old watchtower still draws hungry eyes.', reward: 24 },
    { name: 'A Debt in Bone', enemy: 'Grave-Marked Knight', type: 'OATHBREAKER · ELITE', hp: 54, intent: 12, quote: 'A forgotten oath rattles its chains.', journal: 'Beyond the ridge, the air itself begins to burn.', reward: 32 },
    { name: 'The Ember Warden', enemy: 'The Hollow Warden', type: 'THRONEKEEPER · BOSS', hp: 76, intent: 14, quote: '“Your light ends here, little flame.”', journal: 'The throne is silent. The road is yours again.', reward: 60 },
  ];
  const initialDeck = ['strike','strike','strike','heavy','aim','aim','guard','guard','mend','mend','feint','brace'];
  const $ = (id) => document.getElementById(id);
  let state;
  let toastTimer;
  let busy = false;
  let nextCardId = 0;

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
    return list;
  }
  function freshCard(key) { return { key, id: ++nextCardId }; }
  function initRun() {
    nextCardId = 0;
    state = { hp: 52, maxHp: 60, block: 0, gold: 42, potions: 2, power: 3, encounter: 0, round: 1, energy: 3, maxEnergy: 3, draw: shuffle(initialDeck.map(freshCard)), discard: [], hand: [], enemyHp: encounters[0].hp, won: false, lost: false };
    drawCards(5); render();
  }
  function drawCards(amount) {
    for (let i = 0; i < amount; i++) {
      if (!state.draw.length && state.discard.length) state.draw = shuffle(state.discard.splice(0));
      if (!state.draw.length) return;
      state.hand.push(state.draw.pop());
    }
  }
  function currentEncounter() { return encounters[state.encounter]; }
  function updateIntent() {
    const e = currentEncounter();
    const amount = e.intent + (state.round > 2 && state.encounter > 0 ? 2 : 0);
    $('enemyIntent').querySelector('small').textContent = `${amount} damage`;
    $('enemyIntent').querySelector('b').textContent = state.encounter === 3 && state.round % 2 === 0 ? 'DREAD PULSE' : 'STRIKING';
    $('enemyIntent').querySelector('.intent-icon').textContent = state.encounter === 3 && state.round % 2 === 0 ? '✹' : '⚔';
  }
  function render() {
    if (!state) return;
    const e = currentEncounter();
    $('gold').textContent = state.gold;
    $('hpText').textContent = `${state.hp} / ${state.maxHp}`;
    $('hpBar').style.width = `${Math.max(0, state.hp / state.maxHp * 100)}%`;
    $('blockText').textContent = state.block;
    $('blockBar').style.width = `${Math.min(100, state.block / 20 * 100)}%`;
    $('potionCount').textContent = state.potions;
    $('potionButton').querySelector('small').textContent = `Restore 12 vitality · ${state.potions} remaining`;
    $('potionButton').disabled = state.potions < 1 || state.hp >= state.maxHp || state.won || state.lost;
    $('encounterNumber').textContent = String(state.encounter + 1).padStart(2, '0');
    $('encounterName').textContent = e.name;
    $('roundNumber').textContent = String(state.round).padStart(2, '0');
    $('enemyName').textContent = e.enemy;
    $('enemyType').textContent = e.type;
    $('enemyHpText').textContent = `${Math.max(0, state.enemyHp)} / ${e.hp}`;
    $('enemyHpBar').style.width = `${Math.max(0, state.enemyHp / e.hp * 100)}%`;
    $('battleQuote').textContent = e.quote;
    $('journalText').textContent = e.journal;
    $('progressText').innerHTML = `${state.won ? 4 : state.encounter + 1} <small>/ 4</small>`;
    $('progressBar').style.width = `${state.won ? 100 : (state.encounter + 1) / 4 * 100}%`;
    $('drawCount').textContent = state.draw.length;
    $('discardCount').textContent = state.discard.length;
    $('energyText').textContent = `${state.energy} / ${state.maxEnergy}`;
    $('energyPips').innerHTML = Array.from({ length: state.maxEnergy }, (_, i) => `<i class="${i >= state.energy ? 'empty' : ''}"></i>`).join('');
    $('handCount').textContent = `${state.hand.length} CARD${state.hand.length === 1 ? '' : 'S'}`;
    $('handTurn').textContent = String(state.round).padStart(2, '0');
    $('endTurnButton').disabled = busy || state.won || state.lost;
    $('endTurnButton').style.opacity = state.won || state.lost ? '.5' : '1';
    $('enemyWrap').classList.toggle('dead', state.enemyHp <= 0);
    updateIntent();
    $('cardRow').innerHTML = state.hand.map((card, index) => {
      const c = cardLibrary[card.key];
      const disabled = busy || state.won || state.lost || state.energy < c.cost;
      return `<button class="game-card ${c.attack ? 'attack-card' : 'skill-card'}" data-index="${index}" ${disabled ? 'disabled' : ''} aria-label="${c.name}, costs ${c.cost}. ${c.desc.replace(/<[^>]*>/g, '')}"><span class="card-top"><span class="card-cost">${c.cost}</span><span class="card-type">${c.type}</span></span><b class="card-title">${c.name}</b><span class="card-art"><span>${c.icon}</span></span><span class="card-desc">${c.desc}</span><span class="card-bottom"><span>${c.tag}</span><span class="die">${c.attack ? '⚄' : '✧'}</span></span></button>`;
    }).join('');
    document.querySelectorAll('.game-card').forEach(button => button.addEventListener('click', () => playCard(Number(button.dataset.index))));
  }
  function showRoll(text, kind = '') {
    const toast = $('rollToast'); toast.className = `roll-toast show ${kind}`; toast.textContent = text;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1150);
  }
  function playCard(index) {
    if (busy || state.won || state.lost) return;
    const card = state.hand[index]; if (!card) return;
    const c = cardLibrary[card.key]; if (state.energy < c.cost) return;
    state.energy -= c.cost; state.hand.splice(index, 1); state.discard.push(card);
    if (c.attack) {
      const roll = Math.floor(Math.random() * 6) + 1;
      if (roll === 1) {
        showRoll('⚄  1  —  MISSED', 'miss'); $('battleQuote').textContent = 'The blade finds only smoke.';
      } else if (roll === 6) {
        const damage = (c.damage + state.power) * 2;
        state.enemyHp = Math.max(0, state.enemyHp - damage);
        showRoll(`⚄  6  —  CRITICAL!  ${damage} DMG`, 'crit'); $('battleQuote').textContent = 'A perfect strike. The embers flare!';
        animateHit();
      } else if (roll >= c.threshold) {
        const damage = c.damage + state.power;
        state.enemyHp = Math.max(0, state.enemyHp - damage);
        showRoll(`⚄  ${roll}  —  HIT  ·  ${damage} DMG`); $('battleQuote').textContent = 'Steel bites through the ash.';
        animateHit();
      } else {
        showRoll(`⚄  ${roll}  —  NO OPENING`, 'miss'); $('battleQuote').textContent = 'The enemy turns your strike aside.';
      }
    }
    if (c.block) { state.block += c.block; $('battleQuote').textContent = `You brace behind ${state.block} guard.`; }
    if (c.heal) { const amount = Math.min(c.heal, state.maxHp - state.hp); state.hp += amount; showRoll(`✦  RESTORED  ${amount} VITALITY`); }
    if (c.draw) drawCards(c.draw);
    render();
    if (state.enemyHp <= 0) { busy = true; render(); setTimeout(completeEncounter, 900); }
  }
  function animateHit() { $('enemyWrap').classList.remove('hit'); void $('enemyWrap').offsetWidth; $('enemyWrap').classList.add('hit'); }
  function takeEnemyTurn() {
    const e = currentEncounter();
    const attack = e.intent + (state.round > 2 && state.encounter > 0 ? 2 : 0);
    const blocked = Math.min(state.block, attack); state.block -= blocked;
    const damage = attack - blocked; state.hp = Math.max(0, state.hp - damage);
    $('battleQuote').textContent = damage ? `The blow lands for ${damage} damage.` : 'Your guard turns the blow aside!';
    if (state.hp <= 0) { state.lost = true; state.hand.forEach(c => state.discard.push(c)); state.hand = []; render(); setTimeout(showDefeat, 500); return; }
    state.discard.push(...state.hand); state.hand = []; state.round++; state.energy = state.maxEnergy; drawCards(5); render();
  }
  function endTurn() {
    if (busy || state.won || state.lost) return;
    busy = true; render(); setTimeout(() => { takeEnemyTurn(); busy = false; render(); }, 600);
  }
  function completeEncounter() {
    busy = false;
    state.gold += currentEncounter().reward;
    if (state.encounter === encounters.length - 1) {
      state.won = true; render(); showVictory(); return;
    }
    state.encounter++;
    state.enemyHp = currentEncounter().hp;
    state.hp = Math.min(state.maxHp, state.hp + 6);
    state.block = 0; state.round = 1; state.energy = state.maxEnergy;
    state.discard.push(...state.hand); state.hand = []; drawCards(5);
    $('battleQuote').textContent = `The path opens. +${currentEncounter().reward} shards · +6 vitality`;
    render();
  }
  function usePotion() {
    if (!state.potions || state.hp >= state.maxHp || busy || state.won || state.lost) return;
    const healed = Math.min(12, state.maxHp - state.hp); state.hp += healed; state.potions--;
    showRoll(`⚗  RESTORED  ${healed} VITALITY`); $('battleQuote').textContent = 'Warmth returns to your limbs.'; render();
  }
  function openModal(title, eyebrow, html, actionText = '', action = null) {
    $('modalTitle').textContent = title; $('modalEyebrow').textContent = eyebrow; $('modalBody').innerHTML = html;
    const button = $('modalAction'); button.hidden = !actionText; button.textContent = actionText || '';
    button.onclick = action; $('modalBackdrop').hidden = false; $('modalClose').focus();
  }
  function closeModal() { $('modalBackdrop').hidden = true; }
  function showDefeat() {
    openModal('The lantern fades', 'RUN ENDED', `<p>Kael fell on the Ashen Road at encounter <strong>${state.encounter + 1}</strong>, round <strong>${state.round}</strong>.</p><p>Every roll tells a story. Shuffle the deck and try another path.</p>`, 'BEGIN A NEW RUN', () => { closeModal(); initRun(); });
  }
  function showVictory() {
    openModal('The road is yours', 'VICTORY · EMBERFALL', `<p>The Hollow Warden falls. Kael carries the last lantern beyond the throne, and dawn finds the Ashen Road.</p><p><strong>${state.gold} shards</strong> gathered · <strong>${state.hp}/${state.maxHp}</strong> vitality remaining.</p>`, 'PLAY AGAIN', () => { closeModal(); initRun(); });
  }
  function showPile(which) {
    const pile = which === 'draw' ? state.draw : state.discard;
    const counts = {};
    pile.forEach(c => counts[c.key] = (counts[c.key] || 0) + 1);
    const content = Object.keys(counts).length ? `<div class="modal-card-list">${Object.entries(counts).map(([key, count]) => `<div class="pile-card"><span>${cardLibrary[key].name}</span><small>× ${count}</small></div>`).join('')}</div>` : '<p>This pile is empty.</p>';
    openModal(which === 'draw' ? 'Draw pile' : 'Discard pile', `${pile.length} CARDS`, content);
  }
  $('endTurnButton').addEventListener('click', endTurn);
  $('potionButton').addEventListener('click', usePotion);
  $('drawPileButton').addEventListener('click', () => showPile('draw'));
  $('discardPileButton').addEventListener('click', () => showPile('discard'));
  $('modalClose').addEventListener('click', closeModal);
  $('modalBackdrop').addEventListener('click', e => { if (e.target === $('modalBackdrop')) closeModal(); });
  $('rulesButton').addEventListener('click', () => openModal('Play your hand. Face the odds.', 'FIELD GUIDE', `<ul><li>Spend <strong>Focus</strong> to play cards. You get 3 each turn.</li><li>Attacks roll a six-sided die. <strong>1 always misses</strong>; <strong>6 always hits for double damage</strong>. Other rolls must meet the card's target.</li><li>Your <strong>3 power</strong> is added to attack damage. Guard blocks the next enemy attack.</li><li>End your turn to draw a fresh hand. Defeat four encounters; survive with your potions and healing.</li></ul><p>Tap cards to play. Use <strong>Space</strong> to end your turn and <strong>Q</strong> to drink a draught.</p>`));
  $('mapButton').addEventListener('click', () => openModal('The road ahead', 'ASHEN ROAD · CHAPTER I', `<p><strong>01 — The Hollow:</strong> A quiet ambush at the mountain pass.</p><p><strong>02 — The Broken Watch:</strong> Cinderbound raiders guard the old road.</p><p><strong>03 — A Debt in Bone:</strong> An oathbreaker waits beyond the ridge.</p><p><strong>04 — The Ember Warden:</strong> The thronekeeper stands between you and dawn.</p>`));
  $('soundButton').addEventListener('click', () => { $('soundButton').textContent = $('soundButton').textContent === '♫' ? '♪' : '♫'; $('soundButton').title = $('soundButton').textContent === '♫' ? 'Sound effects' : 'Sound off'; });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if ($('modalBackdrop').hidden && (e.code === 'Space' || e.code === 'KeyE')) { e.preventDefault(); endTurn(); }
    if ($('modalBackdrop').hidden && e.key.toLowerCase() === 'q') usePotion();
  });
  initRun();
})();
