let p = {
    x: 30,
    y: 550,
    w: 20,
    h: 20,
    v: {x:0,y:0},
    jumpS: 5,
    g: 1.2, // default 1.2
    s: 4,
    dacc:0.2,
    frozen: true,
    started: false,
    paused: false,
    level: 0,
    deaths: 0,
    cx:1100,
    cy:550,
    ticks:60,
    jumpBot: true,
    retroEffect: true,
    showFPS: true,
    highestLevel: 0,
    rainbowMode: false,
    rainbow: 0,
    levelSSSBeaten: false,
}

var audio
var deathSound
var hellThemedSoundTrack
var hellTrackRunning

var renderingColor = 'lime';
var rainbowColor = '';

var subtitlesGenerating = false;
let subtitlesInterval

let colorGame = 'lime'

let obsticles = [

]

const keys = {}

window.addEventListener('keydown', (e) => {
  if (e.keyCode == 38) keys['w'] = true
  if (e.keyCode == 37) keys['a'] = true
  if (e.keyCode == 39) keys['d'] = true
  keys[e.key.toLowerCase()] = true
  if (keys['j'] && p.highestLevel >= p.level && p.level != 0) {p.jumpBot = !p.jumpBot}
  if (keys['g']) {colorGame = 'lime'}
  if (keys['p']) {colorGame = 'purple'}
  if (keys['r']) {colorGame = 'red'}
  if (keys['i']) {p.highestLevel = 1337}
  if (keys['b'] && p.highestLevel >= 20) {p.rainbowMode = !p.rainbowMode; if (!p.rainbowMode) {changeGameColor(colorGame)}}
  if (keys['k'] && p.level - 1 > 0 && p.level > 0) {p.level -= 1; loadLevel();}
  if (keys['l'] && p.level <= p.highestLevel && p.level + 1 < 21 && p.level > 0) {p.level += 1; loadLevel();}
  if ((keys['w'] || keys[' '] || keys['d'] ||keys['a']) && !p.paused) {p.frozen = false}
  if (keys['escape'] && p.level > 0) {
        if (p.paused) {document.querySelector('.resumePaused').click();} 
        else {p.paused = true; p.frozen = true; document.querySelector('.pauseScreenMenu').classList.remove('hide')}
  } 
//   if (keyN === 'w') {p.v.y = p.jumpS}
//   if (keyN === 'd') {p.v.x = p.s}
//   if (keyN === 'a') {p.v.x = -p.s}
//   if (keyN === 'w' || keyN === 'd' || keyN === 'a') {p.frozen = false}
//   if (keyN === 'x') {p.cx = p.x, p.cy = p.y}
//   if (keyN === 'j') {p.jumpBot = !p.jumpBot}
})

window.addEventListener('keyup', (e) => {
    if (e.keyCode == 38) keys['w'] = false
    if (e.keyCode == 37) keys['a'] = false
    if (e.keyCode == 39) keys['d'] = false
  keys[e.key.toLowerCase()] = false
})

function executeInputs() {
  if (keys['w'] || keys[' ']) {p.v.y = p.jumpS}
  if (keys['d']) {p.v.x = p.s}
  if (keys['a']) {p.v.x = -p.s}
  if (keys['x'] && p.level > 0) {p.cx = p.x, p.cy = p.y}
}

