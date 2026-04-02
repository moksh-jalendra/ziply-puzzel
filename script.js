// ==========================================
// GLOBALLY ACCESSIBLE HINT TRIGGER
// ==========================================
window.isWaitingForHint = false;

window.requestHint = function() {
    showConfirm("Watch a short ad to reveal your next target?", () => {
        window.isWaitingForHint = true;
        triggerAd(); // Plays the ad!
    });
};

// ==========================================
// ZIPLY: MASTER GAME STATE & CLOUD ECONOMY
// ==========================================

// 1. GLOBAL UI ELEMENTS
const LevlDisplay = document.getElementById('level-disply');
const levl = document.getElementById("level-screen");
const home = document.getElementById("home-screen");
const game = document.getElementById("game-screen");

// 2. GAME STATE VARIABLES
let path = [];
let expected = 1;
let currentMode = '5x5'; 
let selectedLevelkey = 'level5x5_1'; 
let isGameWon = false;

// 3. TIME RUSH VARIABLES
let isTimeRush = false;
let currentRushScore = 0;
let rushTimeLeft = 120; 
let rushInterval = null;

// ==========================================
// 4. DATA SAVING WRAPPERS (Pure Local Storage)
// ==========================================
function saveGameData(key, value) {
    let valueToSave = typeof value === 'object' ? JSON.stringify(value) : value.toString();
    localStorage.setItem(key, valueToSave); 
}

function loadGameData(key, defaultValue) {
    let savedItem = localStorage.getItem(key);
    if (!savedItem) return defaultValue;
    
    try { return JSON.parse(savedItem); } 
    catch (e) { return isNaN(savedItem) ? savedItem : Number(savedItem); }
}

// ==========================================
// 5. GAMEMONETIZE AD TRIGGER
// ==========================================
function triggerAd() {
    if (typeof sdk !== 'undefined' && sdk.showBanner !== 'undefined') {
        console.log("📢 Triggering GameMonetize Ad...");
        sdk.showBanner();
    }
}

// ==========================================
// 6. THE GAME VARIABLES (Start empty!)
// ==========================================
let coins = 0;
let unlockedModes = ['5x5'];
let stats = { '5x5': 0, '6x6': 0, '8x8': 0, 'rush': 0 };
let purchasedThemes = ['clasic'];
let lastLogin = 0;
let loginDays = 0;

const safeUpdateText = (id, text) => { let el = document.getElementById(id); if (el) el.innerText = text; };

// ==========================================
// 7. THE GAME BOOT SEQUENCE (Safe Startup)
// ==========================================
function bootUpGame() {
    // 1. LOAD DATA
    coins = loadGameData('zipCoins', 0);
    unlockedModes = loadGameData('zipModes', ['5x5']);
    stats = loadGameData('zipStats', { '5x5': 0, '6x6': 0, '8x8': 0, 'rush': 0 });
    purchasedThemes = loadGameData('zipInventory', ['clasic']);
    lastLogin = loadGameData('zipLastLogin', 0);
    loginDays = loadGameData('zipLoginDays', 0);

    // 2. UPDATE THE UI
    safeUpdateText('coin-count', coins);
    safeUpdateText('stat-5x5', stats['5x5']);
    safeUpdateText('stat-6x6', stats['6x6']);
    safeUpdateText('stat-8x8', stats['8x8']);
    safeUpdateText('stat-rush', stats['rush']);

    ['6x6', '8x8'].forEach(mode => {
        if (unlockedModes.includes(mode)) {
            let c = document.getElementById(`card-${mode}`);
            if (c) {
                c.classList.remove('locked-mode');
                let p = c.querySelector('p'); if (p) p.innerText = "Unlocked";
                c.onclick = () => selectMode(mode);
            }
        }
    });

    // 3. CHECK DAILY LOGIN
    let today = new Date().getDate(); 
    if (lastLogin !== today) {
        loginDays++;
        saveGameData('zipLastLogin', today);
        saveGameData('zipLoginDays', loginDays);
        if (loginDays === 7 && !purchasedThemes.includes('paper')) {
            purchasedThemes.push('paper');
            saveGameData("zipInventory", purchasedThemes);
            showAlert("🎉 You've logged in for 7 days! Paper Theme unlocked!");
        }
    }

    // 4. LOAD AUDIO & THEME
    musicVolume = loadGameData('zipMusicVol', 0.3);
    sfxVolume = loadGameData('zipSfxVol', 1.0);
    bgMusic.volume = musicVolume;
    if(document.getElementById('bgm-volume')) document.getElementById('bgm-volume').value = musicVolume;
    if(document.getElementById('sfx-volume')) document.getElementById('sfx-volume').value = sfxVolume;

    let savedTheme = loadGameData('zipTheme', 'clasic');
    applyTheme(savedTheme);

    // 5. AUTO-TUTORIAL FOR NEW PLAYERS
    let isFirstPlay = loadGameData('zipFirstPlay', true);
    if (isFirstPlay) {
        setTimeout(() => {
            openTutorial();
        }, 500); 
    }
}

