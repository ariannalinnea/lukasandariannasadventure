//to fix fence jump bug, get time of every key clicked, if time between two keys is less than 
//.5 for example, ignore the key click


const levels  = [ 
  // level 0
  ["flag", "rock", "", "", "", 
   "fenceside", "rock", "", "", "rider",
   "", "tree", "animate", "start animate", "animate",
   "", "water", "", "", "",
   "", "fence", "", "charup", "",],
   
 //level 1
  ["flag", "water", "", "", "",
	"fenceside", "water", "", "", "rider",
	"start animate" , "bridge animate", "animate", "animate", "animate",
	"", "water", "", "", "",
    "", "water", "charup", "", ""],
	
 //level 2
  ["tree","tree","flag","tree","tree",
	"start animate", "animate", "animate", "animate", "animate",
	"water", "bridge", "water", "water", "water",
	"", "", "", "fence", "",
	"rider", "rock", "", "", "charup"]
   
  ]; // end of levels

const totalLevels = 2;
const noPassObstacles = ["rock", "tree", "water"];
var currentLevel = 0; // starting level
var riderOn = false; // is the rider on?
var gridBoxes ;
var currentLocationOfHorse = 0;
var currentLocationOfEnemy = 0;
var enemyStart ; // where the enemy starts animation, first box enemy is showed in
var currentAnimation; // allows 1 animation per level
var widthOfBoard = 5; 
var counter = 0;
var currentTime = 0;
var oldTime = 0;


// start game
window.addEventListener("load", function() {
  gridBoxes = document.querySelectorAll("#gameBoard div");
  loadLevel();
});

// move character 
document.addEventListener("keydown", function (e) {
	console.log(currentLocationOfHorse);
	
	var d = new Date();
	var n = d.getTime();
	
	currentTime = n;
	console.log(currentTime);
	
	// 250 is time between key clicks in milliseconds
	if(currentTime > oldTime + 250 || currentTime == oldTime){
    switch (e.keyCode) {
	  case 37: //left arrow
	    if (currentLocationOfHorse % widthOfBoard !== 0) {

		  tryToMove("left");  
		}
		break;
	  case 38: //up arrow
	     if (currentLocationOfHorse - widthOfBoard >= 0) {
		  tryToMove("up");  
		}
		break;
	  case 39: //right arrow
	     if (currentLocationOfHorse % widthOfBoard < widthOfBoard - 1) {
		  tryToMove("right");  
		}
		break;
	  case 40: //down arrow
	     if (currentLocationOfHorse + widthOfBoard < widthOfBoard *
		 widthOfBoard) {
		  tryToMove("down");  
		}
		break;
	}//switch
	}
	oldTime = currentTime;
}); //key event listener	

//try to move character

function tryToMove(direction) {
	
  // location before move
  let oldLocation = currentLocationOfHorse;
  
  // class of location before move
  let oldClassName = gridBoxes[oldLocation].className;
  
  let nextLocation = 0; //location we wish to move to
  let nextClass = ""; //class of location we wish to move to
  
  let nextLocation2 = 0;
  let nextClass2 = "";
  
  let newClass = ""; //new class to switch to if move successful
  
  switch(direction) {
	case "left":
	  nextLocation = currentLocationOfHorse - 1;
	  break; 
	case "right":
      nextLocation = currentLocationOfHorse + 1;
	  break; 
    case "up":
      nextLocation = currentLocationOfHorse - widthOfBoard;
	  break;
	case "down":
      nextLocation = currentLocationOfHorse + widthOfBoard;
	  break;

  }  // switch
  
  nextClass = gridBoxes[nextLocation].className;
  
  // if the obstacle is not passable, dont move
  if (noPassObstacles.includes(nextClass)) {return; }
  
  //if its a fence, and there is no rider
  if (!riderOn && nextClass.includes("fence")) {return;}
  
  // if there is a fence and the rider is on move two spaces with animation
  if (nextClass.includes("fence")) {
	
	// rider must be on to jump
	if (riderOn) {
	  gridBoxes[currentLocationOfHorse].className = "";  //will bug if jump is before a bridge
	  oldClassName = gridBoxes[nextLocation].className;

      // set values according to direction
      if (direction == "left") {
        nextClass = "overfenceleft";
		nextClass2 = "charrideleft";
		nextLocation2 = nextLocation - 1;
	  }	else if (direction == "right")	 {
		nextClass = "overfenceright";
		nextClass2 = "charrideright";
		nextLocation2 = nextLocation + 1;
	  }	else if (direction == "up") {
		nextClass = "overfenceup";
		nextClass2 = "charrideup";
		nextLocation2 = nextLocation - widthOfBoard;
	  }	else if (direction == "down") {
		nextClass = "overfencedown";
		nextClass2 = "charridedown";
		nextLocation2 = nextLocation + widthOfBoard;
	  } // else if		

	//show horse jumping 
	gridBoxes[nextLocation].className = nextClass;
	
	setTimeout(function () {
	
	  // set jump back to just a fence
	  gridBoxes[nextLocation].className = oldClassName;
	  
	  // update current location of horse to be 2 spaces past take off
	  currentLocationOfHorse = nextLocation2;
	  
	  // get class of box after jump
	  nextClass = gridBoxes[currentLocationOfHorse].className; //code is written 
	  //that if there is a non passable obsticale after jump, it will throw an error
	  
	  //show horse and rider after landing
	  gridBoxes[currentLocationOfHorse].className = nextClass2;
	  
	  //if next box is a flag, go up a level
	  levelUp(nextClass);
	  
	}, 350);
	return;
	
	} // if riderOn
	
  } // if class has fence
  
  
  // if there is a rider, add rider
  if (nextClass == "rider") {
	riderOn = true;  
  } //if
  
  // if there is a bridge in the old location keep it
  if (oldClassName.includes("bridge")) {
	gridBoxes[oldLocation].className = "bridge";	
  } else {
	gridBoxes[oldLocation].className = "";  
  } // else
  
  // build name of new class
  newClass = (riderOn) ? "charride" : "char";
  newClass += direction;
  
  // if there is a bridge in the next location, keep it
  if (gridBoxes[nextLocation].classList.contains("bridge")) {
	newClass += " bridge";	
  } //if
  
  // move 1 space
  currentLocationOfHorse = nextLocation;
  gridBoxes[currentLocationOfHorse].className = newClass;
  
  // if it is an enemy
  if(nextClass.includes("enemy")) {
	document.getElementById("lose").style.display = "block";
    return;	
  } //if
  
  //move up a level if needed
  levelUp(nextClass);
  
} //tryToMove