function setup() {
    document.querySelector('.title').click()
    document.querySelector('.loadingWayThere').classList.add('loading')

    createCanvas(1500,600,false);
    // if (localStorage.getItem('levelNumDieGame')) {p.level = parseInt(localStorage.getItem('levelNumDieGame'))} else {p.level = 1}
    // if (localStorage.getItem('deathsNumDieGame')) {p.deaths = parseInt(localStorage.getItem('deathsNumDieGame'))} else {p.deaths = 0}
    if (localStorage.getItem('levelNumDieGame')) p.deaths = parseInt(localStorage.getItem('deathsNumDieGame'))
    if (localStorage.getItem('highestLevelNumDieGame')) p.highestLevel = parseInt(localStorage.getItem('highestLevelNumDieGame'));
    if (!localStorage.getItem('levelNumDieGame')) {
        document.querySelector('.resume').classList.add('unavaible')
    }
    createMap();
    setTimeout(()=> {
        init();
        if (p.highestLevel >= 20 && !p.levelSSSBeaten) {createSubtitles("WELCOME TO MY GAME PLA- ...                                                         WHAT IS THAT THING ON THE RIGHT SIDE???                           DOESN'T MATTER. JUST DO NOT TOUCH IT!!!")} else {createSubtitles('WELCOME TO MY GAME PLAYER! READY TO HAVE SOME FUN?')}
    },5)
    // if (p.highestLevel >= 20 && !p.levelSSSBeaten) {createSubtitles("WELCOME TO MY GAME PLA- ... WHAT IS THAT THING ON THE RIGHT SIDE??? DOESN'T MATTER. JUST DO NOT TOUCH IT!!!")}
    loadLevel();
    backgroundColor(0)
    document.querySelector('.start').addEventListener('click', () => {
        document.querySelector('.settingsMenu').classList.remove('show')
        if (localStorage.getItem('levelNumDieGame')) {
            document.querySelector('.startConfirmation').classList.add('show')
        } else {
            localStorage.setItem('levelNumDieGame',1)
            localStorage.setItem('deathsNumDieGame',0)
            localStorage.setItem('highestLevelNumDieGame',0)
            p.level = 1; 
            p.deaths = 0; 
            p.highestLevel = 0;
            loadLevel();
            p.jumpBot = false; 
            document.querySelector('.mainScreenMenu').classList.add('hide')
        }
    })
    document.querySelector('.startConfirm').addEventListener('click', () => {
        document.querySelector('.startConfirmation').classList.remove('show')
        p.level = 1; 
        p.deaths = 0; 
        p.highestLevel = 0;
        localStorage.setItem('levelNumDieGame',1)
        localStorage.setItem('deathsNumDieGame',0)
        localStorage.setItem('highestLevelNumDieGame',0)
        loadLevel();
        p.jumpBot = false; 
        document.querySelector('.mainScreenMenu').classList.add('hide')
    })
    document.querySelector('.startCancel').addEventListener('click', () => {
        document.querySelector('.startConfirmation').classList.remove('show')
    })
    document.querySelector('.resume').addEventListener('click', () => {
        p.level = parseInt(localStorage.getItem('levelNumDieGame'))
        p.deaths = parseInt(localStorage.getItem('deathsNumDieGame'))
        loadLevel();
        p.jumpBot = false;
        document.querySelector('.mainScreenMenu').classList.add('hide')
    }) 
    document.querySelector('.volumeSlider').oninput = function() {
        audio.volume = this.value/100;
        hellThemedSoundTrack.volume = this.value / 100;
        if (p.level != 666) audio.play()
        document.querySelector('.volumeSliderNumber').textContent = this.value
        localStorage.setItem('volumeNumDieGame', this.value)
    }
    deathSound = new Audio('./splash-death-splash-46048.mp3');
    document.querySelector('.sfxSlider').oninput = function() {
        deathSound.volume = this.value/100;
        document.querySelector('.sfxSliderNumber').textContent = this.value
        localStorage.setItem('sfxNumDieGame', this.value)
    }
    document.querySelector('.settings').addEventListener('click', () => {
        document.querySelector('.settingsMenu').classList.add('show')
        document.querySelector('.startConfirmation').classList.remove('show')
    })
    document.querySelector('.closeSettings').addEventListener('click', () => {
        document.querySelector('.settingsMenu').classList.remove('show')
    })
    document.querySelector('.retroEffect').oninput = function() {
        if (this.checked) p.retroEffect = true;
        if (!this.checked) p.retroEffect = false;
        localStorage.setItem('retroEffect', this.checked)
    }
    document.querySelector('.showFPS').oninput = function() {
        if (this.checked) p.showFPS = true;
        if (!this.checked) p.showFPS = false;
        localStorage.setItem('showFPS', this.checked)
    }
    document.querySelector('.resumePaused').addEventListener('click', () => {
        document.querySelector('.pauseScreenMenu').classList.add('hide')
        p.paused = false;
        document.querySelector('.settingsMenu').classList.remove('show')
    });
    document.querySelector('.mainMenu').addEventListener('click', () => {
        p.level = 0;
        p.paused = false;
        if (hellTrackRunning) {playAudio();fadeOutHellAudio()}
        changeGameColor(colorGame)
        document.querySelector('.mainScreenMenu').classList.remove('hide');
        document.querySelector('.pauseScreenMenu').classList.add('hide');
        if (p.highestLevel >= 20 && !p.levelSSSBeaten) {createSubtitles("WELCOME TO MY GAME PLA-             ... WHAT IS THAT THING ON THE RIGHT SIDE??? DOESN'T MATTER. JUST DO NOT TOUCH IT!!!")}
        loadLevel();
        document.querySelector('.settingsMenu').classList.remove('show')
    });
    document.querySelector('.settingsPaused').addEventListener('click', () => {
        document.querySelector('.settingsMenu').classList.add('show')
    })
    document.querySelectorAll('.levelCel').forEach( levelBtn => {
        levelBtn.addEventListener('click', () =>{
            document.querySelector('.mapScreenMenu').classList.add('hide')
            document.querySelector('.resumePaused').click()
            document.querySelector('.settingsMenu').classList.remove('show')
            document.querySelector('.mainScreenMenu').classList.add('hide')
            p.level = parseInt(levelBtn.dataset.level);
            p.jumpBot = false;
            loadLevel()
        });
    })
    document.querySelector('.selectLevel').addEventListener('click', () => {
        document.querySelector('.mapScreenMenu').classList.remove('hide')
        createSubtitles(`THIS IS THE MAP. FROM HERE YOU CAN CHOOSE WHICH LEVEL YOU WANT TO PLAY. TO UNLOCK MORE LEVELS YOU NEED TO BEAT THE ONES YOU HAVE ALREADY UNLOCKED :) LOOKS LIKE IS TIME TO BEAT LEVEL ${p.highestLevel + 1}`)
    })
    document.querySelector('.selectLevelPaused').addEventListener('click', () => {
        document.querySelector('.mapScreenMenu').classList.remove('hide')
    })
    document.querySelector('.closeMap').addEventListener('click', () => {
        document.querySelector('.mapScreenMenu').classList.add('hide')
    })
}

function draw() {
    if (p.started && !p.paused) {
        executeInputs()
        jumpBot();
        backgroundColor(0);
        calculateVelocities();
        checkOutOfBoundries();
        drawObsticles();
        drawCheckPoint();
        drawPlayer();
        checkForDeath();
        drawStats(); 
        saveStats();
        createMap()
        if (p.retroEffect) drawRetro()
        if (p.rainbowMode) {rainbowColor = `hsl(${p.rainbow}, 100%, 50%)`; p.rainbow += 5 * 60/fps;}
        if (p.level == 666) {changeGameColor('red')} else if (p.rainbowMode) {changeGameColor(rainbowColor)} else {changeGameColor(colorGame)}
    }        
}

function calculateVelocities() {
    let tps = p.ticks/fps;
    if (!p.frozen) {
        p.y += -p.v.y*tps;
        p.v.y -= p.g*tps;
        p.v.x = p.v.x - p.v.x*tps * p.dacc;
        p.x += p.v.x*tps;
    }
}

function checkOutOfBoundries() {
    if (!rectRectCollisionCheck(0,0,width,height-20,p.x,p.y,p.w,p.y)) killPlayer()
}

