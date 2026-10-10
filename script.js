(() => {
  "use strict";
  const STORAGE_KEY = "party-formation-manager-v2";
  const LEGACY_STORAGE_KEY = "party-formation-manager-v1";
  const MAX_PARTY_SIZE = 4;
  const NORMAL_LIMIT = 2;
  const SPECIAL_LIMIT = 5;
  let selectedStageId = 1;
  let activeElement = "すべて";
  let searchText = "";
  let toastTimer;
  let pendingReset = null;

  const $ = (id) => document.getElementById(id);
  const stageList = $("stage-list"), partySlots = $("party-slots"), roster = $("roster");
  const usageSummary = $("usage-summary"), filters = $("element-filters");
  const allElements = Object.keys(ELEMENTS);
  const seasonIds = SEASONS.map(season => season.id);
  if (!SEASONS.length || new Set(seasonIds).size !== seasonIds.length) {
    throw new Error("SEASONS には重複しない id のシーズンを1つ以上登録してください。");
  }
  let state = loadState();
  let selectedSeasonId = state.selectedSeasonId;
  function currentSeason() { return SEASONS.find(season => season.id === selectedSeasonId) || SEASONS[0]; }
  function currentSeasonParties() { return state.seasons[selectedSeasonId]; }
  function normalizeParties(raw) {
    const result = Object.fromEntries(stages.map(stage => [stage.id, []]));
    for (const stage of stages) {
      const entries = Array.isArray(raw?.[stage.id]) ? raw[stage.id] : [];
      const seen = new Set();
      for (const id of entries) {
        const character = characters.find(c => c.id === id);
        if (!character || seen.has(character.parentId) || result[stage.id].length >= MAX_PARTY_SIZE) continue;
        seen.add(character.parentId);
        result[stage.id].push(id);
      }
    }
    return result;
  }

  function freshState() {
    return { selectedSeasonId: SEASONS[0].id, seasons: Object.fromEntries(SEASONS.map(s => [s.id, normalizeParties({})])) };
  }
  function loadState() {
    const clean = freshState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.seasons && typeof parsed.seasons === "object") {
          for (const season of SEASONS) clean.seasons[season.id] = normalizeParties(parsed.seasons[season.id]);
          if (SEASONS.some(s => s.id === parsed.selectedSeasonId)) clean.selectedSeasonId = parsed.selectedSeasonId;
          return clean;
        }
      }
      // 旧バージョンの編成はシーズン1（最初のシーズン）へ移行。
      const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || "null");
      if (legacy?.parties) clean.seasons[SEASONS[0].id] = normalizeParties(legacy.parties);
    } catch (error) { console.warn("編成データを読み込めませんでした。", error); }
    return clean;
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (_) { showToast("自動保存できませんでした。ブラウザーの保存設定を確認してください。"); }
  }
  function renderSeasonSelect() {
    const select = $("season-select");
    select.innerHTML = SEASONS.map(season => `<option value="${escapeHTML(season.id)}">${escapeHTML(season.name)}</option>`).join("");
    select.value = selectedSeasonId;
  }
  function currentStage() { return stages.find(s => s.id === selectedStageId); }
  function currentParty() { return currentSeasonParties()[selectedStageId] || []; }
  function getCharacter(id) { return characters.find(c => c.id === id); }
  function limitFor(character) { return currentSeason().specialCharacterIds.includes(character.id) || currentSeason().specialCharacterIds.includes(character.parentId) ? SPECIAL_LIMIT : NORMAL_LIMIT; }
  function usageFor(character) {
    // 同じ parentId を持つ武器違いは、使用回数を合算する。
    const familyIds = characters.filter(c => c.parentId === character.parentId).map(c => c.id);
    let count = 0;
    for (const stage of stages) {
      count += (currentSeasonParties()[stage.id] || []).filter(id => familyIds.includes(id)).length;
    }
    return count;
  }
  function familyAlreadyInCurrentParty(character) {
    const familyIds = characters.filter(c => c.parentId === character.parentId).map(c => c.id);
    return currentParty().some(id => familyIds.includes(id));
  }
  function canAdd(character) {
    return currentParty().length < MAX_PARTY_SIZE &&
      !familyAlreadyInCurrentParty(character) &&
      usageFor(character) < limitFor(character);
  }
  function elementPill(name) {
    const info = ELEMENTS[name] || { icon: "✦" };
    return `<span class="element-pill"><span class="element-dot">${info.icon}</span>${escapeHTML(name)}</span>`;
  }
  function tinyElements(character) {
    return character.elements.map(name => `<span class="tiny-element" title="${escapeHTML(name)}">${(ELEMENTS[name] || { icon: "✦" }).icon}</span>`).join("");
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }
  function render() {
    renderSeasonSelect();
    renderStageList();
    renderStageInfo();
    renderParty();
    renderFilters();
    renderRoster();
    renderUsageSummary();
  }
  function renderStageList() {
    stageList.innerHTML = stages.map(stage => {
      const active = stage.id === selectedStageId;
      const party = currentSeasonParties()[stage.id] || [];
      return `<button class="stage-nav-button ${active ? "active" : ""}" data-stage="${stage.id}" type="button" aria-current="${active ? "page" : "false"}">
        <span class="stage-number">${String(stage.id).padStart(2, "0")}</span>
        <span class="stage-nav-adv">${stage.advantages.map(a => (ELEMENTS[a] || { icon: "✦" }).icon).join(" ")}</span>
        <span>エリア ${String(stage.id).padStart(2, "0")}</span><span class="stage-nav-adv">${party.length}/4</span>
      </button>`;
    }).join("");
  }
  function renderStageInfo() {
    const stage = currentStage();
    $("stage-title").textContent = `エリア ${String(stage.id).padStart(2, "0")}`;
    $("stage-affinity").innerHTML = stage.advantages.map(a => (ELEMENTS[a] || { icon: "✦" }).icon).join("　");
    $("stage-advantages").innerHTML = stage.advantages.map(elementPill).join("");
    $("detail-stage-name").textContent = `エリア ${String(stage.id).padStart(2, "0")}`;
    $("detail-enemy").textContent = stage.enemy || "未登録";
    $("detail-advantages").innerHTML = stage.advantages.map(elementPill).join("");
  }
  function renderParty() {
    const party = currentParty();
    $("party-count").textContent = `${party.length} / ${MAX_PARTY_SIZE} 人`;
    partySlots.innerHTML = Array.from({ length: MAX_PARTY_SIZE }, (_, index) => {
      const character = getCharacter(party[index]);
      if (!character) return `<div class="party-slot empty"><span class="slot-index">${index + 1}</span><span class="empty-plus">＋</span><span class="slot-name">キャラクターを選択</span></div>`;
      return `<div class="party-slot">
        <span class="slot-index">${index + 1}</span><img class="character-image" src="${escapeHTML(character.image)}" alt="${escapeHTML(character.name)}">
        <div class="slot-info"><div class="slot-name">${escapeHTML(character.name)}</div><div class="slot-elements">${tinyElements(character)}</div></div>
        <button class="remove-slot" data-remove="${escapeHTML(character.id)}" type="button" aria-label="${escapeHTML(character.name)}を編成から外す">×</button>
      </div>`;
    }).join("");
    $("party-hint").textContent = party.length === MAX_PARTY_SIZE ? "4人編成済みです。追加するには誰かを外してください。" : `あと${MAX_PARTY_SIZE - party.length}人登録できます。キャラクターをクリックして追加してください。`;
  }
  function renderFilters() {
    const choices = ["すべて", ...allElements];
    filters.innerHTML = choices.map(name => `<button type="button" class="filter-button ${activeElement === name ? "active" : ""}" data-element="${escapeHTML(name)}">${name === "すべて" ? "すべて" : (ELEMENTS[name] || { icon: "✦" }).icon + " " + escapeHTML(name)}</button>`).join("");
  }
  function renderRoster() {
    const visible = characters.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesElement = activeElement === "すべて" || c.elements.includes(activeElement);
      return matchesSearch && matchesElement;
    });
    roster.innerHTML = visible.map(character => {
      const used = usageFor(character), limit = limitFor(character);
      const selected = currentParty().includes(character.id);
      const duplicateFamily = familyAlreadyInCurrentParty(character) && !selected;
      const exhausted = used >= limit && !selected;
      const full = currentParty().length >= MAX_PARTY_SIZE && !selected;
      const disabled = selected || duplicateFamily || exhausted || full;
      let status = `${used}/${limit}`;
      if (exhausted) status = `${used}/${limit}`;
      const special = limit === SPECIAL_LIMIT;
      return `<button type="button" class="character-card ${selected ? "selected" : ""}" data-character="${escapeHTML(character.id)}" ${disabled ? "disabled" : ""} aria-label="${escapeHTML(character.name)}、使用${used}回、上限${limit}回">
        ${special ? '<span class="special-tag">特別枠</span>' : ""}
        <div class="character-top"><img
    class="character-image"
    src="${escapeHTML(character.image)}"
    alt="${escapeHTML(character.name)}"><div class="character-name">${escapeHTML(character.name)}</div></div>
        <div class="character-elements">${tinyElements(character)}</div>
        <span class="usage-badge ${special ? "special" : ""} ${exhausted ? "exhausted" : ""}">${status}</span>
        ${exhausted ? '<div class="disabled-note">使用上限</div>' : duplicateFamily ? '<div class="disabled-note">同キャラ編成済み</div>' : full ? '<div class="disabled-note">編成人数上限</div>' : selected ? '<div class="disabled-note">編成中</div>' : ""}
      </button>`;
    }).join("");
    if (!visible.length) roster.innerHTML = `<p class="usage-empty">条件に一致するキャラクターはいません。</p>`;
  }
  function renderUsageSummary() {
    const visible = characters.filter(c => !characters.some(other => other.id !== c.id && other.parentId === c.parentId && characters.indexOf(other) < characters.indexOf(c)));
    const usedOnly = visible.filter(c => usageFor(c) > 0 || limitFor(c) === SPECIAL_LIMIT);
    usageSummary.innerHTML = usedOnly.length ? usedOnly.map(c => {
      const used = usageFor(c), limit = limitFor(c), done = used >= limit;
      return `<div class="usage-row"><span class="usage-name" title="${escapeHTML(c.name)}">${escapeHTML(c.name)}${limit === SPECIAL_LIMIT ? " ★" : ""}</span><span class="usage-value ${done ? "done" : ""}">${used}/${limit}回</span></div>`;
    }).join("") : `<p class="usage-empty">編成すると、使用中のキャラクターがここに表示されます。</p>`;
  }
  function addCharacter(id) {
    const character = getCharacter(id);
    if (!character) return;
    if (currentParty().includes(id)) return;
    if (currentParty().length >= MAX_PARTY_SIZE) return showToast("1ステージに編成できるのは最大4人です。");
    if (familyAlreadyInCurrentParty(character)) return showToast("同じキャラクターの武器違いは、同一ステージに編成できません。");
    if (usageFor(character) >= limitFor(character)) return showToast("このキャラクターは使用上限に達しています。");
    currentSeasonParties()[selectedStageId].push(id);
    saveState(); render();
  }
  function removeCharacter(id) {
    currentSeasonParties()[selectedStageId] = currentParty().filter(existing => existing !== id);
    saveState(); render(); showToast("編成から外しました。使用回数を更新しました。");
  }
  function showToast(message) {
    const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  function askReset(message, action) {
    $("confirm-message").textContent = message;
    pendingReset = action;
    const dialog = $("confirm-dialog");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else if (window.confirm(message)) { pendingReset?.(); pendingReset = null; }
  }

  $("season-select").addEventListener("change", event => {
    if (!SEASONS.some(season => season.id === event.target.value)) return;
    selectedSeasonId = event.target.value;
    state.selectedSeasonId = selectedSeasonId;
    selectedStageId = stages[0].id;
    saveState(); render();
    showToast(`${currentSeason().name}に切り替えました。`);
  });
  stageList.addEventListener("click", event => {
    const button = event.target.closest("[data-stage]");
    if (!button) return;
    selectedStageId = Number(button.dataset.stage); render();
  });
  partySlots.addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");
    if (button) removeCharacter(button.dataset.remove);
  });
  roster.addEventListener("click", event => {
    const button = event.target.closest("[data-character]");
    if (button && !button.disabled) addCharacter(button.dataset.character);
  });
  filters.addEventListener("click", event => {
    const button = event.target.closest("[data-element]");
    if (!button) return;
    activeElement = button.dataset.element; renderFilters(); renderRoster();
  });
  $("search").addEventListener("input", event => { searchText = event.target.value.trim(); renderRoster(); });
  $("reset-stage").addEventListener("click", () => {
    if (!currentParty().length) return showToast("このステージには編成がありません。");
    askReset(`ステージ${String(selectedStageId).padStart(2, "0")}の編成をすべて解除します。`, () => {
      currentSeasonParties()[selectedStageId] = []; saveState(); render(); showToast("このステージの編成をリセットしました。");
    });
  });
  $("reset-all").addEventListener("click", () => {
    askReset(`${currentSeason().name}の全12ステージの編成を解除します。他のシーズンは残ります。`, () => {
      state.seasons[selectedSeasonId] = normalizeParties({}); saveState(); render(); showToast(`${currentSeason().name}の編成をリセットしました。`);
    });
  });
  $("confirm-yes").addEventListener("click", event => {
    // Prevent the dialog's default close until the pending action has run.
    event.preventDefault();
    if (pendingReset) pendingReset();
    pendingReset = null;
    $("confirm-dialog").close();
  });

  // Startup validation: avoid accidental configuration errors in editable data.
  for (const season of SEASONS) {
    const ids = season.specialCharacterIds;
    if (!Array.isArray(ids) || ids.length !== 4 || new Set(ids).size !== 4 || !ids.every(id => characters.some(c => c.id === id || c.parentId === id))) {
      console.warn(`${season.name} の特別枠には実在する4つの異なるキャラクターIDを指定してください。`);
    }
  }
  render();
})();