document.addEventListener("DOMContentLoaded", bootUpGame);


// ==========================================
// TUTORIAL MODAL LOGIC
// ==========================================
function openTutorial() {
    let modal = document.getElementById('tutorial-modal');
    if (modal) {
        modal.classList.remove('hidden-modal');
        modal.style.display = 'flex';
    }
}

function closeTutorial() {
    let modal = document.getElementById('tutorial-modal');
    if (modal) {
        modal.classList.add('hidden-modal');
        modal.style.display = 'none';
        
        // Mark tutorial as seen in the cloud so it doesn't open again!
        saveGameData('zipFirstPlay', false); 
    }
}


// ==========================================
// MODE HUB & POP-UP LOGIC
// ==========================================
function openModeSelect() {
    let modal = document.getElementById('mode-select-modal');
    if (modal) {
        modal.classList.remove('hidden-modal');
        modal.style.display = 'flex';
    }
}

function closeModeSelect() {
    let modal = document.getElementById('mode-select-modal');
    if (modal) {
        modal.classList.add('hidden-modal');
        modal.style.display = 'none';
    }
}

function unlockMode(mode, cost) {
    if (unlockedModes.includes(mode)) return selectMode(mode);
    
    if (coins >= cost) {
        // 👇 Using  Custom Confirm! 👇
        showConfirm(`Unlock ${mode} Master Mode for ${cost} ⭐?`, () => {
            triggerAd()
            coins -= cost;
            saveGameData('zipCoins', coins);
            safeUpdateText('coin-count', coins);
            
            unlockedModes.push(mode);
            saveGameData('zipModes', unlockedModes);
            
            let c = document.getElementById(`card-${mode}`);
            c.classList.remove('locked-mode');
            c.querySelector('p').innerText = "Unlocked";
            c.onclick = () => selectMode(mode);
            
            showAlert(`🎉 ${mode} Mode Unlocked!`);
            selectMode(mode);
        });
    } else {
        showAlert(`You need ${cost} ⭐ to unlock this mode!`);
    }
}

function selectMode(mode) {
    closeModeSelect(); 
    currentMode = mode;
    isTimeRush = false;
    
    closeLevelPanel(); 
    let levelScreenTitle = levl.querySelector('h1'); 
    if (levelScreenTitle) levelScreenTitle.innerText = "World " + mode; 
    
    document.getElementById('rush-score-display').style.display = 'none'; 
    OpenLevelPage();
}

function startTimeRush() {
    closeModeSelect(); 
    isTimeRush = true;
    currentMode = 'rush';
    currentRushScore = 0;
    
    safeUpdateText('rush-score', "0");
    document.getElementById('rush-score-display').style.display = 'block'; 
    safeUpdateText('playing-level-name', "TIME RUSH");
    
    levl.style.display = 'none';
    home.style.display = 'none';
    game.style.display = 'flex';
    
    let allKeys = Object.keys(levels);
    let randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
    zipLogic(levels[randomKey]);
    
    startRushTimer(); 
}


// ==========================================
// LEVEL MAP RENDERING
// ==========================================
function renderLevelButtons() {
    if (!LevlDisplay) return;
    LevlDisplay.innerHTML = '';
    
    let modeProgress = loadGameData('zipProgress_' + currentMode, 1);

    for (let [key, value] of Object.entries(levels)) {
        if (!key.includes(currentMode)) continue; 

        let levelBox = document.createElement('div');
        levelBox.classList.add('levelbox');
        let levelNum = parseInt(key.split('_')[1]); 

        if (levelNum > modeProgress) {
            levelBox.classList.add('locked');
            levelBox.style.cursor = 'not-allowed';
            levelBox.innerText = "🔒" + levelNum;
        } else {
            levelBox.innerText = levelNum; 
            if (key === selectedLevelkey) levelBox.classList.add('selected');
            
            levelBox.addEventListener('click', function () {
                document.querySelectorAll('.levelbox').forEach(btn => btn.classList.remove('selected'));
                levelBox.classList.add('selected');
                selectedLevelkey = key;
                openLevelPanel(key);
            });
        }
        LevlDisplay.appendChild(levelBox);
    }
}