function checkForDeath() {
    let dead = false;
    obsticles.forEach(obsticle => {
        if (obsticle.s === 'rect') {
            if (rectRectCollisionCheck(obsticle.x,obsticle.y,obsticle.w,obsticle.h,p.x,p.y,p.w,p.h)) {
                if (obsticle.f) {
                    if (p.highestLevel < p.level) p.highestLevel = p.level;
                    if (p.level < 20) {p.level += 1;} else {p.level = 1337;}
                    p.jumpBot = false; 
                    createMap();
                    loadLevel()
                } else if (obsticle.sss) {
                    p.level = 666;
                    loadLevel();
                    p.jumpBot = false; 
                    document.querySelector('.mapScreenMenu').classList.add('hide')
                    document.querySelector('.resumePaused').click()
                    document.querySelector('.settingsMenu').classList.remove('show')
                    document.querySelector('.mainScreenMenu').classList.add('hide')
                } else { dead = true }
            }   
        } else if (obsticle.s === 'tri') {
            if(triRectCollisionCheck(obsticle.p1,obsticle.p2,obsticle.p3,p.x,p.y,p.w,p.h)) {
                dead = true
            }
        }
        
    })
    if (dead) killPlayer()
}

function drawPlayer() {
    createRect(p.x,p.y,p.w,p.h,'red')
}

function drawCheckPoint() {
    createRect(p.cx,p.cy,p.w,p.h,'yellow')
}

function drawRetro() {
    for (var i = 0; i < height / 2; i++) {
        createRect(0,i*4,width,2,'black')
    }
}

function killPlayer() {
    resetPlayer(); p.deaths += 1;
    if (p.deaths == 10) createSubtitles(`AFTER YOUR FIRST 10 DEATHS YOU REACHED LEVEL .               .            .           ${p.highestLevel+1} NOT BAD!`)
    if (p.deaths == 25) createSubtitles("AND... POOF. JUST LIKE THAT YOU HAVE GONE THROUGH YOUR FIRST 25 DEATHS.")
    if (p.deaths == 50) createSubtitles("CONGRATIOLATIONS PLAYER ON YOUR FIRST 50 DEATHS. IM SURE THERE ARE MANY MORE TO COME.")
    if (p.deaths == 100) createSubtitles("WOW. YOu ARE ALREADY AT A 100. IM CURIOUS TO SEE HOW MANY DEATHS YOU WOULD HAVE BY THE END OF THIS.")
    if (p.deaths == 250) createSubtitles("250 DEATHS.         THAT NUMBER JUST KEEPS GROWING AND GROWING.")
    if (p.deaths == 500) createSubtitles("I SEE YOU ARE NOT QUITING ANYTIME SOON. 500 HUNDRED DEATHS EVERYBODY. FIVE ZERO ZERO.")
    if (p.deaths == 1000) createSubtitles("AND.... DRUM ROLL PLEASE.... A THOUSAND!!! CONGRATIOLATIONS PLAYER. THAT IS SOME SERIOUS DEDICATION TO THE GAME. IM PROUD OF YOU!")
    if (p.deaths == 2000) createSubtitles("2000. THAT WAS THE AMOUNT OF ATTEMPTS IT TOOK ME TO COMPLETE THE LAST LEVEL. SO GOODLUCK!")
    if (p.deaths == 5000) createSubtitles("HOW DID WE GET HERE? 5000 THOUSAND DEATHS. IS INCREDIBLE TO SEE THAT YOU HAVEN'T QUIT YET!")
    if (p.deaths == 10000) createSubtitles("10000... DID YOU KNOW THAT IN VARIOUS CULTURES, THE NUMBER 10000 IS CONSIDERED A SYMBOLIC VALUE FOR COMPLETENESS OR A LARGE, COMPREHENSIVE AMOUNT. SO CONGRATS ON THAT. IM SURE YOU AREN'T QUITING ANYTIME SOON.")
    if (p.deaths == 20000) createSubtitles("20000. YOU DESERVE A MEDAL FOR YOUR DEDICATION. AND YOU TRULY        CAN'T          STOP       NOW!!!")
    deathSound.currentTime = 0;
    deathSound.play();
}

function resetPlayer() {
    p.x = p.cx;
    p.y = p.cy;
    p.frozen = true;
    p.v = {x:0,y:0}
}

function drawObsticles() {
    obsticles.forEach(obsticle => {
        if (obsticle.s === 'rect') {
            let c = renderingColor
            if (obsticle.f) c = 'blue'
            if (obsticle.sss) c = 'red'
            createRect(obsticle.x,obsticle.y,obsticle.w,obsticle.h, c)
        } else if(obsticle.s === 'tri') {
            createTriangle(obsticle.p1[0],obsticle.p1[1],obsticle.p2[0],obsticle.p2[1],obsticle.p3[0],obsticle.p3[1], renderingColor)
        }
        
    })
}

