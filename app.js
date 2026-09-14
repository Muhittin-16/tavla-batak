/* ============================================================
   TAVLA & BATAK
   TAM OYUN MOTORU
   ------------------------------------------------------------
   - Tavla: zar, hamle, kapı, kırma, bar, toplama, bot
   - Batak: tekli + eşli ihaleli
   - Tekli ihale: 4-13
   - Eşli ihale: 8-13
   - Pas
   - Koz
   - Renk takip zorunluluğu
   - El kazanma
   - Puanlama
   - Eşlide partner eli açık
   - Eşlide kullanıcı iki eli oynar
   - Kart sürükleme / sıralama
   - Mobil uyum
   ============================================================ */

(() => {
"use strict";

/* ============================================================
   GENEL YARDIMCILAR
   ============================================================ */

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function esc(v) {
    return String(v)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function notify(text) {
    const el = $("#gameMessage");
    if (el) el.textContent = text;
}

function showScreen(id) {
    $$(".screen").forEach(x => x.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");

    window.scrollTo({top: 0, behavior: "smooth"});
}

function bindNavigation() {
    document.addEventListener("click", e => {
        const nav = e.target.closest("[data-screen]");
        if (!nav) return;

        e.preventDefault();
        const target = nav.dataset.screen;

        if (target === "home") showScreen("homeScreen");
        if (target === "tavla") {
            showScreen("tavlaScreen");
            if (!Tavla.started) Tavla.start();
        }
        if (target === "batak") {
            showScreen("batakScreen");
            if (!Batak.started) Batak.start();
        }
        if (target === "salon") showScreen("salonScreen");
    });

    const tavlaLinks = [
        ["#homeBtn", "homeScreen"],
        ["#tavlaBtn", "tavlaScreen"],
        ["#batakBtn", "batakScreen"],
        ["#salonBtn", "salonScreen"]
    ];

    tavlaLinks.forEach(([sel, screen]) => {
        const el = $(sel);
        if (el) {
            el.addEventListener("click", e => {
                e.preventDefault();
                showScreen(screen);
            });
        }
    });
}

/* ============================================================
   TAVLA
   ============================================================ */

const Tavla = {

    started: false,

    points: [],

    bar: {
        you: 0,
        bot: 0
    },

    off: {
        you: 0,
        bot: 0
    },

    dice: [],

    usedDice: [],

    turn: "you",

    selected: null,

    rolling: false,

    winner: null,

    board: null,

    start() {
        this.started = true;
        this.reset();
        this.render();
        this.bind();
    },

    reset() {
        this.points = Array.from({length: 24}, () => ({
            you: 0,
            bot: 0
        }));

        /*
         * Standart tavla başlangıç dizilimi:
         * Kullanıcı alt/sağ taraftan,
         * bot karşı taraftan oynar.
         */
        this.points[0].you = 2;
        this.points[11].you = 5;
        this.points[16].you = 3;
        this.points[18].you = 5;

        this.points[23].bot = 2;
        this.points[12].bot = 5;
        this.points[7].bot = 3;
        this.points[5].bot = 5;

        this.bar = {you: 0, bot: 0};
        this.off = {you: 0, bot: 0};

        this.dice = [];
        this.usedDice = [];
        this.turn = "you";
        this.selected = null;
        this.rolling = false;
        this.winner = null;
    },

    bind() {
        const roll = $("#rollDice");
        const fresh = $("#newTavla");

        if (roll && !roll.dataset.bound) {
            roll.dataset.bound = "1";
            roll.addEventListener("click", () => this.roll());
        }

        if (fresh && !fresh.dataset.bound) {
            fresh.dataset.bound = "1";
            fresh.addEventListener("click", () => {
                this.reset();
                this.render();
            });
        }

        const board = $("#backgammonBoard");

        if (board && !board.dataset.bound) {
            board.dataset.bound = "1";

            board.addEventListener("click", e => {
                const point = e.target.closest("[data-point]");
                if (!point) return;

                const index = Number(point.dataset.point);
                this.handlePoint(index);
            });
        }
    },

    roll() {
        if (this.turn !== "you" || this.rolling || this.winner) return;

        if (this.dice.length && this.availableDice().length) {
            notify("Önce mevcut zarları kullanmalısın.");
            return;
        }

        this.rolling = true;

        const a = 1 + Math.floor(Math.random() * 6);
        const b = 1 + Math.floor(Math.random() * 6);

        this.dice = a === b ? [a, a, a, a] : [a, b];
        this.usedDice = [];

        this.renderDice();

        setTimeout(() => {
            this.rolling = false;

            if (!this.hasAnyMove("you")) {
                notify("Geçerli hamle yok. Sıra rakibe geçti.");
                setTimeout(() => this.botTurn(), 900);
            } else {
                notify("Zarlarını kullan. Hareket etmek istediğin taşı seç.");
            }

            this.render();
        }, 500);
    },

    availableDice() {
        return this.dice
            .map((v, i) => this.usedDice.includes(i) ? null : v)
            .filter(Boolean);
    },

    dieIndex(value) {
        return this.dice.findIndex(
            (v, i) => v === value && !this.usedDice.includes(i)
        );
    },

    handlePoint(index) {
        if (this.turn !== "you" || this.rolling || this.winner) return;

        /*
         * Önce kaynak seç.
         */
        if (this.selected === null) {
            if (this.points[index].you > 0) {
                if (this.bar.you > 0) {
                    notify("Önce bardaki taşı oyuna sokmalısın.");
                    return;
                }

                this.selected = index;
                notify(`${index + 1}. hanedeki taşı seçtin. Hedef haneye tıkla.`);
                this.render();
            }
            return;
        }

        /*
         * Aynı noktaya tekrar tıklama
         */
        if (this.selected === index) {
            this.selected = null;
            this.render();
            return;
        }

        const from = this.selected;
        const distance = this.distanceYou(from, index);

        if (!distance) {
            this.selected = null;
            this.render();
            return;
        }

        const di = this.dieIndex(distance);

        if (di === -1) {
            notify("Bu hamle için uygun zar yok.");
            return;
        }

        if (!this.isLegalMove("you", from, index, distance)) {
            notify("Bu haneye oynayamazsın.");
            return;
        }

        this.move("you", from, index, di);
    },

    distanceYou(from, to) {
        /*
         * Kullanıcı 0 -> 23 yönünde ilerler.
         */
        return to - from > 0 ? to - from : null;
    },

    distanceBot(from, to) {
        return from - to > 0 ? from - to : null;
    },

    isLegalMove(player, from, to, distance) {

        if (distance < 1 || distance > 6) return false;

        if (player === "you") {
            if (this.points[from].you <= 0) return false;

            if (this.bar.you > 0) return false;

            if (to < 0 || to > 23) {
                return this.canBearOff("you", from, distance);
            }

            if (this.points[to].bot >= 2) return false;
            return true;
        }

        if (player === "bot") {
            if (this.points[from].bot <= 0) return false;

            if (this.bar.bot > 0) return false;

            if (to < 0 || to > 23) {
                return this.canBearOff("bot", from, distance);
            }

            if (this.points[to].you >= 2) return false;
            return true;
        }

        return false;
    },

    canBearOff(player, from, distance) {
        if (!this.allInHome(player)) return false;

        if (player === "you") {
            const target = from + distance;

            if (target === 24) return true;

            if (target > 24) {
                /*
                 * Daha uzakta taş yoksa fazla zar kullanılabilir.
                 */
                for (let i = 18; i < from; i++) {
                    if (this.points[i].you > 0) return false;
                }
                return true;
            }
        }

        if (player === "bot") {
            const target = from - distance;

            if (target === -1) return true;

            if (target < -1) {
                for (let i = 5; i > from; i--) {
                    if (this.points[i].bot > 0) return false;
                }
                return true;
            }
        }

        return false;
    },

    allInHome(player) {
        if (this.bar[player] > 0) return false;

        if (player === "you") {
            for (let i = 0; i < 18; i++) {
                if (this.points[i].you > 0) return false;
            }
            return true;
        }

        for (let i = 6; i < 24; i++) {
            if (this.points[i].bot > 0) return false;
        }

        return true;
    },

    move(player, from, to, dieIndex) {

        const p = this.points[from];

        if (player === "you") {
            p.you--;

            if (to > 23) {
                this.off.you++;
            } else {
                if (this.points[to].bot === 1) {
                    this.points[to].bot = 0;
                    this.bar.bot++;
                }

                this.points[to].you++;
            }
        }

        if (player === "bot") {
            p.bot--;

            if (to < 0) {
                this.off.bot++;
            } else {
                if (this.points[to].you === 1) {
                    this.points[to].you = 0;
                    this.bar.you++;
                }

                this.points[to].bot++;
            }
        }

        this.usedDice.push(dieIndex);
        this.selected = null;

        this.render();

        if (this.off.you >= 15) {
            this.winner = "you";
            notify("Tebrikler! Tavlayı kazandın.");
            this.render();
            return;
        }

        if (this.off.bot >= 15) {
            this.winner = "bot";
            notify("Rakip tavlayı kazandı.");
            this.render();
            return;
        }

        if (this.availableDice().length === 0) {
            this.endTurn();
        }
    },

    hasAnyMove(player) {
        if (!this.dice.length) return false;

        if (this.bar[player] > 0) {
            return this.availableDice().some(die => {
                if (player === "you") {
                    const target = die - 1;
                    return this.points[target] &&
                           this.points[target].bot < 2;
                }

                const target = 24 - die;
                return this.points[target] &&
                       this.points[target].you < 2;
            });
        }

        for (let i = 0; i < 24; i++) {
            if (this.points[i][player] <= 0) continue;

            for (const die of this.availableDice()) {
                let to;

                if (player === "you") {
                    to = i + die;
                } else {
                    to = i - die;
                }

                if (this.isLegalMove(player, i, to, die)) return true;
            }
        }

        return false;
    },

    endTurn() {
        if (this.turn === "you") {
            this.turn = "bot";
            this.dice = [];
            this.usedDice = [];
            this.selected = null;
            this.render();
            setTimeout(() => this.botTurn(), 700);
        } else {
            this.turn = "you";
            this.dice = [];
            this.usedDice = [];
            this.selected = null;
            this.render();
            notify("Sıra sende. Zar at.");
        }
    },

    async botTurn() {
        if (this.winner) return;

        this.turn = "bot";

        const a = 1 + Math.floor(Math.random() * 6);
        const b = 1 + Math.floor(Math.random() * 6);

        this.dice = a === b ? [a,a,a,a] : [a,b];
        this.usedDice = [];

        this.render();
        await sleep(700);

        /*
         * Bar'daki bot taşı varsa önce onu sok.
         */
        while (this.availableDice().length) {

            let moved = false;

            if (this.bar.bot > 0) {
                for (let di = 0; di < this.dice.length; di++) {
                    if (this.usedDice.includes(di)) continue;

                    const die = this.dice[di];
                    const to = 24 - die;

                    if (this.points[to].you < 2) {
                        if (this.points[to].you === 1) {
                            this.points[to].you = 0;
                            this.bar.you++;
                        }

                        this.bar.bot--;
                        this.points[to].bot++;
                        this.usedDice.push(di);
                        moved = true;
                        break;
                    }
                }

                if (!moved) break;

                this.render();
                await sleep(450);
                continue;
            }

            const moves = [];

            for (let from = 0; from < 24; from++) {
                if (this.points[from].bot <= 0) continue;

                for (let di = 0; di < this.dice.length; di++) {
                    if (this.usedDice.includes(di)) continue;

                    const die = this.dice[di];
                    const to = from - die;

                    if (this.isLegalMove("bot", from, to, die)) {
                        moves.push({
                            from,
                            to,
                            di,
                            score: this.botMoveScore(from, to)
                        });
                    }
                }
            }

            if (!moves.length) break;

            moves.sort((x,y) => y.score - x.score);

            const move = moves[0];

            this.move("bot", move.from, move.to, move.di);

            if (this.winner) return;

            await sleep(450);
        }

        if (!this.winner) {
            this.endTurn();
        }
    },

    botMoveScore(from, to) {
        let score = 0;

        if (to >= 0 && this.points[to].you === 1) score += 100;
        if (to >= 0 && this.points[to].bot > 0) score += 30;
        if (from < 6) score += 20;
        if (to < 6) score += 10;

        return score + Math.random() * 5;
    },

    render() {
        this.renderBoard();
        this.renderDice();
        this.renderInfo();
    },

    renderBoard() {
        const board = $("#backgammonBoard");
        if (!board) return;

        board.innerHTML = "";

        for (let i = 23; i >= 0; i--) {
            board.appendChild(this.makePoint(i));
        }

        /*
         * Taşların daha rahat görülmesi için board'ın
         * üzerine ekstra bar/off alanları koyuyoruz.
         */
        const existingBar = board.parentElement?.querySelector(".runtime-tavla-info");

        if (!existingBar && board.parentElement) {
            const info = document.createElement("div");
            info.className = "runtime-tavla-info";
            info.innerHTML = `
                <div class="runtime-bar">
                    <span>Rakip Bar: <b id="rtBotBar">0</b></span>
                    <span>Senin Bar: <b id="rtYouBar">0</b></span>
                    <span>Toplanan: <b id="rtYouOff">0</b> / <b id="rtBotOff">0</b></span>
                </div>
            `;
            board.parentElement.appendChild(info);
        }

        const botBar = $("#rtBotBar");
        const youBar = $("#rtYouBar");
        const youOff = $("#rtYouOff");
        const botOff = $("#rtBotOff");

        if (botBar) botBar.textContent = this.bar.bot;
        if (youBar) youBar.textContent = this.bar.you;
        if (youOff) youOff.textContent = this.off.you;
        if (botOff) botOff.textContent = this.off.bot;
    },

    makePoint(index) {
        const wrap = document.createElement("div");
        wrap.className = "tavla-point";

        if (this.selected === index) {
            wrap.classList.add("selected");
        }

        wrap.dataset.point = index;

        const number = document.createElement("div");
        number.className = "point-number";
        number.textContent = index + 1;
        wrap.appendChild(number);

        const stack = document.createElement("div");
        stack.className = "checker-stack";

        const you = this.points[index].you;
        const bot = this.points[index].bot;

        if (you > 0) {
            for (let i = 0; i < you; i++) {
                stack.appendChild(this.makeChecker("you", i, you));
            }
        } else if (bot > 0) {
            for (let i = 0; i < bot; i++) {
                stack.appendChild(this.makeChecker("bot", i, bot));
            }
        }

        wrap.appendChild(stack);

        return wrap;
    },

    makeChecker(type, index, total) {
        const el = document.createElement("div");
        el.className = `checker ${type}`;

        if (index >= 5) {
            el.classList.add("stacked");
        }

        el.textContent = total;
        return el;
    },

    renderDice() {
        const box = $("#diceBox");
        if (!box) return;

        box.innerHTML = "";

        this.dice.forEach((value, index) => {
            const die = document.createElement("div");
            die.className = "runtime-die";

            if (this.usedDice.includes(index)) {
                die.classList.add("used");
            }

            die.innerHTML = this.dieFace(value);
            box.appendChild(die);
        });
    },

    dieFace(value) {
        const dots = {
            1: [4],
            2: [0,8],
            3: [0,4,8],
            4: [0,2,6,8],
            5: [0,2,4,6,8],
            6: [0,2,3,5,6,8]
        };

        return `
            <div class="die-grid">
                ${Array.from({length:9}, (_,i) =>
                    `<i class="${dots[value].includes(i) ? "dot" : ""}"></i>`
                ).join("")}
            </div>
        `;
    },

    renderInfo() {
        const turn = $("#turnLabel");
        if (turn) {
            turn.textContent =
                this.turn === "you" ? "Sıra sende" : "Rakip düşünüyor...";
        }

        const barBot = $("#barBot");
        const barYou = $("#barYou");
        const offYou = $("#offYou");
        const offYouSide = $("#offYouSide");

        if (barBot) barBot.textContent = this.bar.bot;
        if (barYou) barYou.textContent = this.bar.you;
        if (offYou) offYou.textContent = this.off.you;
        if (offYouSide) offYouSide.textContent = this.off.you;
    }
};

/* ============================================================
   BATAK
   ============================================================ */

const Batak = {

    started: false,

    mode: "single",

    players: [],

    deck: [],

    phase: "idle",

    dealer: 0,

    currentPlayer: 0,

    highestBid: 0,

    highestBidder: null,

    passCount: 0,

    trump: null,

    trick: [],

    trickNumber: 0,

    scores: [0,0,0,0],

    roundTricks: [0,0,0,0],

    dragIndex: null,

    processing: false,

    suits: ["♠","♥","♦","♣"],

    suitNames: {
        "♠": "Maça",
        "♥": "Kupa",
        "♦": "Karo",
        "♣": "Sinek"
    },

    ranks: [
        {name:"2", value:2},
        {name:"3", value:3},
        {name:"4", value:4},
        {name:"5", value:5},
        {name:"6", value:6},
        {name:"7", value:7},
        {name:"8", value:8},
        {name:"9", value:9},
        {name:"10", value:10},
        {name:"J", value:11},
        {name:"Q", value:12},
        {name:"K", value:13},
        {name:"A", value:14}
    ],

    start() {
        this.started = true;
        this.installRuntimeStyle();
        this.bind();
        this.startRound();
    },

    bind() {

        const newBatak = $("#newBatak");

        if (newBatak && !newBatak.dataset.bound) {
            newBatak.dataset.bound = "1";
            newBatak.addEventListener("click", () => this.startRound());
        }

        const choices = $("#trumpChoices");

        if (choices && !choices.dataset.bound) {
            choices.dataset.bound = "1";

            choices.addEventListener("click", e => {
                const btn = e.target.closest("[data-suit]");

                if (!btn) return;

                this.chooseTrump(btn.dataset.suit);
            });
        }

        const hand = $("#playerHand");

        if (hand && !hand.dataset.bound) {
            hand.dataset.bound = "1";

            hand.addEventListener("click", e => {
                const card = e.target.closest(".playing-card");

                if (!card) return;

                const index = Number(card.dataset.index);

                if (Number.isInteger(index)) {
                    this.playUserCard(index);
                }
            });

            hand.addEventListener("dragstart", e => {
                const card = e.target.closest(".playing-card");
                if (!card) return;

                this.dragIndex = Number(card.dataset.index);

                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(this.dragIndex));

                card.classList.add("dragging");
            });

            hand.addEventListener("dragend", e => {
                const card = e.target.closest(".playing-card");
                if (card) card.classList.remove("dragging");

                this.dragIndex = null;
            });

            hand.addEventListener("dragover", e => {
                e.preventDefault();
            });

            hand.addEventListener("drop", e => {
                e.preventDefault();

                const target = e.target.closest(".playing-card");
                if (!target) return;

                const to = Number(target.dataset.index);
                const from = this.dragIndex;

                if (!Number.isInteger(from) || !Number.isInteger(to)) return;
                if (from === to) return;

                this.reorderUserHand(from, to);
            });
        }
    },

    startRound() {
        this.mode = "single";

        /*
         * Mevcut HTML'de mod düğmesi yoksa varsayılan tekli.
         * Sayfa üzerinde .batak-mode-btn varsa onu da kullan.
         */
        const modeButton = $(".batak-mode-btn.active");
        if (modeButton?.dataset.mode) {
            this.mode = modeButton.dataset.mode;
        }

        this.players = [
            {
                name: "Sen",
                hand: [],
                team: 0,
                bot: false,
                tricks: 0,
                bid: null
            },
            {
                name: "Murat",
                hand: [],
                team: 1,
                bot: true,
                tricks: 0,
                bid: null
            },
            {
                name: "Ayşe",
                hand: [],
                team: 0,
                bot: true,
                tricks: 0,
                bid: null
            },
            {
                name: "Kemal",
                hand: [],
                team: 1,
                bot: true,
                tricks: 0,
                bid: null
            }
        ];

        if (this.mode === "pair") {
            /*
             * Eşli: Sen + Ayşe / Murat + Kemal
             */
            this.players[0].team = 0;
            this.players[2].team = 0;
        }

        this.scores = [0,0,0,0];
        this.roundTricks = [0,0,0,0];
        this.deck = this.makeDeck();
        this.deal();
        this.dealer = Math.floor(Math.random() * 4);
        this.currentPlayer = (this.dealer + 1) % 4;

        this.highestBid = 0;
        this.highestBidder = null;
        this.passCount = 0;
        this.trump = null;
        this.trick = [];
        this.trickNumber = 0;
        this.phase = "bidding";
        this.processing = false;

        this.renderAll();

        notify(
            this.mode === "pair"
                ? "Eşli ihaleli batak başladı. İhale 8'den başlar."
                : "Tekli ihaleli batak başladı. İhale 4'ten başlar."
        );

        this.continuePhase();
    },

    makeDeck() {
        const deck = [];

        for (const suit of this.suits) {
            for (const rank of this.ranks) {
                deck.push({
                    id: `${suit}${rank.name}${Math.random().toString(36).slice(2)}`,
                    suit,
                    rank: rank.name,
                    value: rank.value
                });
            }
        }

        return shuffle(deck);
    },

    deal() {
        for (let i = 0; i < 13; i++) {
            for (let p = 0; p < 4; p++) {
                this.players[p].hand.push(this.deck.pop());
            }
        }

        this.players.forEach(p => {
            p.hand.sort(this.cardSort);
        });
    },

    cardSort(a,b) {
        const suitOrder = {
            "♠":0,
            "♥":1,
            "♦":2,
            "♣":3
        };

        if (a.suit !== b.suit) {
            return suitOrder[a.suit] - suitOrder[b.suit];
        }

        return a.value - b.value;
    },

    continuePhase() {

        if (this.phase === "bidding") {
            this.renderBidding();

            if (this.players[this.currentPlayer].bot) {
                this.botBid();
            }

            return;
        }

        if (this.phase === "trump") {
            this.renderTrump();

            if (this.players[this.highestBidder].bot) {
                setTimeout(() => this.botChooseTrump(), 650);
            }

            return;
        }

        if (this.phase === "playing") {
            this.renderPlaying();

            if (this.isHumanTurn()) {
                notify(
                    this.mode === "pair" && this.highestBidder === 0
                    ? "Sen ve partnerinin elleri açık. Sırası gelen eli sen oynat."
                    : "Sıra sende."
                );
            } else {
                this.botPlay();
            }
        }
    },

    minBid() {
        return this.mode === "pair" ? 8 : 4;
    },

    bidValues() {
        const arr = [];

        for (let i = this.minBid(); i <= 13; i++) {
            arr.push(i);
        }

        return arr;
    },

    botBid() {

        const player = this.players[this.currentPlayer];

        let strength = this.handStrength(player.hand);

        /*
         * Basit ama kurallı ihale davranışı.
         */
        let bid = this.minBid() - 1;

        if (strength >= 0.42) bid = this.minBid();
        if (strength >= 0.50) bid++;
        if (strength >= 0.58) bid++;
        if (strength >= 0.66) bid++;
        if (strength >= 0.73) bid++;
        if (strength >= 0.80) bid++;
        if (strength >= 0.86) bid++;
        if (strength >= 0.91) bid++;

        bid = clamp(bid, this.minBid(), 13);

        if (
            bid <= this.highestBid ||
            (Math.random() < 0.18 && this.highestBid >= this.minBid())
        ) {
            this.submitBid(player === this.players[this.currentPlayer] ? null : null, null);
            return;
        }

        setTimeout(() => this.submitBid(bid, this.currentPlayer), 700);
    },

    handStrength(hand) {
        let points = 0;

        hand.forEach(card => {
            if (card.value === 14) points += 0.075;
            else if (card.value === 13) points += 0.045;
            else if (card.value === 12) points += 0.025;
            else if (card.value === 11) points += 0.015;
        });

        const suitCounts = {};
        hand.forEach(c => {
            suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
        });

        Object.values(suitCounts).forEach(n => {
            if (n >= 5) points += 0.08;
            if (n >= 6) points += 0.06;
        });

        return clamp(points, 0, 1);
    },

    submitBid(value, playerIndex) {

        if (this.phase !== "bidding") return;
        if (playerIndex !== this.currentPlayer) return;

        const player = this.players[playerIndex];

        if (value !== null) {
            if (value < this.minBid() || value > 13) return;
            if (value <= this.highestBid) return;

            player.bid = value;
            this.highestBid = value;
            this.highestBidder = playerIndex;
            this.passCount = 0;

            notify(`${player.name} ${value} dedi.`);
        } else {
            player.bid = "pass";
            this.passCount++;

            notify(`${player.name} pas geçti.`);
        }

        /*
         * Bir turdaki herkes ihaleyi geçerse ve hiç teklif yoksa:
         * tekli 4, eşli 8 zorunlu başlangıç.
         */
        const next = (this.currentPlayer + 1) % 4;

        if (this.passCount >= 4 && !this.highestBidder) {
            this.highestBid = this.minBid();
            this.highestBidder = this.dealer;
            this.players[this.dealer].bid = this.minBid();

            this.phase = "trump";

            notify(
                `Herkes pas geçti. İhale ${this.minBid()} olarak ${this.players[this.dealer].name} oyuncusuna kaldı.`
            );

            this.renderAll();
            setTimeout(() => this.continuePhase(), 800);
            return;
        }

        /*
         * Eğer üç oyuncu pas geçtiyse son teklif veren kazanır.
         */
        const bidsFinished = this.players.every(p => p.bid !== null);

        if (bidsFinished) {

            if (!this.highestBidder) {
                this.highestBidder = this.dealer;
                this.highestBid = this.minBid();
                this.players[this.dealer].bid = this.highestBid;
            }

            this.phase = "trump";

            this.renderAll();

            setTimeout(() => this.continuePhase(), 500);
            return;
        }

        this.currentPlayer = next;

        this.renderAll();

        setTimeout(() => this.continuePhase(), 500);
    },

    renderBidding() {

        this.renderStatus();

        const controls = $(".batak-controls");
        if (!controls) return;

        if (this.players[this.currentPlayer].bot) {
            controls.innerHTML = `
                <div class="runtime-batak-wait">
                    <strong>${esc(this.players[this.currentPlayer].name)}</strong>
                    ihaleyi düşünüyor...
                </div>
            `;
            return;
        }

        const values = this.bidValues()
            .filter(v => v > this.highestBid);

        controls.innerHTML = `
            <div class="runtime-bid-title">
                İhale: <strong>${this.highestBid || "-"}</strong>
            </div>

            <div class="runtime-bid-buttons">
                ${values.map(v =>
                    `<button type="button" class="runtime-bid-btn" data-bid="${v}">${v}</button>`
                ).join("")}

                <button type="button"
                        class="runtime-bid-btn pass"
                        data-bid="pass">
                    PAS
                </button>
            </div>
        `;

        $$(".runtime-bid-btn", controls).forEach(btn => {
            btn.addEventListener("click", () => {

                const value = btn.dataset.bid === "pass"
                    ? null
                    : Number(btn.dataset.bid);

                this.submitBid(value, this.currentPlayer);
            });
        });
    },

    renderTrump() {

        this.renderStatus();

        const controls = $(".batak-controls");
        if (!controls) return;

        if (this.highestBidder !== 0) {
            controls.innerHTML = `
                <div class="runtime-batak-wait">
                    <strong>${esc(this.players[this.highestBidder].name)}</strong>
                    koz seçiyor...
                </div>
            `;
            return;
        }

        controls.innerHTML = `
            <div class="runtime-trump-title">
                Kozunu seç
            </div>

            <div class="runtime-trump-buttons">
                ${this.suits.map(s =>
                    `<button type="button"
                        class="runtime-trump-btn ${this.isRedSuit(s) ? "red" : ""}"
                        data-runtime-trump="${s}">
                        <span>${s}</span>
                        ${this.suitNames[s]}
                    </button>`
                ).join("")}
            </div>
        `;

        $$("[data-runtime-trump]", controls).forEach(btn => {
            btn.addEventListener("click", () => {
                this.chooseTrump(btn.dataset.runtimeTrump);
            });
        });
    },

    chooseTrump(suit) {

        if (this.phase !== "trump") return;
        if (this.highestBidder === null) return;

        if (this.highestBidder !== 0) return;

        this.setTrump(suit);
    },

    botChooseTrump() {
        const hand = this.players[this.highestBidder].hand;

        const counts = {};
        this.suits.forEach(s => counts[s] = 0);

        hand.forEach(card => {
            counts[card.suit]++;
        });

        let trump = this.suits[0];

        for (const suit of this.suits) {
            if (counts[suit] > counts[trump]) {
                trump = suit;
            }
        }

        this.setTrump(trump);
    },

    setTrump(suit) {

        this.trump = suit;
        this.phase = "playing";
        this.currentPlayer = this.highestBidder;
        this.trick = [];
        this.trickNumber = 0;

        /*
         * Eşli oyunda ihaleyi alanın partnerinin eli açılır.
         */
        if (this.mode === "pair" && this.highestBidder !== null) {
            const partner = this.partnerOf(this.highestBidder);

            if (partner !== null) {
                this.players[partner].open = true;
            }
        }

        this.renderAll();

        notify(
            `${this.players[this.highestBidder].name} koz olarak ${this.suitNames[suit]} seçti.`
        );

        setTimeout(() => this.continuePhase(), 700);
    },

    partnerOf(index) {
        if (this.mode !== "pair") return null;

        return (index + 2) % 4;
    },

    isHumanTurn() {
        if (this.currentPlayer === 0) return true;

        if (
            this.mode === "pair" &&
            this.highestBidder === 0 &&
            this.currentPlayer === 2
        ) {
            return true;
        }

        return false;
    },

    playUserCard(index) {

        if (this.phase !== "playing") return;
        if (!this.isHumanTurn()) return;
        if (this.processing) return;

        const player = this.players[this.currentPlayer];
        const card = player.hand[index];

        if (!card) return;

        const legal = this.legalCards(player.hand, this.trick);

        if (!legal.some(c => c.id === card.id)) {
            notify("Bu kartı oynayamazsın. Renk takip etmelisin.");
            return;
        }

        this.playCard(this.currentPlayer, card);
    },

    legalCards(hand, trick) {

        if (!trick.length) return [...hand];

        const leadSuit = trick[0].card.suit;

        const sameSuit = hand.filter(c => c.suit === leadSuit);

        if (sameSuit.length) {
            return sameSuit;
        }

        /*
         * Renk yoksa başka renk oynanabilir.
         * Koz oynama zorunluluğu yok.
         */
        return [...hand];
    },

    playCard(playerIndex, card) {

        const player = this.players[playerIndex];

        const idx = player.hand.findIndex(c => c.id === card.id);

        if (idx < 0) return;

        const legal = this.legalCards(player.hand, this.trick);

        if (!legal.some(c => c.id === card.id)) {
            notify("Geçersiz kart.");
            return;
        }

        player.hand.splice(idx, 1);

        this.trick.push({
            player: playerIndex,
            card
        });

        this.renderAll();

        if (this.trick.length === 4) {
            this.resolveTrick();
            return;
        }

        this.currentPlayer = (playerIndex + 1) % 4;

        /*
         * Eşli modda partner de normal oyuncu gibi sıraya gelir.
         * Ancak ihaleyi alan oyuncu iki eli yönetir.
         */
        this.renderAll();

        setTimeout(() => this.continuePhase(), 350);
    },

    botPlay() {

        if (this.processing) return;

        if (this.isHumanTurn()) return;

        const player = this.players[this.currentPlayer];

        const legal = this.legalCards(player.hand, this.trick);

        if (!legal.length) return;

        let selected;

        if (!this.trick.length) {
            selected = this.chooseBotLead(legal);
        } else {
            selected = this.chooseBotResponse(legal, this.trick);
        }

        setTimeout(() => {
            this.playCard(this.currentPlayer, selected);
        }, 550);
    },

    chooseBotLead(cards) {

        /*
         * Öncelik:
         * - Kozu gereksiz yere harcama
         * - Küçük kartla başla
         * - Çok olan renkten oynama eğilimi
         */
        const nonTrump = cards.filter(c => c.suit !== this.trump);

        if (nonTrump.length) {
            return [...nonTrump].sort((a,b) => a.value - b.value)[0];
        }

        return [...cards].sort((a,b) => a.value - b.value)[0];
    },

    chooseBotResponse(cards, trick) {

        const winning = this.currentWinningCard(trick);

        /*
         * Kazanabilecek en küçük kart.
         */
        const beaters = cards.filter(c =>
            this.cardBeats(c, winning.card, trick[0].card.suit)
        );

        if (beaters.length) {
            return [...beaters].sort((a,b) => a.value - b.value)[0];
        }

        /*
         * Kazanamıyorsa en düşük kart.
         */
        return [...cards].sort((a,b) => a.value - b.value)[0];
    },

    currentWinningCard(trick) {

        let winner = trick[0];

        for (let i = 1; i < trick.length; i++) {
            if (
                this.cardBeats(
                    trick[i].card,
                    winner.card,
                    trick[0].card.suit
                )
            ) {
                winner = trick[i];
            }
        }

        return winner;
    },

    cardBeats(candidate, current, leadSuit) {

        if (candidate.suit === current.suit) {
            return candidate.value > current.value;
        }

        if (candidate.suit === this.trump && current.suit !== this.trump) {
            return true;
        }

        if (current.suit === this.trump && candidate.suit !== this.trump) {
            return false;
        }

        if (candidate.suit === leadSuit && current.suit !== leadSuit) {
            return true;
        }

        return false;
    },

    resolveTrick() {

        this.processing = true;

        const winner = this.currentWinningCard(this.trick);
        const winnerIndex = winner.player;

        this.roundTricks[winnerIndex]++;

        const winningName = this.players[winnerIndex].name;

        notify(
            `${winningName} eli aldı: ${winner.card.rank}${winner.card.suit}`
        );

        this.renderAll();

        setTimeout(() => {

            this.trick = [];
            this.trickNumber++;
            this.currentPlayer = winnerIndex;
            this.processing = false;

            if (this.trickNumber >= 13) {
                this.finishRound();
                return;
            }

            this.renderAll();

            this.continuePhase();

        }, 900);
    },

    finishRound() {

        this.phase = "finished";

        /*
         * Tekli:
         * İhaleyi alan oyuncu ihalesini yapamazsa eksi.
         * Diğer herkes en az 1 el almak zorunda.
         */
        if (this.mode === "single") {

            const bidder = this.highestBidder;
            const bid = this.highestBid;

            if (this.roundTricks[bidder] >= bid) {
                this.scores[bidder] += bid;
            } else {
                this.scores[bidder] -= bid;
            }

            for (let i = 0; i < 4; i++) {
                if (i === bidder) continue;

                if (this.roundTricks[i] >= 1) {
                    this.scores[i] += this.roundTricks[i];
                } else {
                    this.scores[i] -= 1;
                }
            }
        }

        /*
         * Eşli:
         * Takım bazlı değerlendirme.
         */
        if (this.mode === "pair") {

            const bidder = this.highestBidder;
            const partner = this.partnerOf(bidder);
            const teamTricks =
                this.roundTricks[bidder] +
                this.roundTricks[partner];

            const bid = this.highestBid;

            if (teamTricks >= bid) {
                this.scores[bidder] += bid;
                this.scores[partner] += bid;
            } else {
                this.scores[bidder] -= bid;
                this.scores[partner] -= bid;
            }

            const enemy = [0,1,2,3].filter(
                i => i !== bidder && i !== partner
            );

            const enemyTricks =
                this.roundTricks[enemy[0]] +
                this.roundTricks[enemy[1]];

            /*
             * Rakip takım da el kazanmışsa takım puanı alır.
             */
            this.scores[enemy[0]] += enemyTricks;
            this.scores[enemy[1]] += enemyTricks;
        }

        this.renderAll();

        let result = "";

        if (this.mode === "single") {
            result =
                `${this.players[this.highestBidder].name} ` +
                `${this.highestBid} istedi, ` +
                `${this.roundTricks[this.highestBidder]} el aldı.`;
        } else {
            const partner = this.partnerOf(this.highestBidder);

            result =
                `${this.players[this.highestBidder].name} + ` +
                `${this.players[partner].name}: ` +
                `${this.roundTricks[this.highestBidder] +
                this.roundTricks[partner]} el aldı.`;
        }

        notify(`Oyun tamamlandı. ${result}`);

        this.renderFinished();
    },

    renderFinished() {

        const controls = $(".batak-controls");
        if (!controls) return;

        controls.innerHTML = `
            <div class="runtime-result">
                <h3>🏆 El Tamamlandı</h3>

                <div class="runtime-score-table">
                    ${this.players.map((p,i) => `
                        <div class="runtime-score-row">
                            <span>${esc(p.name)}</span>
                            <strong>${this.scores[i]}</strong>
                        </div>
                    `).join("")}
                </div>

                <button type="button"
                        class="runtime-new-game"
                        id="runtimeNewBatak">
                    Yeni Oyun
                </button>
            </div>
        `;

        const btn = $("#runtimeNewBatak");

        if (btn) {
            btn.addEventListener("click", () => {
                this.startRound();
            });
        }
    },

    reorderUserHand(from, to) {

        const hand = this.players[0].hand;

        if (
            from < 0 ||
            to < 0 ||
            from >= hand.length ||
            to >= hand.length
        ) return;

        const [card] = hand.splice(from, 1);

        hand.splice(to, 0, card);

        this.renderHand();
    },

    renderAll() {
        this.renderStatus();
        this.renderPlayers();
        this.renderHand();
        this.renderTrick();

        if (this.phase === "bidding") {
            this.renderBidding();
        }

        if (this.phase === "trump") {
            this.renderTrump();
        }

        if (this.phase === "playing") {
            this.renderPlaying();
        }
    },

    renderPlaying() {

        const controls = $(".batak-controls");
        if (!controls) return;

        /*
         * Eşli ihaleyi kullanıcı aldıysa partnerin eli açık.
         */
        if (
            this.mode === "pair" &&
            this.highestBidder === 0 &&
            this.currentPlayer === 2
        ) {
            controls.innerHTML = `
                <div class="runtime-partner-turn">
                    <strong>Partnerinin sırası</strong>
                    <span>Partnerinin açık elinden bir kart seç.</span>
                </div>
            `;
            return;
        }

        if (this.isHumanTurn()) {
            controls.innerHTML = `
                <div class="runtime-your-turn">
                    ${this.trick.length
                        ? `İlk renk: <strong>${this.suitNames[this.trick[0].card.suit]}</strong>`
                        : "Eli sen başlatıyorsun."}
                </div>
            `;
        } else {
            controls.innerHTML = `
                <div class="runtime-batak-wait">
                    <strong>${esc(this.players[this.currentPlayer].name)}</strong>
                    oynuyor...
                </div>
            `;
        }
    },

    renderStatus() {

        const status = $(".batak-status");

        if (!status) return;

        const bidText =
            this.highestBidder !== null
                ? `${this.players[this.highestBidder].name} / ${this.highestBid}`
                : "-";

        status.innerHTML = `
            <div class="runtime-status-grid">
                <div>
                    <span>Mod</span>
                    <strong>${this.mode === "pair" ? "Eşli" : "Tekli"}</strong>
                </div>

                <div>
                    <span>İhale</span>
                    <strong>${bidText}</strong>
                </div>

                <div>
                    <span>Koz</span>
                    <strong>
                        ${this.trump
                            ? `${this.trump} ${this.suitNames[this.trump]}`
                            : "-"}
                    </strong>
                </div>

                <div>
                    <span>El</span>
                    <strong>${Math.min(this.trickNumber + 1, 13)} / 13</strong>
                </div>
            </div>
        `;
    },

    renderPlayers() {

        const table = $(".batak-table");
        if (!table) return;

        const players = [
            [0, "player-bottom"],
            [1, "player-left"],
            [2, "player-top"],
            [3, "player-right"]
        ];

        players.forEach(([index, cls]) => {

            const el =
                table.querySelector(`.${cls}`) ||
                table.querySelector(`[data-player="${index}"]`);

            if (!el) return;

            const p = this.players[index];

            el.dataset.player = index;

            el.innerHTML = `
                <div class="runtime-player-name">
                    ${esc(p.name)}
                    ${p.team !== undefined && this.mode === "pair"
                        ? `<small>Takım ${p.team === 0 ? "A" : "B"}</small>`
                        : ""}
                </div>

                <div class="runtime-player-cards">
                    ${
                        (
                            index === 0 ||
                            (
                                this.mode === "pair" &&
                                this.highestBidder === 0 &&
                                index === 2
                            )
                        )
                        ? `${p.hand.length} kart`
                        : `${p.hand.length} kapalı`
                    }
                </div>

                <div class="runtime-player-tricks">
                    El: ${this.roundTricks[index]}
                </div>
            `;
        });
    },

    renderHand() {

        const handEl = $("#playerHand");
        if (!handEl) return;

        const p = this.players[0];

        handEl.innerHTML = "";

        p.hand.forEach((card,index) => {

            const legal =
                this.phase === "playing" &&
                this.currentPlayer === 0 &&
                this.isHumanTurn()
                    ? this.legalCards(p.hand, this.trick)
                        .some(c => c.id === card.id)
                    : false;

            const el = this.makeCard(card, index, legal);

            handEl.appendChild(el);
        });

        /*
         * Eşli ihaleyi sen aldıysan partnerin eli ayrıca görünür.
         */
        let partnerPanel = $("#runtimePartnerHand");

        if (
            this.mode === "pair" &&
            this.highestBidder === 0
        ) {

            if (!partnerPanel) {
                partnerPanel = document.createElement("div");
                partnerPanel.id = "runtimePartnerHand";
                partnerPanel.className = "runtime-partner-hand";

                handEl.parentElement?.appendChild(partnerPanel);
            }

            const partner = this.players[2];

            partnerPanel.innerHTML = `
                <div class="runtime-partner-title">
                    Partnerin — ${esc(partner.name)}
                </div>

                <div class="runtime-partner-cards">
                    ${partner.hand.map((card,index) =>
                        this.makeCardHTML(
                            card,
                            `partner-${index}`,
                            this.currentPlayer === 2 &&
                            this.phase === "playing" &&
                            this.legalCards(partner.hand, this.trick)
                                .some(c => c.id === card.id)
                        )
                    ).join("")}
                </div>
            `;

            $$(".runtime-partner-cards .playing-card").forEach(el => {
                el.addEventListener("click", () => {
                    if (this.currentPlayer !== 2) return;

                    const index = Number(el.dataset.index);

                    this.playPartnerCard(index);
                });
            });

        } else if (partnerPanel) {
            partnerPanel.remove();
        }
    },

    playPartnerCard(index) {

        if (
            this.mode !== "pair" ||
            this.highestBidder !== 0 ||
            this.currentPlayer !== 2 ||
            this.phase !== "playing"
        ) return;

        const partner = this.players[2];
        const card = partner.hand[index];

        if (!card) return;

        const legal = this.legalCards(partner.hand, this.trick);

        if (!legal.some(c => c.id === card.id)) {
            notify("Partner elinden bu kartı oynayamazsın.");
            return;
        }

        this.playCard(2, card);
    },

    makeCard(card,index,legal) {

        const el = document.createElement("div");

        el.innerHTML = this.makeCardHTML(card,index,legal);

        const cardEl = el.firstElementChild;

        cardEl.draggable = true;

        return cardEl;
    },

    makeCardHTML(card,index,legal) {

        const red = this.isRedSuit(card.suit);

        const classes = [
            "playing-card",
            red ? "red" : "",
            legal ? "legal-card" : "",
            !legal && this.phase === "playing" && this.currentPlayer === 0
                ? "disabled-card"
                : ""
        ].filter(Boolean).join(" ");

        return `
            <div class="${classes}"
                 data-index="${index}"
                 data-card-id="${esc(card.id)}"
                 draggable="true">

                <div class="card-corner top">
                    <strong>${esc(card.rank)}</strong>
                    <span>${card.suit}</span>
                </div>

                <div class="card-center">
                    ${card.suit}
                </div>

                <div class="card-corner bottom">
                    <strong>${esc(card.rank)}</strong>
                    <span>${card.suit}</span>
                </div>
            </div>
        `;
    },

    isRedSuit(suit) {
        return suit === "♥" || suit === "♦";
    },

    renderTrick() {

        const area = $(".played-cards");

        if (!area) return;

        area.innerHTML = "";

        this.trick.forEach(item => {

            const card = document.createElement("div");

            card.className = "runtime-played";

            card.innerHTML = `
                <div class="runtime-played-name">
                    ${esc(this.players[item.player].name)}
                </div>

                ${this.makeCardHTML(
                    item.card,
                    `played-${item.player}`,
                    false
                )}
            `;

            area.appendChild(card);
        });
    },

    installRuntimeStyle() {

        if ($("#runtimeBatakStyle")) return;

        const style = document.createElement("style");
        style.id = "runtimeBatakStyle";

        style.textContent = `

        /* =====================================================
           TAVLA RUNTIME
           ===================================================== */

        .runtime-tavla-info {
            margin-top:14px;
            padding:12px;
            border-radius:14px;
            background:rgba(255,255,255,.06);
            border:1px solid rgba(255,255,255,.08);
        }

        .runtime-bar {
            display:flex;
            gap:18px;
            justify-content:center;
            flex-wrap:wrap;
            font-size:13px;
        }

        .runtime-bar b {
            color:#f4c95d;
        }

        .runtime-die {
            width:54px;
            height:54px;
            border-radius:10px;
            background:#fff;
            color:#111;
            display:flex;
            align-items:center;
            justify-content:center;
            box-shadow:0 5px 18px rgba(0,0,0,.25);
            margin:4px;
        }

        .runtime-die.used {
            opacity:.28;
            transform:scale(.9);
        }

        .die-grid {
            width:38px;
            height:38px;
            display:grid;
            grid-template-columns:repeat(3,1fr);
            grid-template-rows:repeat(3,1fr);
            gap:2px;
        }

        .die-grid i {
            width:8px;
            height:8px;
            border-radius:50%;
            background:transparent;
            justify-self:center;
            align-self:center;
        }

        .die-grid i.dot {
            background:#111;
        }

        /* =====================================================
           BATAK
           ===================================================== */

        .runtime-status-grid {
            display:grid;
            grid-template-columns:repeat(4,1fr);
            gap:10px;
            margin-bottom:14px;
        }

        .runtime-status-grid > div {
            padding:10px;
            border-radius:12px;
            background:rgba(255,255,255,.05);
            border:1px solid rgba(255,255,255,.08);
            text-align:center;
        }

        .runtime-status-grid span {
            display:block;
            font-size:11px;
            opacity:.65;
            margin-bottom:4px;
        }

        .runtime-status-grid strong {
            font-size:14px;
        }

        .runtime-bid-title,
        .runtime-trump-title {
            margin-bottom:10px;
            font-weight:700;
        }

        .runtime-bid-buttons,
        .runtime-trump-buttons {
            display:flex;
            gap:8px;
            flex-wrap:wrap;
        }

        .runtime-bid-btn,
        .runtime-trump-btn,
        .runtime-new-game {
            border:0;
            border-radius:10px;
            padding:11px 15px;
            cursor:pointer;
            color:#fff;
            background:#1c6b52;
            font-weight:800;
            transition:.15s ease;
        }

        .runtime-bid-btn:hover,
        .runtime-trump-btn:hover,
        .runtime-new-game:hover {
            transform:translateY(-2px);
            filter:brightness(1.12);
        }

        .runtime-bid-btn.pass {
            background:#6a2731;
        }

        .runtime-trump-btn {
            min-width:90px;
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:3px;
        }

        .runtime-trump-btn span {
            font-size:24px;
        }

        .runtime-trump-btn.red span {
            color:#e53950;
        }

        .runtime-batak-wait,
        .runtime-your-turn,
        .runtime-partner-turn {
            padding:12px 14px;
            border-radius:12px;
            background:rgba(255,255,255,.05);
        }

        .runtime-player-name small {
            display:block;
            opacity:.6;
            font-size:10px;
        }

        .runtime-player-tricks {
            font-size:11px;
            opacity:.7;
            margin-top:4px;
        }

        /* GERÇEK İSKAMBİL KARTI */

        .playing-card {
            position:relative;
            width:76px;
            height:108px;
            flex:0 0 76px;
            border-radius:10px;
            background:
                linear-gradient(135deg,#ffffff,#f1f1ed);
            color:#111;
            border:1px solid #c8c8c8;
            box-shadow:
                0 5px 10px rgba(0,0,0,.22),
                inset 0 0 0 1px rgba(255,255,255,.8);
            user-select:none;
            cursor:pointer;
            transition:
                transform .15s ease,
                box-shadow .15s ease,
                opacity .15s ease;
        }

        .playing-card:hover {
            transform:translateY(-8px);
            box-shadow:
                0 12px 20px rgba(0,0,0,.30);
            z-index:5;
        }

        .playing-card.red {
            color:#c9283e;
        }

        .playing-card.disabled-card {
            opacity:.55;
        }

        .playing-card.dragging {
            opacity:.35;
            transform:rotate(3deg) scale(.96);
        }

        .playing-card .card-corner {
            position:absolute;
            display:flex;
            flex-direction:column;
            align-items:center;
            line-height:1;
            font-family:Georgia,serif;
        }

        .playing-card .card-corner.top {
            top:7px;
            left:7px;
        }

        .playing-card .card-corner.bottom {
            right:7px;
            bottom:7px;
            transform:rotate(180deg);
        }

        .playing-card .card-corner strong {
            font-size:18px;
        }

        .playing-card .card-corner span {
            font-size:14px;
        }

        .playing-card .card-center {
            position:absolute;
            inset:0;
            display:flex;
            align-items:center;
            justify-content:center;
            font-family:Georgia,serif;
            font-size:38px;
        }

        .batak-controls {
            margin-top:14px;
        }

        #playerHand {
            display:flex;
            flex-wrap:wrap;
            gap:8px;
            align-items:flex-end;
            min-height:118px;
        }

        .runtime-partner-hand {
            margin-top:18px;
            padding:12px;
            border-radius:14px;
            background:rgba(255,255,255,.045);
            border:1px solid rgba(255,255,255,.08);
        }

        .runtime-partner-title {
            font-weight:800;
            margin-bottom:10px;
        }

        .runtime-partner-cards {
            display:flex;
            flex-wrap:wrap;
            gap:7px;
        }

        .runtime-partner-cards .playing-card {
            width:64px;
            height:92px;
            flex-basis:64px;
        }

        .runtime-partner-cards .card-center {
            font-size:31px;
        }

        .runtime-partner-cards .card-corner strong {
            font-size:15px;
        }

        .runtime-partner-cards .card-corner span {
            font-size:12px;
        }

        .played-cards {
            display:flex;
            justify-content:center;
            align-items:center;
            flex-wrap:wrap;
            gap:15px;
            min-height:125px;
        }

        .runtime-played {
            display:flex;
            flex-direction:column;
            align-items:center;
            gap:4px;
        }

        .runtime-played-name {
            font-size:11px;
            opacity:.75;
        }

        .runtime-played .playing-card {
            cursor:default;
            transform:none;
        }

        .runtime-result {
            padding:16px;
            border-radius:15px;
            background:rgba(255,255,255,.05);
            border:1px solid rgba(255,255,255,.08);
        }

        .runtime-result h3 {
            margin-top:0;
        }

        .runtime-score-table {
            display:flex;
            flex-direction:column;
            gap:7px;
            margin:12px 0;
        }

        .runtime-score-row {
            display:flex;
            justify-content:space-between;
            padding:9px 11px;
            border-radius:9px;
            background:rgba(255,255,255,.05);
        }

        @media(max-width:700px) {

            .runtime-status-grid {
                grid-template-columns:repeat(2,1fr);
            }

            .playing-card {
                width:58px;
                height:84px;
                flex-basis:58px;
            }

            .playing-card .card-center {
                font-size:30px;
            }

            .playing-card .card-corner strong {
                font-size:14px;
            }

            .playing-card .card-corner span {
                font-size:11px;
            }

            #playerHand {
                gap:5px;
            }

            .runtime-partner-cards {
                gap:5px;
            }

            .runtime-partner-cards .playing-card {
                width:52px;
                height:76px;
                flex-basis:52px;
            }

            .runtime-partner-cards .card-center {
                font-size:25px;
            }
        }

        `;

        document.head.appendChild(style);
    }
};

/* ============================================================
   BATAK MOD SEÇİMİ
   ============================================================ */

document.addEventListener("click", e => {

    const btn = e.target.closest(".batak-mode-btn");

    if (!btn) return;

    $$(".batak-mode-btn").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");

    Batak.mode = btn.dataset.mode === "pair"
        ? "pair"
        : "single";

    Batak.startRound();
});

/* ============================================================
   SAYFA BAŞLANGICI
   ============================================================ */

function boot() {

    bindNavigation();

    /*
     * Mevcut HTML'deki standart butonlar.
     */
    const home = $("#goHome");
    const tavla = $("#goTavla");
    const batak = $("#goBatak");
    const salon = $("#goSalon");

    if (home) {
        home.addEventListener("click", () => showScreen("homeScreen"));
    }

    if (tavla) {
        tavla.addEventListener("click", () => {
            showScreen("tavlaScreen");
            if (!Tavla.started) Tavla.start();
        });
    }

    if (batak) {
        batak.addEventListener("click", () => {
            showScreen("batakScreen");
            if (!Batak.started) Batak.start();
        });
    }

    if (salon) {
        salon.addEventListener("click", () => showScreen("salonScreen"));
    }

    /*
     * Ana sayfa varsayılan.
     */
    showScreen("homeScreen");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
} else {
    boot();
}

})();
