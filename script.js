// global constants
var clueHoldTime = 1000; //how long to hold each clue's light/sound
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var pattern = [2, 5, 4, 3, 6, 1, 2, 4];
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; // must be between 0.0 and 1.0
var guessCounter = 0;
var tries = 0;
var timer = parseInt(document.getElementById("countdown").innerHTML); //sec (not millisecs)
var intervalVar;

var loseAudio = new Audio('https://cdn.glitch.com/697ba869-5360-4f19-87e3-0383d7783cdd%2Fgame-lose-sound-effect.mp3?v=1616279784415');
var mistakeAudio = new Audio ('https://cdn.glitch.com/697ba869-5360-4f19-87e3-0383d7783cdd%2Fgame-mistake-sound-effect.mp3?v=1616280259453');
var winAudio = new Audio ('https://cdn.glitch.com/697ba869-5360-4f19-87e3-0383d7783cdd%2Fgame-win-bell-sound-effect.mp3?v=1616280604115');

// One-liner to resume playback when user interacted with the page.
document.querySelector('button').addEventListener('click', function() {
  context.resume().then(() => {
    console.log('Playback resumed successfully');
  });
});

function generatePattern(){
  for(let i=0;i<pattern.length;i++){
    pattern[i] = Math.floor(Math.random()*6)+1;
  }
}

function decrementTimer(){
  timer--;
  if(!gamePlaying){
    stopGame();
    return;
  }
  document.getElementById("countdown").innerHTML = timer + " seconds left";
  if(timer <= 0){
    loseAudio.play();
    stopGame();
    alert("Game over. The timer ran out");
  }
}

function startTimer(){
  intervalVar = setInterval(decrementTimer, 1000);
}
function pauseTimer(){
  clearInterval(intervalVar);
}

function startGame(){
  //initialize game variables
  tries = 0;
  generatePattern();
  clueHoldTime = 1000; //reset time
  progress = 0;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  document.getElementById("countdown").classList.remove("hidden");
  document.getElementById("countdown").classList.add("inline");
  revealLives();
  playClueSequence();
  //
  initializeButtonImage();
  timer = 30;
  document.getElementById("countdown").innerHTML = timer + " seconds left";
}

function revealLives(){
  document.getElementById("lives").classList.remove("hidden");
  document.getElementById("lives").classList.add("inline");
  document.getElementById("life1").classList.remove("hidden");
  document.getElementById("life2").classList.remove("hidden");
  document.getElementById("life3").classList.remove("hidden");
}

function initializeButtonImage(){
  //initialize images in buttons
  for(let i=1; i<=6; i++){
    wrongButton(i);
  }
  document.getElementById("button"+pattern[0]).classList.remove("wrong");
  document.getElementById("button"+pattern[0]).classList.add("right");
}

function stopGame(){
  gamePlaying = false;
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  document.getElementById("countdown").classList.add("hidden");
  document.getElementById("countdown").classList.remove("inline");
  document.getElementById("lives").classList.add("hidden");
  document.getElementById("lives").classList.remove("inline");
  //clear image from all buttons
  clearButtonImage();
  //to make sure buttons are clear if they are initialized on a timer 
  setTimeout(clearButtonImage, 5000); 
  pauseTimer();
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.626,//C  //240,
  2: 293.665,//D  //261.6,
  3: 329.628,//E  //329.6,
  4: 369.994,//F#  //392,
  5: 440.000,//A  //466.2,
  6: 493.883//B  //500,
  
  //For the attempt to form chords
/*  7: 329.628, //E  1
  8: 391.995,//G    1
  9: 369.994,//F#  2 
  10: 440.000,//A  2
  11: 415.304,//G#  3
  12: 493.883,//B  3
  13: 466.164,//A#  4
  14: 554.365,//C#  4
  15: 554.365,//C#  5
  16: 659.255,//E  5
  17: 622.254,//D#  6
  18: 739.989//F#  6
  */
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    tonePlaying = true
  }
}
function stopTone(){
    g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
    tonePlaying = false
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

//trying to do similar to lighting up button
function rightButton(btn){
  document.getElementById("button"+btn).classList.add("right");
  document.getElementById("button"+btn).classList.remove("wrong");
}
function wrongButton(btn){
  document.getElementById("button"+btn).classList.add("wrong");
  document.getElementById("button"+btn).classList.remove("right");
}
function clearButtonImage(){
  //added to clear image
  for(let x=1; x<=6; x++){
    document.getElementById("button"+x).classList.remove("right");
    document.getElementById("button"+x).classList.remove("wrong");
  }
  
}

function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

function playClueSequence(){
  clueHoldTime -= 80;
  guessCounter = 0;
  document.getElementById("playClue").classList.remove("hidden"); //hmm
  document.getElementById("playClue").classList.add("inline");//hmm
  console.log("playClue should be visible");
  //remove images from buttons
  clearButtonImage();
  //
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime 
    delay += cluePauseTime;
  }
  console.log("playClue hidden again");
  setTimeout(hidePlayClue, delay);
  setTimeout(initializeButtonImage, delay); //problem: initializes sometimes after stopGame is called (temp fix)
  //make buttons unclickable during playback
  disableButtons();
  setTimeout(enableButtons, delay);
  //start timer
  setTimeout(startTimer, delay);
}

function disableButtons(){
  for(let x=1; x<=6; x++){
    document.getElementById("button"+x).disabled = true;
  }
}
function enableButtons(){
  for(let x=1; x<=6; x++){
    document.getElementById("button"+x).disabled = false;
  }
}

function hidePlayClue(){
  document.getElementById("playClue").classList.add("hidden"); //hmm
  document.getElementById("playClue").classList.remove("inline");//hmm
}

function loseGame(){
  stopGame();
  loseAudio.play();
  alert("Game Over. You lost.");
  //have audio/visual for failure
}
function winGame(){
  stopGame();
  winAudio.play();
  alert("Game Over. You won!");
  //have audio/visual for winning
}

function guess(btn){
  console.log("user guessed: " + btn);
  if(!gamePlaying){
    clearButtonImage();
    return;
  }
  
  if(btn == pattern[guessCounter]){
    //
    for(let x=1; x<=6; x++){
      wrongButton(x);
    }
    if(guessCounter<7){
      let p = pattern[guessCounter + 1];
      document.getElementById("button"+p).classList.remove("wrong");
      rightButton(pattern[guessCounter+1]);
    }
    //
    if(guessCounter == progress){
      if(progress == pattern.length - 1){
        winGame();
      }else{
        progress++;
        pauseTimer(); //pause timer
        playClueSequence();
      }
    }else{
      guessCounter++;
    }
  }else{
    tries++;
    document.getElementById("life"+tries).classList.remove("inline");
    document.getElementById("life"+tries).classList.add("hidden");
    if(tries == 3){
      loseGame();
    }else{
      //have audio/visual to show mistake
      mistakeAudio.play();
      //alert("Mistake #" + tries + ", try again");
      pauseTimer();
      playClueSequence();
    }
  }
}