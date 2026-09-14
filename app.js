/* ============================================================
   TAVLA-BATAK
   TAVLA OYUN MOTORU
   1. PARÇA
   ============================================================ */

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
        remainingDice: [],

        turn: "player",

        selectedPoint: null,

        gameStarted: false,
        gameOver: false,

        playerName: "Sen",
        botName: "Rakip",

        message: "Zar atmak için hazır.",

        legalMoves: [],

        matchTarget: 1,

        scores: {
            player: 0,
            bot: 0
        }
    };

    /* ========================================================
       BAŞLANGIÇ
       ======================================================== */

    function init() {

        resetState();
        bindEvents();
        render();

    }

    /* ========================================================
       OYUNU SIFIRLA
       ======================================================== */

    function resetState() {

        state.board = new Array(24).fill(0);

        /*
           Oyuncu başlangıç taşları
           1. nokta  = 2
           12. nokta = 5
           17. nokta = 3
           19. nokta = 5
        */

        state.board[0] = 2;
        state.board[11] = 5;
        state.board[16] = 3;
        state.board[18] = 5;

        /*
           Rakip taşları
        */

        state.board[23] = -2;
        state.board[12] = -5;
        state.board[7] = -3;
        state.board[5] = -5;

        state.bar.player = 0;
        state.bar.bot = 0;

        state.borneOff.player = 0;
        state.borneOff.bot = 0;

        state.dice = [];
        state.remainingDice = [];

        state.turn = "player";
        state.selectedPoint = null;

        state.gameStarted = false;
        state.gameOver = false;

        state.message = "Zar atmak için hazır.";
        state.legalMoves = [];
    }

    /* ========================================================
       YENİ OYUN
       ======================================================== */

    function newGame() {

        resetState();
        render();

        setMessage("Yeni oyun başladı. Zar atabilirsin.");

    }

    /* ========================================================
       ZAR AT
       ======================================================== */

    function rollDice() {

        if (state.gameOver) {
            return;
        }

        if (state.turn !== "player") {
            return;
        }

        if (state.remainingDice.length > 0) {
            setMessage("Önce mevcut zarlarını kullan.");
            return;
        }

        state.gameStarted = true;

        const d1 = randomDice();
        const d2 = randomDice();

        state.dice = [d1, d2];

        /*
           Çift zar gelirse dört hamle hakkı
        */

        if (d1 === d2) {

            state.remainingDice = [
                d1,
                d1,
                d1,
                d1
            ];

        } else {

            state.remainingDice = [
                d1,
                d2
            ];

        }

        state.selectedPoint = null;

        calculateLegalMoves();

        if (state.legalMoves.length === 0) {

            setMessage("Yapabileceğin hamle yok.");

            setTimeout(() => {

                endPlayerTurn();

            }, 900);

            return;
        }

        setMessage(
            `Zarlar: ${d1} - ${d2}. Bir pul seç.`
        );

        render();
    }

    /* ========================================================
       RASTGELE ZAR
       ======================================================== */

    function randomDice() {

        return Math.floor(Math.random() * 6) + 1;

    }

    /* ========================================================
       YASAL HAMLELER
       ======================================================== */

    function calculateLegalMoves() {

        state.legalMoves = [];

        if (state.turn !== "player") {
            return;
        }

        /*
           Önce bar üzerindeki taş kontrol edilir.
        */

        if (state.bar.player > 0) {

            for (const die of state.remainingDice) {

                const target = die - 1;

                if (canMoveTo(target, die)) {

                    state.legalMoves.push({
                        from: "bar",
                        to: target,
                        die: die
                    });

                }

            }

            return;
        }

        /*
           Normal taş hareketleri
        */

        for (let from = 0; from < 24; from++) {

            if (state.board[from] <= 0) {
                continue;
            }

            for (const die of state.remainingDice) {

                const to = from + die;

                if (to < 24) {

                    if (canMoveTo(to, die)) {

                        state.legalMoves.push({
                            from: from,
                            to: to,
                            die: die
                        });

                    }

                } else {

                    if (canBearOff(from, die)) {

                        state.legalMoves.push({
                            from: from,
                            to: "off",
                            die: die
                        });

                    }

                }

            }

        }

    }

    /* ========================================================
       HEDEFE GİDİLEBİLİR Mİ?
       ======================================================== */

    function canMoveTo(target, die) {

        if (target < 0 || target > 23) {
            return false;
        }

        /*
           Rakibin iki veya daha fazla taşı varsa kapalıdır.
        */

        if (state.board[target] < -1) {
            return false;
        }

        return true;
    }

    /* ========================================================
       PULU ALABİLİR Mİ?
       ======================================================== */

    function canBearOff(from, die) {

        /*
           Tüm oyuncu taşları kendi ev bölgesinde olmalı.
           Oyuncu için ev bölgesi 19-24.
        */

        for (let i = 0; i < 18; i++) {

            if (state.board[i] > 0) {
                return false;
            }

        }

        /*
           Normal zar ile tam veya daha ileri çıkış.
        */

        if (from + die >= 24) {
            return true;
        }

        /*
           Daha uzaktaki taş yoksa büyük zar kullanılabilir.
        */

        for (let i = from + 1; i < 24; i++) {

            if (state.board[i] > 0) {
                return false;
            }

        }

        return false;
    }

    /* ========================================================
       NOKTA SEÇ
       ======================================================== */

    function selectPoint(point) {

        if (state.gameOver) {
            return;
        }

        if (state.turn !== "player") {
            return;
        }

        if (state.remainingDice.length === 0) {
            setMessage("Önce zar at.");
            return;
        }

        /*
           Bar'da taş varsa başka pul seçilemez.
        */

        if (state.bar.player > 0) {

            setMessage("Önce bardaki pulunu oyuna sok.");

            return;
        }

        if (state.board[point] <= 0) {

            setMessage("Burada senin pulun yok.");

            return;
        }

        state.selectedPoint = point;

        setMessage(
            `${point + 1}. nokta seçildi. Gideceği yeri seç.`
        );

        render();
    }

    /* ========================================================
       HEDEF NOKTAYA BAS
       ======================================================== */

    function pointClicked(point) {

        if (state.selectedPoint === null) {

            selectPoint(point);

            return;
        }

        tryMove(
            state.selectedPoint,
            point
        );

    }

    /* ========================================================
       HAMLE YAP
       ======================================================== */

    function tryMove(from, to) {

        if (state.turn !== "player") {
            return;
        }

        const distance = to - from;

        if (distance <= 0) {

            setMessage("Bu yöne hareket edemezsin.");

            return;
        }

        const dieIndex =
            state.remainingDice.findIndex(
                die => die === distance
            );

        if (dieIndex === -1) {

            setMessage("Bu hareket için uygun zar yok.");

            return;
        }

        if (!canMoveTo(to, distance)) {

            setMessage("Bu nokta kapalı.");

            return;
        }

        movePlayerChecker(
            from,
            to,
            dieIndex
        );

    }

    /* ========================================================
       OYUNCU PULU HAREKET ETTİR
       ======================================================== */

    function movePlayerChecker(
        from,
        to,
        dieIndex
    ) {

        /*
           Zar kullan
        */

        state.remainingDice.splice(
            dieIndex,
            1
        );

        /*
           Eski noktadan çıkar
        */

        state.board[from]--;

        /*
           Rakibin tek pulunu kır
        */

        if (state.board[to] === -1) {

            state.board[to] = 0;
            state.bar.bot++;

        }

        /*
           Yeni noktaya koy
        */

        state.board[to]++;

        state.selectedPoint = null;

        /*
           Kazanma kontrolü
        */

        if (state.borneOff.player >= 15) {

            finishGame("player");

            return;
        }

        /*
           Başka zar varsa devam
        */

        if (state.remainingDice.length > 0) {

            calculateLegalMoves();

            if (state.legalMoves.length > 0) {

                setMessage("Hamleni yap.");

            } else {

                endPlayerTurn();

            }

        } else {

            endPlayerTurn();

        }

        render();

    }

    /* ========================================================
       OYUNCU TURUNU BİTİR
       ======================================================== */

    function endPlayerTurn() {

        state.selectedPoint = null;
        state.remainingDice = [];
        state.dice = [];

        state.turn = "bot";

        setMessage("Rakip düşünüyor...");

        render();

        setTimeout(() => {

            botTurn();

        }, 700);

    }

    /* ========================================================
       MESAJ
       ======================================================== */

    function setMessage(message) {

        state.message = message;

        const el =
            document.getElementById("gameMessage");

        if (el) {
            el.textContent = message;
        }

    }

    /* ========================================================
       OYUNU BİTİR
       ======================================================== */

    function finishGame(winner) {

        state.gameOver = true;

        if (winner === "player") {

            state.scores.player++;

            setMessage(
                "🎉 Tebrikler! Oyunu kazandın!"
            );

        } else {

            state.scores.bot++;

            setMessage(
                "Rakip kazandı."
            );

        }

        render();

    }

    /* ========================================================
       BUTONLAR
       ======================================================== */

    function bindEvents() {

        const roll =
            document.getElementById("rollDice");

        if (roll) {

            roll.addEventListener(
                "click",
                rollDice
            );

        }

        const newButton =
            document.getElementById("newTavla");

        if (newButton) {

            newButton.addEventListener(
                "click",
                newGame
            );

        }

    }

    /* ========================================================
       ANA RENDER
       ======================================================== */

    function render() {

        renderBoard();
        renderDice();
        renderStatus();

    }

    /* ========================================================
       TAHTA
       ======================================================== */

    function renderBoard() {

        const board =
            document.getElementById(
                "backgammonBoard"
            );

        if (!board) {
            return;
        }

        board.innerHTML = "";

        for (let i = 0; i < 24; i++) {

            const point =
                document.createElement("div");

            point.className =
                "tavla-point";

            point.dataset.point = i;

            const triangle =
                document.createElement("div");

            triangle.className =
                "tavla-triangle";

            point.appendChild(triangle);

            const number =
                document.createElement("div");

            number.className =
                "tavla-point-number";

            number.textContent =
                i + 1;

            point.appendChild(number);

            const checkers =
                document.createElement("div");

            checkers.className =
                "tavla-checkers";

            const count =
                Math.abs(state.board[i]);

            for (
                let c = 0;
                c < count;
                c++
            ) {

                const checker =
                    document.createElement("div");

                checker.className =
                    "tavla-checker " +
                    (
                        state.board[i] > 0
                            ? "player"
                            : "bot"
                    );

                checkers.appendChild(checker);

            }

            point.appendChild(checkers);

            if (
                state.selectedPoint === i
            ) {

                point.classList.add(
                    "selected"
                );

            }

            point.addEventListener(
                "click",
                () => pointClicked(i)
            );

            board.appendChild(point);

        }

    }

    /* ========================================================
       ZARLAR
       ======================================================== */

    function renderDice() {

        const diceBox =
            document.getElementById(
                "diceBox"
            );

        if (!diceBox) {
            return;
        }

        diceBox.innerHTML = "";

        for (
            let i = 0;
            i < state.dice.length;
            i++
        ) {

            const die =
                document.createElement("div");

            die.className = "die";

            die.textContent =
                state.dice[i];

            if (
                state.remainingDice.indexOf(
                    state.dice[i]
                ) === -1
            ) {

                die.classList.add("used");

            }

            diceBox.appendChild(die);

        }

    }

    /* ========================================================
       DURUM
       ======================================================== */

    function renderStatus() {

        const turnLabel =
            document.getElementById(
                "turnLabel"
            );

        if (turnLabel) {

            turnLabel.textContent =
                state.turn === "player"
                    ? "Senin sıran"
                    : "Rakibin sırası";

        }

        const diceText =
            document.getElementById(
                "diceText"
            );

        if (diceText) {

            diceText.textContent =
                state.dice.length
                    ? state.dice.join(" - ")
                    : "-";

        }

        const offYou =
            document.getElementById(
                "offYou"
            );

        if (offYou) {

            offYou.textContent =
                state.borneOff.player;

        }

        const offBot =
            document.getElementById(
                "offBot"
            );

        if (offBot) {

            offBot.textContent =
                state.borneOff.bot;

        }

        const barYou =
            document.getElementById(
                "barYou"
            );

        if (barYou) {

            barYou.textContent =
                state.bar.player;

        }

        const barBot =
            document.getElementById(
                "barBot"
            );

        if (barBot) {

            barBot.textContent =
                state.bar.bot;

        }

    }

    /* ========================================================
       BOT
       ======================================================== */

    function botTurn() {

        /*
           Bu bölüm bir sonraki parçada
           tam bot motoruyla doldurulacak.
        */

        setMessage(
            "Rakip turu hazırlanıyor..."
        );

    }

    return {

        init,
        newGame,
        rollDice,

        getState: () => state

    };

})();


/* ============================================================
   BAŞLAT
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        Tavla.init();

    }
);

window.Tavla = Tavla;
