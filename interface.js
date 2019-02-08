window.addEventListener('resize', evt=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
window.addEventListener('mousemove', evt=>{
    mouse.x = evt.x;
    mouse.y = evt.y;
});
window.addEventListener('keydown', evt=>{
    if(evt.code=="Enter"){
        drawBox.confirm.onclick();
    }
})
document.addEventListener("contextmenu", function(e){
    e.preventDefault();
  }, false);
window.addEventListener('mousedown', evt =>{
    switch(evt.which){
        case 1:
            mouse.left = true;
            break;
        case 2:
            mouse.middle = true;
            break;
        case 3:
            mouse.right = true;
            break;

    }
});
window.addEventListener("mouseup", evt =>{
    switch(evt.which){
        case 1:
            mouse.left = false;
            break;
        case 2:
            mouse.middle = false;
            break;
        case 3:
            mouse.right = false;
            break;

    }
});
function drawInit(x,y,xDim,yDim, boxSize, layers, inputMap){

    drawBox.inputMap = inputMap;
    drawBox.inputMapNumber = 0;
    drawBox.image = new image(xDim*boxSize,yDim*boxSize);
    drawBox.outputs = inputMap.length;
    drawBox.data = [];
    drawBox.xDim = xDim;
    drawBox.yDim = yDim;
    drawBox.dim = boxSize;
    drawBox.x = x;
    drawBox.y = y;
    drawBox.pointerX = 0;
    drawBox.pointerY = 0;
    drawBox.layers = layers;    
    drawBox.layers.push(drawBox.outputs);
    drawBox.network = Network.generate(xDim*yDim,drawBox.layers);

    drawBox.div = document.createElement("div");
    drawBox.number = document.createElement("INPUT");
    drawBox.number.setAttribute("type", "text");
    drawBox.number.setAttribute("value", (drawBox.inputMap)?drawBox.inputMap[0]:0);
    drawBox.div.appendChild(drawBox.number);

    drawBox.confirm = document.createElement("INPUT");
    drawBox.confirm.setAttribute("type", "button");
    drawBox.confirm.setAttribute("value", "enter");
    drawBox.div.appendChild(drawBox.confirm);

    drawBox.trainNumber = document.createElement("INPUT");
    drawBox.trainNumber.setAttribute("type", "number");
    drawBox.trainNumber.setAttribute("value", 100);
    drawBox.div.appendChild(drawBox.trainNumber);

    drawBox.train = document.createElement("INPUT");
    drawBox.train.setAttribute("type", "button");
    drawBox.train.setAttribute("value", "train");
    drawBox.div.appendChild(drawBox.train);

    drawBox.guess = document.createElement("INPUT");
    drawBox.guess.setAttribute("type", "button");
    drawBox.guess.setAttribute("value", "guess");
    drawBox.div.appendChild(drawBox.guess);

    document.body.appendChild(drawBox.div);

    drawBox.guess.onclick = ()=>{
        let bestValue = {index: 0, confidence: 0, secondBest: 0};
        let result = drawBox.network.compute(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,0,0)))[drawBox.layers.length].activation;
        for(let i = 0; i < drawBox.outputs; i++){
            if(result.elements[i]>bestValue.confidence){
                bestValue.secondBest = bestValue.confidence;
                bestValue.confidence = result.elements[i];
                bestValue.index = i;
            }
        }
        window.alert("I think that the drawing is option " + ((drawBox.inputMap)?drawBox.inputMap[bestValue.index]:bestValue.index) + " with " + Math.min(bestValue.confidence-bestValue.secondBest)*100 + "% confidence.");
    }
    drawBox.train.onclick = ()=>{
        drawBox.network.learn(drawBox.data, parseInt(drawBox.trainNumber.value));
    }

    drawBox.confirm.onclick = ()=>{
        let output = [];
        for(let i = 0; i < drawBox.outputs; i++){
            output.push((i==drawBox.inputMapNumber)?1:0);
        }
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,0,0)), new Vector(output)));
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,0.1,0.1)), new Vector(output)));
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,0.1,0)), new Vector(output)));
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,0.1,-0.1)), new Vector(output)));
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,0,-0.1)), new Vector(output)));
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,-0.1,-0.1)), new Vector(output)));
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,-0.1,0)), new Vector(output)));
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,-0.1,0.1)), new Vector(output)));
        drawBox.data.push(new TrainingDatum(new Vector(drawBox.image.rastor(drawBox.xDim,drawBox.yDim,0,0.1)), new Vector(output)));

        drawBox.inputMapNumber++;
        drawBox.inputMapNumber = drawBox.inputMapNumber%drawBox.outputs;
        drawBox.number.value = (drawBox.inputMap)?drawBox.inputMap[drawBox.inputMapNumber]:drawBox.inputMapNumber;
        drawBox.image.clear();
    }
    drawUpdate();
}
function draw(){
    ctx.clearRect(drawBox.x,drawBox.y,drawBox.dim*drawBox.xDim,drawBox.dim*drawBox.yDim);
    ctx.strokeRect(drawBox.x,drawBox.y,drawBox.dim*drawBox.xDim,drawBox.dim*drawBox.yDim);
    ctx.stroke();
    ctx.putImageData(drawBox.image.toImageData(),drawBox.x, drawBox.y);
}
function drawUpdate(){  
    if(mouse.left){
        drawBox.image.addLine(mouse.x-drawBox.x,mouse.y-drawBox.y-100,drawBox.pointerX-drawBox.x,drawBox.pointerY-drawBox.y-100,10,1);
    }
    if(mouse.right){
        drawBox.image.addLine(mouse.x-drawBox.x,mouse.y-drawBox.y-100,drawBox.pointerX-drawBox.x,drawBox.pointerY-drawBox.y-100,40,0);
    }
    drawBox.pointerX = mouse.x;
    drawBox.pointerY = mouse.y;
    draw();
    window.requestAnimationFrame(drawUpdate);
}
class image{
    constructor(width,height){
        this.array = [];
        this.width = width;
        this.height = height;
        for(let i = 0; i < width*height; i++){
            this.array.push(0);
        }
    }
    addLine(x1,y1,x2,y2,width, value){
        let step = 1/Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
        let xvect = (x2-x1)*step;
        let yvect = (y2-y1)*step;
        let xnorm = -yvect
        let ynorm = xvect;
        let x = x1;
        let y = y1;
        for(let i = 0; i < 1/step; i++){
            for(let w = -width; w <= width; w+=0.5){
                this.set(Math.floor(x+xnorm*w), Math.floor(y+ynorm*w), value);
                this.set(Math.floor(x+xnorm*w+xvect), Math.floor(y+ynorm*w+yvect), value);

            }
            x+=xvect;
            y+=yvect;
        }
    }
    set(x,y, value){
        if(x>=0&&x<this.width&&y>=0&&y<this.height){
            this.array[x+y*this.width] = value;
        }
    }
    at(x,y){
        if(x>=0&&x<this.width&&y>=0&&y<this.height){
            return this.array[x+y*this.width];
        }
        return 0;
    }
    clear(){
        for(let i = 0; i < this.array.length; i++){
            this.array[i] = 0;
        }
    }
    averageInsquare(x1,y1,x2,y2){
        let total = 0;
        for(let y = y1; y < y2; y++){
            for(let x = x1; x < x2; x++){
                total += this.at(x,y);
            }
        }
        return total/((x2-x1)*(y2-y1));
    }
    rastor(width,height,offsetx, offsety){
        let array = []
        let xRatio = this.width/width;
        let yRatio = this.height/height;
        for(let y = 0; y < this.width-0.1; y += yRatio){
            for(let x = 0; x < this.width-0.1; x += xRatio){
                array.push(this.averageInsquare(Math.floor(x+offsetx*this.width),Math.floor(y+offsety*this.width), Math.floor(x+xRatio+offsetx*this.width), Math.floor(y+yRatio+offsety*this.height)));
            }
        }
        return array;
    }
    toImageData(){
        /*var imgData = ctx.createImageData(100, 100);
        var i;
        for (i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i+0] = 255;
        imgData.data[i+1] = 0;
        imgData.data[i+2] = 0;
        imgData.data[i+3] = 255;
        }*/
        let imgData = ctx.createImageData(this.width,this.height);
        for(let i = 0; i < imgData.data.length; i +=4){
            imgData.data[i+3] = this.array[i/4]*255;
        }
        return imgData;
    }
}
var drawBox = {X:0, Y:0, xDim: 0, yDim: 0, dim: 10, array: []};
var mouse = {x:0, y:0, left: false, right: false, middle: false}