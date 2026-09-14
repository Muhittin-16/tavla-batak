

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --bg: #0b0f16;
    --bg2: #111722;
    --panel: #151d29;
    --panel2: #1b2533;
    --border: rgba(255,255,255,.09);
    --text: #f5f7fa;
    --muted: #9da8b7;
    --gold: #d9a441;
    --gold2: #f0c766;
    --green: #238b63;
    --green2: #2fa977;
    --red: #c84b4b;
    --shadow: 0 20px 60px rgba(0,0,0,.35);
}

html {
    scroll-behavior: smooth;
}

body {
    min-height: 100vh;
    background:
        radial-gradient(circle at 15% 10%, rgba(217,164,65,.08), transparent 30%),
        radial-gradient(circle at 85% 20%, rgba(35,139,99,.08), transparent 30%),
        var(--bg);
    color: var(--text);
    font-family: Arial, Helvetica, sans-serif;
}

button {
    font: inherit;
    cursor: pointer;
}

button,
a {
    -webkit-tap-highlight-color: transparent;
}


/* =========================================================
   HEADER
========================================================= */

.site-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 1px solid var(--border);
    background: rgba(11,15,22,.92);
    backdrop-filter: blur(16px);
}

.header-inner {
    width: min(1180px, calc(100% - 32px));
    min-height: 76px;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
    text-decoration: none;
}

.logo-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, var(--gold), #8e6318);
    font-size: 23px;
    box-shadow: 0 8px 25px rgba(217,164,65,.2);
}

.logo strong {
    display: block;
    font-size: 18px;
}

.logo small {
    display: block;
    margin-top: 3px;
    color: var(--muted);
    font-size: 11px;
}

.main-nav {
    display: flex;
    align-items: center;
    gap: 5px;
}

.main-nav button {
    border: 0;
    background: transparent;
    color: #c8d0db;
    padding: 10px 13px;
    border-radius: 9px;
    transition: .2s;
}

.main-nav button:hover {
    background: rgba(255,255,255,.06);
    color: white;
}


/* =========================================================
   SCREENS
========================================================= */

.screen {
    display: none;
}

.screen.active {
    display: block;
}


/* =========================================================
   HERO
========================================================= */

.hero {
    width: min(1180px, calc(100% - 32px));
    min-height: 570px;
    margin: auto;
    display: grid;
    grid-template-columns: 1.05fr .95fr;
    align-items: center;
    gap: 50px;
    padding: 70px 0 55px;
}

.hero-content {
    max-width: 650px;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 13px;
    border: 1px solid rgba(217,164,65,.25);
    border-radius: 999px;
    background: rgba(217,164,65,.08);
    color: var(--gold2);
    font-size: 13px;
    margin-bottom: 22px;
}

.hero h1 {
    font-size: clamp(44px, 6vw, 76px);
    line-height: .98;
    letter-spacing: -3px;
}

.hero h1 span {
    color: var(--gold2);
}

.hero p {
    max-width: 560px;
    margin-top: 25px;
    color: var(--muted);
    font-size: 18px;
    line-height: 1.7;
}

.hero-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 32px;
}

.primary-button,
.secondary-button,
.game-button,
.new-game-button,
.back-button,
.roll-button {
    border: 0;
    border-radius: 10px;
    padding: 13px 19px;
    font-weight: 700;
    transition: transform .2s, box-shadow .2s, background .2s;
}

.primary-button {
    background: linear-gradient(135deg, var(--gold2), var(--gold));
    color: #171108;
    box-shadow: 0 10px 30px rgba(217,164,65,.18);
}

.primary-button:hover,
.game-button:hover,
.roll-button:hover {
    transform: translateY(-2px);
}

.secondary-button {
    color: white;
    background: rgba(255,255,255,.06);
    border: 1px solid var(--border);
}

.secondary-button:hover {
    background: rgba(255,255,255,.1);
}


/* =========================================================
   HERO TAVLA GÖRSELİ
========================================================= */

.hero-art {
    min-height: 410px;
    position: relative;
    display: grid;
    place-items: center;
}