function jumpBot() {
    if (p.jumpBot && p.v.y < 0 && (p.highestLevel >= p.level || p.level == 0)) {
    let dead = false;
    obsticles.forEach(obsticle => {
        if (obsticle.s === 'rect') {
            if (rectRectCollisionCheck(obsticle.x,obsticle.y,obsticle.w,obsticle.h,p.x+p.v.x,p.y-p.v.y,p.w,p.h)) {
                if (obsticle.f || obsticle.sss) {}
                else { dead = true }
            }   
        } else if (obsticle.s === 'tri') {
            if(triRectCollisionCheck(obsticle.p1,obsticle.p2,obsticle.p3,p.x+p.v.x,p.y-p.v.y,p.w,p.h)) {
                dead = true
            }
        }
        
    })
    if (!rectRectCollisionCheck(0,0,width,height-20,p.x+p.v.x,p.y-p.v.y,p.w,p.y)) dead = true
    if (dead) p.v.y = p.jumpS;

}
    if (p.jumpBot && p.v.x < 0 && (p.highestLevel >= p.level || p.level == 0)) {
        let dead = false;
        obsticles.forEach(obsticle => {
            if (obsticle.s === 'rect') {
                if (rectRectCollisionCheck(obsticle.x,obsticle.y,obsticle.w,obsticle.h,p.x+p.v.x*2,p.y,p.w,p.h)) {
                    if (obsticle.f || obsticle.sss) {}
                    else { dead = true }
                }   
            } else if (obsticle.s === 'tri') {
                if(triRectCollisionCheck(obsticle.p1,obsticle.p2,obsticle.p3,p.x+p.v.x*2,p.y,p.w,p.h)) {
                    dead = true
                }
            }
            
        })
        if (!rectRectCollisionCheck(0+20,0,width,height,p.x-p.v.x,p.y,p.w,p.y)) dead = true
        if (dead) p.v.x = p.s;
    }
    if (p.jumpBot && p.v.x > 0 && (p.highestLevel >= p.level || p.level == 0)) {
        let dead = false;
        obsticles.forEach(obsticle => {
            if (obsticle.s === 'rect') {
                if (rectRectCollisionCheck(obsticle.x,obsticle.y,obsticle.w,obsticle.h,p.x+p.v.x*2,p.y,p.w,p.h)) {
                    if (obsticle.f || obsticle.sss) {}
                    else { dead = true }
                }   
            } else if (obsticle.s === 'tri') {
                if(triRectCollisionCheck(obsticle.p1,obsticle.p2,obsticle.p3,p.x+p.v.x*2,p.y,p.w,p.h)) {
                    dead = true
                }
            }
            
        })
        if (!rectRectCollisionCheck(0,0,width-20,height,p.x-p.v.x,p.y,p.w,p.y)) dead = true
        if (dead) p.v.x = -p.s;
    }
    if (p.jumpBot && p.v.y > 0 && (p.highestLevel >= p.level || p.level == 0)) {
        let dead = false;
    obsticles.forEach(obsticle => {
        if (obsticle.s === 'rect') {
            if (rectRectCollisionCheck(obsticle.x,obsticle.y,obsticle.w,obsticle.h,p.x+p.v.x,p.y-p.v.y,p.w,p.h)) {
                if (obsticle.f || obsticle.sss) {}
                else { dead = true }
            }   
        } else if (obsticle.s === 'tri') {
            if(triRectCollisionCheck(obsticle.p1,obsticle.p2,obsticle.p3,p.x+p.v.x,p.y-p.v.y,p.w,p.h)) {
                dead = true
            }
        }
        
    })
    if (!rectRectCollisionCheck(0,20,width,height,p.x+p.v.x,p.y-p.v.y,p.w,p.y)) dead = true
    if (dead) p.v.y = -p.jumpS;
    }
}

