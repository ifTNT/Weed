var Fractal = function(){
    this.transforms = [
        [[-0.86,0.03,0],[-0.03,0.86,1.5],[0,0,1]], //T1
        [[0.2,-0.25,0],[0.25,0.26,0.45],[0,0,1]],  //T0
        [[-0.15,0.27,0],[0.25,0.26,0.45],[0,0,1]], //T3
        [[0,0,0],[0,0.17,0],[0,0,1]]               //T4
    ];
    this.workLength = 7; // Actually length of work: 4^workLength
    if(turbojs){
        this.genIV();
        //console.log(this.IV);
    }
}
Fractal.prototype.genIV = function(){
    console.log("Work length: ", Math.pow(4, this.workLength));
    console.log("Stratd generate initial vector(CPU)");
    this.t0 = window.performance.now();
    this.IV = turbojs.alloc(4*Math.pow(4, this.workLength)); //Initial vector (A 3 by (4^workLength) matrix actually)
    console.log("yay");
    var tempIV = [];
    var genTemp = function(_p,t,workLength){
        if(t==workLength) return _p;
        var rtVal = [];
        var p;
        // T1
        p = [_p[0]*-0.86+_p[1]*0.03,  _p[0]*-0.03+_p[1]*0.86+1.5,  1];
        rtVal = rtVal.concat(genTemp(p,t+1,workLength));
        // T2
        p = [_p[0]*0.2+_p[1]*-0.25,  _p[0]*0.25+_p[1]*0.26+0.45,  1];
        rtVal = rtVal.concat(genTemp(p,t+1,workLength));
        //T3
        p = [_p[0]*-0.15+_p[1]*0.27,  _p[0]*0.25+_p[1]*0.26+0.25,  1];
        rtVal = rtVal.concat(genTemp(p,t+1,workLength));
        //T4
        p = [0,  _p[1]*0.17,  1];
        rtVal = rtVal.concat(genTemp(p,t+1,workLength));
        return rtVal;
    };
    tempIV = genTemp([0,0,1],0,this.workLength);
    for(var i=0; i<Math.pow(4,this.workLength); i++){
        //console.log(i);
        this.IV.data[i*4] = tempIV[i*3];
        this.IV.data[i*4+1] = tempIV[i*3+1];
        this.IV.data[i*4+2] = tempIV[i*3+2];
        this.IV.data[i*4+3] = 0;
    }
    console.log(this.IV.data);
    /*for(var i=0; i<100; i++){
        for(var j=0; j<Math.pow(4,this.workLength); j++){
            this.IV.push(tempIV[j]);
        }
    }*/
    console.log("IV generated " + (window.performance.now()-this.t0) + " ms");
}
Fractal.prototype.genPoints = function(){
    console.log("Stratd transform(GPU)");
    this.t0 = window.performance.now();
    turbojs.run(this.IV,`void main(void){
        vec4 p = read();
        mat4 t1 = mat4(
            -0.86, -0.03, 0, 0,
            0.03,  -0.86, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
        commit(p*t1);
    }`);
    console.log(this.IV.data);
    console.log("Transformed " + (window.performance.now()-this.t0) + " ms");
    this.t0 = undefined;
    return this.IV.data;
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
    /*for(var i of points){
        ctx.moveTo(i[0]*scale+250, 500-i[1]*scale);
        ctx.lineTo(i[0]*scale+0.1+250, 500-i[1]*scale);
    }*/
    ctx.closePath();
    ctx.stroke();
    console.log(points.length);
    render(0);
}

$(document).ready(init);