.table-preview {
    width: min(470px, 90%);
    aspect-ratio: 1.35;
    padding: 22px;
    border-radius: 22px;
    background:
        linear-gradient(135deg, #6f3f1e, #3a1e11);
    border: 9px solid #24150d;
    box-shadow:
        0 30px 70px rgba(0,0,0,.45),
        inset 0 0 0 2px rgba(255,210,120,.15);
    transform: perspective(900px) rotateX(7deg) rotateZ(-2deg);
}

.preview-title {
    display: flex;
    justify-content: center;
    gap: 8px;
    color: #f3cf8b;
    font-weight: 800;
    letter-spacing: 2px;
    font-size: 13px;
    margin-bottom: 14px;
}

.mini-board {
    height: 250px;
    border-radius: 10px;
    background:
        repeating-linear-gradient(
            90deg,
            #a66b34 0 32px,
            #75421f 32px 64px
        );
    position: relative;
    overflow: hidden;
    border: 4px solid #2c180d;
}

.mini-board::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 16px;
    transform: translateX(-50%);
    background: #2a160b;
}

.mini-point {
    position: absolute;
    width: 0;
    height: 0;
    border-left: 22px solid transparent;
    border-right: 22px solid transparent;
    border-top: 110px solid rgba(45,20,10,.8);
}

.mini-point:nth-child(1) { left: 4%; top: 0; }
.mini-point:nth-child(2) { left: 19%; top: 0; }
.mini-point:nth-child(3) { left: 35%; top: 0; }
.mini-point:nth-child(4) {
    left: 55%;
    bottom: 0;
    border-top: 0;
    border-bottom: 110px solid rgba(45,20,10,.8);
}
.mini-point:nth-child(5) {
    left: 71%;
    bottom: 0;
    border-top: 0;
    border-bottom: 110px solid rgba(45,20,10,.8);
}
.mini-point:nth-child(6) {
    left: 87%;
    bottom: 0;
    border-top: 0;
    border-bottom: 110px solid rgba(45,20,10,.8);
}

.mini-checkers {
    position: absolute;
    left: 10%;
    bottom: 12px;
    display: flex;
    flex-direction: column-reverse;
    gap: 2px;
    z-index: 3;
}

.mini-checkers i {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #eee7d7;
    border: 3px solid #bcae92;
    box-shadow: 0 3px 5px rgba(0,0,0,.35);
}

.preview-dice {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: -20px;
    position: relative;
    z-index: 5;
}

.preview-dice span {
    width: 45px;
    height: 45px;
    display: grid;
    place-items: center;
    background: white;
    color: #111;
    border-radius: 8px;
    font-size: 25px;
    box-shadow: 0 7px 15px rgba(0,0,0,.35);
}

.floating-dice {
    position: absolute;
    width: 62px;
    height: 62px;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: white;
    color: #111;
    font-size: 34px;
    box-shadow: 0 15px 35px rgba(0,0,0,.4);
    z-index: 5;
}

.dice-one {
    top: 45px;
    right: 15px;
    transform: rotate(13deg);
}

.dice-two {
    bottom: 45px;
    left: 10px;
    transform: rotate(-15deg);
}


/* =========================================================
   OYUNLAR
========================================================= */

.games-section {
    width: min(1180px, calc(100% - 32px));
    margin: auto;
    padding: 65px 0 30px;
}

.section-heading {
    text-align: center;
    margin-bottom: 35px;
}

.section-heading > span {
    color: var(--gold2);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
}

.section-heading h2 {
    margin-top: 8px;
    font-size: 34px;
}

.section-heading p {
    color: var(--muted);
    margin-top: 9px;
}

.game-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
}

.game-card {
    overflow: hidden;
    border-radius: 20px;
    background: var(--panel);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
}

.game-image {
    height: 235px;
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
}