function loadLevel() {
    p.cx = 30; p.cy = 550;
    if (p.level == 0) {
        p.cx = 750;p.cy = 300;
        if (p.highestLevel >= 20)  {
            obsticles = [
                {s:'rect',x:1420,y:300,w:50,h:50, sss: true}
            ];
            document.querySelector('.level666').classList.add('show');
        } else {
            obsticles = [

            ];
            document.querySelector('.level666').classList.remove('show');
        }
    } else if (p.level == 1) {
        //verified
        createSubtitles("WELCOME TO THE FIRST LEVEL, PLAYER. REACH THE BLUE SQUARE TO COMPLETE IT.");
        obsticles = [
            {s:'rect',x:0,y:0,w:350,h:350},
            {s:'tri',p1:[350,350],p2:[350,0],p3:[700,0]},
            {s:'tri',p1:[700,600],p2:[1050,250],p3:[1050,600]},
            {s:'rect',x:1050,y:250,w:450,h:350},
            {s:'rect',x:1420,y:50,w:50,h:50,f:true}
        ]
    } else if (p.level == 2) {
        //verified
        createSubtitles("CONGRATIOLATIONS PLAYER! YOU MADE IT TO THE SECOND LEVEL! ONLY 18 MORE TO GO!");
        obsticles = [
            {s:'rect',x:0,y:400,w:1350,h:20},
            {s:'rect',x:150,y:200,w:1350,h:20},
            {s:'rect',x:1420,y:50,w:50,h:50,f:true}
        ]
    } else if(p.level == 3) {
        createSubtitles("LEVEL 3 - NOTHING TOO HARD RIGHT?");
        obsticles = [
            // {s:'rect',x:100,y:170,w:20,h:430},
            // {s:'rect',x:300,y:0,w:20,h:430},
            // // {s:'rect',x:500,y:170,w:20,h:430},
            // // {s:'rect',x:500,y:170,w:500,h:20},
            // {s:'tri',p1:[500,600],p2:[500,170],p3:[1000,170]},
            // {s:'rect',x:1200,y:0,w:20,h:430},
            // {s:'tri',p1:[900,430],p2:[1200,170],p3:[1200,430]},
            // {s:'rect',x:1420,y:50,w:50,h:50,f:true}
            {s:'tri',p1:[0,450],p2:[0,0],p3:[100,0]},
            {s:'tri',p1:[280,150],p2:[180,600],p3:[380,600]},
            {s:'tri',p1:[560,450],p2:[460,0],p3:[660,0]},
            {s:'tri',p1:[840,150],p2:[740,600],p3:[940,600]},
            {s:'tri',p1:[1120,450],p2:[1020,0],p3:[1220,0]},
            {s:'tri',p1:[1400,150],p2:[1300,600],p3:[1400,600]},
            {s:'rect',x:1425,y:535,w:50,h:50,f:true}
        ]
    } else if(false) {
        obsticles = [

        ];
    } else if (p.level == 4) {
        createSubtitles("THIS LEVELS SEEMS KIND OF FAMILIAR.");
        obsticles = [
            {s:'rect',x:100,y:0,w:150,h:20},
            {s:'rect',x:100,y:170,w:150,h:430},
            {s:'rect',x:400,y:0,w:150,h:400},
            {s:'rect',x:400,y:550,w:150,h:50},
            {s:'rect',x:700,y:0,w:150,h:225},
            {s:'rect',x:700,y:375,w:150,h:225},
            {s:'rect',x:1000,y:180,w:150,h:250},
            {s:'rect',x:1000,y:580,w:150,h:30},
            {s:'rect',x:1000,y:0,w:150,h:30},
            {s:'rect',x:1300,y:150,w:20,h:450},
            {s:'rect',x:1385,y:535,w:50,h:50,f:true}
        ]
    } else if(p.level == 5) {
        //verified
        createSubtitles("IS BEGINNING TO GET HARD RIGHT?");
        obsticles = [
            {s:'rect',x:100,y:150,w:20,h:450},
            {s:'tri',p1:[0,500],p2:[0,400],p3:[50,450]},
            {s:'tri',p1:[100,400],p2:[100,300],p3:[50,350]},
            {s:'tri',p1:[0,300],p2:[0,200],p3:[50,250]},
            {s:'tri',p1:[100,200],p2:[100,150],p3:[50,150]},
            {s:'tri',p1:[1400,250],p2:[1400,150],p3:[1450,200]},
            {s:'tri',p1:[1500,350],p2:[1500,250],p3:[1450,300]},
            {s:'tri',p1:[1400,450],p2:[1400,350],p3:[1450,400]},
            {s:'tri',p1:[1500,150],p2:[1500,50],p3:[1450,100]},
            {s:'tri',p1:[120,150],p2:[100,600],p3:[1180,600]},
            {s:'tri',p1:[300,0],p2:[1380,450],p3:[1380,0]},
            {s:'rect',x:1380,y:0,w:20,h:450},
            {s:'rect',x:1425,y:0,w:50,h:50,f:true}
        ];
    } else if (p.level == 6 ) {
        createSubtitles("THIS LEVEL IS RATED HARD. BUT I BELIEVE IN YOU. YOU CAN DO IT!")
         // verified
         obsticles = [
            {s:'rect',x:100,y:0,w:20,h:200},
            {s:'rect',x:100,y:400,w:20,h:200},
            {s:'tri',p1:[120,400],p2:[120,600],p3:[800,600]},
            {s:'tri',p1:[120,0],p2:[120,200],p3:[800,0]},
            {s:'rect',x:1400,y:250,w:100,h:100,f:true},
            {s:'tri',p1:[1500,0],p2:[1500,300],p3:[800,0]}, 
            {s:'rect',x:270,y:0,w:20,h:350},
            {s:'rect',x:420,y:210,w:20,h:410},
            {s:'rect',x:570,y:0,w:20,h:430},
            {s:'rect',x:720,y:120,w:20,h:500},
            {s:'rect',x:870,y:0,w:20,h:430},
            {s:'rect',x:1020,y:200,w:20,h:400},
            {s:'rect',x:1170,y:0,w:20,h:320},
            {s:'tri',p1:[1500,600],p2:[1500,300],p3:[800,600]},
            // {s:'rect',x:800,y:400,w:20,h:200},
        ]
    } else if (p.level == 7) {
        createSubtitles("LET ME SEE WHAT YOU GOT. DON'T DISAPPOINT ME!")
        obsticles = [
            {s:'rect',x:100,y:130,w:20,h:470},
            {s:'rect',x:400,y:0,w:20,h:470},
            {s:'rect',x:100,y:130,w:170,h:20},
            {s:'rect',x:370,y:130,w:30,h:20},
            {s:'rect',x:220,y:280,w:180,h:20},
            {s:'tri',p1:[220,300],p2:[400,300],p3:[400,400]},
            {s:'tri',p1:[120,370],p2:[120,470],p3:[300,470]},
            {s:'tri',p1:[420,600],p2:[1100,600],p3:[760,470]},
            {s:'tri',p1:[420,470],p2:[420,340],p3:[760,340]},
            {s:'tri',p1:[1100,470],p2:[1100,340],p3:[760,340]},
            {s:'rect',x:1170,y:450,w:20,h:150},
            {s:'rect',x:1240,y:340,w:20,h:150},
            {s:'rect',x:1240,y:490,w:80,h:20},
            {s:'rect',x:1320,y:410,w:60,h:20},
            {s:'tri',p1:[1310,340],p2:[1310,250],p3:[700,340]},
            {s:'tri',p1:[420,340],p2:[420,270],p3:[820,340]},
            {s:'tri',p1:[600,150],p2:[760,150],p3:[760,220]},
            {s:'tri',p1:[1100,150],p2:[760,150],p3:[760,220]},
            {s:'rect',x:1380,y:130,w:20,h:470},
            {s:'rect',x:500,y:130,w:900,h:20},
            {s:'rect',x:1425,y:535,w:50,h:50,f:true}
        ];
    } else if (p.level == 8) {
        createSubtitles("THIS LEVEL TOOK ME A LONG TIME TO BUILD. PLEASE STAY HERE FOR AT LEAST 100 DEATHS")
        obsticles = [
            {s:'tri',p1:[100,600],p2:[150,600],p3:[200,100]},
            {s:'tri',p1:[400,0],p2:[1200,0],p3:[1200,100]}, // 800 100
            {s:'tri',p1:[1150,450],p2:[1200,100],p3:[1200,450]},//-50 350 
            {s:'tri',p1:[1150,450],p2:[300,450],p3:[300,350]}, //850 100
            {s:'tri',p1:[200,100],p2:[400,250],p3:[1100,212]},
            {s:'tri',p1:[1100,212],p2:[400,250],p3:[1075,339]},
            {s:'tri',p1:[300,450],p2:[300,270],p3:[250,450]},
            {s:'tri',p1:[140,550],p2:[140,600],p3:[1200,600]}, // 1060 50
            {s:'tri',p1:[250,450],p2:[1200,450],p3:[1200,500]},
            {s:'tri',p1:[0,500],p2:[0,0],p3:[100,0]},
            {s:'tri',p1:[1500,600],p2:[1500,500],p3:[1200,600]},
            {s:'tri',p1:[1500,150],p2:[1500,500],p3:[1300,200]},
            {s:'tri',p1:[1350,450],p2:[1200,500],p3:[1200,200]},
            {s:'tri',p1:[1200,0],p2:[1350,0],p3:[1200,150]},
            {s:'rect',x:1420,y:50,w:50,h:50,f:true}
        ];
    } else if (p.level == 9) {
        createSubtitles('LEVEL9. SOOOOOOOOOOOOOOOOOOOOOOOOOO CURVY. AM I RIGHT?')
        obsticles = [
            {s:'tri',p1:[100,450],p2:[200,600],p3:[800,350]},
            {s:'tri',p1:[1100,260],p2:[600,120],p3:[800,350]},
            {s:'tri',p1:[100,120],p2:[605,120],p3:[580,150]},
            {s:'tri',p1:[0,330],p2:[0,250],p3:[550,270]},
            {s:'tri',p1:[1300,130],p2:[600,0],p3:[1300,0]},
            {s:'tri',p1:[1300,400],p2:[1200,0],p3:[1400,0]},
            {s:'tri',p1:[1300,400],p2:[850,470],p3:[1300,300]},
            {s:'tri',p1:[550,450],p2:[200,600],p3:[850,600]},
            {s:'tri',p1:[1350,530],p2:[1500,600],p3:[850,600]},
            {s:'tri',p1:[1350,530],p2:[1500,600],p3:[1500,400]},
            {s:'tri',p1:[1300,400],p2:[1450,250],p3:[1300,250]},
            {s:'tri',p1:[1430,130],p2:[1500,130],p3:[1500,200]},
            {s:'rect',x:1420,y:50,w:50,h:50,f:true}
        ];
    } else if (p.level == 10) {
    createSubtitles("LEVEL 10! HALFWAY THERE!!!                                                             RIGHT?")
       obsticles = [
            {s:'tri',p1:[100,600],p2:[1500,600],p3:[1500,500]},
            {s:'tri',p1:[0,500],p2:[1400,400],p3:[0,300]},
            {s:'tri',p1:[1500,300],p2:[100,200],p3:[1500,100]},
            {s:'tri',p1:[0,0],p2:[0,100],p3:[1400,0]},
            {s:'rect',x:1420,y:20,w:50,h:50,f:true}
        ];
    } else if (p.level == 11) {
        createSubtitles("THIS IS IT. YOUR FIRST INSANE RATED LEVEL. EVERYTHING UP TO THIS POINT WAS EASY. LET'S SEE IF YOU CAN BEAT IT.")
    } else if(p.level == 15) {
        
    } else if (p.level == 19) {
        obsticles = [
            {s:'rect',x:80,y:50,w:20,h:550},
            {s:'rect',x:30,y:400,w:20,h:100},
            {s:'rect',x:0,y:250,w:20,h:100},
            {s:'rect',x:60,y:250,w:20,h:100},
            {s:'rect',x:30,y:100,w:20,h:100},
            {s:'rect',x:100,y:140,w:1370,h:20},
            {s:'rect',x:130,y:270,w:1370,h:20},
            {s:'rect',x:100,y:390,w:1370,h:20},
            {s:'rect',x:130,y:500,w:1370,h:20},
            {s:'rect',x:1420,y:535,w:50,h:50,f:true}
        ]
    } else if(p.level == 20) {
        createSubtitles("THIS IS IT! LEVEL 20. THE GRAND FINALE. THE END OF THE GAME. THAT BLUE SQUARE THERE IS THE FINISH LINE AND NOW ALL YOU NEED TO DO IS CROSS IT AND IS GG'S. GOODLUCK!")
        // verified
        obsticles = [
            {s:'rect',x:100,y:60,w:20,h:540},
            {s:'rect',x:200,y:0,w:20,h:500},
            {s:'rect',x:0,y:480,w:70,h:20},
            // {s:'rect',x:160,y:480,w:60,h:20},
            {s:'rect',x:0,y:100,w:70,h:20},
            {s:'rect',x:160,y:100,w:40,h:20},
            // {s:'rect',x:300,y:170,w:150,h:180},
            {s:'tri',p1:[300,350],p2:[450,350],p3:[450,500]},
            {s:'tri',p1:[300,350],p2:[450,350],p3:[450,200]},
            {s:'tri',p1:[200,370],p2:[200,170],p3:[320,260]},
            {s:'rect',x:30,y:290,w:140,h:20},
            {s:'rect',x:200,y:0,w:20,h:500},
            {s:'rect',x:200,y:0,w:1000,h:90},
            {s:'rect',x:160,y:480,w:190,h:20},
            {s:'tri',p1:[220,480],p2:[350,480],p3:[220,350]},
            {s:'rect',x:450,y:170,w:300,h:430},
            {s:'rect',x:830,y:430,w:20,h:50},
            {s:'rect',x:830,y:550,w:20,h:50},
            {s:'tri',p1:[600,415],p2:[300,170],p3:[1000,170]},
            {s:'rect',x:1200,y:0,w:20,h:430},
            {s:'rect',x:1015,y:520,w:20,h:80},
            {s:'rect',x:1200,y:430,w:20,h:70},
            {s:'tri',p1:[1220,500],p2:[1420,400],p3:[1220,300]},
            {s:'tri',p1:[1500,600],p2:[1300,600],p3:[1500,500]},
            {s:'tri',p1:[1500,300],p2:[1300,200],p3:[1500,100]},
            {s:'tri',p1:[1220,0],p2:[1420,0],p3:[1220,100]},
            {s:'tri',p1:[800,430],p2:[1200,170],p3:[1200,430]},
            // {s:'tri',p1:[850,550],p2:[850,600],p3:[1000,600]},
            // {s:'tri',p1:[850,480],p2:[850,430],p3:[1000,430]},
            {s:'rect',x:1420,y:50,w:50,h:50,f:true}
        ]
    } else if(p.level == 666) {
        fadeOutAudio()
        setTimeout(() => {
            playHellAudio();
        },4000)
        createSubtitles('WELCOME TO LEVEL 666, PLAYER! HERE YOU WILL MEET YOUR DESTINY! THIS LEVEL WAS MADE FOR THE ONES WHO REALLY WANT A CHALLENGE. IT CONTAINS SOME OF THE HARDEST MANEUVERS THIS SEEMINGLY SIMPLE GAME HAS TO OFFER. GOOD LUCK YOU WILL NEED IT!')
        obsticles = [
            {s:'rect',x:80,y:100,w:2,h:500},
            {s:'rect',x:80,y:250,w:340,h:2},
            {s:'rect',x:250,y:168,w:135,h:2},
            {s:'rect',x:250,y:0,w:2,h:170},
            {s:'rect',x:420,y:100,w:2,h:250},
            {s:'rect',x:420,y:100,w:320,h:2},
            {s:'rect',x:620,y:50,w:2,h:340},
            {s:'rect',x:520,y:50,w:2,h:50},
            {s:'rect',x:820,y:0,w:2,h:520},
            {s:'rect',x:770,y:230,w:50,h:290},
            {s:'rect',x:420,y:518,w:340,h:2},
            {s:'rect',x:510,y:160,w:20,h:360},
            {s:'rect',x:230,y:250,w:20,h:120},
            {s:'rect',x:160,y:390,w:20,h:60},
            {s:'rect',x:120,y:390,w:40,h:20},
            {s:'tri',p1:[80,100],p2:[140,100],p3:[80,250]},
            {s:'tri',p1:[250,250],p2:[80,220],p3:[80,250]},
            {s:'tri',p1:[250,100],p2:[250,170],p3:[190,100]},
            {s:'tri',p1:[180,150],p2:[250,170],p3:[190,100]},
            {s:'tri',p1:[250,150],p2:[250,170],p3:[330,170]},
            {s:'tri',p1:[420,110],p2:[420,80],p3:[300,80]},
            {s:'tri',p1:[820,0],p2:[820,30],p3:[620,0]},
            {s:'tri',p1:[820,160],p2:[820,230],p3:[670,230]},
            {s:'tri',p1:[770,375],p2:[770,230],p3:[670,230]},
            {s:'tri',p1:[770,375],p2:[770,520],p3:[720,520]},
            {s:'tri',p1:[620,290],p2:[690,420],p3:[620,420]},
            {s:'tri',p1:[620,390],p2:[570,390],p3:[620,420]},
            {s:'tri',p1:[420,520],p2:[420,450],p3:[620,520]},
            {s:'tri',p1:[520,520],p2:[520,420],p3:[420,450]},
            {s:'tri',p1:[530,370],p2:[580,250],p3:[530,250]},
            {s:'tri',p1:[620,160],p2:[560,160],p3:[620,210]},
            {s:'tri',p1:[420,160],p2:[465,160],p3:[420,210]},
            {s:'tri',p1:[420,300],p2:[420,350],p3:[480,350]},
            {s:'tri',p1:[420,250],p2:[420,350],p3:[380,250]},
            {s:'tri',p1:[250,370],p2:[300,350],p3:[350,250]},
            {s:'tri',p1:[250,370],p2:[250,250],p3:[350,250]},
            {s:'tri',p1:[420,520],p2:[420,450],p3:[160,450]}, // 260 70
            {s:'tri',p1:[380,450],p2:[360,330],p3:[350,450]},
            {s:'tri',p1:[230,370],p2:[230,250],p3:[180,250]},
            {s:'tri',p1:[80,540],p2:[420,600],p3:[80,600]},
        ]
    } else if(p.level == 1337) {
        obsticles = [
               
        ]
    }
    resetPlayer()
}

