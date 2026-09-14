/* =========================================================
   TAVLA & BATAK
   app.js
   ========================================================= */

"use strict";

/* =========================================================
   GENEL YARDIMCILAR
========================================================= */

const $ = (selector, root = document) =>
    root.querySelector(selector);

const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/* =========================================================
   TAVLA
========================================================= */

const Tavla = (() => {

    const state = {
        board: Array(24).fill(0),

        bar: {
            player: 0,
            bot: 0
        },

        borneOff: {
            player: 0,
            bot: 0
        },

        dice: [],
        usedDice: [],

        turn: "player",

        selectedPoint: null,

        started: false,
        gameOver: false,
        botThinking: false,

        message: "Zar atarak oyuna başla."
    };


    /* =====================================================
       BAŞLANGIÇ
    ===================================================== */

    function init() {
        resetGame();

        const rollButton = $("#rollDice");

        if (rollButton) {
            rollButton.addEventListener("click", rollDice);
        }

        const newButton = $("#newTavla");

        if (newButton) {
            newButton.addEventListener("click", resetGame);
        }
    }


    function resetGame() {

        state.board.fill(0);

        /*
         * Gerçek tavla başlangıç dizilimi.
         *
         * Oyuncu:
         * 2 adet 1. hanede
         * 5 adet 12. hanede
         * 3 adet 17. hanede
         * 5 adet 19. hanede
         *
         * Bot bunun karşı tarafıdır.
         */

        state.board[0] = 2;
        state.board[11] = 5;
        state.board[16] = 3;
        state.board[18] = 5;

        state.board[23] = -2;
        state.board[12] = -5;
        state.board[7] = -3;
        state.board[5] = -5;

        state.bar.player = 0;
        state.bar.bot = 0;

        state.borneOff.player = 0;
        state.borneOff.bot = 0;

        state.dice = [];
        state.usedDice = [];

        state.turn = "player";
        state.selectedPoint = null;

        state.started = false;
        state.gameOver = false;
        state.botThinking = false;

        state.message = "Zar atarak oyuna başla.";

        render();
    }


    /* =====================================================
       ZAR
    ===================================================== */

    function rollDice() {

        if (state.gameOver) return;

        if (state.turn !== "player") {
            state.message = "Şu anda rakibin sırası.";
            render();
            return;
        }

        if (state.dice.length > 0) {
            state.message = "Önce mevcut zarlarını kullan.";
            render();
            return;
        }

        const d1 = randomInt(1, 6);
        const d2 = randomInt(1, 6);

        state.dice = d1 === d2
            ? [d1, d1, d1, d1]
            : [d1, d2];

        state.usedDice = [];
        state.started = true;
        state.selectedPoint = null;

        state.message =
            d1 === d2
                ? `Çift attın: ${d1}-${d2}. Dört hamle hakkın var.`
                : `Zarların: ${d1}-${d2}. Pulunu seç.`;

        render();

        setTimeout(() => {
            if (!hasAnyPlayerMove()) {
                state.message =
                    "Bu zarlarla yapabileceğin hamle yok. Sıra rakibe geçiyor.";

                render();

                setTimeout(endPlayerTurn, 1200);
            }
        }, 250);
    }


    function getAvailableDice() {

        return state.dice
            .map((value, index) => ({
                value,
                index
            }))
            .filter(item =>
                !state.usedDice.includes(item.index)
            );
    }


    function useDie(index) {

        if (!state.usedDice.includes(index)) {
            state.usedDice.push(index);
        }
    }


    /* =====================================================
       SAHİPLİK / KAPI
    ===================================================== */

    function playerOwns(point) {
        return state.board[point] > 0;
    }


    function botOwns(point) {
        return state.board[point] < 0;
    }


    function playerTargetOpen(point) {

        if (point < 0 || point > 23) {
            return false;
        }

        /*
         * Rakibin iki veya daha fazla pulu varsa kapalıdır.
         */
        return state.board[point] >= -1;
    }


    function botTargetOpen(point) {

        if (point < 0 || point > 23) {
            return false;
        }

        return state.board[point] <= 1;
    }


    /* =====================================================
       BAR
    ===================================================== */

    function playerHasBar() {
        return state.bar.player > 0;
    }


    function botHasBar() {
        return state.bar.bot > 0;
    }


    function playerBarTarget(die) {
        /*
         * Oyuncu 24 yönünde ilerler.
         */
        return 24 - die;
    }


    function botBarTarget(die) {
        /*
         * Bot ters yönde ilerler.
         */
        return die - 1;
    }


    function canEnterPlayerFromBar(die) {

        const target = playerBarTarget(die);

        return playerTargetOpen(target);
    }


    function enterPlayerFromBar(dieIndex) {

        const dice = getAvailableDice();

        const dieObject =
            dice.find(d => d.index === dieIndex);

        if (!dieObject) return false;

        const die = dieObject.value;
        const target = playerBarTarget(die);

        if (!canEnterPlayerFromBar(die)) {
            return false;
        }

        if (state.board[target] === -1) {

            state.board[target] = 1;
            state.bar.bot++;

        } else {

            state.board[target]++;
        }

        state.bar.player--;

        useDie(dieIndex);

        return true;
    }


    /* =====================================================
       TOPLAMA KONTROLÜ
    ===================================================== */

    function playerCanBearOff() {

        if (state.bar.player > 0) {
            return false;
        }

        /*
         * Oyuncunun bütün pulları 19-24 bölgesinde olmalı.
         */
        for (let i = 0; i < 18; i++) {
            if (state.board[i] > 0) {
                return false;
            }
        }

        return true;
    }


    function botCanBearOff() {

        if (state.bar.bot > 0) {
            return false;
        }

        /*
         * Botun toplama bölgesi 1-6.
         */
        for (let i = 6; i < 24; i++) {
            if (state.board[i] < 0) {
                return false;
            }
        }

        return true;
    }


    function playerCanBearFrom(point, die) {

        if (!playerCanBearOff()) {
            return false;
        }

        /*
         * Normal tam eşleşme.
         */
        if (point + die === 24) {
            return true;
        }

        /*
         * Zar fazla geldiyse, daha geride pul yoksa
         * toplama yapılabilir.
         */
        if (point + die > 24) {

            for (let i = point + 1; i < 24; i++) {

                if (state.board[i] > 0) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }


    function botCanBearFrom(point, die) {

        if (!botCanBearOff()) {
            return false;
        }

        if (point - die === -1) {
            return true;
        }

        if (point - die < 0) {

            for (let i = point - 1; i >= 0; i--) {

                if (state.board[i] < 0) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }


    /* =====================================================
       OYUNCU HAMLE KONTROLÜ
    ===================================================== */

    function playerMoveDestination(point, die) {
        return point + die;
    }


    function canPlayerMove(point, die) {

        if (!playerOwns(point)) {
            return false;
        }

        const target =
            playerMoveDestination(point, die);

        /*
         * Toplama.
         */
        if (target >= 24) {
            return playerCanBearFrom(point, die);
        }

        return playerTargetOpen(target);
    }


    function movePlayer(point, dieIndex) {

        const dice =
            getAvailableDice();

        const dieObject =
            dice.find(d => d.index === dieIndex);

        if (!dieObject) {
            return false;
        }

        const die = dieObject.value;

        if (!canPlayerMove(point, die)) {
            return false;
        }

        const target =
            point + die;

        /*
         * TOPLAMA
         */
        if (target >= 24) {

            state.board[point]--;
            state.borneOff.player++;

            useDie(dieIndex);

            state.selectedPoint = null;

            state.message =
                "Pulunu topladın.";

            checkWinner();

            return true;
        }


        /*
         * NORMAL HAREKET
         */
        state.board[point]--;


        /*
         * Rakibin tek pulunu kır.
         */
        if (state.board[target] === -1) {

            state.board[target] = 1;
            state.bar.bot++;

            state.message =
                "Rakibin pulunu kırdın!";

        } else {

            state.board[target]++;

            state.message =
                "Pulun hareket etti.";
        }

        useDie(dieIndex);

        state.selectedPoint = null;

        checkWinner();

        return true;
    }


    /* =====================================================
       OYUNCU TIKLAMASI
    ===================================================== */

    function handlePointClick(point) {

        if (state.gameOver) return;

        if (state.turn !== "player") return;

        if (state.dice.length === 0) {

            state.message =
                "Önce zar at.";

            render();
            return;
        }


        /*
         * Bardaki pul önceliklidir.
         */
        if (playerHasBar()) {

            state.message =
                "Önce bardaki pulunu oyuna sokmalısın.";

            render();
            return;
        }


        /*
         * Pul seçilmemiş.
         */
        if (state.selectedPoint === null) {

            if (!playerOwns(point)) {

                state.message =
                    "Kendi pulunu seçmelisin.";

                render();
                return;
            }

            const canMove =
                getAvailableDice()
                    .some(d =>
                        canPlayerMove(point, d.value)
                    );

            if (!canMove) {

                state.message =
                    "Bu pul mevcut zarlarla hareket edemez.";

                render();
                return;
            }

            state.selectedPoint = point;

            state.message =
                `${point + 1}. hane seçildi. Şimdi hedefe bas.`;

            render();

            return;
        }


        /*
         * Aynı pula tekrar basılırsa seçimi kaldır.
         */
        if (state.selectedPoint === point) {

            state.selectedPoint = null;

            state.message =
                "Pul seçimi kaldırıldı.";

            render();
            return;
        }


        const from =
            state.selectedPoint;


        /*
         * Hedef noktaya uygun zar bul.
         */
        const possibleDice =
            getAvailableDice()
                .filter(d =>
                    canPlayerMove(from, d.value)
                );


        /*
         * Doğrudan hedef haneye basıldıysa
         * mesafeye göre uygun zarı kullan.
         */
        for (const die of possibleDice) {

            if (from + die.value === point) {

                movePlayer(from, die.index);

                state.selectedPoint = null;

                render();

                finishPlayerTurnIfNeeded();

                return;
            }
        }


        /*
         * Toplama için hedef 24 olarak düşünülür.
         */
        if (point === 23) {

            for (const die of possibleDice) {

                if (
                    from + die.value >= 24 &&
                    playerCanBearFrom(
                        from,
                        die.value
                    )
                ) {

                    movePlayer(from, die.index);

                    state.selectedPoint = null;

                    render();

                    finishPlayerTurnIfNeeded();

                    return;
                }
            }
        }


        /*
         * Başka kendi puluna basılırsa
         * yeni pul seç.
         */
        if (playerOwns(point)) {

            state.selectedPoint = point;

            state.message =
                `${point + 1}. hanedeki pul seçildi.`;

            render();
            return;
        }


        state.message =
            "Bu hedefe mevcut zarlarla gidemezsin.";

        render();
    }


    /* =====================================================
       HAMLE VAR MI?
    ===================================================== */

    function hasAnyPlayerMove() {

        const dice =
            getAvailableDice();

        if (dice.length === 0) {
            return false;
        }


        /*
         * Bar kontrolü.
         */
        if (playerHasBar()) {

            return dice.some(d =>
                canEnterPlayerFromBar(d.value)
            );
        }


        /*
         * Normal pullar.
         */
        for (let point = 0; point < 24; point++) {

            if (!playerOwns(point)) {
                continue;
            }

            for (const die of dice) {

                if (canPlayerMove(point, die.value)) {
                    return true;
                }
            }
        }

        return false;
    }


    /* =====================================================
       TUR BİTİRME
    ===================================================== */

    function finishPlayerTurnIfNeeded() {

        if (state.gameOver) {
            return;
        }

        if (state.usedDice.length >= state.dice.length) {

            setTimeout(endPlayerTurn, 450);

            return;
        }

        if (!hasAnyPlayerMove()) {

            state.message =
                "Başka hamle yok. Rakibin sırası.";

            render();

            setTimeout(endPlayerTurn, 900);
        }
    }


    function endPlayerTurn() {

        if (state.gameOver) return;

        state.dice = [];
        state.usedDice = [];
        state.selectedPoint = null;

        state.turn = "bot";
        state.botThinking = true;

        state.message =
            "Rakip zar atıyor...";

        render();

        setTimeout(botRoll, 900);
    }


    /* =====================================================
       BOT ZARI
    ===================================================== */

    function botRoll() {

        if (state.gameOver) return;

        const d1 = randomInt(1, 6);
        const d2 = randomInt(1, 6);

        state.dice =
            d1 === d2
                ? [d1, d1, d1, d1]
                : [d1, d2];

        state.usedDice = [];

        state.message =
            `Rakibin zarları: ${d1}-${d2}`;

        render();

        setTimeout(botPlayAvailableMoves, 700);
    }


    /* =====================================================
       BOT HAMLESİ
    ===================================================== */

    function botPlayAvailableMoves() {

        if (state.gameOver) return;

        const dice =
            getAvailableDice();

        if (dice.length === 0) {

            endBotTurn();
            return;
        }

        /*
         * Basit ama kurallı bot:
         * 1. Bardaki pulu sok.
         * 2. Rakibin tek pulunu kır.
         * 3. Güvenli noktaya git.
         * 4. Gerekirse toplar.
         */

        const die =
            chooseBotDie(dice);


        /*
         * Bardaki bot pulu.
         */
        if (botHasBar()) {

            const target =
                botBarTarget(die.value);

            if (botTargetOpen(target)) {

                if (state.board[target] === 1) {

                    state.board[target] = -1;
                    state.bar.player++;

                } else {

                    state.board[target]--;
                }

                state.bar.bot--;

                useDie(die.index);

                state.message =
                    "Rakip bardaki pulunu oyuna soktu.";

                render();

                setTimeout(
                    botPlayAvailableMoves,
                    550
                );

                return;
            }


            useDie(die.index);

            setTimeout(
                botPlayAvailableMoves,
                350
            );

            return;
        }


        /*
         * Önce kırabileceği hamle.
         */
        const hitMove =
            findBotHitMove(die.value);

        if (hitMove) {

            executeBotMove(
                hitMove.from,
                hitMove.to,
                die.index
            );

            setTimeout(
                botPlayAvailableMoves,
                550
            );

            return;
        }


        /*
         * Toplayabiliyorsa toplama.
         */
        const bearMove =
            findBotBearMove(die.value);

        if (bearMove) {

            state.board[bearMove.from]++;

            state.borneOff.bot++;

            useDie(die.index);

            state.message =
                "Rakip bir pulunu topladı.";

            checkWinner();

            render();

            setTimeout(
                botPlayAvailableMoves,
                550
            );

            return;
        }


        /*
         * Normal güvenli hamle.
         */
        const normalMove =
            findBotNormalMove(die.value);

        if (normalMove) {

            executeBotMove(
                normalMove.from,
                normalMove.to,
                die.index
            );

            setTimeout(
                botPlayAvailableMoves,
                550
            );

            return;
        }


        /*
         * Hamle yok.
         */
        useDie(die.index);

        setTimeout(
            botPlayAvailableMoves,
            350
        );
    }


    function chooseBotDie(dice) {

        /*
         * Büyük zarı öncelikli kullan.
         */
        return [...dice]
            .sort((a, b) => b.value - a.value)[0];
    }


    function findBotHitMove(die) {

        for (let from = 23; from >= 0; from--) {

            if (!botOwns(from)) {
                continue;
            }

            const to =
                from - die;

            if (to < 0) {
                continue;
            }

            if (state.board[to] === 1) {

                return {
                    from,
                    to
                };
            }
        }

        return null;
    }


    function findBotBearMove(die) {

        if (!botCanBearOff()) {
            return null;
        }

        for (let from = 0; from < 6; from++) {

            if (!botOwns(from)) {
                continue;
            }

            if (botCanBearFrom(from, die)) {

                return {
                    from
                };
            }
        }

        return null;
    }


    function findBotNormalMove(die) {

        let best = null;

        for (let from = 23; from >= 0; from--) {

            if (!botOwns(from)) {
                continue;
            }

            const to =
                from - die;

            if (to < 0) {
                continue;
            }

            if (!botTargetOpen(to)) {
                continue;
            }


            /*
             * Güvenli nokta önceliği.
             */
            const targetCount =
                Math.abs(state.board[to]);

            let score = 0;

            if (targetCount === 0) score += 5;
            if (targetCount === 1) score += 8;
            if (state.board[to] < 0) score += 10;

            score += to / 10;

            if (!best || score > best.score) {

                best = {
                    from,
                    to,
                    score
                };
            }
        }

        return best;
    }


    function executeBotMove(from, to, dieIndex) {

        state.board[from]++;


        if (state.board[to] === 1) {

            state.board[to] = -1;
            state.bar.player++;

            state.message =
                "Rakip senin pulunu kırdı.";

        } else {

            state.board[to]--;

            state.message =
                "Rakip pulunu hareket ettirdi.";
        }

        useDie(dieIndex);

        checkWinner();

        render();
    }


    function endBotTurn() {

        if (state.gameOver) return;

        state.dice = [];
        state.usedDice = [];

        state.turn = "player";
        state.botThinking = false;

        state.message =
            "Senin sıran. Zar at.";

        render();
    }


    /* =====================================================
       KAZANAN
    ===================================================== */

    function checkWinner() {

        if (state.borneOff.player >= 15) {

            state.gameOver = true;

            state.message =
                "🎉 Tebrikler! Tavlayı kazandın!";

            render();

            return true;
        }

        if (state.borneOff.bot >= 15) {

            state.gameOver = true;

            state.message =
                "Rakip tavlayı kazandı.";

            render();

            return true;
        }

        return false;
    }


    /* =====================================================
       GÖRSEL ZAR
    ===================================================== */

    function diceSymbol(value) {

        const symbols = [
            "",
            "⚀",
            "⚁",
            "⚂",
            "⚃",
            "⚄",
            "⚅"
        ];

        return symbols[value] || "⚄";
    }


    function renderDice() {

        const box =
            $("#diceBox");

        if (!box) return;

        box.innerHTML = "";


        if (state.dice.length === 0) {

            const a =
                document.createElement("span");

            const b =
                document.createElement("span");

            a.textContent = "⚄";
            b.textContent = "⚂";

            box.appendChild(a);
            box.appendChild(b);

            return;
        }


        state.dice.forEach((value, index) => {

            const die =
                document.createElement("span");

            die.textContent =
                diceSymbol(value);

            if (state.usedDice.includes(index)) {

                die.style.opacity = "0.28";
                die.style.transform = "scale(.88)";
            }

            box.appendChild(die);
        });
    }


    /* =====================================================
       TAHTA ÇİZ
    ===================================================== */

    function renderBoard() {

        const board =
            $("#backgammonBoard");

        if (!board) return;

        board.innerHTML = "";


        for (let i = 0; i < 24; i++) {

            const point =
                document.createElement("div");

            point.className =
                "tavla-point " +
                (i < 12 ? "top" : "bottom");

            point.dataset.point = String(i);


            if (state.selectedPoint === i) {
                point.classList.add("selected");
            }


            const triangle =
                document.createElement("div");

            triangle.className =
                "tavla-triangle";


            const checkers =
                document.createElement("div");

            checkers.className =
                "tavla-checkers";


            const count =
                Math.abs(state.board[i]);

            const owner =
                state.board[i] > 0
                    ? "player"
                    : "bot";


            /*
             * Görselde 5'ten fazlasını da göstermek yerine
             * pul sayısını doğru tutuyoruz.
             */
            for (let c = 0; c < count; c++) {

                const checker =
                    document.createElement("div");

                checker.className =
                    `tavla-checker ${owner}`;

                checkers.appendChild(checker);
            }


            point.appendChild(triangle);
            point.appendChild(checkers);


            point.addEventListener(
                "click",
                () => handlePointClick(i)
            );


            board.appendChild(point);
        }
    }


    /* =====================================================
       BİLGİLERİ GÜNCELLE
    ===================================================== */

    function renderInfo() {

        const turnLabel =
            $("#turnLabel");

        if (turnLabel) {

            if (state.gameOver) {

                turnLabel.textContent =
                    "Oyun Bitti";

            } else if (state.botThinking) {

                turnLabel.textContent =
                    "Rakip düşünüyor...";

            } else if (state.turn === "player") {

                turnLabel.textContent =
                    "Senin sıran";

            } else {

                turnLabel.textContent =
                    "Rakibin sırası";
            }
        }


        const message =
            $("#gameMessage");

        if (message) {
            message.textContent =
                state.message;
        }


        const barBot =
            $("#barBot");

        if (barBot) {
            barBot.textContent =
                state.bar.bot;
        }


        const barYou =
            $("#barYou");

        if (barYou) {
            barYou.textContent =
                state.bar.player;
        }


        const offYou =
            $("#offYou");

        if (offYou) {
            offYou.textContent =
                state.borneOff.player;
        }
    }


    /* =====================================================
       GENEL RENDER
    ===================================================== */

    function render() {

        renderBoard();
        renderDice();
        renderInfo();
    }


    /* =====================================================
       DIŞARIDAN ERİŞİM
    ===================================================== */

    return {
        init,
        resetGame,
        refresh: render,
        rollDice,
        getState: () => state
    };

})();


/* =========================================================
   BATAK
========================================================= */

const Batak = (() => {

    const state = {
        deck: [],
        players: [
            {
                name: "Sen",
                hand: [],
                score: 0,
                bid: 0
            },
            {
                name: "Oyuncu 2",
                hand: [],
                score: 0,
                bid: 0
            },
            {
                name: "Oyuncu 3",
                hand: [],
                score: 0,
                bid: 0
            },
            {
                name: "Oyuncu 4",
                hand: [],
                score: 0,
                bid: 0
            }
        ],

        trump: null,
        currentPlayer: 0,
        bidding: true,
        highestBid: 0,
        highestBidder: null,

        trick: [],
        trickNumber: 0,

        message: "İhaleye gir veya pas de."
    };


    /* =====================================================
       DESTE
    ===================================================== */

    const suits = [
        {
            key: "S",
            name: "Maça",
            symbol: "♠",
            red: false
        },
        {
            key: "H",
            name: "Kupa",
            symbol: "♥",
            red: true
        },
        {
            key: "D",
            name: "Karo",
            symbol: "♦",
            red: true
        },
        {
            key: "C",
            name: "Sinek",
            symbol: "♣",
            red: false
        }
    ];


    function createDeck() {

        const deck = [];

        for (const suit of suits) {

            for (let rank = 2; rank <= 14; rank++) {

                deck.push({
                    suit: suit.key,
                    suitName: suit.name,
                    symbol: suit.symbol,
                    rank,
                    red: suit.red
                });
            }
        }

        return deck;
    }


    function shuffle(deck) {

        for (let i = deck.length - 1; i > 0; i--) {

            const j =
                Math.floor(Math.random() * (i + 1));

            [deck[i], deck[j]] =
                [deck[j], deck[i]];
        }

        return deck;
    }


    function cardText(card) {

        const names = {
            11: "J",
            12: "Q",
            13: "K",
            14: "A"
        };

        return `${names[card.rank] || card.rank}${card.symbol}`;
    }


    /* =====================================================
       YENİ BATAK
    ===================================================== */

    function resetGame() {

        state.deck =
            shuffle(createDeck());

        state.players.forEach(player => {

            player.hand = [];
            player.score = 0;
            player.bid = 0;
        });

        for (let i = 0; i < 13; i++) {

            for (const player of state.players) {

                player.hand.push(
                    state.deck.pop()
                );
            }
        }


        state.trump = null;
        state.currentPlayer = 0;
        state.bidding = true;

        state.highestBid = 0;
        state.highestBidder = null;

        state.trick = [];
        state.trickNumber = 0;

        state.message =
            "İhaleye gir veya pas de.";

        render();
    }


    /* =====================================================
       İHALE
    ===================================================== */

    function playerBid() {

        if (!state.bidding) return;

        const bid =
            randomInt(3, 5);

        state.players[0].bid = bid;

        state.highestBid = bid;
        state.highestBidder = 0;

        state.message =
            `Sen ${bid} dedin. Rakipler düşünüyor...`;

        render();

        setTimeout(botBids, 900);
    }


    function playerPass() {

        if (!state.bidding) return;

        state.players[0].bid = 0;

        state.message =
            "Sen pas dedin. Rakipler ihaleye devam ediyor.";

        render();

        setTimeout(botBids, 800);
    }


    function botBids() {

        if (!state.bidding) return;

        /*
         * Basit ihale sistemi.
         */
        for (let i = 1; i < 4; i++) {

            const bid =
                randomInt(0, 5);

            state.players[i].bid = bid;

            if (bid > state.highestBid) {

                state.highestBid = bid;
                state.highestBidder = i;
            }
        }


        if (state.highestBidder === null) {

            state.highestBidder = 0;
            state.highestBid = 3;
        }


        const trumpIndex =
            randomInt(0, 3);

        state.trump =
            suits[trumpIndex];


        state.bidding = false;

        state.currentPlayer =
            state.highestBidder;

        state.message =
            `${state.players[state.highestBidder].name} ihaleyi ${state.highestBid} aldı. Koz: ${state.trump.symbol} ${state.trump.name}`;

        render();

        if (state.currentPlayer !== 0) {

            setTimeout(playBotTrick, 900);
        }
    }


    /* =====================================================
       GEÇERLİ KARTLAR
    ===================================================== */

    function getLegalCards(playerIndex) {

        const hand =
            state.players[playerIndex].hand;

        if (state.trick.length === 0) {
            return hand;
        }

        const leadSuit =
            state.trick[0].card.suit;

        const sameSuit =
            hand.filter(card =>
                card.suit === leadSuit
            );

        if (sameSuit.length > 0) {
            return sameSuit;
        }

        return hand;
    }


    /* =====================================================
       KART OYNAMA
    ===================================================== */

    function playPlayerCard(index) {

        if (state.bidding) {

            state.message =
                "Önce ihaleyi tamamla.";

            render();
            return;
        }

        if (state.currentPlayer !== 0) {
            return;
        }

        const legal =
            getLegalCards(0);

        const card =
            state.players[0].hand[index];

        if (!card) return;

        if (!legal.includes(card)) {

            state.message =
                "Bu kartı oynayamazsın.";

            render();
            return;
        }

        state.players[0].hand.splice(index, 1);

        state.trick.push({
            player: 0,
            card
        });

        state.message =
            "Kartını oynadın.";

        render();

        if (state.trick.length < 4) {

            state.currentPlayer = 1;

            setTimeout(playBotTrick, 650);
        } else {

            finishTrick();
        }
    }


    function playBotTrick() {

        if (state.trick.length >= 4) {
            finishTrick();
            return;
        }

        const playerIndex =
            state.currentPlayer;

        if (playerIndex === 0) {
            return;
        }

        const legal =
            getLegalCards(playerIndex);

        if (!legal.length) return;

        /*
         * Basit bot:
         * mümkünse düşük kart oynar.
         */
        const sorted =
            [...legal].sort(
                (a, b) => a.rank - b.rank
            );

        const card =
            sorted[0];

        const hand =
            state.players[playerIndex].hand;

        const index =
            hand.indexOf(card);

        if (index >= 0) {
            hand.splice(index, 1);
        }

        state.trick.push({
            player: playerIndex,
            card
        });

        state.message =
            `${state.players[playerIndex].name} kart oynadı.`;

        render();

        if (state.trick.length === 4) {

            setTimeout(
                finishTrick,
                800
            );

        } else {

            state.currentPlayer =
                (playerIndex + 1) % 4;

            if (state.currentPlayer === 0) {

                state.message =
                    "Sıra sende. Kartını seç.";

                render();

            } else {

                setTimeout(
                    playBotTrick,
                    650
                );
            }
        }
    }


    /* =====================================================
       EL KAZANANI
    ===================================================== */

    function cardPower(card, leadSuit) {

        let power = card.rank;

        if (
            state.trump &&
            card.suit === state.trump.key
        ) {
            power += 100;
        }

        if (card.suit === leadSuit) {
            power += 50;
        }

        return power;
    }


    function getTrickWinner() {

        if (!state.trick.length) {
            return null;
        }

        const leadSuit =
            state.trick[0].card.suit;

        let winner =
            state.trick[0];

        for (let i = 1; i < state.trick.length; i++) {

            const current =
                state.trick[i];

            if (
                cardPower(
                    current.card,
                    leadSuit
                ) >
                cardPower(
                    winner.card,
                    leadSuit
                )
            ) {
                winner = current;
            }
        }

        return winner.player;
    }


    function finishTrick() {

        const winner =
            getTrickWinner();

        if (winner === null) {
            return;
        }

        state.players[winner].score++;

        state.trickNumber++;

        state.message =
            `${state.players[winner].name} eli aldı.`;

        state.trick = [];

        state.currentPlayer = winner;

        render();

        /*
         * 13 el tamamlandı.
         */
        if (state.trickNumber >= 13) {

            finishRound();

            return;
        }


        if (state.currentPlayer === 0) {

            state.message =
                "Sıra sende.";

            render();

        } else {

            setTimeout(
                playBotTrick,
                900
            );
        }
    }


    function finishRound() {

        state.message =
            "🎉 Batak eli tamamlandı.";

        render();
    }


    /* =====================================================
       BATAK RENDER
    ===================================================== */

    function renderHand() {

        const handElement =
            $("#playerHand");

        if (!handElement) return;

        handElement.innerHTML = "";


        state.players[0].hand.forEach(
            (card, index) => {

                const element =
                    document.createElement("button");

                element.className =
                    "playing-card";

                element.type = "button";

                element.textContent =
                    cardText(card);

                if (card.red) {
                    element.style.color =
                        "#b32d36";
                }

                element.addEventListener(
                    "click",
                    () => playPlayerCard(index)
                );

                handElement.appendChild(element);
            }
        );
    }


    function renderTrick() {

        const cards =
            $$(".card-placeholder");

        cards.forEach((element, index) => {

            element.textContent =
                "🂠";

            if (
                state.trick[index] &&
                state.trick[index].card
            ) {

                const card =
                    state.trick[index].card;

                element.textContent =
                    cardText(card);

                element.style.color =
                    card.red
                        ? "#b32d36"
                        : "#222";
            }
        });
    }


    function renderStatus() {

        const status =
            $(".batak-status");

        if (!status) return;

        const span =
            status.querySelector("span");

        const strong =
            status.querySelector("strong");

        if (span) {
            span.textContent =
                state.bidding
                    ? "İhale"
                    : "Durum";
        }

        if (strong) {
            strong.textContent =
                state.message;
        }


        const trump =
            $(".trump");

        if (trump) {

            trump.textContent =
                state.trump
                    ? `Koz: ${state.trump.symbol} ${state.trump.name}`
                    : "Koz: Henüz belirlenmedi";
        }
    }


    function render() {

        renderHand();
        renderTrick();
        renderStatus();
    }


    /* =====================================================
       BATAK INIT
    ===================================================== */

    function init() {

        const newButton =
            $("#newBatak");

        if (newButton) {

            newButton.addEventListener(
                "click",
                resetGame
            );
        }


        const bidButton =
            $(".batak-controls button:nth-child(1)");

        const passButton =
            $(".batak-controls button:nth-child(2)");


        if (bidButton) {

            bidButton.addEventListener(
                "click",
                playerBid
            );
        }


        if (passButton) {

            passButton.addEventListener(
                "click",
                playerPass
            );
        }


        resetGame();
    }


    return {
        init,
        resetGame
    };

})();


/* =========================================================
   SAYFA AÇILINCA
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Tavla.init();
        Batak.init();

    }
);


/* =========================================================
   GLOBAL ERİŞİM
========================================================= */

window.Tavla = Tavla;
window.Batak = Batak;
