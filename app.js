"use strict";

/* ============================================================
   TAVLA & BATAK
   GERÇEK OYNANABİLİR TEMEL OYUN MOTORU
   ============================================================ */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ============================================================
   TAVLA
   ============================================================ */

const Tavla = (() => {

    const state = {
        board: Array(24).fill(0),
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
        botThinking: false
    };

    function reset() {

        state.board = Array(24).fill(0);

        /*
            Pozitif = oyuncu
            Negatif = bot
        */

        // SEN
        state.board[0]  = 2;
        state.board[11] = 5;
        state.board[16] = 3;
        state.board[18] = 5;

        // BOT
        state.board[23] = -2;
        state.board[12] = -5;
        state.board[7]  = -3;
        state.board[5]  = -5;

        state.barYou = 0;
        state.barBot = 0;

        state.offYou = 0;
        state.offBot = 0;

        state.dice = [];
        state.usedDice = [];

        state.turn = "you";
        state.selected = null;
        state.started = false;
        state.gameOver = false;
        state.botThinking = false;

        render();

        message("Oyuna başlamak için zar at.");
    }

    function message(text) {
        const el = $("#gameMessage");
        if (el) el.textContent = text;
    }

    function rollDice() {

        if (state.gameOver) return;

        if (state.turn !== "you") {
            message("Şu anda sıra rakipte.");
            return;
        }

        if (state.dice.length > 0) {
            message("Önce mevcut zarlarını kullan.");
            return;
        }

        const a = Math.floor(Math.random() * 6) + 1;
        const b = Math.floor(Math.random() * 6) + 1;

        state.dice = a === b
            ? [a, a, a, a]
            : [a, b];

        state.usedDice = [];
        state.started = true;

        message(
            `Zarlar: ${state.dice.join(" - ")}. Pulunu seç.`
        );

        render();

        if (!hasAnyMove("you")) {
            setTimeout(() => endYouTurn(), 700);
        }
    }

    function getDiceSymbols() {

        const symbols = {
            1: "⚀",
            2: "⚁",
            3: "⚂",
            4: "⚃",
            5: "⚄",
            6: "⚅"
        };

        return state.dice
            .map((d, i) => {
                const used = state.usedDice[i];
                return `<span class="${used ? "used-die" : ""}">
                            ${symbols[d]}
                        </span>`;
            })
            .join("");
    }

    function renderDice() {

        const box = $("#diceBox");
        if (!box) return;

        if (!state.dice.length) {
            box.innerHTML = `
                <span class="die">⚄</span>
                <span class="die">⚂</span>
            `;
            return;
        }

        box.innerHTML = getDiceSymbols();
    }

    function canMoveToYou(target) {

        if (target < 0 || target > 23) return false;

        return state.board[target] >= -1;
    }

    function distanceForYou(from, to) {
        return to - from;
    }

    function canBearOffYou(from, die) {

        if (from < 18) return false;

        const target = from + die;

        if (target === 24) return true;

        if (target > 24) {

            for (let i = 18; i < from; i++) {
                if (state.board[i] > 0) return false;
            }

            return true;
        }

        return false;
    }

    function useDie(index) {

        if (state.usedDice[index]) return false;

        state.usedDice[index] = true;
        return true;
    }

    function availableDice() {

        const result = [];

        for (let i = 0; i < state.dice.length; i++) {

            if (!state.usedDice[i]) {
                result.push({
                    index: i,
                    value: state.dice[i]
                });
            }
        }

        return result;
    }

    function findDie(from, to) {

        const distance = to - from;

        for (const d of availableDice()) {

            if (distance === d.value) {
                return d;
            }
        }

        return null;
    }

    function hitOpponent(target) {

        if (state.board[target] === -1) {

            state.board[target] = 0;
            state.barBot++;

            message("Rakibin pulunu kırdın!");
        }
    }

    function moveYou(from, to, dieIndex) {

        if (state.board[from] <= 0) return false;

        if (!canMoveToYou(to)) return false;

        const die = state.dice[dieIndex];

        if (to - from !== die) return false;

        hitOpponent(to);

        state.board[from]--;
        state.board[to]++;

        useDie(dieIndex);

        state.selected = null;

        if (state.offYou >= 15) {
            winYou();
            return true;
        }

        if (availableDice().length === 0) {
            endYouTurn();
        } else {
            message("Başka bir zar kullanabilir veya turu tamamlayabilirsin.");
        }

        render();

        return true;
    }

    function bearOffYou(from, dieIndex) {

        const die = state.dice[dieIndex];

        if (!canBearOffYou(from, die)) return false;

        state.board[from]--;
        state.offYou++;

        useDie(dieIndex);

        state.selected = null;

        message("Pulunu topladın!");

        if (state.offYou >= 15) {
            winYou();
            return true;
        }

        if (availableDice().length === 0) {
            endYouTurn();
        }

        render();

        return true;
    }

    function pointClick(point) {

        if (state.gameOver) return;

        if (state.turn !== "you") {
            message("Rakibin sırasını bekle.");
            return;
        }

        if (!state.started) {
            message("Önce Zar At butonuna bas.");
            return;
        }

        /* BARDA PUL VARSA */

        if (state.barYou > 0) {

            const dice = availableDice();

            for (const d of dice) {

                const target = d.value - 1;

                if (point === target && canMoveToYou(target)) {

                    if (state.board[target] === -1) {
                        state.barBot++;
                        state.board[target] = 0;
                    }

                    state.barYou--;
                    state.board[target]++;

                    useDie(d.index);

                    message("Bardaki pul oyuna girdi.");

                    if (state.barYou === 0) {
                        message("Artık normal pullarını oynayabilirsin.");
                    }

                    if (availableDice().length === 0) {
                        endYouTurn();
                    }

                    render();
                    return;
                }
            }

            message("Bardaki pulunu önce oyuna sokmalısın.");
            return;
        }

        /* PUL SEÇ */

        if (state.selected === null) {

            if (state.board[point] > 0) {

                state.selected = point;

                message(
                    `${point + 1}. hanedeki pul seçildi. Hedef noktaya tıkla.`
                );

                render();
            } else {
                message("Burada senin pulun yok.");
            }

            return;
        }

        /* AYNI PULA TEKRAR TIKLAMA */

        if (state.selected === point) {

            state.selected = null;
            message("Pul seçimi iptal edildi.");
            render();
            return;
        }

        /* NORMAL HAREKET */

        const die = findDie(state.selected, point);

        if (die) {

            moveYou(
                state.selected,
                point,
                die.index
            );

            return;
        }

        /* TOPLAMA */

        for (const d of availableDice()) {

            if (canBearOffYou(state.selected, d.value)) {

                if (point === 23) {
                    bearOffYou(
                        state.selected,
                        d.index
                    );
                    return;
                }
            }
        }

        message("Bu noktaya bu zarla gidemezsin.");
    }

    function hasAnyMove(player) {

        const dice = availableDice();

        if (!dice.length) return false;

        if (player === "you") {

            if (state.barYou > 0) {

                return dice.some(d => {
                    const target = d.value - 1;
                    return canMoveToYou(target);
                });
            }

            for (let from = 0; from < 24; from++) {

                if (state.board[from] <= 0) continue;

                for (const d of dice) {

                    const to = from + d.value;

                    if (to <= 23 && canMoveToYou(to)) {
                        return true;
                    }

                    if (to >= 24 && canBearOffYou(from, d.value)) {
                        return true;
                    }
                }
            }
        }

        return true;
    }

    function endYouTurn() {

        if (state.gameOver) return;

        state.dice = [];
        state.usedDice = [];
        state.selected = null;

        state.turn = "bot";

        message("Sıra rakipte...");

        render();

        setTimeout(botTurn, 900);
    }

    function botCanMove(from, to) {

        if (to < 0 || to > 23) return false;

        return state.board[to] <= 1;
    }

    function botMove(from, to, dieIndex) {

        if (state.board[from] >= 0) return false;

        if (!botCanMove(from, to)) return false;

        if (state.board[to] === 1) {

            state.board[to] = 0;
            state.barYou++;
        }

        state.board[from]++;
        state.board[to]--;

        state.usedDice[dieIndex] = true;

        return true;
    }

    function botTurn() {

        if (state.gameOver) return;

        state.botThinking = true;

        const a = Math.floor(Math.random() * 6) + 1;
        const b = Math.floor(Math.random() * 6) + 1;

        state.dice = a === b
            ? [a, a, a, a]
            : [a, b];

        state.usedDice = [];

        message(
            `Rakip zar attı: ${state.dice.join(" - ")}`
        );

        render();

        setTimeout(() => {

            for (let d = 0; d < state.dice.length; d++) {

                if (state.usedDice[d]) continue;

                const die = state.dice[d];

                let moved = false;

                /* ÖNCE BAR */

                if (state.barBot > 0) {

                    const target = 24 - die;

                    if (botCanMove(target, target)) {

                        if (state.board[target] === 1) {
                            state.board[target] = 0;
                            state.barYou++;
                        }

                        state.barBot--;
                        state.board[target]--;

                        state.usedDice[d] = true;
                        moved = true;
                    }
                }

                /* NORMAL PUL */

                if (!moved) {

                    for (let from = 23; from >= 0; from--) {

                        if (state.board[from] >= 0) continue;

                        const to = from - die;

                        if (to < 0) {

                            if (from <= 5) {

                                state.board[from]++;
                                state.offBot++;
                                state.usedDice[d] = true;
                                moved = true;
                                break;
                            }

                            continue;
                        }

                        if (botCanMove(from, to)) {

                            botMove(from, to, d);
                            moved = true;
                            break;
                        }
                    }
                }
            }

            state.dice = [];
            state.usedDice = [];
            state.turn = "you";
            state.botThinking = false;

            if (state.offBot >= 15) {

                loseYou();
                return;
            }

            message("Sıra sende. Zar at.");

            render();

        }, 900);
    }

    function winYou() {

        state.gameOver = true;
        state.turn = "you";

        message("🎉 Tebrikler! Tavlayı kazandın.");

        render();
    }

    function loseYou() {

        state.gameOver = true;
        state.turn = "bot";

        message("Rakip tavlayı kazandı.");

        render();
    }

    function renderBoard() {

        const board = $("#backgammonBoard");

        if (!board) return;

        board.innerHTML = "";

        for (let i = 0; i < 24; i++) {

            const point = document.createElement("div");

            point.className =
                "tavla-point " +
                (i < 12 ? "top" : "bottom");

            point.dataset.point = i;

            if (state.selected === i) {
                point.classList.add("selected");
            }

            const triangle = document.createElement("div");

            triangle.className = "tavla-triangle";

            const checkers = document.createElement("div");

            checkers.className = "tavla-checkers";

            const count = Math.abs(state.board[i]);

            for (let c = 0; c < count; c++) {

                const checker = document.createElement("span");

                checker.className =
                    "tavla-checker " +
                    (state.board[i] > 0 ? "player" : "bot");

                checker.textContent = "";

                checkers.appendChild(checker);
            }

            point.appendChild(triangle);
            point.appendChild(checkers);

            point.addEventListener(
                "click",
                () => pointClick(i)
            );

            board.appendChild(point);
        }
    }

    function renderInfo() {

        const turn = $("#turnLabel");

        if (turn) {

            turn.textContent =
                state.turn === "you"
                    ? "Sen"
                    : "Rakip";
        }

        const barBot = $("#barBot");
        const barYou = $("#barYou");
        const offYou = $("#offYou");

        if (barBot) barBot.textContent = state.barBot;
        if (barYou) barYou.textContent = state.barYou;
        if (offYou) offYou.textContent = state.offYou;
    }

    function render() {

        renderBoard();
        renderDice();
        renderInfo();
    }

    function init() {

        const roll = $("#rollDice");

        if (roll) {
            roll.addEventListener(
                "click",
                rollDice
            );
        }

        const newGame = $("#newTavla");

        if (newGame) {
            newGame.addEventListener(
                "click",
                reset
            );
        }

        reset();
    }

    return {
        init,
        refresh: render,
        newGame: reset
    };

})();