function init() {
    audio = new Audio('./2021-08-16_-_8_Bit_Adventure_-_www.FesliyanStudios.com.mp3')
    hellThemedSoundTrack = new Audio('./darkess-118749.mp3')
    hellThemedSoundTrack.currentTime = 0;
    audio.currentTime = 0;
    
    // audio.play()
    document.querySelector('.loadingContainer').remove()
    p.started = true;
    // setTimeout(() => {
    //     audio.addEventListener('ended', () => {
    //         audio.currentTime = 0;
    //         audio.play()
    //     })
    // }, 2000)
    if (localStorage.getItem('volumeNumDieGame')) {
        audio.volume = parseInt(localStorage.getItem('volumeNumDieGame'))/100;
        hellThemedSoundTrack.volume = audio.volume;
        document.querySelector('.volumeSlider').value = audio.volume*100;
        document.querySelector('.volumeSliderNumber').textContent = audio.volume*100;
    } else { document.querySelector('.volumeSlider').value = 100; document.querySelector('.volumeSliderNumber').textContent = 100;}
    if (localStorage.getItem('sfxNumDieGame')) {
        deathSound.volume = parseInt(localStorage.getItem('sfxNumDieGame'))/100;
        document.querySelector('.sfxSlider').value = deathSound.volume*100;
        document.querySelector('.sfxSliderNumber').textContent = deathSound.volume*100;
    } else { document.querySelector('.sfxSlider').value = 100; document.querySelector('.sfxSliderNumber').textContent = 100;}
    if (localStorage.getItem('retroEffect') === 'false') { p.retroEffect = false; document.querySelector('.retroEffect').checked = false;}
    if (localStorage.getItem('showFPS') === 'false') { p.showFPS = false; document.querySelector('.showFPS').checked = false;}
    if (localStorage.getItem('colorNumDieGame')) { colorGame =  localStorage.getItem('colorNumDieGame');}
    playAudio()
}