// move up a level
function levelUp(nextClass) {
  if (nextClass == "flag" && riderOn && currentLevel < totalLevels) {
	document.getElementById("levelup").style.display = "block";
	clearTimeout(currentAnimation);
	setTimeout (function() {
	  document.getElementById("levelup").style.display = "none";
	    currentLevel++;  //add an if statement if there are no more levels dont increment
	    loadLevel(); 
	  
	}, 1000);
	
  } else if(nextClass == "flag" && riderOn && currentLevel >= totalLevels){
	  document.getElementById("end").style.display = "block";
	  clearTimeout(currentAnimation);
  } // else if
  
} //levelUp


// load current levels 0 - maxlevel
function loadLevel(){
  let levelMap = levels[currentLevel];
  let animateBoxes;
  riderOn = false;
  
  // load board
  for(var i = 0; i < gridBoxes.length; i++){
	gridBoxes[i].className = levelMap[i];
	if(levelMap[i].includes("char")) currentLocationOfHorse = i;
	if(levelMap[i].includes("start animate")){ 
	  enemyStart = i - 1;
	  currentLocationOfEnemy = enemyStart;
	}// if
	if(currentLocationOfEnemy != null){
	  console.log(currentLocationOfEnemy);	
	} // if
  } // for
  
  animateBoxes = document.querySelectorAll(".animate");
  
  animateEnemy(animateBoxes, 0, "right");
  
} //loadLevel

// animate enemy left to right
// boxes - array of grid boxes that include animation
// index - current location of animation
// direction - current direction of animation
function animateEnemy(boxes, index, direction){
  if(counter == 0){

  currentLocationOfEnemy = enemyStart;/////////////unnneccessary
  }
  // exits function if no animation
  if(boxes.length <= 0){ return;}
  
  // update the images
  if(direction == "right"){
	boxes[index].classList.add("enemyright");
  } else{
	boxes[index].classList.add("enemyleft");
  } //else
  
  // remove images from other boxes
  for(i = 0; i < boxes.length; i++){
	if(i != index){
	  boxes[i].classList.remove("enemyleft");
	  boxes[i].classList.remove("enemyright");
	} //if
  } //for
  
  // moving right
  if(direction == "right"){
	if(counter >= 1){
		//console.log("HI");
		currentLocationOfEnemy++;
	}
	// turn around if hit right side of animation
	if(index == boxes.length - 1){
	  //currentLocationOfEnemy = currentLocationOfEnemy + 1;
	  index--;
	  direction = "left";
    } else{
	  index++;
    } //else
	
  // moving left
  } else{
	if(counter >= 1){
		console.log("check");
		currentLocationOfEnemy--;
	} //if 
	
	// turn around if hit left side of animation
    if(index == 0){
	 // currentLocationOfEnemy = currentLocationOfEnemy - 1;
	  index++;
	  direction = "right";
	} else{
		index--;
	} //else
		
  }// else
  
  currentAnimation = setTimeout(function(){
	  animateEnemy(boxes, index, direction);
  }, 750);
   
   counter++;
   //console.log(counter);
  // if enemy runs into player, end the game
  console.log(currentLocationOfEnemy);
  if(currentLocationOfHorse == currentLocationOfEnemy){
	document.getElementById("lose").style.display = "block";
	clearTimeout(currentAnimation);
	
    return;	  
  } //if
}// animateEnemy
