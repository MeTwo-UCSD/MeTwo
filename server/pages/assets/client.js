const myPort = 8085;
var counter = 0;

var connection = new WebSocket('ws://192.168.0.201:' + myPort);//'ws://192.168.0.201:'+myPort);
var connectionOpen = false; 

connection.onopen = function() {
  console.log("client says: connection established!");
  connectionOpen = true;
}

connection.onmessage = function(message) {
  console.log("message from server: " + message.data);
};

connection.onclose = function() {
  connectionOpen = false;
}

var needToSend = false; 
var deployStatus = 0; 
document.getElementById("deployer").addEventListener("click", function() {
    if (deployStatus == 0) {
      deployStatus = 1;
      needToSend = true;
    } else {
      deployStatus = 0;
      needToSend = true;
    }
})

/* send key signals */
var w = false;
var a = false;
var s = false;
var d = false;

/* motor speed global vars */
var leftMotor = 0;
var rightMotor = 0;

var leftMotor_prev = 0;
var rightMotor_prev = 0;

/* joystick global vars */
var joystickX = 5;
var joystickY = 5;

var joystickX_prev = 5;
var joystickY_prev = 5;


// Checks whether or not there was a change in drive motor speed or joystick.
function hasChange() {
  if(needToSend) { console.log("need to send"); needToSend = false; return true;}
  if(leftMotor_prev != leftMotor) {console.log("leftmotor"); return true;}
  if(rightMotor_prev != rightMotor) {console.log("rightmotor"); return true;}
  if(joystickX_prev != joystickX) {console.log("joyX"); return true;}
  if(joystickY_prev != joystickY) {console.log("joyY"); return true;}

  return false;
}

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  var joystick	= new VirtualJoystick({
  container	: document.body,
  strokeStyle	: 'cyan',
  limitStickTravel: true,
  stickRadius	: 120
  });
  joystick.addEventListener('touchStartValidation', function(event){
    var touch	= event.changedTouches[0];
    if( touch.pageX < window.innerWidth/2 )	return false;
    return true
  });

  // one on the right of the screen
  var joystick	= new VirtualJoystick({
    container	: document.body,
    strokeStyle	: 'orange',
    limitStickTravel: true,
    stickRadius	: 120
  });

  joystick.addEventListener('touchStartValidation', function(event){
    var touch	= event.changedTouches[0];
    if( touch.pageX >= window.innerWidth/2 )	return false;
    return true
  });
} else {
  console.log("touchscreen is",
    VirtualJoystick.touchScreenAvailable() ? "available" : "not available");

  var joystick	= new VirtualJoystick({
    container	: document.getElementById('container'),
    mouseSupport	: true,
    limitStickTravel  : true
  });

  joystick.addEventListener('touchStart', function(){
    console.log('down');
  });

  joystick.addEventListener('touchEnd', function(){
    console.log('up');
  });

  var deployStatus = 0;
  document.getElementById("deployer").onclick = function() {
	joystick.baseEl.style.display = "none";
	joystick.destroy();
    document.getElementById("deployer").style.color = "red";
    if (deployStatus == 0) {
      deployStatus = 1;
    } else {
      deployStatus = 0;
    }
  }
  
  document.onkeypress = function (event) {
    if (event.keyCode == 32) {
      //document.getElementById("deployer").style.backgroundColor = "gray";
    }
  }

  /* send key signals */
  var w = false;
  var a = false;
  var s = false;
  var d = false;

  // Set wasd booleans to true on key down.
  document.onkeydown = function (event) {
    if (event.keyCode == 87) {
      w = true;
    }
    if (event.keyCode == 65) {
      a = true;
    }
    if (event.keyCode == 83) {
      s = true;
    }
    if (event.keyCode == 68) {
      d = true;
    }
    
    /* deploy button */
    /*if (event.keyCode == 32) {
      document.getElementById("deployer").style.backgroundColor = "gray";
      if (deployStatus == 0) {
	deployStatus = 1;
      } else {
	deployStatus = 0;
      }
    }*/
  }

  // Set wasd booleans to false on key up.
  document.onkeyup = function (event) {
    if (event.keyCode == 87) {
      w = false;
    }
    if (event.keyCode == 65) {
      a = false;
    }
    if (event.keyCode == 83) {
      s = false;
    }
    if (event.keyCode == 68) {
      d = false;
    }
   
   /* deploy button */ 
   /*if (event.keyCode == 32) {
      document.getElementById("deployer").style.backgroundColor = "lightGray";
   }*/
  }


  setInterval(function(){

    // Update the previous motor values.
    leftMotor_prev = leftMotor;
    rightMotor_prev = rightMotor;

    // Calculate speed of left and right motors based on wasd keys.
    leftMotor = 0;
    rightMotor = 0;

    if (w) {
      leftMotor += 2;
      rightMotor += 2;
    }

    if (a) {
      leftMotor -= 1;
      rightMotor += 1;
    }

    if (s) {
      leftMotor -= 2;
      rightMotor -= 2;
    }

    if (d) {
      leftMotor += 1;
      rightMotor -= 1;
    }
    // Offset the left and right motors by 4, so the range is 1 to 7, with 4 being the not moving state.
    leftMotor += 4;
    rightMotor += 4;

    // Update joystick prev values.
    joystickX_prev = joystickX;
    joystickY_prev = joystickY;

    // Update joystick values.
    joystickX = Math.floor(joystick.deltaX() / 20) + 5;
    joystickY = Math.floor(joystick.deltaY() / 20) + 5;

    if(connectionOpen && hasChange()) {

      // Motor values 1 to 7. 4 is the middle value.
      // Joystick values 0 to 9. 5 is the middle value.
      // Deploy value is 0 for no deploy. 1 for deploy. 
      var stringToSend = '' + leftMotor + rightMotor + joystickX + joystickY + deployStatus;


      // Send string.
      connection.send(stringToSend);
    }

  }, 1/30 * 1000);
}