// ==========================================
// CORE GAMEPLAY LOGIC (WITH INTERACTIVE TUTORIAL)
// ==========================================
function zipLogic(puzzleArry) {
    const grid = document.getElementById("grid");
    const wrapper = document.getElementById('grid-wrapper');
    
    // 🧹 BUG FIX 1: CLEANUP OLD TUTORIAL ELEMENTS ON RESTART 🧹
    document.querySelectorAll('#tut-msg-box').forEach(el => el.remove());
    document.querySelectorAll('.tut-finger-anim').forEach(el => el.remove());
    if (window.tutInterval) clearInterval(window.tutInterval);

    grid.innerHTML = '';
    path = [];
    expected = 1;
    isGameWon = false; 
    drawPipe();

    let gridSize = Math.sqrt(puzzleArry.length); 
    grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    let puzzelindex = 0;
    let targetPathLength = 0; 

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            let cell = document.createElement("div");
            cell.dataset.x = x;
            cell.dataset.y = y;
            let cellValue = puzzleArry[puzzelindex];
            cell.dataset.val = cellValue; 

            if (cellValue === -1) {
                cell.classList.add("cell", "wall"); 
            } else {
                cell.classList.add("cell");
                targetPathLength++; 
                if (cellValue !== 0) cell.innerText = cellValue;
            }
            grid.appendChild(cell);
            puzzelindex++;
        }
    }

    // 👆 --- TUTORIAL STATE MACHINE --- 👆
    let isTutorial = (selectedLevelkey === 'level5x5_1');
    let tutFinger = null;
    let tutMsg = null;

    if (isTutorial) {
        tutMsg = document.createElement("div");
        tutMsg.id = "tut-msg-box";
        tutMsg.style.cssText = "position:absolute; top:-70px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.85); color:#ffdb58; padding:10px 15px; border-radius:10px; font-weight:bold; font-size:14px; width:max-content; z-index:100; text-align:center; border: 2px solid #ffdb58; pointer-events:none; transition: all 0.3s;";
        tutMsg.innerHTML = "Rule 1: Swipe to connect 1 to 2";
        wrapper.appendChild(tutMsg);

        tutFinger = document.createElement("div");
        tutFinger.innerHTML = "👆";
        tutFinger.classList.add('tut-finger-anim'); // Added class so we can delete it later
        tutFinger.style.cssText = "position:absolute; font-size:50px; z-index:100; pointer-events:none; transition: top 0.4s ease, left 0.4s ease; filter: drop-shadow(0px 8px 6px rgba(0,0,0,0.5));";
        wrapper.appendChild(tutFinger);

        function animateTutorial(phase) {
            let paths = {
                1: ["3-2", "3-3", "4-3", "4-4", "3-4", "2-4"],
                2: ["2-4", "2-3", "1-3", "1-2"],
                3: ["1-2", "2-2", "2-1", "2-0", "3-0", "4-0", "4-1", "4-2"]
            };
            let steps = paths[phase];
            let stepIdx = 0;

            if (window.tutInterval) clearInterval(window.tutInterval);
            window.tutInterval = setInterval(() => {
                // BUG FIX 2: Hide the ghost finger if the player is actively touching the screen
                if (window.isDraggingGameState) {
                    tutFinger.style.opacity = '0'; 
                    return; 
                }
                tutFinger.style.opacity = '1';

                let coord = steps[stepIdx];
                let cell = document.querySelector(`.cell[data-x="${coord.split('-')[0]}"][data-y="${coord.split('-')[1]}"]`);
                if (cell) {
                    let rect = cell.getBoundingClientRect();
                    let wrapRect = wrapper.getBoundingClientRect();
                    tutFinger.style.left = (rect.left - wrapRect.left + (rect.width/2) - 20) + 'px';
                    tutFinger.style.top = (rect.top - wrapRect.top + (rect.height/2) - 10) + 'px';
                }
                stepIdx++;
                if (stepIdx >= steps.length) stepIdx = 0; 
            }, 600);
        }
        animateTutorial(1); 
    }
    // 👆 ---------------------------- 👆

    function handlePlayerMove(clientX, clientY) {
        if (isGameWon) return; 
        
        let ellement = document.elementFromPoint(clientX, clientY);
        if (!ellement || !ellement.classList.contains('cell')) return;

        // Tutorial Rule: Hit a wall check
        if (ellement.classList.contains('wall')) {
            if (isTutorial && tutMsg) {
                tutMsg.innerHTML = "⚠️ Rule 2: You cannot cross dark walls!";
                tutMsg.style.color = "#ff4d4d";
                tutMsg.style.borderColor = "#ff4d4d";
            }
            return;
        }

        let gridx = ellement.dataset.x;
        let gridy = ellement.dataset.y;
        let coordinate = gridx + "-" + gridy;
        let cellValue = parseInt(ellement.dataset.val);
        
        if (path.length === 0 && cellValue !== 1) return;
        
        if (path.length > 0) {
            let lastcoordinate = path[path.length - 1];
            let lastx = parseInt(lastcoordinate.split("-")[0]);
            let lasty = parseInt(lastcoordinate.split("-")[1]);
            if (Math.abs(gridx - lastx) + Math.abs(gridy - lasty) !== 1) return;
        }
        
        if (path.length > 1 && path[path.length - 2] === coordinate) {
            let removdbox = path.pop();
            let celltoerase = document.querySelector(`[data-x="${removdbox.split('-')[0]}"][data-y="${removdbox.split('-')[1]}"]`);
            celltoerase.classList.remove('active-path');
            drawPipe(); 
            
            if (parseInt(celltoerase.dataset.val) !== 0) expected--;
            return; 
        }
        
        if (cellValue !== 0) {
            if (cellValue !== expected) return;
            expected++; // Expected moves to the next required number
            
            // 👆 TUTORIAL PHASE UPDATER (FIXED TIMING) 👆
            if (isTutorial) {
                // If expected is 3, it means they just successfully connected 1 to 2!
                if (expected === 3) {
                    tutMsg.innerHTML = "Great! Now connect 2 to 3";
                    tutMsg.style.color = "#ffdb58"; tutMsg.style.borderColor = "#ffdb58";
                    animateTutorial(2);
                } 
                // If expected is 4, it means they just successfully connected 2 to 3!
                else if (expected === 4) {
                    tutMsg.innerHTML = "Almost there! Connect 3 to 4<br>Rule 3: End on the biggest number!";
                    animateTutorial(3);
                } 
                // If expected is 5, it means they touched 4, but missed some empty tiles!
                else if (expected === 5 && path.length < targetPathLength) {
                    tutMsg.innerHTML = "Rule 4: You must fill ALL empty blocks before finishing!";
                    tutMsg.style.color = "#00e5ff"; tutMsg.style.borderColor = "#00e5ff";
                }
            }
        }
        
        if (!path.includes(coordinate)) {
            path.push(coordinate);
            ellement.classList.add('active-path'); 
            drawPipe(); 
            playSound(sfxPop); 
        }
        
        if (path.length === targetPathLength && cellValue !== 0) {
            isGameWon = true; 
            playSound(sfxWin);
            
            // Clean up tutorial elements on win
            if (isTutorial) {
                clearInterval(tutInterval);
                if (tutFinger) tutFinger.remove();
                if (tutMsg) tutMsg.innerHTML = "PERFECT!";
            }

            if (isTimeRush) {
                currentRushScore++;
                safeUpdateText('rush-score', currentRushScore);
                fireConfetti();
                setTimeout(() => {
                    let allKeys = Object.keys(levels);
                    let randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
                    zipLogic(levels[randomKey]); 
                }, 500);
            } else {
                stopTimer(); 
                let savedTime = loadGameData('zipTime_' + selectedLevelkey, null);
                if (savedTime === null) {
                    stats[currentMode]++;
                    saveGameData('zipStats', stats);
                    safeUpdateText(`stat-${currentMode}`, stats[currentMode]);
                }

                let totalSeconds = timeElapsed / 1000;
                let earnedStars = 1; let starText = "⭐☆☆";
                if (totalSeconds <= (gridSize*4)) { earnedStars = 3; starText = "⭐⭐⭐"; }
                else if (totalSeconds <= (gridSize*9)) { earnedStars = 2; starText = "⭐⭐☆"; }

                if (savedTime === null || timeElapsed < parseInt(savedTime)) {
                    saveGameData('zipTime_' + selectedLevelkey, timeElapsed);
                    saveGameData('zipStars_' + selectedLevelkey, earnedStars);
                }

                let currentLevelNum = parseInt(selectedLevelkey.split('_')[1]);
                let modeProgress = loadGameData('zipProgress_' + currentMode, 1);
                if (currentLevelNum === modeProgress) {
                    saveGameData('zipProgress_' + currentMode, modeProgress + 1);
                }
                
                coins += (earnedStars * 2); 
                saveGameData('zipCoins', coins);
                safeUpdateText('coin-count', coins);

                setTimeout(() => {
                    safeUpdateText('victory-title', "CLEARED!");
                    safeUpdateText('victory-time', document.getElementById('game-timer').innerText);
                    safeUpdateText('victory-stars', starText);
                    document.getElementById('victory-modal').style.display = 'flex';
                    fireConfetti();
                }, 1000); 
            }
        }
    }

    // Engine Controls 
    window.isDraggingGameState = false; 
    window.activeGameMove = handlePlayerMove;

    if (!grid.dataset.controlsBound) {
        grid.dataset.controlsBound = "true";
        grid.addEventListener("touchstart", (e) => { 
            e.preventDefault(); 
            window.isDraggingGameState = true; 
            if (window.activeGameMove) window.activeGameMove(e.touches[0].clientX, e.touches[0].clientY); 
        }, { passive: false });
        
        grid.addEventListener("touchmove", (e) => { 
            e.preventDefault(); 
            if (window.activeGameMove) window.activeGameMove(e.touches[0].clientX, e.touches[0].clientY); 
        }, { passive: false });
        
        grid.addEventListener("touchend", () => { window.isDraggingGameState = false; }); // Add this

        grid.onmousedown = (e) => { 
            window.isDraggingGameState = true; 
            if (window.activeGameMove) window.activeGameMove(e.clientX, e.clientY); 
        };
        
        window.onmousemove = (e) => { 
            if (window.isDraggingGameState && window.activeGameMove) window.activeGameMove(e.clientX, e.clientY); 
        };
        
        window.onmouseup = () => { window.isDraggingGameState = false; };
    }
} // <-- End of zipLogic




