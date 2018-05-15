var Fractal = function(){
    this.transforms = [
        [[-0.86,0.03,0],[-0.03,0.86,1.5],[0,0,1]], //T1
        [[0.2,-0.25,0],[0.25,0.26,0.45],[0,0,1]],  //T0
        [[-0.15,0.27,0],[0.25,0.26,0.45],[0,0,1]], //T3
        [[0,0,0],[0,0.17,0],[0,0,1]]               //T4
    ];
    this.gpu = new GPU();
    this.iterPoints = this.gpu.createKernel(function(p,t){
        var T = 0;
        if((this.thread.y/1024) <= 850){
            T = 0;
        }else if((this.thread.y/1024) <= 932){
            T = 1;
        }else if((this.thread.y/1024) <= 1014){
            T = 2;
        }else{
            T = 3;
        }
        var sum = 0;
        for(var i=0; i<3; i++){
            sum += p[this.thread.y][i] * t[T][this.thread.x][i];
        }
        return sum;
    }).setOutput([3,1024*1024]);
    this.genIV();
    console.log(this.IV);
}
Fractal.prototype.genIV = function(){
    this.IV = [];
    var tempIV = [];
    var genTemp = function(_p,t){
        if(t==5) return [_p];
        var rtVal = [];
        var p;
        // T1
        p = [_p[0]*-0.86+_p[1]*0.03,  _p[0]*-0.03+_p[1]*0.86+1.5,  1];
        rtVal = rtVal.concat(genTemp(p,t+1));
        // T2
        p = [_p[0]*0.2+_p[1]*-0.25,  _p[0]*0.25+_p[1]*0.26+0.45,  1];
        rtVal = rtVal.concat(genTemp(p,t+1));
        //T3
        p = [_p[0]*-0.15+_p[1]*0.27,  _p[0]*0.25+_p[1]*0.26+0.25,  1];
        rtVal = rtVal.concat(genTemp(p,t+1));
        //T4
        p = [0,  _p[1]*0.17,  1];
        rtVal = rtVal.concat(genTemp(p,t+1));
        return rtVal;
    };
    tempIV = genTemp([0,0,1],0);
    for(var i=0; i<1024; i++){
        for(var j=0; j<1024; j++){
            this.IV.push(tempIV[j]);
        }
    }
}
Fractal.prototype.genPoints = function(){
    return this.iterPoints(this.IV, this.transforms);
}


//=============Main start=============

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const fractal = new Fractal;
var points = fractal.genPoints();

function render(t){
    
    requestAnimationFrame(render);
}

function init() {
    canvas.width = 500;
    canvas.height = 500;
	ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    $("body")[0].appendChild(canvas);
    ctx.strokeStyle = "white";
    ctx.beginPath();
    var scale = 50;
    for(var i of points){
        ctx.moveTo(i[0]*scale+250, 500-i[1]*scale);
        ctx.lineTo(i[0]*scale+0.1+250, 500-i[1]*scale);
    }
    ctx.closePath();
    ctx.stroke();
    console.log(points);
    render(0);
}

$(document).ready(init);

