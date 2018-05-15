var Fractal = function(){
    this.gpu = new GPU();
    this.iterPoints = this.gpu.createKernel(function(p){
        var T;
        if((this.theread.x/1024) <= 850){
            T = [[-0.86,0.03,0],[-0.03,0.86,1.5],[0,0,1]];
        }else if((this.theread.x/1024) <= 932){
            T = [[0.2,-0.25,0],[0.25,0.26,0.45],[0,0,1]];
        }else if((this.theread.x/1024) <= 1014){
            T = [[-0.15,0.27,0],[0.25,0.26,0.45],[0,0,1]];
        }else{
            T = [[0,0,0],[0,0.17,0],[0,0,1]];
        }
        var sum=0;
        for(var i=0; i<3; i++){
            sum += T[this.thread.y][i] * p [i][this.thread.x];
        }
        return sum;
    }).setOutput([1024*1024,3]);
    this.genIV();
    console.log(this.IV);
}
Fractal.prototype.genIV = function(){
    this.IV = [];
    var tempIV = [1,2,3];
    var stack = [];
    var state = 0;
    stack.push(state);
    while(stack.length > 0){
        stack.pop();
    }
    for(var i=0; i<1024; i++){
        this.IV.push(tempIV);
    }
}
Fractal.prototype.genPoints = function(){

}


//=============Main start=============

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const fractal = new Fractal;

function render(t){

    requestAnimationFrame(render);
}

function init() {
    canvas.width = 500;
    canvas.height = 500;
	ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);
	$("body")[0].appendChild(canvas);
    render(0);
}

$(document).ready(init);

