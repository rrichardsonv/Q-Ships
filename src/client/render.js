(function(){
  //constructor definition - Client side render model
  function Renderer(canvas){

    //grab given html canvas object
    this.canvas = canvas;
    this.canvas.height = window.innerHeight
    this.canvas.width = window.innerWidth

    //start lawn mower
    this.ctx = this.canvas.getContext("2d");

    this.ticker = 0
  }

  //iterate through all of the snapshot assets and run draw and each one
  Renderer.prototype.populateUniverse = function(){
    //clear the canvas before very frame
    this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
    //check if there is any input from WS
    if(this.objectsArray){
      //iterate through all the objects set in controller from on message WS
      for(var i = 0; i < this.objectsArray.length; i++){
        //run draw function for each individual object
        this.draw(this.objectsArray[i]);
      }
    }
  };

  Renderer.prototype.images = function(type,ticker){
    var image = new Image();
    var ticker = ticker || 0;

    if(type === "ship" || type === "spawnship"){
      // image.src = "http://i.imgur.com/2JndZdm.png";
      image.src = "http://i.imgur.com/JDMrHaJ.png";

    } else if (type === "upShip") {
       image.src = [
        "http://i.imgur.com/OjQL9nk.png",
        "http://i.imgur.com/Ice0ahG.png",
        "http://i.imgur.com/LPSjtUm.png",
        "http://i.imgur.com/dDo84hf.png",
        "http://i.imgur.com/xeSWbGW.png"
        ][ticker]
    } else if (type === "upLeftShip") {
      image.src = [
        "http://i.imgur.com/HB35u91.png",
        "http://i.imgur.com/YigBqAN.png",
        "http://i.imgur.com/utjjT1j.png",
        "http://i.imgur.com/jIrky4d.png",
        "http://i.imgur.com/jIrky4d.png"
      ][ticker]
    } else if (type === "upRightShip") {
      image.src = [
        "http://i.imgur.com/dIf6OBS.png",
        "http://i.imgur.com/8CuW90w.png",
        "http://i.imgur.com/2LHj4HA.png",
        "http://i.imgur.com/6GdvCm6.png",
        "http://i.imgur.com/6GdvCm6.png"
      ][ticker]
    } else if (type === "leftShip") {
      image.src = [
        "http://i.imgur.com/dPVBJQf.png",
        "http://i.imgur.com/xEy0DFC.png",
        "http://i.imgur.com/asyEDMw.png",
        "http://i.imgur.com/Ji7Y4sk.png",
        "http://i.imgur.com/wDOXFjK.png"
      ][ticker]
    } else if (type === "rightShip") {
      image.src = [
        "http://i.imgur.com/7LUcTQ9.png",
        "http://i.imgur.com/R17dabw.png",
        "http://i.imgur.com/F9ZJVCJ.png",
        "http://i.imgur.com/5s52V4w.png",
        "http://i.imgur.com/IuQkhWJ.png"
      ][ticker]
    } else if (type === "pumpYourBrakes") {
      image.src = "http://i.imgur.com/h6kWQjf.png";
    } else if (type === "astroid") {
      image.src = "http://i.imgur.com/8i5gG51.png";
    } else if(type === "pew") {
      image.src = "http://i.imgur.com/VioerDV.png";
    }
    return image;
  };

  // for an individual asset, run canvas methods to place on canvas
  Renderer.prototype.draw = function(object){
    // get the dimensions of the object
    var dims = this.dimensions(object);

    // for testing purpose only
    this.ctx.fillStyle = "white";

    // translate the object center point
    this.ctx.translate(dims.midpointX, dims.midpointY);

    // rotate at the object's center point
    this.ctx.rotate(dims.rad - (Math.PI/2));


    if (  object.type === "nuke" || object.type === "debris" || object.type === "shrapnel" || object.type === "star_one"|| object.type === "star_two" || object.type === "star_three"){
        this.ctx.fillRect(dims.width/(-2),dims.height/(-2), dims.width, dims.height);
    } else {
      // get the correct image tag based off the type
      var img = this.images(object.type, this.ticker);

      if(object.state === "spawning"){
        this.ctx.globalAlpha = 0.3
        this.ctx.drawImage(img, dims.width/(-2), dims.height/(-2))
        this.ctx.globalAlpha = 1.0
      } else{


      // draw the image at its own center point
      this.ctx.drawImage(img, dims.width/(-2), dims.height/(-2))
      }

      // roll through ticker to reset its value ... 0, 1, 2
      this.ticker === 4 ? this.ticker = 0 : this.ticker += 1
    }

    // rotate the canvas back to its original state
    this.ctx.rotate((dims.rad-(Math.PI/2))/-1);

    // translate the canvas back to where the img is center is the center of the canvas
    this.ctx.translate(dims.midpointX/-1, dims.midpointY/-1);
  }

  // takes in a snapshot asset (each asset has an x, y, rad - width and height are accessed from itemKey object literal)
  Renderer.prototype.dimensions = function(currentAsset){
    return {
      width: itemKey[currentAsset.type].width,
      height: itemKey[currentAsset.type].height,
      rad: currentAsset.rad,
      x: currentAsset.x,
      y: currentAsset.y,
      midpointX: currentAsset.x + (itemKey[currentAsset.type].width/2),
      midpointY: currentAsset.y + (itemKey[currentAsset.type].height/2)
    }
  }

  //runs populateUniverse in a repeated loop
  //takes in a snapshotAssetArray to update itself
  Renderer.prototype.tickTock = function(){
    var that = this;
    function execute(){
      window.requestAnimationFrame(execute);
      that.populateUniverse();
    }
    execute();
  }

  // welcome the users
  Renderer.prototype.showState = function(state) {
    var welcome = document.getElementById("welcome");
    var score = document.getElementById("score");
    if (state !== 0) {
      welcome.setAttribute("class", "hidden");
      score.setAttribute("style", "opacity: 0.4");
    } else {
      welcome.removeAttribute("class");
      score.removeAttribute("class");
    }
  }

  // rendering the scores to the screen
  Renderer.prototype.showScores = function(scoresArray) {
    var scoreDiv = document.getElementById("score");
    scoreDiv.innerHTML = '';
    var scoresDisplay = document.createElement('ol');
    var newHTML = '';
    for (var i = 0; i < scoresArray.length; i++){
      var score = scoresArray[i].score
      var dots = 40 - (scoresArray[i].name.length + score.toString().length)
      var dotString = '';
      for (var j = 0; j < dots; j++) {
        dotString += "."
      }
      newHTML += "<li>" + scoresArray[i].name + dotString + scoresArray[i].score + "</li>";
    }
    scoresDisplay.innerHTML = newHTML;
    scoreDiv.appendChild(scoresDisplay);
  }

Renderer.prototype.announceNuke = function(){
  var nukeDiv = document.getElementById("nuke-div");
  nukeDiv.removeAttribute('class');
  setTimeout(function() {
    nukeDiv.setAttribute("class", "hidden");
  }, 3000);
}

// Renderer.prototype.findNuke = function(scores) {
//   var nukers = [];
//   for (var i = 0; i < scores.length; i++) {
//   }
// }

  // item keys to identify their dimensions
  var itemKey = {
    ship: {width: 65, height: 59},
    spawnship: {width: 65, height: 59},
    upShip: {width: 65, height: 59},
    upLeftShip: {width: 65, height: 59},
    upRightShip: {width: 65, height: 59},
    leftShip: {width: 65, height: 59},
    rightShip: {width: 65, height: 59},
    pumpYourBrakes: {width: 65, height: 59},
    pew: {width: 4, height: 10},
    nuke: {width: 80, height: 80},
    astroid: {width: 45, height: 49},
    debris: {width: 7, height: 7},
    shrapnel: {width: 3, height: 3},
    star_one: {width: 2, height: 2},
    star_two: {width: 4, height: 4},
    star_three: {width: 6, height: 6}
  }
  window.Renderer = Renderer;
})()