// ==========================================
// PAGE NAVIGATION & MODALS
// ==========================================
function OpenLevelPage() {
    renderLevelButtons();
    levl.style.display = 'flex';
    home.style.display = 'none';
    game.style.display = 'none';
    document.getElementById('victory-modal').style.display = 'none'; 

    setTimeout(() => {
        let activeBtn = document.querySelector('.levelbox.selected');
        if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
}

function start() {
    // Trigger an ad when they start a level!
    

    levl.style.display = 'none';
    game.style.display = 'flex';
    document.getElementById('victory-modal').style.display = 'none'; 

    resizeCanvas(); 
    resetTimer(); 
    path = []; 
    drawPipe(); 
    safeUpdateText('playing-level-name', selectedLevelkey.toUpperCase().replace('_', ' '));
    
    zipLogic(levels[selectedLevelkey]);
    startTimer(); 
}

function backhome() {
    levl.style.display = 'none';
    home.style.display = 'flex';
    game.style.display = 'none'; 
}

function openLevelPanel(levelName) {
    safeUpdateText('selected-level-name', levelName.toUpperCase().replace('_', ' '));
    let savedTime = loadGameData('zipTime_' + levelName, null);
    let savedStars = loadGameData('zipStars_' + levelName, null);
    
    let timeText = "--:--";
    let starText = "☆☆☆"; 
    if (savedTime) {
        let seconds = Math.floor(savedTime / 1000);
        let milliseconds = Math.floor((savedTime % 1000) / 10);
        timeText = (seconds < 10 ? "0" + seconds : seconds) + ":" + (milliseconds < 10 ? "0" + milliseconds : milliseconds);
    }
    if (savedStars) {
        if (savedStars == 3) starText = "⭐⭐⭐";
        else if (savedStars == 2) starText = "⭐⭐☆";
        else if (savedStars == 1) starText = "⭐☆☆"; 
    }
    safeUpdateText('best-time', timeText);
    safeUpdateText('star-rating', starText);
    document.getElementById('level-info-panel').classList.remove('hidden-modal');
}

function closeLevelPanel() { document.getElementById('level-info-panel').classList.add('hidden-modal'); }

function replayFromVictory() {
    document.getElementById('victory-modal').style.display = 'none';
    start(); 
}

function nextFromVictory() {
    document.getElementById('victory-modal').style.display = 'none';
    let currentLevelNum = parseInt(selectedLevelkey.split('_')[1]);
    let nextLevelKey = `level${currentMode}_${currentLevelNum + 1}`;
    
    if (levels[nextLevelKey]) {
        selectedLevelkey = nextLevelKey; 
        start(); 
    } else {
        showAlert("You beat all the levels in this world!");
        OpenLevelPage(); 
    }
}


// ==========================================
// TIMER ENGINES
// ==========================================
let timerInterval = null;
let timeElapsed = 0; 
let startTime = 0;

function startTimer() {
    stopTimer(); 
    startTime = Date.now();
    updateTimerDisplay(); 
    timerInterval = setInterval(updateTimerDisplay, 1000); 
}

function updateTimerDisplay() {
    timeElapsed = Date.now() - startTime; 
    let minutes = Math.floor(timeElapsed / 60000);
    let seconds = Math.floor((timeElapsed % 60000) / 1000);
    safeUpdateText('game-timer', (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds));
}

function stopTimer() { clearInterval(timerInterval); }
function resetTimer() {
    stopTimer();
    timeElapsed = 0;
    let timerEl = document.getElementById('game-timer');
    if (timerEl) { timerEl.innerText = "00:00"; timerEl.classList.remove('panic-time'); }
}

function startRushTimer() {
    clearInterval(rushInterval);
    rushTimeLeft = 120; 
    
    rushInterval = setInterval(() => {
        rushTimeLeft--;
        let minutes = Math.floor(rushTimeLeft / 60);
        let seconds = rushTimeLeft % 60;
        safeUpdateText('game-timer', (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds));

        if (rushTimeLeft <= 10) {
            document.getElementById('game-timer').classList.add('panic-time');
            playSound(sfxError); 
        }

        if (rushTimeLeft <= 0) {
            clearInterval(rushInterval);
            isGameWon = true; 
            document.getElementById('game-timer').classList.remove('panic-time');
            
            if (currentRushScore > stats['rush']) {
                stats['rush'] = currentRushScore;
                saveGameData('zipStats', stats);
                safeUpdateText('stat-rush', stats['rush']);
            }
            showAlert(`Time's up! You solved ${currentRushScore} puzzles!`);
            triggerAd(); // 📢 Ad after time rush ends
            backhome(); 
        }
    }, 1000);
}

// ==========================================
// AUDIO & CONFETTI ENGINE
// ==========================================
const sfxPop = new Audio('assets/pop.mp3');
const sfxError = new Audio('assets/error.mp3');
const sfxWin = new Audio('assets/win.mp3');
const bgMusic = new Audio('assets/bgm.mp3');
bgMusic.loop = true;

let musicVolume = 0.3; 
let sfxVolume = 1.0;   

const bgmSlider = document.getElementById('bgm-volume');
const sfxSlider = document.getElementById('sfx-volume');
if (bgmSlider) {
    bgmSlider.addEventListener('input', function() {
        musicVolume = parseFloat(this.value);
        bgMusic.volume = musicVolume;
        saveGameData('zipMusicVol', musicVolume);
        if (musicVolume > 0 && bgMusic.paused) bgMusic.play().catch(e=>e);
        else if (musicVolume === 0) bgMusic.pause();
    });
}
if (sfxSlider) {
    sfxSlider.addEventListener('input', function() {
        sfxVolume = parseFloat(this.value);
        saveGameData('zipSfxVol', sfxVolume);
        if (sfxVolume > 0) { sfxPop.volume = sfxVolume; sfxPop.currentTime = 0; sfxPop.play().catch(e=>e); }
    });
}

function playSound(soundObj) {
    if (sfxVolume > 0) { soundObj.volume = sfxVolume; soundObj.currentTime = 0; soundObj.play().catch(e=>e); }
}

let audioUnlocked = false;
function unlockAllAudio() {
    if (audioUnlocked) return; 
    sfxPop.play().then(() => sfxPop.pause()).catch(e=>e);
    sfxError.play().then(() => sfxError.pause()).catch(e=>e);
    sfxWin.play().then(() => sfxWin.pause()).catch(e=>e);
    if (musicVolume > 0) bgMusic.play().catch(e=>e);
    audioUnlocked = true; 
    document.body.removeEventListener('touchstart', unlockAllAudio);
    document.body.removeEventListener('click', unlockAllAudio);
}
document.body.addEventListener('touchstart', unlockAllAudio);
document.body.addEventListener('click', unlockAllAudio);

function fireConfetti() {
    const colors = ['#ffdb58', '#ff4081', '#00e5ff', '#7cfc00', '#ff1493'];
    for (let i = 0; i < 75; i++) {
        let conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.width = Math.random() > 0.5 ? '10px' : '15px';
        conf.style.height = Math.random() > 0.5 ? '10px' : '5px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.top = '50%'; conf.style.left = '50%';
        conf.style.zIndex = '99999'; conf.style.pointerEvents = 'none';
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        let angle = Math.random() * Math.PI * 2;
        let velocity = 150 + Math.random() * 300;
        let tx = Math.cos(angle) * velocity; let ty = Math.sin(angle) * velocity;
        conf.animate([
            { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px + 200px)) rotate(${Math.random()*720}deg) scale(0)`, opacity: 0 }
        ], { duration: 1500 + Math.random() * 1500, easing: 'cubic-bezier(.37,0,.23,1)', fill: 'forwards' });
        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 4000); 
    }
}


// ==========================================
// THEME SHOP
// ==========================================
const themeCost = { wood: 5, glass: 15 };

function slideTheme(direction) {
    let slider = document.getElementById('theme-slider');
    let scrollAmount = slider.clientWidth / 2;
    slider.scrollBy({ left: scrollAmount * direction, behavior: "smooth" });
}

function handleTheme(themeName) {
    let modeProgress = loadGameData('zipProgress_5x5', 1);
    if (themeName == 'ice') {
        if (modeProgress < 3) return showAlert('You must reach Level 3 in 5x5 first!');
        return applyTheme(themeName);
    }
    if (purchasedThemes.includes(themeName)) return applyTheme(themeName);
    if (themeName === 'paper') return showAlert('Complete your 7-day login streak to unlock this!');

    let cost = themeCost[themeName];
    if (coins >= cost) {
        showConfirm(`Do you want to spend ${cost} ⭐ to unlock ${themeName}?`, () => {
            triggerAd()
            coins -= cost;
            saveGameData("zipCoins", coins);
            safeUpdateText("coin-count", coins);
            purchasedThemes.push(themeName);
            saveGameData("zipInventory", purchasedThemes);
            showAlert(`You unlocked ${themeName}!`);
            applyTheme(themeName);
        });
    } else {
        showAlert(`You need ${cost} ⭐ to unlock this theme.`);
    }
}

function applyTheme(themeName) {
    if (themeName === 'clasic') document.body.removeAttribute('data-theme');
    else document.body.dataset.theme = themeName;
    saveGameData("zipTheme", themeName);
    updateThemesButtons(themeName);
}

function updateThemesButtons(activeTheme) {
    let setBtnText = (selector, text) => { let btn = document.querySelector(selector); if(btn) btn.innerText = text; };
    
    setBtnText('#theme-clasic .theme-btn', activeTheme === 'clasic' ? "Selected" : "Select");
    setBtnText('#theme-wood .theme-btn', purchasedThemes.includes("wood") ? (activeTheme === 'wood' ? "Selected" : "Select") : `Unlock ${themeCost.wood} ⭐`);
    setBtnText('#theme-glass .theme-btn', purchasedThemes.includes("glass") ? (activeTheme === 'glass' ? "Selected" : "Select") : `Unlock ${themeCost.glass} ⭐`);
    
    let modeProgress = loadGameData('zipProgress_5x5', 1);
    setBtnText('#theme-ice .theme-btn', modeProgress >= 3 ? (activeTheme === 'ice' ? "Selected" : "Select") : `Level 3 Required`);
    
    let daysLeft = 7 - loginDays;
    setBtnText('#theme-paper .theme-btn', purchasedThemes.includes('paper') ? (activeTheme === 'paper' ? "Selected" : "Select") : `${daysLeft} Logins Left`);
}

const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');
if (profileBtn) {
    profileBtn.addEventListener('click', function (event) {
        profileDropdown.classList.toggle('hidden');
        event.stopPropagation();
        safeUpdateText('stat-streak', loginDays || 0);
    });
}
document.addEventListener('click', function (event) {
    if (profileBtn && !profileBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.add('hidden');
    }
});


// ==========================================
// CANVAS DRAWING ENGINE
// ==========================================
const canvas = document.getElementById('pipe-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const wrapper = document.getElementById('grid-wrapper');

function resizeCanvas() {
    if (!wrapper || !canvas) return;
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
}
window.addEventListener('resize', () => { resizeCanvas(); drawPipe(); });

function drawPipe() {
    if (!canvas || !ctx) return;
    if (canvas.width === 0) resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (path.length === 0) return;

    let themeColor = getComputedStyle(document.body).getPropertyValue('--path-color').trim() || "orange";
    ctx.strokeStyle = themeColor;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    const parentRect = wrapper.getBoundingClientRect();

    for (let i = 0; i < path.length; i++) {
        let el;
        let coordinateString = String(path[i]);
        if (coordinateString.includes("-")) {
            let [cellX, cellY] = coordinateString.split("-");
            el = document.querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`);
        } else {
            el = document.querySelectorAll('.cell')[path[i]];
        }
        if (!el) continue;

        let rect = el.getBoundingClientRect();
        let drawX = rect.left - parentRect.left + (rect.width / 2);
        let drawY = rect.top - parentRect.top + (rect.height / 2);

        if (i === 0) {
            ctx.moveTo(drawX, drawY);
            ctx.lineTo(drawX + 0.1, drawY);
        } else {
            ctx.lineTo(drawX, drawY);
        }
    }
    ctx.stroke();
}

// ==========================================
// CUSTOM ALERT & CONFIRM CONTROLLERS
// ==========================================
let confirmCallback = null;

function showAlert(msg) {
    document.getElementById('alert-text').innerText = msg;
    let m = document.getElementById('custom-alert');
    m.classList.remove('hidden-modal');
    m.style.display = 'flex';
}

function closeAlert() {
    let m = document.getElementById('custom-alert');
    m.classList.add('hidden-modal');
    m.style.display = 'none';
}

function showConfirm(msg, callback) {
    confirmCallback = callback; // Save what the game wants to do if they say YES
    document.getElementById('confirm-text').innerText = msg;
    let m = document.getElementById('custom-confirm');
    m.classList.remove('hidden-modal');
    m.style.display = 'flex';
}

function closeConfirm(result) {
    let m = document.getElementById('custom-confirm');
    m.classList.add('hidden-modal');
    m.style.display = 'none';
    
    
    if (result && confirmCallback) {
        confirmCallback();
    }
    confirmCallback = null; 
}



// 2. The Smart Pathfinding Solver (DFS Backtracking) 
window.giveHint = function() {
    let maxNum = 0;
    let targetLen = 0;
    let startCoord = null;
    let targetNextNum = expected;

    // Analyze the board to find the rules for this specific level
    document.querySelectorAll('.cell').forEach(c => {
        if (!c.classList.contains('wall')) {
            targetLen++; 
            let v = parseInt(c.dataset.val);
            if (v > maxNum) maxNum = v; 
            if (v === 1) startCoord = `${c.dataset.x}-${c.dataset.y}`; 
        }
    });

    // Determine starting state for the invisible solver
    let basePath = [];
    if (path.length === 0) {
        basePath = [startCoord];
        targetNextNum = 2;
    } else {
        basePath = [...path];
    }

    let bestSolution = null;

    // The Backtracking Solver
    function solve(currentPath, currentExpected) {
        if (bestSolution) return; 

        let currNode = currentPath[currentPath.length - 1];
        let [cx, cy] = currNode.split('-').map(Number);
        let cellEl = document.querySelector(`.cell[data-x="${cx}"][data-y="${cy}"]`);
        if (!cellEl) return;
        let cellVal = parseInt(cellEl.dataset.val);

        // PERFECT WIN CONDITION
        if (currentPath.length === targetLen && cellVal === maxNum) {
            bestSolution = [...currentPath];
            return;
        }

        let neighbors = [
            `${cx+1}-${cy}`, `${cx-1}-${cy}`, `${cx}-${cy+1}`, `${cx}-${cy-1}`
        ];

        for (let n of neighbors) {
            if (!currentPath.includes(n)) { 
                let nEl = document.querySelector(`.cell[data-x="${n.split('-')[0]}"][data-y="${n.split('-')[1]}"]`);
                if (nEl && !nEl.classList.contains('wall')) {
                    let nVal = parseInt(nEl.dataset.val);
                    
                    // FIXED LOGIC: Only evaluate the neighbor we are about to step on!
                    if (nVal === 0 || nVal === currentExpected) {
                        currentPath.push(n);
                        
                        // If we step on the target, increase the expected number for the next steps
                        let nextExpected = (nVal === currentExpected) ? currentExpected + 1 : currentExpected;
                        
                        solve(currentPath, nextExpected); 
                        currentPath.pop(); 
                    }
                }
            }
        }
    }

    // Run the solver instantly
    solve(basePath, targetNextNum);

    // Display the Hint logically
    if (bestSolution) {
        let targetIndex = -1;
        for (let i = basePath.length - 1; i < bestSolution.length; i++) {
            let coord = bestSolution[i];
            let cell = document.querySelector(`.cell[data-x="${coord.split('-')[0]}"][data-y="${coord.split('-')[1]}"]`);
            if (parseInt(cell.dataset.val) === targetNextNum) {
                targetIndex = i;
                break;
            }
        }

        if (targetIndex !== -1) {
            let stepsToAnimate = bestSolution.slice(basePath.length - 1, targetIndex + 1);
            
            stepsToAnimate.forEach((p, index) => {
                // FIXED: Skip index 0 so it doesn't glow the tile you are already standing on
                if (index > 0) {
                    setTimeout(() => {
                        let el = document.querySelector(`.cell[data-x="${p.split('-')[0]}"][data-y="${p.split('-')[1]}"]`);
                        if (el) {
                            el.classList.add('hint-glow');
                            setTimeout(() => el.classList.remove('hint-glow'), 1500);
                        }
                    }, index * 150); 
                }
            });
        } else {
             showAlert("You are on the right path! Just fill the remaining empty tiles to finish!");
        }
    } else {
        showAlert("Your current path blocks the solution! Undo some moves and try the hint again.");
    }
};