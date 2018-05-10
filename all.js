 $(document).ready(init);
var T1 = {
  a: 0.86, b: 0.03,
  c: -0.03, d: 0.86,
  e: 0, f: 1.5,
};
var T2 = {
  a: 0.2, b: -0.25,
  c: 0.21, d: 0.23,
  e: 0, f: 1.5
};
var T3 = {
  a: -0.15, b: 0.27,
  c: 0.25, d: 0.26,
  e: 0, f: 0.45
};
var T4 = {
  a: 0, b: 0,
  c: 0, d: 0.17,
  e: 0, f: 0
};
var transforms = [
  {p: 83, t: T1},
  {p: 91, t: T2},
  {p: 99, t: T3},
  {p: 100,t: T4}
];
function transform(seed, _x, _y){
  var x, y;
  for(var i of transforms){
    if(seed<=(i.p)){
      x = _x*i.t.a + _y*i.t.b + i.t.e;
      y = _x*i.t.c + _y*i.t.d + i.t.f;
      break;
    }
  }
  return {x: x,y: y};
}

var _x, _y;
var displayOffset = { x: 0, y: 0 };
var canvas;
var ctx;
var counter;
var k;
var t0=0, t1=0, fps=0;

function init(){
  _x=Math.random();
  _y=Math.random();
  k=1;
  counter=0;
  canvas = document.getElementById('fractal');
  canvas.height = window.innerHeight-40;
  canvas.width = window.innerWidth-40;
  ctx = canvas.getContext('2d');
  canvas.addEventListener("wheel", zoomFern);
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width, canvas.height);
  registPan();
  render();
}

function render(timestamp){
  t0 =  performance.now() ;
  ctx.strokeStyle = "rgba(159, 216, 36,0.3)";
  //Fallen leafs
  //ctx.strokeStyle = "hsla("+ Math.floor(Math.sin(timestamp))*255 + ",50%,60%,0.3)";
  var density = 0.35;
  //height ~ 10.254 @ scale=1
  var scale = Math.floor(canvas.height/10.5)*k;
  var totalDots = scale*scale*110;
  var drawSpeed = totalDots/55;
  ctx.beginPath();
  var x,y;
  if(counter<=totalDots){
    for(var i=0; i<drawSpeed; i++){
      x = canvas.width/2+_x*scale + displayOffset.x;
      y = canvas.height-_y*scale + displayOffset.y;
      if(x>=0 && x<= canvas.width && y>=0 && y<= canvas.height){
        ctx.moveTo(x,y);
        ctx.lineTo(x+0.1,y);
      }
      //ctx.fillRect(250+x*scale, canvas.height-y*scale, 1, 1);
      var nextLocation = transform(Math.floor(Math.random()*100)+1, _x, _y);
      _x = nextLocation.x;
      _y = nextLocation.y;
    }
    counter += Math.floor(drawSpeed);
  }
  ctx.closePath();
  ctx.stroke();
  
  fps = Math.floor((fps+1/(t0-t1)*1000)/2);
  t1=t0;
  ctx.fillStyle = "black";
  ctx.fillRect(20, canvas.height-30, 120, 40);
  ctx.fillRect(canvas.width-90, 30, 70, 30);
  ctx.fillStyle = "rgba(159, 216, 36,1)";
  ctx.font = "10px Console";
  ctx.fillText("Drew "+counter+" pixels", 20, canvas.height-20, 100);
  //ctx.fillStyle = "hsl(0,0%,80%)";
  ctx.font = "16px Console";
  ctx.fillText(fps+" FPS", canvas.width-80, 50, 100);
  
  requestAnimationFrame(render);
}

function zoomFern(e) {
  e.preventDefault();
  var delta = e.deltaY || e.wheelDelta || e.detail;
  var pk=k;
  if (delta > 0) {
    k -= 0.5;
  } else {
    k += 0.5;
  }
  if (k < 1 || k > 8){
    k = pk;
  }else{
    displayOffset.x *= k/pk;
    displayOffset.y *= k/pk;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    counter = 0;
  }
}

var dragging = false;

function registPan() {
  $("#fractal")
    .on("mousedown", function(e) {
      if(!dragging){
        $(this).data("p0", { x: e.pageX, y: e.pageY });
        $(this).data("offset", {x: displayOffset.x, y: displayOffset.y});
        dragging = true;
      }
    })
    .on("mousemove", function(e){
        if(dragging){
          var origin = $(this).data("offset"), 
                 p0 = $(this).data("p0"),
                 p1 = { x: e.pageX, y: e.pageY };
          var cpi = 1;
          console.log(origin);
          displayOffset.x = origin.x + (p1.x - p0.x)/cpi;
          displayOffset.y = origin.y + (p1.y - p0.y)/cpi;
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          counter = 0;
        }
    });
  $(document).on("mouseup", function(e) {
      dragging = false;
    });
}
