/*
* Name: Jungeun Kim
* Date: April 18, 2026
* Section: IAB 6068
*
* This is the JS to implement the UI for my cryptogram generator, and
generate
* Responsible for all interactions.
* Generating Map.
*/

"use strict";

(function() {
  window.addEventListener("load", init);

  function init() {
    const map=id("game-map");
    fillTile(map);
    const crops = {
      grass: {name: '수풀', growTime: 3000, xp: 5},
      wheat: { name: '밀', growTime: 5000, xp: 10},
      carrot: { name: '당근', growTime: 7000, xp: 15}
    };

    id("start").addEventListener("click", startGame);

    id("gamem-map").addEventListener("click", function(e) {
      const tile = e.target.closest(".tile");

      if(tile.classList.contains("crop")) {
        harvest(tile);
      } else if(!tile.classList.contains("grow")) {
        plant(tile);
      }
    });

    const inventory = [
      { id: "grass_seed", name: "수풀 씨앗", count: Infinity, icon: "images/seed.png"},
      { id: "wheat_seed", name: "밀 씨앗", count: 2, icon: "images/seed.png"},
      { id: "carrot_seed", name: "당근 씨앗", count: 0, icon: "images/seed.png"},
      { id: "grass", name: "수풀", count: 0, icon: "images/seed.png"},
      { id: "wheat", name: "밀", count: 0, icon: "images/seed.png"},
      { id: "carrot", name: "당근", count: 0, icon: "images/seed.png"}
    ];

    let selectedItem = null;

    const invBtn = qs(".inv-btn");
    const invWindow = id("inventory-window");
    const closeBtn = id("close-inv");

    invBtn.addEventListener("click", () => {
      invWindow.classList.toggle("hidden");

      if (!invWindow.classList.contains("hidden")) {
        renderInventory();
      }
    });

    closeBtn.addEventListener("click", () => {
      invWindow.classList.add("hidden");
    });
  }

  /**
   * @param {object} map
   */
  function fillTile(map) {
    const fragment = document.createDocumentFragment();

    for(let i = 0; i < 100; i++) {
      const tile = creEl("div");
      tile.classList.add("tile");

      const top = creEl("div");
      top.classList.add("face", "top");

      const front = creEl("front");
      front.classList.add("face", "front");

      const side = creEl("div");
      side.classList.add("face", "side");

      tile.appendChild(top);
      tile.appendChild(front);
      tile.appendChild(side);

      fragment.appendChild(tile);

      tile.dataset.x = i % 10;
      tile.dataset.y = Math.floor(i / 10);

      tile.dataset.crop = "none";
    }

    map.appendChild(fragment);
  }

  function renderInventory() {
    const grid = id("item-grid");

    inventory.forEach((item, index) => {
      const slot = creEl("div");
      slot.className = "item-slot";

      if (item.id !== 'empty_slot') {
        const img = creEl("img");
        img.src = item.icon;
        slot.appendChild(img);

        const count = creEl("span");
        count.className = "item-count";
        count.textContent = item.count;
        slot.appendChild(count);

        slot.onclick = () => selectSeed(item, slot);
      }

      grid.appendChild(slot);
    });
  }


  /**
   * @param {dictionary} item
   * @param {object} slotEl
   */
  function selectSeed(item, slotEl) {
    // 모든 슬롯 선택 효과 해제
    qsa(".item-slot").forEach(el => el.classList.remove("selected"));

    // 현재 아이템 선택
    selectedItem = item;
    slotEl.classList.add("selected");
  }

  function startGame() {
    id("start-screen").classList.add("hidden");
    id("status-bar").classList.remove("hidden");
    id("side-menu").classList.remove("hidden");
  }

  /**
   * @param {object} tile
   */
  function plant(tile) {
    const topFace = tile.querySelector(".top");

    const growImg = creEl("img");
    growImg.src = "images/grow.png";
    growImg.classList.add("plant-model");

    topFace.appendChild(growImg);
    tile.classList.add("grow");
    tile.dataset.crop = selectedItem.id.slice(0, -5);
    if(selectedItem.count != Infinity)
      selectedItem.count--;


    tile.timerId = setTimeout(() => {
      tile.classList.remove("grow");
      tile.classList.add("crop");
    }, crops[tile.dataset.crop][growTime])
  }

  /**
   * @param {object} tile
   */
  function harvest(tile) {
    const xp = crops[tile.dataset.crop][xp];
    let crrXp = parseInt(id("current-xp").textContent);
    let crrMax = parseInt(id("max-up").textContent);

    crrXp += xp;
    if(crrXp > crrMax)
      levelUp;


  }

  function levelUp() {
    let crrXp = parseInt(id("current-xp").textContent);
    let crrMax = parseInt(id("max-up").textContent);
    let crrLv = parseInt(id("level").textContent);

    crrXp -= crrMax;
    crrMax += 100;
    crrLv++;

    id("current-xp").textContent = crrXp;
    id("max-up").textContent = crrMax;
    id("level").textContent = "Lv." + String(crrLv);
  }

  /*HELPER FUNCTIONS*/

  /**
   * @param {string} name
   * @returns {object}
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * @param {string} name
   * @returns {object}
   */
  function creEl(name) {
    return document.createElement(name);
  }

  /**
   * @param {string} query
   * @returns {object}
   */
  function qs(query) {
    return document.querySelector(query);
  }

  /**
   * @param {string} query
   * @returns {array}
   */
  function qsa(query) {
    return document.querySelectorAll(query);
  }
})();