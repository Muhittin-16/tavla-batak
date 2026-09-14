/* ============================================================
   TAVLA & BATAK
   Tam çalışan yerel oyun motoru
   ============================================================ */

(() => {
"use strict";

/* ============================================================
   GENEL YARDIMCILAR
   ============================================================ */

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ============================================================
   EKRANLAR
   ============================================================ */

function showScreen(name) {
    $$(".screen").forEach(el => el.classList.remove("active"));

    const target = $("#" + name + "Screen");
    if (target) target.classList.add("active");

    $$(".nav-btn").forEach(btn => btn.classList.remove("active"));

    if (name === "home") {
        const b = document.querySelector('[data-screen="home"]');
        if (b) b.classList.add("active");
    }

    if (name === "tavla") {
        const b = document.querySelector('[data-screen="tavla"]');
        if (b) b.classList.add("active");
    }

    if (name === "batak") {
        const b = document.querySelector('[data-screen="batak"]');
        if (b) b.classList.add("active");
    }

    if (name === "salon") {
        const b = document.querySelector('[data-screen="salon"]');
        if (b) b.classList.add("active");
    }
}

function bindNavigation() {
    $$("[data-screen]").forEach(btn => {
        btn.addEventListener("click", () => {
            showScreen(btn.dataset.screen);
        });
    });
}

/* ============================================================
   TAVLA
   ============================================================ */

const Tavla = {

    board: [],
    barYou: 0,
    barBot: 0,
    offYou: 0,
    offBot: 0,

    dice: [],
    usedDice: [],

    turn: "you",
    selected: null,

    started: false,
    gameOver: false,
    botThinking: false,

    boardEl: null,
    diceEl: null,
    messageEl: null,
    turnEl: null,

    init() {
        this.boardEl = $("#backgammonBoard");
        this.diceEl = $("#diceBox");
        this.messageEl = $("#gameMessage");
        this.turnEl = $("#turnLabel");

        const newBtn = $("#newTavla");

        if (newBtn) {
            newBtn.addEventListener("click", () => this.newGame());
        }

        if (this.diceEl) {
            this.diceEl.addEventListener("click", e => {
                const btn = e.target.closest(".dice-btn");
                if (!btn) return;
                this.rollDice();
            });
        }

        if (this.boardEl) {
            this.boardEl.addEventListener("click", e => {
                const point = e.target.closest("[data-point]");
                if (!point) return;

                const p = Number(point.dataset.point);

                if (this.turn === "you") {
                    this.handlePointClick(p);
                }
            });
        }

        this.newGame();
    },

    newGame() {

        this.board = Array(24).fill(null).map(() => ({
            you: 0,
            bot: 0
        }));

        /*
            Standart tavla başlangıcı.

            Kullanıcı: 24'ten 1'e doğru ilerler.
            Bot: 1'den 24'e doğru ilerler.
        */

        this.board[0].bot = 2;
        this.board[5].you = 5;
        this.board[7].you = 3;
        this.board[11].bot = 5;

        this.board[12].you = 5;
        this.board[16].bot = 3;
        this.board[18].bot = 5;
        this.board[23].you = 2;

        this.barYou = 0;
        this.barBot = 0;
        this.offYou = 0;
        this.offBot = 0;

        this.dice = [];
        this.usedDice = [];

        this.turn = "you";
        this.selected = null;

        this.started = true;
        this.gameOver = false;
        this.botThinking = false;

        this.message("Zar atmak için zar alanına tıkla.");
        this.render();
    },

    message(text) {
        if (this.messageEl) {
            this.messageEl.textContent = text;
        }
    },

    rollDice() {

        if (!this.started || this.gameOver) return;

        if (this.turn !== "you") {
            this.message("Şu anda sıra sende değil.");
            return;
        }

        if (this.dice.length > 0) {
            this.message("Önce mevcut zarlarını kullan.");
            return;
        }

        const a = rand(1, 6);
        const b = rand(1, 6);

        this.dice = a === b
            ? [a, a, a, a]
            : [a, b];

        this.usedDice = [];

        this.message(
            `Zarlar: ${a} - ${b}. Oynatmak istediğin taşın bulunduğu haneye tıkla.`
        );

        this.render();

        if (!this.hasAnyLegalMove("you")) {
            this.message("Bu zarlarla oynayabileceğin hamle yok. Botun sırası.");
            setTimeout(() => this.endTurn(), 900);
        }
    },

    getRemainingDice() {
        return this.dice.filter((_, i) => !this.usedDice.includes(i));
    },

    pointBlockedFor(player, point) {

        if (point < 0 || point > 23) return true;

        const enemy = player === "you" ? "bot" : "you";

        return this.board[point][enemy] >= 2;
    },

    direction(player) {
        return player === "you" ? -1 : 1;
    },

    destination(player, from, die) {
        return player === "you"
            ? from - die
            : from + die;
    },

    inHome(player, point) {

        if (player === "you") {
            return point >= 0 && point <= 5;
        }

        return point >= 18 && point <= 23;
    },

    allInHome(player) {

        const bar = player === "you" ? this.barYou : this.barBot;

        if (bar > 0) return false;

        for (let i = 0; i < 24; i++) {
            if (this.board[i][player] > 0 && !this.inHome(player, i)) {
                return false;
            }
        }

        return true;
    },

    canBearOff(player, from, die) {

        if (!this.allInHome(player)) return false;

        if (player === "you") {

            const exact = from + 1 === die;

            if (exact) return true;

            if (die > from + 1) {
                for (let i = from + 1; i <= 5; i++) {
                    if (this.board[i].you > 0) return false;
                }
                return true;
            }

        } else {

            const distance = 24 - from;

            const exact = distance === die;

            if (exact) return true;

            if (die > distance) {
                for (let i = 18; i < from; i++) {
                    if (this.board[i].bot > 0) return false;
                }
                return true;
            }
        }

        return false;
    },

    legalMove(player, from, die) {

        if (!this.board[from][player]) return false;

        if (this.pointBlockedFor(player, from)) return false;

        const dest = this.destination(player, from, die);

        if (dest < 0 || dest > 23) {
            return this.canBearOff(player, from, die);
        }

        if (this.pointBlockedFor(player, dest)) {
            return false;
        }

        return true;
    },

    hasAnyLegalMove(player) {

        const dice = this.getRemainingDice();

        if (!dice.length) return false;

        if (player === "you" && this.barYou > 0) {
            return dice.some(die => {
                const dest = die - 1;
                return !this.pointBlockedFor(player, dest);
            });
        }

        if (player === "bot" && this.barBot > 0) {
            return dice.some(die => {
                const dest = die - 1;
                return !this.pointBlockedFor(player, dest);
            });
        }

        for (let p = 0; p < 24; p++) {

            if (this.board[p][player] <= 0) continue;

            for (const die of dice) {
                if (this.legalMove(player, p, die)) {
                    return true;
                }
            }
        }

        return false;
    },

    handlePointClick(point) {

        if (this.gameOver) return;
        if (this.turn !== "you") return;
        if (!this.dice.length) {
            this.message("Önce zar at.");
            return;
        }

        /*
            Eğer bar'da taş varsa sadece bar üzerinden giriş yapılabilir.
        */

        if (this.barYou > 0) {

            const remaining = this.getRemainingDice();

            for (let i = 0; i < this.dice.length; i++) {

                if (this.usedDice.includes(i)) continue;

                const die = this.dice[i];
                const dest = die - 1;

                if (dest === point && !this.pointBlockedFor("you", dest)) {
                    this.moveFromBar("you", i);
                    return;
                }
            }

            this.message("Önce bardaki taşı oyuna sokmalısın.");
            return;
        }

        /*
            İlk tıklama: taş seç.
        */

        if (this.selected === null) {

            if (this.board[point].you <= 0) {
                this.message("Burada sana ait taş yok.");
                return;
            }

            this.selected = point;
            this.message(`Taş seçildi: ${point + 1}. Gideceği haneye tıkla.`);
            this.render();
            return;
        }

        /*
            Aynı yere tıklanırsa seçim iptal.
        */

        if (this.selected === point) {
            this.selected = null;
            this.message("Taş seçimi iptal edildi.");
            this.render();
            return;
        }

        /*
            Hedef noktaya göre zar bul.
        */

        const from = this.selected;

        let dieIndex = -1;

        for (let i = 0; i < this.dice.length; i++) {

            if (this.usedDice.includes(i)) continue;

            const die = this.dice[i];
            const dest = this.destination("you", from, die);

            if (dest === point) {
                dieIndex = i;
                break;
            }
        }

        /*
            Bear off için oyuncu hedefi olarak özel olarak tahtanın dışına
            tıklamak yerine, taşın kendi hanesine tekrar tıklama desteği.
        */

        if (dieIndex === -1) {

            for (let i = 0; i < this.dice.length; i++) {

                if (this.usedDice.includes(i)) continue;

                if (this.canBearOff("you", from, this.dice[i])) {
                    if (
                        (point === 0 && from === 0) ||
                        (point === 5 && from === 5)
                    ) {
                        dieIndex = i;
                        break;
                    }
                }
            }
        }

        if (dieIndex === -1) {

            this.message("Bu hamle geçerli değil. Kullanabileceğin zarı kontrol et.");
            return;
        }

        const die = this.dice[dieIndex];

        if (!this.legalMove("you", from, die)) {

            if (this.canBearOff("you", from, die)) {
                this.bearOff("you", from, dieIndex);
                return;
            }

            this.message("Bu hamle geçerli değil.");
            return;
        }

        this.move("you", from, dieIndex);
    },

    moveFromBar(player, dieIndex) {

        const die = this.dice[dieIndex];

        const dest = player === "you"
            ? die - 1
            : 24 - die;

        if (this.pointBlockedFor(player, dest)) {
            return;
        }

        const enemy = player === "you" ? "bot" : "you";

        if (this.board[dest][enemy] === 1) {

            this.board[dest][enemy] = 0;

            if (enemy === "you") {
                this.barYou++;
            } else {
                this.barBot++;
            }
        }

        this.board[dest][player]++;
        this[player === "you" ? "barYou" : "barBot"]--;

        this.usedDice.push(dieIndex);
        this.selected = null;

        this.afterMove();
    },

    move(player, from, dieIndex) {

        const die = this.dice[dieIndex];

        const dest = this.destination(player, from, die);

        if (dest < 0 || dest > 23) {

            if (this.canBearOff(player, from, die)) {
                this.bearOff(player, from, dieIndex);
            }

            return;
        }

        if (!this.legalMove(player, from, die)) {
            return;
        }

        const enemy = player === "you" ? "bot" : "you";

        this.board[from][player]--;

        /*
            Tek rakip varsa kır.
        */

        if (this.board[dest][enemy] === 1) {

            this.board[dest][enemy] = 0;

            if (enemy === "you") {
                this.barYou++;
            } else {
                this.barBot++;
            }
        }

        this.board[dest][player]++;

        this.usedDice.push(dieIndex);
        this.selected = null;

        this.message(
            player === "you"
                ? "Hamle yapıldı."
                : "Bot hamle yaptı."
        );

        this.afterMove();
    },

    bearOff(player, from, dieIndex) {

        if (!this.canBearOff(player, from, this.dice[dieIndex])) {
            this.message("Taş çıkarma hamlesi geçerli değil.");
            return;
        }

        this.board[from][player]--;

        if (player === "you") {
            this.offYou++;
        } else {
            this.offBot++;
        }

        this.usedDice.push(dieIndex);
        this.selected = null;

        this.afterMove();
    },

    afterMove() {

        if (this.offYou >= 15) {
            this.gameOver = true;
            this.message("🎉 Tebrikler! Tavlayı sen kazandın!");
            this.render();
            return;
        }

        if (this.offBot >= 15) {
            this.gameOver = true;
            this.message("Bot tavlayı kazandı.");
            this.render();
            return;
        }

        const remaining = this.getRemainingDice();

        if (!remaining.length || !this.hasAnyLegalMove(this.turn)) {
            this.endTurn();
            return;
        }

        this.render();
    },

    endTurn() {

        this.dice = [];
        this.usedDice = [];
        this.selected = null;

        if (this.turn === "you") {

            this.turn = "bot";

            this.message("Bot düşünüyor...");
            this.render();

            setTimeout(() => this.botTurn(), 850);

        } else {

            this.turn = "you";

            this.message("Sıra sende. Zar at.");
            this.render();
        }
    },

    async botTurn() {

        if (this.gameOver) return;

        this.botThinking = true;

        const a = rand(1, 6);
        const b = rand(1, 6);

        this.dice = a === b
            ? [a, a, a, a]
            : [a, b];

        this.usedDice = [];

        this.render();

        await sleep(650);

        while (
            this.getRemainingDice().length &&
            this.hasAnyLegalMove("bot")
        ) {

            let choices = [];

            /*
                Bar'daki taş önce.
            */

            if (this.barBot > 0) {

                for (let i = 0; i < this.dice.length; i++) {

                    if (this.usedDice.includes(i)) continue;

                    const die = this.dice[i];
                    const dest = 24 - die;

                    if (!this.pointBlockedFor("bot", dest)) {
                        choices.push({
                            type: "bar",
                            dieIndex: i
                        });
                    }
                }

            } else {

                for (let from = 0; from < 24; from++) {

                    if (this.board[from].bot <= 0) continue;

                    for (let i = 0; i < this.dice.length; i++) {

                        if (this.usedDice.includes(i)) continue;

                        const die = this.dice[i];

                        if (this.legalMove("bot", from, die)) {

                            choices.push({
                                type: "move",
                                from,
                                dieIndex: i
                            });

                        } else if (this.canBearOff("bot", from, die)) {

                            choices.push({
                                type: "off",
                                from,
                                dieIndex: i
                            });
                        }
                    }
                }
            }

            if (!choices.length) break;

            /*
                Basit ama mantıklı seçim:
                - rakibi kırabiliyorsa tercih et
                - çıkabiliyorsa tercih et
                - bar girişi öncelikli
            */

            let selected = null;

            const hitting = choices.find(c => {

                if (c.type !== "move") return false;

                const die = this.dice[c.dieIndex];
                const dest = this.destination("bot", c.from, die);

                return this.board[dest].you === 1;
            });

            const bearing = choices.find(c => c.type === "off");

            selected = hitting || bearing || choices[0];

            if (selected.type === "bar") {
                this.moveFromBar("bot", selected.dieIndex);

            } else if (selected.type === "off") {
                this.bearOff(
                    "bot",
                    selected.from,
                    selected.dieIndex
                );

            } else {
                this.move(
                    "bot",
                    selected.from,
                    selected.dieIndex
                );
            }

            if (this.gameOver) return;

            this.render();

            await sleep(550);
        }

        this.botThinking = false;

        if (!this.gameOver) {
            this.endTurn();
        }
    },

    render() {

        this.renderBoard();
        this.renderDice();
        this.renderInfo();
    },

    renderInfo() {

        if (this.turnEl) {

            if (this.turn === "you") {
                this.turnEl.textContent = "Sıra: Sen";
            } else {
                this.turnEl.textContent = "Sıra: Bot";
            }
        }

        const barYou = $("#barYou");
        const barBot = $("#barBot");
        const offYou = $("#offYou");
        const offYouSide = $("#offYouSide");

        if (barYou) barYou.textContent = this.barYou;
        if (barBot) barBot.textContent = this.barBot;
        if (offYou) offYou.textContent = this.offYou;
        if (offYouSide) offYouSide.textContent = this.offYou;
    },

    renderDice() {

        if (!this.diceEl) return;

        this.diceEl.innerHTML = "";

        if (!this.dice.length) {

            const btn = document.createElement("button");
            btn.className = "dice-btn";
            btn.type = "button";
            btn.innerHTML = "🎲<br><small>ZAR AT</small>";

            this.diceEl.appendChild(btn);
            return;
        }

        this.dice.forEach((die, index) => {

            const btn = document.createElement("button");

            btn.type = "button";
            btn.className = "dice-btn";

            if (this.usedDice.includes(index)) {
                btn.classList.add("used");
            }

            btn.dataset.index = index;

            btn.innerHTML = `
                <strong>${die}</strong>
                <span>Zar</span>
            `;

            this.diceEl.appendChild(btn);
        });
    },

    renderBoard() {

        if (!this.boardEl) return;

        this.boardEl.innerHTML = "";

        /*
            Üst sıra 12 - 18
            Alt sıra 11 - 0
        */

        const top = [12,13,14,15,16,17,18,19,20,21,22,23];
        const bottom = [11,10,9,8,7,6,5,4,3,2,1,0];

        const topRow = document.createElement("div");
        topRow.className = "board-row board-top";

        const bottomRow = document.createElement("div");
        bottomRow.className = "board-row board-bottom";

        top.forEach(p => {
            topRow.appendChild(this.createPoint(p, true));
        });

        bottom.forEach(p => {
            bottomRow.appendChild(this.createPoint(p, false));
        });

        this.boardEl.appendChild(topRow);

        const middle = document.createElement("div");
        middle.className = "board-middle";

        const bar = document.createElement("div");
        bar.className = "board-bar";

        bar.innerHTML = `
            <div class="bar-side">
                <span>Bot</span>
                <strong>${this.barBot}</strong>
            </div>
            <div class="bar-side">
                <span>Sen</span>
                <strong>${this.barYou}</strong>
            </div>
        `;

        middle.appendChild(bar);
        this.boardEl.appendChild(middle);

        this.boardEl.appendChild(bottomRow);
    },

    createPoint(point, top) {

        const el = document.createElement("button");

        el.type = "button";
        el.className = "board-point";

        if (top) {
            el.classList.add("point-top");
        } else {
            el.classList.add("point-bottom");
        }

        el.dataset.point = point;

        if (this.selected === point) {
            el.classList.add("selected");
        }

        const number = document.createElement("span");
        number.className = "point-number";
        number.textContent = point + 1;

        el.appendChild(number);

        const pieces = document.createElement("div");
        pieces.className = "pieces";

        const youCount = this.board[point].you;
        const botCount = this.board[point].bot;

        /*
            Taşları göster.
        */

        const addPiece = (player, count, index) => {

            const piece = document.createElement("div");

            piece.className =
                "checker " +
                (player === "you"
                    ? "checker-you"
                    : "checker-bot");

            piece.textContent = index < 5 ? "" : "";

            pieces.appendChild(piece);
        };

        const maxShow = 5;

        for (let i = 0; i < Math.min(youCount, maxShow); i++) {
            addPiece("you", youCount, i);
        }

        for (let i = 0; i < Math.min(botCount, maxShow); i++) {
            addPiece("bot", botCount, i);
        }

        if (youCount > 5) {

            const more = document.createElement("span");
            more.className = "piece-count";
            more.textContent = "+" + (youCount - 5);
            pieces.appendChild(more);
        }

        if (botCount > 5) {

            const more = document.createElement("span");
            more.className = "piece-count";
            more.textContent = "+" + (botCount - 5);
            pieces.appendChild(more);
        }

        el.appendChild(pieces);

        return el;
    }
};

/* ============================================================
   BATAK
   ============================================================ */

const Batak = {

    deck: [],
    players: [],

    currentPlayer: 0,

    phase: "idle",

    highestBid: 0,
    highestBidder: -1,

    trump: null,

    trick: [],

    trickNumber: 0,

    scores: [0,0,0,0],

    bidTurn: 0,

    playerHandEl: null,
    statusEl: null,
    trumpEl: null,
    playedEl: null,
    trumpChoicesEl: null,

    suits: ["♠", "♥", "♦", "♣"],
    ranks: [
        "2","3","4","5","6","7","8","9","10",
        "J","Q","K","A"
    ],

    init() {

        this.playerHandEl = $("#playerHand");
        this.statusEl = $(".batak-status");
        this.trumpEl = $(".trump");
        this.playedEl = $(".played-cards");
        this.trumpChoicesEl = $("#trumpChoices");

        const newBtn = $("#newBatak");

        if (newBtn) {
            newBtn.addEventListener("click", () => this.newGame());
        }

        const bidBtn = $("#bidButton");
        const passBtn = $("#passButton");

        if (bidBtn) {
            bidBtn.addEventListener("click", () => this.playerBid());
        }

        if (passBtn) {
            passBtn.addEventListener("click", () => this.playerPass());
        }

        if (this.trumpChoicesEl) {

            $$(".trump-btn", this.trumpChoicesEl).forEach(btn => {

                btn.addEventListener("click", () => {

                    const suit = btn.dataset.suit;

                    this.chooseTrump(suit);
                });
            });
        }

        this.newGame();
    },

    newGame() {

        this.deck = this.createDeck();

        this.players = [
            {
                name: "Sen",
                hand: []
            },
            {
                name: "Bot 1",
                hand: []
            },
            {
                name: "Bot 2",
                hand: []
            },
            {
                name: "Bot 3",
                hand: []
            }
        ];

        this.currentPlayer = 0;

        this.phase = "bidding";

        this.highestBid = 0;
        this.highestBidder = -1;

        this.trump = null;

        this.trick = [];
        this.trickNumber = 0;

        this.scores = [0,0,0,0];

        this.bidTurn = 0;

        shuffle(this.deck);

        for (let i = 0; i < 13; i++) {

            for (let p = 0; p < 4; p++) {

                this.players[p].hand.push(
                    this.deck.pop()
                );
            }
        }

        this.players.forEach(p => this.sortHand(p.hand));

        this.hideTrumpChoices();

        this.updateStatus(
            "İhale başladı. Sıra sende: İhaleye Gir veya Pas."
        );

        this.render();
    },

    createDeck() {

        const deck = [];

        for (const suit of this.suits) {

            for (const rank of this.ranks) {

                deck.push({
                    suit,
                    rank,
                    value: this.cardValue(rank)
                });
            }
        }

        return deck;
    },

    cardValue(rank) {

        if (rank === "A") return 14;
        if (rank === "K") return 13;
        if (rank === "Q") return 12;
        if (rank === "J") return 11;

        return Number(rank);
    },

    sortHand(hand) {

        const suitOrder = {
            "♠": 0,
            "♥": 1,
            "♦": 2,
            "♣": 3
        };

        hand.sort((a,b) => {

            const suit = suitOrder[a.suit] - suitOrder[b.suit];

            if (suit !== 0) return suit;

            return a.value - b.value;
        });
    },

    isRed(card) {
        return card.suit === "♥" || card.suit === "♦";
    },

    cardText(card) {
        return `${card.rank}${card.suit}`;
    },

    updateStatus(text) {

        if (this.statusEl) {
            this.statusEl.textContent = text;
        }
    },

    playerBid() {

        if (this.phase !== "bidding") return;

        if (this.bidTurn !== 0) {
            this.updateStatus("Şu anda sıra sende değil.");
            return;
        }

        let bid;

        if (this.highestBid < 8) {
            bid = 8;
        } else {
            bid = this.highestBid + 1;
        }

        this.highestBid = bid;
        this.highestBidder = 0;

        this.updateStatus(
            `Sen ${bid} dedin. Botlar teklif veriyor...`
        );

        this.bidTurn = 1;

        this.render();

        setTimeout(() => this.botBid(1), 700);
    },

    playerPass() {

        if (this.phase !== "bidding") return;

        if (this.bidTurn !== 0) return;

        this.updateStatus("Sen pas geçtin. Botlar teklif veriyor...");

        this.bidTurn = 1;

        this.render();

        setTimeout(() => this.botBid(1), 650);
    },

    botBid(playerIndex) {

        if (this.phase !== "bidding") return;

        if (playerIndex >= 4) {

            this.finishBidding();
            return;
        }

        let bidAmount = 0;

        /*
            Botlar rastgele ama mevcut ihaleye göre teklif verir.
        */

        const hand = this.players[playerIndex].hand;

        const strongCards = hand.filter(c => c.value >= 11).length;

        const wantsBid = strongCards >= 4
            ? Math.random() > 0.20
            : Math.random() > 0.65;

        if (wantsBid) {

            bidAmount = Math.max(
                8,
                this.highestBid + 1
            );

            /*
                Çok yükselmesini engelle.
            */

            if (bidAmount > 13) {
                bidAmount = 0;
            }
        }

        if (bidAmount > 0) {

            this.highestBid = bidAmount;
            this.highestBidder = playerIndex;

            this.updateStatus(
                `${this.players[playerIndex].name} ${bidAmount} dedi.`
            );

        } else {

            this.updateStatus(
                `${this.players[playerIndex].name} pas geçti.`
            );
        }

        this.bidTurn = playerIndex + 1;

        this.render();

        setTimeout(() => this.botBid(playerIndex + 1), 650);
    },

    finishBidding() {

        /*
            Hiç kimse teklif vermediyse kullanıcı otomatik 8 alır.
        */

        if (this.highestBidder === -1) {
            this.highestBid = 8;
            this.highestBidder = 0;
        }

        this.currentPlayer = this.highestBidder;

        if (this.highestBidder === 0) {

            this.phase = "trump";

            this.showTrumpChoices();

            this.updateStatus(
                `İhaleyi ${this.highestBid} ile sen aldın. Kozunu seç.`
            );

            this.render();

        } else {

            /*
                Bot ihale aldıysa bot koz seçer.
            */

            this.phase = "trump";

            const suit = this.chooseBotTrump();

            this.trump = suit;

            this.hideTrumpChoices();

            this.updateStatus(
                `${this.players[this.highestBidder].name} ihaleyi aldı. Koz: ${suit}`
            );

            this.render();

            setTimeout(() => this.startTricks(), 1100);
        }
    },

    chooseBotTrump() {

        const hand = this.players[this.highestBidder].hand;

        const counts = {
            "♠": 0,
            "♥": 0,
            "♦": 0,
            "♣": 0
        };

        hand.forEach(c => counts[c.suit]++);

        return Object.keys(counts)
            .sort((a,b) => counts[b] - counts[a])[0];
    },

    showTrumpChoices() {

        if (!this.trumpChoicesEl) return;

        this.trumpChoicesEl.classList.remove("hidden");
        this.trumpChoicesEl.style.display = "flex";
    },

    hideTrumpChoices() {

        if (!this.trumpChoicesEl) return;

        this.trumpChoicesEl.classList.add("hidden");
        this.trumpChoicesEl.style.display = "none";
    },

    chooseTrump(suit) {

        if (this.phase !== "trump") return;
        if (this.highestBidder !== 0) return;

        this.trump = suit;

        this.hideTrumpChoices();

        this.updateStatus(
            `Koz ${suit} seçildi. Oyun başlıyor...`
        );

        this.render();

        setTimeout(() => this.startTricks(), 900);
    },

    startTricks() {

        this.phase = "playing";

        this.trick = [];
        this.trickNumber = 0;

        /*
            İhaleyi alan oyuncu ilk kartı atar.
        */

        this.currentPlayer = this.highestBidder;

        this.updateStatus(
            `Koz: ${this.trump}. ${this.players[this.currentPlayer].name} ilk kartı oynuyor.`
        );

        this.render();

        if (this.currentPlayer !== 0) {
            setTimeout(() => this.botPlay(), 850);
        }
    },

    getLegalCards(playerIndex) {

        const hand = this.players[playerIndex].hand;

        if (this.trick.length === 0) {
            return [...hand];
        }

        const leadSuit = this.trick[0].card.suit;

        const sameSuit = hand.filter(
            card => card.suit === leadSuit
        );

        if (sameSuit.length > 0) {
            return sameSuit;
        }

        /*
            Renk yoksa herhangi kart atılabilir.
        */

        return [...hand];
    },

    cardCanBePlayed(playerIndex, card) {

        const legal = this.getLegalCards(playerIndex);

        return legal.some(
            c =>
                c.suit === card.suit &&
                c.rank === card.rank
        );
    },

    playerPlayCard(cardIndex) {

        if (this.phase !== "playing") return;

        if (this.currentPlayer !== 0) {
            this.updateStatus("Şu anda sıra sende değil.");
            return;
        }

        const card = this.players[0].hand[cardIndex];

        if (!card) return;

        if (!this.cardCanBePlayed(0, card)) {

            const leadSuit = this.trick.length
                ? this.trick[0].card.suit
                : "";

            this.updateStatus(
                `Yere ${leadSuit} geldi. Elinde o renkten varsa onu atmalısın.`
            );

            return;
        }

        this.playCard(0, cardIndex);
    },

    playCard(playerIndex, cardIndex) {

        const player = this.players[playerIndex];

        const card = player.hand[cardIndex];

        if (!card) return;

        if (!this.cardCanBePlayed(playerIndex, card)) {
            return;
        }

        player.hand.splice(cardIndex, 1);

        this.trick.push({
            player: playerIndex,
            card
        });

        this.render();

        if (this.trick.length < 4) {

            this.currentPlayer =
                (this.currentPlayer + 1) % 4;

            this.updateStatus(
                `${this.players[this.currentPlayer].name} oynuyor.`
            );

            if (this.currentPlayer !== 0) {
                setTimeout(() => this.botPlay(), 650);
            }

        } else {

            this.resolveTrick();
        }
    },

    botPlay() {

        if (this.phase !== "playing") return;

        if (this.currentPlayer === 0) return;

        const legal = this.getLegalCards(this.currentPlayer);

        if (!legal.length) return;

        /*
            Bot mümkün olduğunca küçük kartı oynar.
        */

        let card = [...legal]
            .sort((a,b) => a.value - b.value)[0];

        /*
            Eğer koz oynayarak eli alabilecekse bazen koz kullan.
        */

        if (this.trick.length > 0) {

            const winningTrump = legal
                .filter(c => c.suit === this.trump)
                .sort((a,b) => a.value - b.value)[0];

            if (winningTrump && Math.random() > 0.45) {
                card = winningTrump;
            }
        }

        const index = this.players[this.currentPlayer]
            .hand
            .findIndex(c =>
                c.suit === card.suit &&
                c.rank === card.rank
            );

        this.playCard(this.currentPlayer, index);
    },

    resolveTrick() {

        const winner = this.getTrickWinner();

        this.updateStatus(
            `${this.players[winner].name} eli aldı.`
        );

        this.scores[winner]++;

        this.renderPlayedWinner(winner);

        this.trickNumber++;

        setTimeout(() => {

            this.trick = [];

            if (this.trickNumber >= 13) {
                this.finishRound();
                return;
            }

            this.currentPlayer = winner;

            this.updateStatus(
                `${this.players[winner].name} yeni eli başlatıyor.`
            );

            this.render();

            if (this.currentPlayer !== 0) {
                setTimeout(() => this.botPlay(), 650);
            }

        }, 1200);
    },

    getTrickWinner() {

        const leadSuit = this.trick[0].card.suit;

        let winner = this.trick[0];

        for (let i = 1; i < this.trick.length; i++) {

            const current = this.trick[i].card;
            const best = winner.card;

            /*
                Koz her zaman koz olmayan rengi yener.
            */

            if (
                current.suit === this.trump &&
                best.suit !== this.trump
            ) {
                winner = this.trick[i];
                continue;
            }

            if (
                current.suit !== this.trump &&
                best.suit === this.trump
            ) {
                continue;
            }

            /*
                Aynı koz.
            */

            if (
                current.suit === this.trump &&
                best.suit === this.trump
            ) {
                if (current.value > best.value) {
                    winner = this.trick[i];
                }

                continue;
            }

            /*
                Koz değilse sadece yere gelen renkte
                daha büyük kart kazanır.
            */

            if (
                current.suit === leadSuit &&
                best.suit === leadSuit &&
                current.value > best.value
            ) {
                winner = this.trick[i];
            }
        }

        return winner.player;
    },

    renderPlayedWinner(winner) {

        if (!this.playedEl) return;

        const winnerName = this.players[winner].name;

        this.playedEl.innerHTML = `
            <div class="trick-result">
                🏆 ${winnerName} eli aldı
            </div>
        `;
    },

    finishRound() {

        this.phase = "finished";

        const bidder = this.highestBidder;

        const bidderScore = this.scores[bidder];

        let success = bidderScore >= this.highestBid;

        if (success) {

            this.scores[bidder] += this.highestBid;

            this.updateStatus(
                `🏆 Tur bitti! ${this.players[bidder].name} ihalesini yaptı.`
            );

        } else {

            this.scores[bidder] -= this.highestBid;

            this.updateStatus(
                `❌ Tur bitti! ${this.players[bidder].name} ihaleyi yapamadı.`
            );
        }

        this.render();

        setTimeout(() => {

            const again = confirm(
                "Tur tamamlandı. Yeni Batak eli başlatılsın mı?"
            );

            if (again) {
                this.newGame();
            }

        }, 700);
    },

    render() {

        this.renderHand();
        this.renderTrump();
        this.renderPlayed();
        this.renderControls();
    },

    renderHand() {

        if (!this.playerHandEl) return;

        this.playerHandEl.innerHTML = "";

        const hand = this.players[0]
            ? this.players[0].hand
            : [];

        hand.forEach((card, index) => {

            const btn = document.createElement("button");

            btn.type = "button";

            btn.className = "playing-card";

            if (this.isRed(card)) {
                btn.classList.add("red");
            }

            /*
                Oynanamayan kartları hafif soldur.
            */

            if (
                this.phase === "playing" &&
                this.currentPlayer === 0 &&
                !this.cardCanBePlayed(0, card)
            ) {
                btn.classList.add("disabled-card");
            }

            btn.innerHTML = `
                <span class="card-corner">
                    ${card.rank}
                    <br>
                    ${card.suit}
                </span>

                <span class="card-center">
                    ${card.suit}
                </span>

                <span class="card-corner bottom">
                    ${card.rank}
                    <br>
                    ${card.suit}
                </span>
            `;

            btn.addEventListener("click", () => {
                this.playerPlayCard(index);
            });

            this.playerHandEl.appendChild(btn);
        });
    },

    renderTrump() {

        if (!this.trumpEl) return;

        this.trumpEl.innerHTML = `
            <span>Koz:</span>
            <strong class="${this.trump === "♥" || this.trump === "♦" ? "red" : ""}">
                ${this.trump || "-"}
            </strong>
        `;
    },

    renderPlayed() {

        if (!this.playedEl) return;

        if (this.trick.length === 0) {

            if (
                this.phase === "playing" &&
                this.trickNumber === 0
            ) {
                this.playedEl.innerHTML = `
                    <div class="empty-trick">
                        İlk kartı bekliyor...
                    </div>
                `;
            }

            return;
        }

        this.playedEl.innerHTML = "";

        this.trick.forEach(item => {

            const wrapper = document.createElement("div");

            wrapper.className = "played-card";

            const red = this.isRed(item.card)
                ? "red"
                : "";

            wrapper.innerHTML = `
                <span class="played-player">
                    ${this.players[item.player].name}
                </span>

                <div class="mini-card ${red}">
                    ${item.card.rank}${item.card.suit}
                </div>
            `;

            this.playedEl.appendChild(wrapper);
        });
    },

    renderControls() {

        const bid = $("#bidButton");
        const pass = $("#passButton");

        if (!bid || !pass) return;

        const active =
            this.phase === "bidding" &&
            this.bidTurn === 0;

        bid.disabled = !active;
        pass.disabled = !active;
    }
};

/* ============================================================
   BAŞLAT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    bindNavigation();

    Tavla.init();
    Batak.init();

    /*
        Ana sayfa açılışta aktif.
    */

    showScreen("home");
});

/* Global erişim */
window.Tavla = Tavla;
window.Batak = Batak;

})();