function playAudio() {
    audio.play();
    const fadeDuration = 3000; // in milliseconds
    const interval = 10; // interval for increasing volume
    const steps = fadeDuration / interval;
    const stepSize = audio.volume / steps;

    let currentStep = 0;
    audio.volume = 0

    const fadeInterval = setInterval(function() {
      if (currentStep < steps) {
        audio.volume += stepSize;
        currentStep++;
      } else {
        clearInterval(fadeInterval);
      }
    }, interval);
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        audio.play()
    })
}

function playHellAudio() {
    hellTrackRunning = true;
    hellThemedSoundTrack.play();
    const fadeDuration = 3000; // in milliseconds
    const interval = 10; // interval for increasing volume
    const steps = fadeDuration / interval;
    const stepSize = hellThemedSoundTrack.volume / steps;

    let currentStep = 0;
    hellThemedSoundTrack.volume = 0

    const fadeInterval = setInterval(function() {
      if (currentStep < steps) {
        hellThemedSoundTrack.volume += stepSize;
        currentStep++;
      } else {
        clearInterval(fadeInterval);
      }
    }, interval);
    hellThemedSoundTrack.addEventListener('ended', () => {
        hellThemedSoundTrack.currentTime = 0;
        hellThemedSoundTrack.play()
    })
}