.tavla-image {
    background:
        radial-gradient(circle at 50% 50%, rgba(220,160,70,.25), transparent 55%),
        linear-gradient(135deg, #482414, #1d100a);
}

.batak-image {
    background:
        radial-gradient(circle at 50% 50%, rgba(35,139,99,.22), transparent 55%),
        linear-gradient(135deg, #102d25, #071712);
}

.game-icon-large {
    font-size: 76px;
    filter: drop-shadow(0 15px 20px rgba(0,0,0,.45));
}

.card-dice {
    position: absolute;
    right: 28px;
    top: 28px;
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: white;
    color: #111;
    font-size: 30px;
    transform: rotate(9deg);
}

.playing-cards {
    position: absolute;
    bottom: 22px;
    right: 30px;
    display: flex;
}

.playing-cards span {
    width: 52px;
    height: 72px;
    display: grid;
    place-items: center;
    margin-left: -15px;
    border-radius: 8px;
    background: #f5f1e8;
    color: #1b1b1b;
    border: 2px solid white;
    font-size: 25px;
    box-shadow: 0 8px 15px rgba(0,0,0,.3);
}

.playing-cards span:nth-child(2) {
    color: #b83c3c;
    transform: rotate(7deg);
}

.playing-cards span:nth-child(3) {
    color: #222;
    transform: rotate(13deg);
}

.game-card-content {
    padding: 27px;
}

.game-label {
    color: var(--gold2);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
}

.game-card h3 {
    font-size: 29px;
    margin-top: 7px;
}

.game-card p {
    color: var(--muted);
    line-height: 1.65;
    margin-top: 9px;
    min-height: 53px;
}

.game-button {
    width: 100%;
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(217,164,65,.1);
    color: var(--gold2);
    border: 1px solid rgba(217,164,65,.2);
}

.batak-card .game-button {
    background: rgba(35,139,99,.1);
    color: #61d8a9;
    border-color: rgba(35,139,99,.25);
}


/* =========================================================
   ÖZELLİKLER
========================================================= */

.features {
    width: min(1180px, calc(100% - 32px));
    margin: 45px auto 70px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
}

.feature {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 20px;
    border-radius: 14px;
    background: rgba(255,255,255,.025);
    border: 1px solid var(--border);
}

.feature-icon {
    width: 43px;
    height: 43px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: rgba(217,164,65,.1);
    font-size: 20px;
}

.feature strong {
    display: block;
    font-size: 14px;
}

.feature span {
    display: block;
    margin-top: 4px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.4;
}


/* =========================================================
   OYUN EKRANI
========================================================= */

.game-screen {
    width: min(1250px, calc(100% - 28px));
    margin: auto;
    padding: 28px 0 70px;
}

.game-top {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
}

.game-top > div {
    text-align: center;
}

.game-top h2 {
    display: inline;
    font-size: 26px;
    margin-left: 7px;
}

.game-top small {
    display: block;
    color: var(--muted);
    margin-top: 4px;
}

.game-title-icon {
    font-size: 25px;
}

.back-button {
    justify-self: start;
    background: rgba(255,255,255,.06);
    color: white;
    border: 1px solid var(--border);
}

.new-game-button {
    justify-self: end;
    background: var(--gold);
    color: #171108;
}


/* =========================================================
   TAVLA MASASI
========================================================= */

.tavla-layout {
    display: grid;
    grid-template-columns: 170px minmax(500px, 850px) 170px;
    justify-content: center;
    align-items: center;
    gap: 18px;
}

.player-panel,
.info-box {
    padding: 17px;
    border-radius: 14px;
    background: var(--panel);
    border: 1px solid var(--border);
}

.player-panel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.player-avatar {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(217,164,65,.13);
}

.player-panel strong {
    display: block;
    font-size: 14px;
}

.player-panel span {
    display: block;
    color: var(--muted);
    font-size: 11px;
    margin-top: 2px;
}

.player-score {
    width: 100%;
    margin-top: 7px;
    color: var(--gold2);
    font-size: 25px;
    font-weight: 800;
}

.tavla-table {
    padding: 18px;
    border-radius: 22px;
    background: #21140c;
    border: 8px solid #120b07;
    box-shadow: 0 30px 60px rgba(0,0,0,.5);
}

.board-header {
    display: flex;
    justify-content: space-between;
    color: #d6b27a;
    font-size: 12px;
    padding: 0 8px 12px;
}

.backgammon-board {
    min-height: 470px;
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 5px;
    position: relative;
    overflow: hidden;
    border-radius: 9px;
    background:
        linear-gradient(
            90deg,
            #713d1b 0 49%,
            #2a150b 49% 51%,
            #713d1b 51% 100%
        );
    border: 4px solid #8b5528;
}

.backgammon-board::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 20px;
    transform: translateX(-50%);
    background: #2b160c;
    z-index: 1;
}

.tavla-point {
    min-width: 0;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
}

.tavla-point.top {
    justify-content: flex-start;
}

.tavla-point.bottom {
    justify-content: flex-end;
}

.tavla-triangle {
    width: 0;
    height: 0;
    border-left: 24px solid transparent;
    border-right: 24px solid transparent;
}

.tavla-point.top .tavla-triangle {
    border-top: 180px solid #a66532;
}

.tavla-point.bottom .tavla-triangle {
    order: 2;
    border-bottom: 180px solid #a66532;
}

.tavla-checkers {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
}

.tavla-point.top .tavla-checkers {
    top: 7px;
}

.tavla-point.bottom .tavla-checkers {
    bottom: 7px;
    flex-direction: column-reverse;
}

.tavla-checker {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 3px solid rgba(0,0,0,.28);
    box-shadow:
        0 3px 5px rgba(0,0,0,.45),
        inset 0 2px 2px rgba(255,255,255,.2);
}

.tavla-checker.player {
    background: #eee5d2;
    border-color: #bcae92;
}

.tavla-checker.bot {
    background: #292d35;
    border-color: #0c0e12;
}

.tavla-point.selected .tavla-triangle {
    filter: brightness(1.35);
}

.tavla-point.selected {
    outline: 3px solid rgba(240,199,102,.7);
    outline-offset: -3px;
    border-radius: 5px;
}

.dice-area {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    padding: 18px 0 8px;
}

.dice-box {
    display: flex;
    gap: 8px;
}

.dice-box span {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: white;
    color: #111;
    font-size: 26px;
    font-weight: 800;
    box-shadow: 0 7px 15px rgba(0,0,0,.3);
}

.roll-button {
    background: var(--gold);
    color: #171108;
}

.game-message {
    text-align: center;
    color: #e2c681;
    font-size: 13px;
    padding: 5px;
}

.side-info {
    display: grid;
    gap: 10px;
}

.info-box span {
    display: block;
    color: var(--muted);
    font-size: 11px;
}

.info-box strong {
    display: block;
    color: var(--gold2);
    font-size: 23px;
    margin-top: 5px;
}


/* =========================================================
   BATAK
========================================================= */

.batak-table {
    min-height: 680px;
    max-width: 1050px;
    margin: auto;
    position: relative;
    border-radius: 28px;
    border: 12px solid #21140c;
    background:
        radial-gradient(circle at center, rgba(39,166,119,.25), transparent 55%),
        #14583f;
    box-shadow: 0 30px 70px rgba(0,0,0,.5);
}

.batak-player {
    position: absolute;
    min-width: 130px;
    padding: 12px;
    border-radius: 13px;
    background: rgba(5,25,19,.85);
    border: 1px solid rgba(255,255,255,.1);
    text-align: center;
}

.batak-player .avatar {
    font-size: 25px;
}

.batak-player strong {
    display: block;
    font-size: 13px;
    margin-top: 4px;
}

.batak-player span {
    display: block;
    color: #91b9a9;
    font-size: 10px;
    margin-top: 3px;
}

.player-top {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.player-left {
    top: 50%;
    left: 20px;
    transform: translateY(-50%);
}

.player-right {
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
}

.player-bottom {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}

.batak-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.batak-status {
    margin-bottom: 18px;
}

.batak-status span {
    display: block;
    color: #9cc8b7;
    font-size: 11px;
}

.batak-status strong {
    display: block;
    margin-top: 5px;
}

.played-cards {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
}

.card-placeholder {
    width: 65px;
    height: 90px;
    display: grid;
    place-items: center;
    background: #f4f0e7;
    color: #222;
    border-radius: 8px;
    font-size: 27px;
    box-shadow: 0 7px 15px rgba(0,0,0,.25);
}

.card-placeholder:nth-child(2) {
    color: #b32d36;
}

.card-placeholder:nth-child(3) {
    color: #b32d36;
}

.trump {
    margin-top: 15px;
    color: #cde4db;
}

.player-hand {
    display: flex;
    justify-content: center;
    margin-top: 12px;
}

.playing-card {
    width: 55px;
    height: 76px;
    margin-left: -7px;
    display: grid;
    place-items: center;
    border-radius: 7px;
    background: #f5f1e8;
    color: #222;
    border: 2px solid white;
    font-size: 14px;
    box-shadow: 0 5px 12px rgba(0,0,0,.3);
}

.batak-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
}


/* =========================================================
   SALON
========================================================= */

.salon-page {
    width: min(1000px, calc(100% - 32px));
    margin: auto;
    padding: 75px 0;
}

.empty-salon {
    max-width: 600px;
    margin: 45px auto;
    padding: 55px 30px;
    text-align: center;
    border-radius: 20px;
    background: var(--panel);
    border: 1px solid var(--border);
}

.empty-icon {
    font-size: 55px;
}

.empty-salon h3 {
    margin-top: 15px;
    font-size: 24px;
}

.empty-salon p {
    color: var(--muted);
    line-height: 1.6;
    margin: 10px 0 25px;
}


/* =========================================================
   FOOTER
========================================================= */

.site-footer {
    width: min(1180px, calc(100% - 32px));
    margin: auto;
    padding: 25px 0;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    color: var(--muted);
    font-size: 12px;
}

.site-footer strong {
    display: block;
    color: white;
}

.site-footer span {
    display: block;
    margin-top: 3px;
}


/* =========================================================
   MOBİL
========================================================= */

@media (max-width: 950px) {

    .main-nav button:nth-child(4) {
        display: none;
    }

    .hero {
        grid-template-columns: 1fr;
        text-align: center;
        padding-top: 45px;
    }

    .hero-content {
        margin: auto;
    }

    .hero p {
        margin-left: auto;
        margin-right: auto;
    }

    .hero-buttons {
        justify-content: center;
    }

    .hero-art {
        min-height: 350px;
    }

    .game-grid {
        grid-template-columns: 1fr;
    }

    .features {
        grid-template-columns: 1fr;
    }

    .tavla-layout {
        grid-template-columns: 1fr;
    }

    .player-panel {
        max-width: 400px;
        margin: auto;
    }

    .side-info {
        grid-template-columns: repeat(3, 1fr);
    }

    .backgammon-board {
        min-height: 420px;
    }

}


@media (max-width: 650px) {

    .header-inner {
        min-height: 68px;
    }

    .logo small {
        display: none;
    }

    .logo strong {
        font-size: 15px;
    }

    .logo-icon {
        width: 38px;
        height: 38px;
        font-size: 19px;
    }

    .main-nav {
        gap: 0;
    }

    .main-nav button {
        padding: 8px;
        font-size: 11px;
    }

    .hero {
        width: min(100% - 22px, 1180px);
        min-height: auto;
        padding: 40px 0;
    }

    .hero h1 {
        font-size: 43px;
        letter-spacing: -2px;
    }

    .hero p {
        font-size: 15px;
    }

    .hero-art {
        min-height: 280px;
    }

    .table-preview {
        width: 92%;
        padding: 12px;
    }

    .mini-board {
        height: 190px;
    }

    .mini-point {
        border-left-width: 15px;
        border-right-width: 15px;
    }

    .mini-point:nth-child(1),
    .mini-point:nth-child(2),
    .mini-point:nth-child(3) {
        border-top-width: 85px;
    }

    .mini-point:nth-child(4),
    .mini-point:nth-child(5),
    .mini-point:nth-child(6) {
        border-bottom-width: 85px;
    }

    .mini-checkers i {
        width: 30px;
        height: 30px;
    }

    .floating-dice {
        width: 48px;
        height: 48px;
        font-size: 25px;
    }

    .games-section {
        width: min(100% - 22px, 1180px);
        padding-top: 30px;
    }

    .section-heading h2 {
        font-size: 27px;
    }

    .game-image {
        height: 200px;
    }

    .game-card-content {
        padding: 22px;
    }

    .game-screen {
        width: min(100% - 18px, 1250px);
        padding-top: 18px;
    }

    .game-top {
        grid-template-columns: auto 1fr auto;
    }

    .game-top h2 {
        font-size: 20px;
    }

    .game-title-icon {
        font-size: 19px;
    }

    .new-game-button,
    .back-button {
        padding: 9px 10px;
        font-size: 11px;
    }

    .tavla-table {
        padding: 8px;
        border-width: 5px;
    }

    .backgammon-board {
        min-height: 330px;
        padding: 10px;
        gap: 2px;
    }

    .tavla-triangle {
        border-left-width: 14px;
        border-right-width: 14px;
    }

    .tavla-point.top .tavla-triangle {
        border-top-width: 125px;
    }

    .tavla-point.bottom .tavla-triangle {
        border-bottom-width: 125px;
    }

    .tavla-checker {
        width: 25px;
        height: 25px;
        border-width: 2px;
    }

    .side-info {
        grid-template-columns: repeat(3, 1fr);
    }

    .info-box {
        padding: 10px;
        text-align: center;
    }

    .info-box strong {
        font-size: 18px;
    }

    .batak-table {
        min-height: 610px;
        border-width: 6px;
    }

    .batak-player {
        min-width: 92px;
        padding: 8px;
    }

    .player-left {
        left: 7px;
    }

    .player-right {
        right: 7px;
    }

    .card-placeholder {
        width: 48px;
        height: 70px;
        font-size: 21px;
    }

    .playing-card {
        width: 43px;
        height: 63px;
        font-size: 11px;
    }

    .site-footer {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }

}

Bunu kaydettikten sonra siteyi hemen açma.

Bana sadece:

style tamam

yaz. Sonra app.js'ye geçip Tavla'yı gerçekten oynanabilir hale getireceğiz.

style tamam

Tamam kanka. Şimdi sıra app.js'de. Burada artık gösteriş değil, gerçek Tavla oynanışı yapacağız.

app.js dosyasını aç

Yapacağın işlem
Kalem / Düzenle'ye bas.
İçindeki her şeyi sil.
Aşağıdaki kodu tamamını yapıştır.
Değişiklikleri kaydet.

Bu sürümde:

🎲 Zar atma
⚪ 15 senin pulun
⚫ 15 rakip pul
↔️ Pul seçme ve hareket ettirme
💥 Rakip tek pulunu kırma
🚧 Kapalı kapı kontrolü
🎲 Çift zar
🚪 Bara gönderme
🔄 Yeni oyun
🤖 Bot rakip
📱 Telefon/tablet uyumu

olacak.

/* =========================================================
   TAVLA & BATAK
   TAVLA OYUN MOTORU
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
        botThinking: false,

        playerName: "Sen",
        botName: "Rakip",

        message: "Oyuna başlamak için zar at."
    };


    /* =====================================================
       YARDIMCILAR
    ===================================================== */

    const $ = (selector) => document.querySelector(selector);


    function createArray() {
        return new Array(24).fill(0);
    }


    function resetBoard() {

        state.board = createArray();

        /*
            POZİSYONLAR

            Pozitif = oyuncu
            Negatif = bot
        */

        state.board[0] = 2;
        state.board[11] = 5;
        state.board[16] = 3;
        state.board[18] = 5;

        state.board[23] = -2;
        state.board[12] = -5;
        state.board[7] = -3;
        state.board[5] = -5;
    }


    function resetGame() {

        resetBoard();

        state.bar.player = 0;
        state.bar.bot = 0;

        state.borneOff.player = 0;
        state.borneOff.bot = 0;

        state.dice = [];
        state.usedDice = [];

        state.turn = "player";
        state.selectedPoint = null;

        state.gameStarted = false;
        state.gameOver = false;
        state.botThinking = false;

        state.message = "Oyuna başlamak için zar at.";

        render();
    }


    /* =====================================================
       ZAR
    ===================================================== */

    function rollDice() {

        if (state.gameOver) {
            return;
        }

        if (state.turn !== "player") {
            return;
        }

        if (state.dice.length > 0) {
            return;
        }

        const first = Math.floor(Math.random() * 6) + 1;
        const second = Math.floor(Math.random() * 6) + 1;

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
        state.gameStarted = true;
        state.selectedPoint = null;

        state.message =
            `Zarların: ${first} ve ${second}. Pulunu seç.`;

        render();

        setTimeout(checkPlayerMoves, 300);
    }


    function availableDice() {

        return state.dice
            .map((value, index) => ({
                value,
                index
            }))
            .filter(item => !state.usedDice.includes(item.index));
    }


    function useDie(index) {

        if (!state.usedDice.includes(index)) {
            state.usedDice.push(index);
        }
    }


    /* =====================================================
       PUL KONTROLÜ
    ===================================================== */

    function playerHasPiecesOnBar() {

        return state.bar.player > 0;
    }


    function pointBelongsToPlayer(point) {

        return state.board[point] > 0;
    }


    function pointBelongsToBot(point) {

        return state.board[point] < 0;
    }


    function isBlockedForPlayer(point) {

        return state.board[point] <= -2;
    }


    function playerCanMoveTo(point) {

        if (point < 0 || point > 23) {
            return false;
        }

        if (isBlockedForPlayer(point)) {
            return false;
        }

        return true;
    }


    /* =====================================================
       BAR
    ===================================================== */

    function enterFromBar(die) {

        /*
            Oyuncu ters yönde ilerler.
            Bar'dan giriş noktası 24 - zar
        */

        const target = 24 - die;

        if (!playerCanMoveTo(target)) {
            return false;
        }

        if (state.board[target] === -1) {

            state.board[target] = 1;

            state.bar.player--;

            state.bar.bot++;

            state.board[target] = 1;

        } else {

            state.board[target]++;

            state.bar.player--;

        }

        return true;
    }


    /* =====================================================
       OYUNCU HAMLESİ
    ===================================================== */

    function getPlayerDestination(from, die) {

        return from + die;
    }


    function canPlayerMove(from, die) {

        if (!pointBelongsToPlayer(from)) {
            return false;
        }

        const target = getPlayerDestination(from, die);

        if (target > 23) {
            /*
                Şimdilik toplama bölgesine girme kontrolü.
            */

            return canBearOff(from, die);
        }

        return playerCanMoveTo(target);
    }


    function canBearOff(from, die) {

        /*
            Tüm oyuncu pulları kendi son bölgesinde
            olduğunda toplama yapılabilir.

            Oyuncunun son bölgesi 18-23.
        */

        for (let i = 0; i < 18; i++) {

            if (state.board[i] > 0) {
                return false;
            }
        }

        const distance = from + die;

        if (distance === 24) {
            return true;
        }

        if (distance > 24) {

            for (let i = from - 1; i >= 18; i--) {

                if (state.board[i] > 0) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }


    function movePlayer(from, dieIndex) {

        if (state.turn !== "player") {
            return false;
        }

        const available = availableDice();

        const dieObject = available.find(
            item => item.index === dieIndex
        );

        if (!dieObject) {
            return false;
        }

        const die = dieObject.value;

        if (!canPlayerMove(from, die)) {
            state.message = "Bu hamle yapılamaz.";
            render();
            return false;
        }


        const target = from + die;


        /* TOPLAMA */

        if (target >= 24) {

            state.board[from]--;

            state.borneOff.player++;

            useDie(dieIndex);

            state.selectedPoint = null;

            state.message = "Pulunu topladın.";

            checkWinner();

            finishPlayerTurnIfNeeded();

            render();

            return true;
        }


        /* NORMAL HAMLE */

        state.board[from]--;


        /* RAKİP TEK PUL */

        if (state.board[target] === -1) {

            state.board[target] = 1;

            state.bar.bot++;

        } else {

            state.board[target]++;
        }


        useDie(dieIndex);

        state.selectedPoint = null;

        state.message = "Hamle yapıldı.";

        checkWinner();

        finishPlayerTurnIfNeeded();

        render();

        return true;
    }


    /* =====================================================
       TIKLAMA
    ===================================================== */

    function handlePointClick(point) {

        if (state.turn !== "player") {
            return;
        }

        if (state.gameOver) {
            return;
        }

        if (state.dice.length === 0) {
            state.message = "Önce zar at.";
            render();
            return;
        }


        /*
            BARDA PUL VARSA
        */

        if (playerHasPiecesOnBar()) {

            state.message =
                "Önce bardaki pulunu oyuna sokmalısın.";

            render();

            return;
        }


        /*
            HENÜZ PUL SEÇİLMEDİ
        */

        if (state.selectedPoint === null) {

            if (!pointBelongsToPlayer(point)) {

                state.message =
                    "Kendi pulunu seçmelisin.";

                render();

                return;
            }

            state.selectedPoint = point;

            state.message =
                `${point + 1}. hanedeki pul seçildi.`;

            render();

            return;
        }


        /*
            AYNI NOKTAYA BASILDI
        */

        if (state.selectedPoint === point) {

            state.selectedPoint = null;

            state.message = "Pul seçimi iptal edildi.";

            render();

            return;
        }


        /*
            SEÇİLEN PUL İLE HAMLE ARA
        */

        const from = state.selectedPoint;

        const possibleDice = availableDice();

        for (const die of possibleDice) {

            if (canPlayerMove(from, die.value)) {

                const success =
                    movePlayer(from, die.index);

                if (success) {
                    return;
                }
            }
        }


        /*
            Başka pul seçmek
        */

        if (pointBelongsToPlayer(point)) {

            state.selectedPoint = point;

            state.message =
                `${point + 1}. hane seçildi.`;

            render();

            return;
        }


        state.message =
            "Bu noktaya bu zarlarla gidemezsin.";

        render();
    }


    /* =====================================================
       HAMLE VAR MI?
    ===================================================== */

    function hasAnyPlayerMove() {

        if (playerHasPiecesOnBar()) {

            for (const die of availableDice()) {

                const target = 24 - die.value;

                if (playerCanMoveTo(target)) {
                    return true;
                }
            }

            return false;
        }


        for (let point = 0; point < 24; point++) {

            if (!pointBelongsToPlayer(point)) {
                continue;
            }

            for (const die of availableDice()) {

                if (canPlayerMove(point, die.value)) {
                    return true;
                }
            }
        }

        return false;
    }


    function checkPlayerMoves() {

        if (state.turn !== "player") {
            return;
        }

        if (availableDice().length === 0) {
            return;
        }

        if (!hasAnyPlayerMove()) {

            state.message =
                "Yapılabilecek hamle yok. Sıra rakibe geçiyor.";

            render();

            setTimeout(endPlayerTurn, 1200);
        }
    }


    function finishPlayerTurnIfNeeded() {

        if (availableDice().length === 0) {

            setTimeout(endPlayerTurn, 500);
        }
    }


    function endPlayerTurn() {

        if (state.gameOver) {
            return;
        }

        state.dice = [];
        state.usedDice = [];
        state.selectedPoint = null;

        state.turn = "bot";

        state.message =
            "Rakip düşünüyor...";

        render();

        setTimeout(botTurn, 900);
    }


    /* =====================================================
       BOT
    ===================================================== */

    function botTurn() {

        if (state.gameOver) {
            return;
        }

        state.botThinking = true;

        const first = Math.floor(Math.random() * 6) + 1;
        const second = Math.floor(Math.random() * 6) + 1;

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

        render();

        setTimeout(botMakeMove, 700);
    }


    function botMakeMove() {

        if (state.gameOver) {
            return;
        }

        const dice = availableDice();

        if (dice.length === 0) {

            state.dice = [];
            state.usedDice = [];

            state.turn = "player";
            state.botThinking = false;

            state.message =
                "Senin sıran. Zar at.";

            render();

            return;
        }


        const dieObject = dice[0];

        const die = dieObject.value;


        /*
            Önce bardan gir
        */

        if (state.bar.bot > 0) {

            const target = die - 1;

            if (
                target >= 0 &&
                state.board[target] >= 0
            ) {

                if (state.board[target] === 1) {

                    state.board[target] = -1;

                    state.bar.player++;

                } else {

                    state.board[target]--;
                }

                state.bar.bot--;

                useDie(dieObject.index);

                render();

                setTimeout(botMakeMove, 450);

                return;
            }
        }


        /*
            Normal bot hamlesi
        */

        let moved = false;


        for (let from = 23; from >= 0; from--) {

            if (state.board[from] >= 0) {
                continue;
            }

            const target = from - die;

            if (target < 0) {
                continue;
            }

            if (state.board[target] > 1) {
                continue;
            }


            state.board[from]++;


            if (state.board[target] === 1) {

                state.board[target] = -1;

                state.bar.player++;

            } else {

                state.board[target]--;
            }


            useDie(dieObject.index);

            moved = true;

            break;
        }


        if (!moved) {
            useDie(dieObject.index);
        }


        render();

        setTimeout(botMakeMove, 500);
    }


    /* =====================================================
       KAZANMA
    ===================================================== */

    function checkWinner() {

        if (state.borneOff.player >= 15) {

            state.gameOver = true;
            state.message =
                "🎉 Tebrikler! Tavlayı kazandın.";

            render();

            return true;
        }


        if (state.borneOff.bot >= 15) {

            state.gameOver = true;
            state.message =
                "Rakip oyunu kazandı.";

            render();

            return true;
        }

        return false;
    }


    /* =====================================================
       TAHTA ÇİZİMİ
    ===================================================== */

    function renderBoard() {

        const boardElement =
            $("#backgammonBoard");

        if (!boardElement) {
            return;
        }

        boardElement.innerHTML = "";


        /*
            24 hane
        */

        for (let i = 0; i < 24; i++) {

            const point =
                document.createElement("div");

            point.className =
                "tavla-point " +
                (i < 12 ? "top" : "bottom");

            point.dataset.point = i;


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


            for (let c = 0; c < count; c++) {

                const checker =
                    document.createElement("div");

                checker.className =
                    `tavla-checker ${owner}`;

                checkers.appendChild(checker);
            }


            if (state.selectedPoint === i) {

                point.classList.add("selected");
            }


            point.appendChild(triangle);
            point.appendChild(checkers);

            point.addEventListener(
                "click",
                () => handlePointClick(i)
            );


            boardElement.appendChild(point);
        }
    }


    /* =====================================================
       ZAR GÖRÜNTÜSÜ
    ===================================================== */

    function diceSymbol(number) {

        const symbols = [
            "",
            "⚀",
            "⚁",
            "⚂",
            "⚃",
            "⚄",
            "⚅"
        ];

        return symbols[number] || "⚄";
    }


    function renderDice() {

        const diceBox =
            $("#diceBox");

        if (!diceBox) {
            return;
        }

        diceBox.innerHTML = "";


        if (state.dice.length === 0) {

            const a =
                document.createElement("span");

            const b =
                document.createElement("span");

            a.textContent = "⚄";
            b.textContent = "⚂";

            diceBox.appendChild(a);
            diceBox.appendChild(b);

            return;
        }


        state.dice.forEach((value, index) => {

            const die =
                document.createElement("span");

            die.textContent =
                diceSymbol(value);


            if (state.usedDice.includes(index)) {

