/* =========================================================
   TAVLA & BATAK
   TAVLA MOTORU - 1. PARÇA
   ========================================================= */

"use strict";

const Tavla = (() => {

    const state = {
        board: [],
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

        gameStarted: false,
        gameOver: false,

        message: "Zar atmak için butona basın.",

        playerName: "Sen",
        botName: "Rakip",

        score: {
            player: 0,
            bot: 0
        },

        matchTarget: 5
    };

    /* =====================================================
       YARDIMCI
       ===================================================== */

    const $ = (id) => document.getElementById(id);

    function setMessage(text) {
        state.message = text;

        const el = $("gameMessage");

        if (el) {
            el.textContent = text;
        }
    }

    function randomDie() {
        return Math.floor(Math.random() * 6) + 1;
    }

    /* =====================================================
       YENİ OYUN
       ===================================================== */

    function resetBoard() {

        state.board = new Array(24).fill(0);

        /*
            POZİTİF = OYUNCU
            NEGATİF = RAKİP
        */

        // Oyuncunun 15 pulu
        state.board[0] = 2;
        state.board[11] = 5;
        state.board[16] = 3;
        state.board[18] = 5;

        // Rakibin 15 pulu
        state.board[23] = -2;
        state.board[12] = -5;
        state.board[7] = -3;
        state.board[5] = -5;

        state.bar.player = 0;
        state.bar.bot = 0;

        state.borneOff.player = 0;
        state.borneOff.bot = 0;
    }

    function resetGame() {

        resetBoard();

        state.dice = [];
        state.usedDice = [];

        state.turn = "player";
        state.selectedPoint = null;

        state.gameStarted = true;
        state.gameOver = false;

        setMessage("Oyun başladı. Zar at.");

        render();
    }

    /* =====================================================
       ZAR
       ===================================================== */

    function rollDice() {

        if (!state.gameStarted) {
            resetGame();
            return;
        }

        if (state.gameOver) {
            return;
        }

        if (state.turn !== "player") {
            setMessage("Şu anda rakibin sırası.");
            return;
        }

        if (state.dice.length > 0) {
            setMessage("Önce mevcut zarlarını kullan.");
            return;
        }

        const first = randomDie();
        const second = randomDie();

        if (first === second) {

            state.dice = [
                first,
                first,
                first,
                first
            ];

        } else {

            state.dice = [
                first,
                second
            ];
        }

        state.usedDice = [];

        setMessage(
            `Zarlar: ${first} - ${second}. Bir pul seç.`
        );

        render();

        checkAvailableMoves();
    }

    /* =====================================================
       ZAR KULLANIMI
       ===================================================== */

    function availableDice() {

        return state.dice
            .map((value, index) => {

                if (state.usedDice.includes(index)) {
                    return null;
                }

                return {
                    value,
                    index
                };

            })
            .filter(Boolean);
    }

    function useDie(index) {

        if (!state.usedDice.includes(index)) {
            state.usedDice.push(index);
        }
    }

    /* =====================================================
       PUl SAHİPLİĞİ
       ===================================================== */

    function isPlayerPoint(point) {

        return state.board[point] > 0;
    }

    function isBotPoint(point) {

        return state.board[point] < 0;
    }

    function playerCount(point) {

        return Math.max(0, state.board[point]);
    }

    function botCount(point) {

        return Math.max(0, -state.board[point]);
    }

    /* =====================================================
       HAMLE KONTROLÜ
       ===================================================== */

    function canPlayerMoveTo(point) {

        if (point < 0 || point > 23) {
            return false;
        }

        /*
           Rakibin 2 veya daha fazla pulu varsa
           o haneye girilemez.
        */

        if (state.board[point] <= -2) {
            return false;
        }

        return true;
    }

    function playerMoveDistance(from, to) {

        return to - from;
    }

    function getPossibleDestinations(from) {

        const results = [];

        if (state.bar.player > 0) {

            for (const die of availableDice()) {

                const destination = die.value - 1;

                if (canPlayerMoveTo(destination)) {

                    results.push({
                        from: "bar",
                        to: destination,
                        dieIndex: die.index,
                        dieValue: die.value
                    });
                }
            }

            return results;
        }

        for (const die of availableDice()) {

            const destination =
                from + die.value;

            if (destination > 23) {
                continue;
            }

            if (!canPlayerMoveTo(destination)) {
                continue;
            }

            results.push({
                from,
                to: destination,
                dieIndex: die.index,
                dieValue: die.value
            });
        }

        return results;
    }

    /* =====================================================
       PUL SEÇME
       ===================================================== */

    function selectPoint(point) {

        if (state.turn !== "player") {
            return;
        }

        if (state.gameOver) {
            return;
        }

        /*
           BARDA PUL VARSA ÖNCE BARDAKİ PUL
           OYUNA GİRMELİ.
        */

        if (state.bar.player > 0) {

            setMessage(
                "Önce bardaki pulunu oyuna sokmalısın."
            );

            return;
        }

        if (!isPlayerPoint(point)) {

            setMessage(
                "Bu hanede senin pulun yok."
            );

            return;
        }

        state.selectedPoint = point;

        const moves = getPossibleDestinations(point);

        if (moves.length === 0) {

            setMessage(
                "Bu pul ile geçerli bir hamle yok."
            );

            state.selectedPoint = null;

        } else {

            setMessage(
                `${point + 1}. haneyi seçtin. Gideceğin haneye bas.`
            );
        }

        render();
    }

    /* =====================================================
       HEDEF SEÇME
       ===================================================== */

    function moveTo(point) {

        if (state.selectedPoint === null) {
            return;
        }

        const from = state.selectedPoint;

        const distance =
            playerMoveDistance(from, point);

        const die = availableDice().find(
            item => item.value === distance
        );

        if (!die) {

            setMessage(
                "Bu hamle için uygun zar yok."
            );

            return;
        }

        if (!canPlayerMoveTo(point)) {

            setMessage(
                "Bu haneye oynayamazsın."
            );

            return;
        }

        executePlayerMove(
            from,
            point,
            die.index
        );
    }

    /* =====================================================
       OYUNCU HAMLESİ
       ===================================================== */

    function executePlayerMove(
        from,
        to,
        dieIndex
    ) {

        if (state.board[from] <= 0) {
            return;
        }

        /*
           PULU KALDIR
        */

        state.board[from]--;

        /*
           RAKİBİN TEK PULU VARSA KIR
        */

        if (state.board[to] === -1) {

            state.board[to] = 0;

            state.bar.bot++;

            setMessage(
                "Rakibin pulunu kırdın!"
            );
        }

        /*
           HEDEF HANEYE KOY
        */

        state.board[to]++;

        useDie(dieIndex);

        state.selectedPoint = null;

        /*
           TÜM ZARLAR KULLANILDIYSA
           TUR BİTER
        */

        if (
            availableDice().length === 0
        ) {

            endPlayerTurn();

        } else {

            setMessage(
                "Hamle tamam. Diğer zarını kullan."
            );

            render();
        }
    }

    /* =====================================================
       BARDAKİ PULU OYUNA SOK
       ===================================================== */

    function enterFromBar(dieIndex) {

        if (state.bar.player <= 0) {
            return;
        }

        const die =
            state.dice[dieIndex];

        const destination =
            die - 1;

        if (!canPlayerMoveTo(destination)) {

            setMessage(
                "Bu zar ile bardan giriş yapılamıyor."
            );

            return;
        }

        /*
           RAKİBİN TEK PULU VARSA KIR
        */

        if (state.board[destination] === -1) {

            state.board[destination] = 0;

            state.bar.bot++;

            setMessage(
                "Bardan girdin ve rakibin pulunu kırdın!"
            );
        }

        state.board[destination]++;

        state.bar.player--;

        useDie(dieIndex);

        if (
            availableDice().length === 0
        ) {

            endPlayerTurn();

        } else {

            render();
        }
    }

    /* =====================================================
       BAR KONTROLÜ
       ===================================================== */

    function handleBarEntry() {

        if (state.bar.player <= 0) {
            return false;
        }

        const dice = availableDice();

        if (dice.length === 0) {
            return false;
        }

        let possible = false;

        for (const die of dice) {

            const destination =
                die.value - 1;

            if (
                canPlayerMoveTo(destination)
            ) {

                possible = true;
            }
        }

        if (!possible) {

            setMessage(
                "Bardaki pulun için geçerli giriş yok."
            );

            return true;
        }

        setMessage(
            "Bardaki pulunu oyuna sokmak için üstteki uygun haneye bas."
        );

        return true;
    }

    /* =====================================================
       GEÇERLİ HAMLE KONTROLÜ
       ===================================================== */

    function checkAvailableMoves() {

        if (state.bar.player > 0) {

            handleBarEntry();

            render();

            return;
        }

        let possible = false;

        for (let point = 0; point < 24; point++) {

            if (!isPlayerPoint(point)) {
                continue;
            }

            const moves =
                getPossibleDestinations(point);

            if (moves.length > 0) {
                possible = true;
                break;
            }
        }

        if (!possible) {

            setMessage(
                "Bu zarlarla geçerli hamle yok. Tur geçiliyor."
            );

            setTimeout(
                endPlayerTurn,
                800
            );

        } else {

            render();
        }
    }

    /* =====================================================
       OYUNCU TURU BİTİR
       ===================================================== */

    function endPlayerTurn() {

        state.dice = [];
        state.usedDice = [];
        state.selectedPoint = null;

        state.turn = "bot";

        setMessage(
            "Rakibin sırası..."
        );

        render();

        setTimeout(
            botTurn,
            900
        );
    }

    /* =====================================================
       RAKİP
       ===================================================== */

    function botTurn() {

        if (state.gameOver) {
            return;
        }

        const first = randomDie();
        const second = randomDie();

        if (first === second) {

            state.dice = [
                first,
                first,
                first,
                first
            ];

        } else {

            state.dice = [
                first,
                second
            ];
        }

        state.usedDice = [];

        setMessage(
            `Rakip zar attı: ${first} - ${second}`
        );

        render();

        setTimeout(
            playBotMoves,
            800
        );
    }

    /* =====================================================
       RAKİP HAMLELERİ
       ===================================================== */

    function playBotMoves() {

        let safety = 10;

        while (
            availableDice().length > 0 &&
            safety > 0
        ) {

            safety--;

            const dice =
                availableDice();

            let moved = false;

            for (const die of dice) {

                /*
                   BARDA RAKİP PULU
                */

                if (state.bar.bot > 0) {

                    const destination =
                        24 - die.value;

                    if (
                        destination >= 0 &&
                        state.board[destination] <= 1
                    ) {

                        moveBotFromBar(
                            die.index,
                            destination
                        );

                        moved = true;
                        break;
                    }

                    continue;
                }

                /*
                   NORMAL HAMLE
                */

                for (
                    let from = 23;
                    from >= 0;
                    from--
                ) {

                    if (
                        state.board[from] >= 0
                    ) {
                        continue;
                    }

                    const to =
                        from - die.value;

                    if (to < 0) {
                        continue;
                    }

                    if (
                        state.board[to] > 1
                    ) {
                        continue;
                    }

                    executeBotMove(
                        from,
                        to,
                        die.index
                    );

                    moved = true;

                    break;
                }

                if (moved) {
                    break;
                }
            }

            if (!moved) {

                /*
                   OYUNDA HİÇ HAMLE YOK
                */

                state.usedDice =
                    state.dice.map(
                        (_, index) => index
                    );
            }
        }

        state.dice = [];
        state.usedDice = [];

        state.turn = "player";

        setMessage(
            "Rakibin turu bitti. Şimdi senin sıran."
        );

        render();

        checkWin();
    }

    /* =====================================================
       RAKİP BAR GİRİŞİ
       ===================================================== */

    function moveBotFromBar(
        dieIndex,
        destination
    ) {

        if (
            state.board[destination] === 1
        ) {

            state.board[destination] = 0;

            state.bar.player++;
        }

        state.board[destination]--;

        state.bar.bot--;

        useDie(dieIndex);
    }

    /* =====================================================
       RAKİP NORMAL HAMLESİ
       ===================================================== */

    function executeBotMove(
        from,
        to,
        dieIndex
    ) {

        if (state.board[from] >= 0) {
            return;
        }

        state.board[from]++;

        if (
            state.board[to] === 1
        ) {

            state.board[to] = 0;

            state.bar.player++;

        }

        state.board[to]--;

        useDie(dieIndex);
    }

    /* =====================================================
       KAZANMA KONTROLÜ
       ===================================================== */

    function checkWin() {

        if (
            state.borneOff.player >= 15
        ) {

            state.gameOver = true;

            state.score.player++;

            setMessage(
                "🎉 Tebrikler! Oyunu kazandın."
            );

            render();

            return true;
        }

        if (
            state.borneOff.bot >= 15
        ) {

            state.gameOver = true;

            state.score.bot++;

            setMessage(
                "Rakip oyunu kazandı."
            );

            render();

            return true;
        }

        return false;
    }

    /* =====================================================
       TAŞA TIKLAMA
       ===================================================== */

    function pointClicked(point) {

        if (state.turn !== "player") {
            return;
        }

        if (state.gameOver) {
            return;
        }

        /*
           BARDA PUL VARSA
        */

        if (state.bar.player > 0) {

            const dice =
                availableDice();

            for (const die of dice) {

                const destination =
                    die.value - 1;

                if (
                    destination === point
                ) {

                    enterFromBar(
                        die.index
                    );

                    return;
                }
            }

            setMessage(
                "Önce bardaki pulunu oyuna sok."
            );

            return;
        }

        /*
           SEÇİLİ PUL YOKSA
           PUL SEÇ
        */

        if (
            state.selectedPoint === null
        ) {

            selectPoint(point);

            return;
        }

        /*
           AYNI HANeye TEKRAR BASILDIYSA
        */

        if (
            state.selectedPoint === point
        ) {

            state.selectedPoint = null;

            setMessage(
                "Pul seçimi iptal edildi."
            );

            render();

            return;
        }

        /*
           HEDEF HANE
        */

        moveTo(point);
    }

    /* =====================================================
       HTML EVENTS
       ===================================================== */

    function bindEvents() {

        const rollButton =
            $("rollDice");

        const newButton =
            $("newTavla");

        if (rollButton) {

            rollButton.onclick = () => {
                rollDice();
            };
        }

        if (newButton) {

            newButton.onclick = () => {
                resetGame();
            };
        }
    }

    /* =====================================================
       TAVLA TAHTASI ÇİZ
       ===================================================== */

    function renderBoard() {

        const board =
            $("backgammonBoard");

        if (!board) {
            return;
        }

        board.innerHTML = "";

        /*
           24 HANE
        */

        for (
            let point = 0;
            point < 24;
            point++
        ) {

            const el =
                document.createElement("div");

            el.className =
                "tavla-point " +
                (point < 12
                    ? "top"
                    : "bottom");

            el.dataset.point = point;

            if (
                state.selectedPoint === point
            ) {

                el.classList.add(
                    "selected"
                );
            }

            const triangle =
                document.createElement("div");

            triangle.className =
                "tavla-triangle";

            const number =
                document.createElement("div");

            number.className =
                "tavla-point-number";

            number.textContent =
                point + 1;

            const checkers =
                document.createElement("div");

            checkers.className =
                "tavla-checkers";

            const count =
                Math.abs(
                    state.board[point]
                );

            const owner =
                state.board[point] > 0
                    ? "player"
                    : "bot";

            /*
               PULLAR
            */

            for (
                let i = 0;
                i < count;
                i++
            ) {

                const checker =
                    document.createElement("div");

                checker.className =
                    "tavla-checker " +
                    owner;

                checker.textContent =
                    count > 5
                        ? (i === 4
                            ? count
                            : "")
                        : "";

                checkers.appendChild(
                    checker
                );
            }

            el.appendChild(triangle);
            el.appendChild(number);
            el.appendChild(checkers);

            el.onclick = () => {
                pointClicked(point);
            };

            board.appendChild(el);
        }
    }

    /* =====================================================
       ZARLARI ÇİZ
       ===================================================== */

    function renderDice() {

        const box =
            $("diceBox");

        if (!box) {
            return;
        }

        box.innerHTML = "";

        if (
            state.dice.length === 0
        ) {

            const empty =
                document.createElement("div");

            empty.className =
                "die";

            empty.textContent =
                "—";

            box.appendChild(empty);

            return;
        }

        state.dice.forEach(
            (value, index) => {

                const die =
                    document.createElement("div");

                die.className = "die";

                if (
                    state.usedDice.includes(
                        index
                    )
                ) {

                    die.classList.add(
                        "used"
                    );
                }

                die.textContent =
                    value;

                box.appendChild(die);
            }
        );
    }

    /* =====================================================
       DURUMU ÇİZ
       ===================================================== */

    function renderStatus() {

        const turn =
            $("turnLabel");

        const diceText =
            $("diceText");

        const offYou =
            $("offYou");

        const offBot =
            $("offBot");

        const barYou =
            $("barYou");

        const barBot =
            $("barBot");

        if (turn) {

            turn.textContent =
                state.turn === "player"
                    ? "Senin sıran"
                    : "Rakibin sırası";
        }

        if (diceText) {

            diceText.textContent =
                state.dice.length
                    ? state.dice.join(" - ")
                    : "Zar bekleniyor";
        }

        if (offYou) {
            offYou.textContent =
                state.borneOff.player;
        }

        if (offBot) {
            offBot.textContent =
                state.borneOff.bot;
        }

        if (barYou) {
            barYou.textContent =
                state.bar.player;
        }

        if (barBot) {
            barBot.textContent =
                state.bar.bot;
        }

        const message =
            $("gameMessage");

        if (message) {
            message.textContent =
                state.message;
        }
    }

    /* =====================================================
       GENEL RENDER
       ===================================================== */

    function render() {

        renderBoard();
        renderDice();
        renderStatus();
    }

    /* =====================================================
       BAŞLAT
       ===================================================== */

    function init() {

        resetBoard();

        state.gameStarted = true;

        bindEvents();

        render();
    }

    /* =====================================================
       DIŞARI AÇ
       ===================================================== */

    return {
        init,
        resetGame,
        rollDice,
        render,
        getState: () => state
    };

})();

/* =========================================================
   TAVLA'YI BAŞLAT
   ========================================================= */

window.Tavla = Tavla;

document.addEventListener(
    "DOMContentLoaded",
    () => {
        Tavla.init();
    }
);