/* ============================================================
   BATAK
   ============================================================ */

const Batak = (() => {

    const suits = ["♠", "♥", "♦", "♣"];

    const suitNames = {
        "♠": "Maça",
        "♥": "Kupa",
        "♦": "Karo",
        "♣": "Sinek"
    };

    const ranks = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
        "A"
    ];

    const state = {
        players: [
            [],
            [],
            [],
            []
        ],

        names: [
            "Sen",
            "Rakip 1",
            "Rakip 2",
            "Rakip 3"
        ],

        bid: [
            null,
            null,
            null,
            null
        ],

        currentBidPlayer: 0,

        trump: null,

        phase: "deal",

        turn: 0,

        leadSuit: null,

        table: [],

        scores: [
            0,
            0,
            0,
            0
        ],

        trickWins: [
            0,
            0,
            0,
            0
        ]
    };

    function createDeck() {

        const deck = [];

        for (const suit of suits) {

            for (const rank of ranks) {

                deck.push({
                    suit,
                    rank
                });
            }
        }

        return deck;
    }

    function shuffle(deck) {

        for (let i = deck.length - 1; i > 0; i--) {

            const j = Math.floor(
                Math.random() * (i + 1)
            );

            [deck[i], deck[j]] =
                [deck[j], deck[i]];
        }

        return deck;
    }

    function rankValue(rank) {

        return ranks.indexOf(rank) + 2;
    }

    function cardText(card) {

        return `${card.rank}${card.suit}`;
    }

    function reset() {

        const deck = shuffle(createDeck());

        state.players = [
            [],
            [],
            [],
            []
        ];

        for (let i = 0; i < 52; i++) {

            state.players[i % 4].push(
                deck[i]
            );
        }

        state.players.forEach(hand => {

            hand.sort((a, b) => {

                if (a.suit !== b.suit) {
                    return suits.indexOf(a.suit) -
                           suits.indexOf(b.suit);
                }

                return rankValue(a.rank) -
                       rankValue(b.rank);
            });
        });

        state.bid = [
            null,
            null,
            null,
            null
        ];

        state.currentBidPlayer = 0;

        state.trump = null;

        state.phase = "bid";

        state.turn = 0;

        state.leadSuit = null;

        state.table = [];

        state.trickWins = [
            0,
            0,
            0,
            0
        ];

        render();

        setTimeout(startBotsBid, 500);
    }

    function playerBid() {

        if (state.phase !== "bid") return;

        if (state.currentBidPlayer !== 0) {

            return;
        }

        if (state.bid[0] !== null) {

            message("Zaten ihale verdin.");
            return;
        }

        state.bid[0] = 8;

        message("Sen 8 verdin.");

        nextBid();
    }

    function playerPass() {

        if (state.phase !== "bid") return;

        if (state.currentBidPlayer !== 0) return;

        state.bid[0] = 0;

        message("Sen pas geçtin.");

        nextBid();
    }

    function startBotsBid() {

        if (state.phase !== "bid") return;

        while (state.currentBidPlayer !== 0) {

            const player =
                state.currentBidPlayer;

            const bid =
                Math.random() < 0.55
                    ? 0
                    : 5 + Math.floor(Math.random() * 6);

            state.bid[player] = bid;

            state.currentBidPlayer =
                (state.currentBidPlayer + 1) % 4;
        }

        message("Sıra sende. İhaleye gir veya pas geç.");

        render();
    }

    function nextBid() {

        state.currentBidPlayer =
            (state.currentBidPlayer + 1) % 4;

        if (state.bid.every(v => v !== null)) {

            finishBidding();
            return;
        }

        if (state.currentBidPlayer === 0) {

            message("Sıra sende. İhaleye gir veya pas geç.");

            render();
        }
    }

    function finishBidding() {

        let winner = 0;
        let highest = -1;

        for (let i = 0; i < 4; i++) {

            if (state.bid[i] !== null &&
                state.bid[i] > highest) {

                highest = state.bid[i];
                winner = i;
            }
        }

        if (highest <= 0) {

            highest = 8;
            winner = 0;
            state.bid[0] = 8;
        }

        state.phase = "trump";

        /*
           Gerçek oyunda koz seçimi ihaleyi alan
           oyuncuya bırakılabilir.
           Burada oyuncu almadıysa bot otomatik seçer.
        */

        if (winner === 0) {

            state.trump =
                suits[Math.floor(Math.random() * 4)];

            message(
                `İhaleyi sen aldın. Koz: ${suitNames[state.trump]}`
            );

            state.turn = 0;
            state.phase = "play";

            state.leadSuit = null;
            state.table = [];

            render();

        } else {

            state.trump =
                suits[Math.floor(Math.random() * 4)];

            message(
                `${state.names[winner]} ihaleyi aldı. Koz: ${suitNames[state.trump]}`
            );

            state.turn = winner;
            state.phase = "play";

            state.leadSuit = null;
            state.table = [];

            render();

            if (winner !== 0) {
                setTimeout(botPlay, 800);
            }
        }
    }

    function cardCanPlay(player, card) {

        if (state.table.length === 0) {
            return true;
        }

        const lead = state.leadSuit;

        const hasLead =
            state.players[player].some(
                c => c.suit === lead
            );

        if (hasLead) {
            return card.suit === lead;
        }

        return true;
    }

    function playPlayerCard(index) {

        if (state.phase !== "play") return;

        if (state.turn !== 0) {
            message("Şu anda sıra rakipte.");
            return;
        }

        const card =
            state.players[0][index];

        if (!card) return;

        if (!cardCanPlay(0, card)) {

            message(
                `Elinde ${suitNames[state.leadSuit]} varsa o türden oynamalısın.`
            );

            return;
        }

        playCard(0, index);
    }

    function playCard(player, index) {

        const card =
            state.players[player][index];

        if (!card) return;

        if (!cardCanPlay(player, card)) {
            return;
        }

        state.players[player].splice(
            index,
            1
        );

        if (state.table.length === 0) {
            state.leadSuit = card.suit;
        }

        state.table.push({
            player,
            card
        });

        render();

        if (state.table.length < 4) {

            state.turn =
                (player + 1) % 4;

            if (state.turn !== 0) {

                setTimeout(
                    botPlay,
                    650
                );
            } else {

                message("Sıra sende. Kartını seç.");
            }

        } else {

            setTimeout(
                finishTrick,
                900
            );
        }
    }

    function botPlay() {

        if (state.phase !== "play") return;

        const player = state.turn;

        if (player === 0) return;

        const hand =
            state.players[player];

        if (!hand.length) return;

        let possible =
            hand.filter(
                card => cardCanPlay(player, card)
            );

        if (!possible.length) {
            possible = hand;
        }

        /*
           Basit bot:
           İlk uygun kartı oynar.
        */

        const card = possible[0];

        const index =
            hand.indexOf(card);

        playCard(player, index);
    }

    function trickCardBeats(a, b) {

        /*
           a mevcut kazanan
           b yeni kart
        */

        const ca = a.card;
        const cb = b.card;

        if (cb.suit === state.trump &&
            ca.suit !== state.trump) {
            return true;
        }

        if (cb.suit !== state.trump &&
            ca.suit === state.trump) {
            return false;
        }

        if (cb.suit !== ca.suit) {
            return false;
        }

        return rankValue(cb.rank) >
               rankValue(ca.rank);
    }

    function finishTrick() {

        if (state.table.length !== 4) return;

        let winner =
            state.table[0];

        for (let i = 1; i < state.table.length; i++) {

            if (trickCardBeats(
                winner,
                state.table[i]
            )) {

                winner =
                    state.table[i];
            }
        }

        const winnerPlayer =
            winner.player;

        state.trickWins[winnerPlayer]++;

        message(
            `${state.names[winnerPlayer]} eli aldı.`
        );

        state.table = [];
        state.leadSuit = null;

        state.turn = winnerPlayer;

        if (
            state.players.every(
                hand => hand.length === 0
            )
        ) {

            finishRound();
            return;
        }

        render();

        if (state.turn !== 0) {

            setTimeout(
                botPlay,
                800
            );
        } else {

            message("Sıra sende.");
        }
    }

    function finishRound() {

        state.phase = "finished";

        for (let i = 0; i < 4; i++) {

            state.scores[i] +=
                state.trickWins[i];
        }

        const result = state.trickWins[0];

        message(
            `Oyun bitti. Sen ${result} el aldın.`
        );

        render();
    }

    function renderHand() {

        const hand =
            $("#playerHand");

        if (!hand) return;

        hand.innerHTML = "";

        state.players[0].forEach(
            (card, index) => {

                const button =
                    document.createElement("button");

                button.className =
                    "playing-card";

                if (
                    card.suit === "♥" ||
                    card.suit === "♦"
                ) {
                    button.classList.add("red");
                }

                button.textContent =
                    cardText(card);

                button.title =
                    `${card.rank} ${suitNames[card.suit]}`;

                button.addEventListener(
                    "click",
                    () => playPlayerCard(index)
                );

                hand.appendChild(button);
            }
        );
    }

    function renderTable() {

        const table =
            $(".played-cards");

        if (!table) return;

        table.innerHTML = "";

        state.table.forEach(item => {

            const card =
                document.createElement("div");

            card.className =
                "card-placeholder played";

            card.innerHTML = `
                <strong>
                    ${cardText(item.card)}
                </strong>
                <small>
                    ${state.names[item.player]}
                </small>
            `;

            table.appendChild(card);
        });
    }

    function renderStatus() {

        const status =
            $(".batak-status");

        if (!status) return;

        let text = "";

        if (state.phase === "bid") {

            text =
                state.currentBidPlayer === 0
                    ? "Sıra sende: İhaleye Gir veya Pas"
                    : "İhale devam ediyor...";
        }

        if (state.phase === "play") {

            if (state.turn === 0) {
                text = "Sıra sende — kartını seç.";
            } else {
                text =
                    `${state.names[state.turn]} oynuyor...`;
            }
        }

        if (state.phase === "finished") {
            text = "Tur tamamlandı.";
        }

        status.textContent = text;

        const trump =
            $(".trump");

        if (trump) {

            trump.innerHTML =
                state.trump
                    ? `Koz: <strong>${state.trump}</strong>`
                    : "Koz: -";
        }
    }

    function render() {

        renderHand();
        renderTable();
        renderStatus();

        const players =
            $$(".batak-player");

        players.forEach(
            (el, i) => {

                el.classList.toggle(
                    "active-player",
                    state.turn === i &&
                    state.phase === "play"
                );
            }
        );
    }

    function init() {

        const newGame =
            $("#newBatak");

        if (newGame) {

            newGame.addEventListener(
                "click",
                reset
            );
        }

        const buttons =
            $$(".batak-controls button");

        if (buttons[0]) {
            buttons[0].addEventListener(
                "click",
                playerBid
            );
        }

        if (buttons[1]) {
            buttons[1].addEventListener(
                "click",
                playerPass
            );
        }

        reset();
    }

    return {
        init,
        newGame: reset
    };

})();

/* ============================================================
   BAŞLAT
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Tavla.init();
        Batak.init();

    }
);

window.Tavla = Tavla;
window.Batak = Batak;