function fadeOutAudio() {
    // Decrease the volume gradually over time
    const fadeDuration = 3000; // in milliseconds
    const interval = 10; // interval for decreasing volume
    const steps = fadeDuration / interval;
    const stepSize = audio.volume / steps;

    let currentStep = 0;
    audio.volume = parseInt(localStorage.getItem('volumeNumDieGame'))/100;

    const fadeInterval = setInterval(function() {
      if (currentStep < steps) {
        audio.volume -= stepSize;
        currentStep++;
      } else {
        clearInterval(fadeInterval);
        audio.pause(); // Pause the audio when fade-out is complete
      }
    }, interval);
}

function fadeOutHellAudio() {
    hellTrackRunning = false;
    const fadeDuration = 3000; // in milliseconds
    const interval = 10; // interval for decreasing volume
    const steps = fadeDuration / interval;
    const stepSize = hellThemedSoundTrack.volume / steps;

    let currentStep = 0;
    hellThemedSoundTrack.volume = parseInt(localStorage.getItem('volumeNumDieGame'))/100;

    const fadeInterval = setInterval(function() {
      if (currentStep < steps) {
        hellThemedSoundTrack.volume -= stepSize;
        currentStep++;
      } else {
        clearInterval(fadeInterval);
        hellThemedSoundTrack.pause(); // Pause the audio when fade-out is complete
      }
    }, interval);
}

function drawStats() {
    // createRect(0,0,200,20,'black')
    // drawText(`level: ${p.level}/20, deaths: ${p.deaths},${fps}`,100,16,16,'white');
    document.querySelector('.level').textContent = `LEVEL:${p.level}/20`
    document.querySelector('.deaths').textContent = `DEATHS:${p.deaths}`
    if (p.showFPS) {document.querySelector('.fps').textContent =`FPS:${fps}`} else {document.querySelector('.fps').textContent = ''}
    if (p.jumpBot && p.level > 0) {document.querySelector('.JBOT').classList.add('show')} else {document.querySelector('.JBOT').classList.remove('show')}
}

function saveStats() {
    if (p.level != 0) { 
        localStorage.setItem('levelNumDieGame', p.level)
        localStorage.setItem('deathsNumDieGame', p.deaths) 
        localStorage.setItem('highestLevelNumDieGame', p.highestLevel) 
    }
    localStorage.setItem('colorNumDieGame', colorGame)
}

function createMap() {
    for (let j = 0; j < 20; j++) {
        document.querySelector(`.levelCel${j+1}`).classList.add('unavailable')
        if (j != 0) document.querySelector(`.connectorContainer :nth-child(${j+1})`).classList.add('hide')
    }
    for (let i = 0; i < p.highestLevel+1; i++) {
        if (i<20) {
            document.querySelector(`.levelCel${i+1}`).classList.remove('unavailable')
            if (i != 0) document.querySelector(`.connectorContainer :nth-child(${i+1})`).classList.remove('hide')
        }
    }
}

function changeGameColor(gameColor) {
    renderingColor = gameColor;
    document.documentElement.style.setProperty('--main-color', gameColor);
}

var subtitlesList = [];

function createSubtitles(message) {
    document.querySelector('.subtitles').textContent = ''
    if (subtitlesGenerating) clearInterval(subtitlesInterval);
    subtitlesGenerating = true;
    let intervalRound = 0
    subtitlesInterval = setInterval(() => {
        document.querySelector('.subtitles').textContent += message.charAt(intervalRound);
        if (intervalRound > message.length) {clearInterval(subtitlesInterval); subtitlesGenerating = false;}
        intervalRound += 1;
    }, 50);
    setTimeout(() => {
        if (!subtitlesGenerating) document.querySelector('.subtitles').textContent = ''
    },2500 + 50*message.length);
}