function init(){
    canvas = document.createElement('canvas');
    canvas.style.position='absolute';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.left='0px';
    canvas.style.top='100px';
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    drawInit(200,200, 20, 20, 20, [16,16], ["circs", "tris", "squares"]);
}
class Matrix {
    constructor(elements){//array of rows
        this.elements = elements;
    }
    multiply(vector){
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push(0);
            for(let vectIndex=0; vectIndex < vector.elements.length; vectIndex++){
                ret[ret.length-1]+=vector.elements[vectIndex]*this.elements[i][vectIndex];
            }
        }
        return new Vector(ret);
    }
    transposeMultiply(vector){
        let ret = [];
        for(let i = 0; i < this.elements[0].length; i++){
            ret.push(0);
            for(let vectIndex=0; vectIndex < this.elements.length; vectIndex++){
                ret[ret.length-1]+=vector.elements[vectIndex]*this.elements[vectIndex][i];
            }
        }
        return new Vector(ret);
    }
    T(){
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push([]);
            for(let i1 = 0; i1 < this.elements[0].length; i1++){
                ret[ret.length-1].push(this.elements[i1][i]);
            }
        }
        return new Matrix(ret);
    }
}
class Vector {
    constructor(elements){
        this.elements = elements;
    }
    sum(vector){
        if(this.elements.length!=vector.elements.length){
            throw "ree";
        }
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push(this.elements[i]+vector.elements[i]);
        }
        return new Vector(ret);
    }
    hadamond(vector){
        if(this.elements.length!=vector.elements.length){
            throw "ree";
        }
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push(this.elements[i]*vector.elements[i]);
        }
        return new Vector(ret);
    }
    sigmoid(){
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push(sigmoid(this.elements[i]));
        }
        return new Vector(ret);
    }
    inverseSigmoid(){
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push(inverseSigmoid(this.elements[i]));
        }
        return new Vector(ret);
    }
    derivativeSigmoid(){
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push(derivativeSigmoid(this.elements[i]));
        }
        return new Vector(ret);
    }
    of(fun){
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push(fun(this.elements[i]));
        }
        return new Vector(ret);
    }
    C(vector){
        let ret = 0;
        for(let i = 0; i < this.elements.length; i++){
            ret += (this.elements[i]-vector.elements[i])*(this.elements[i]-vector.elements[i])*0.5;
        }
        return ret;
    }
    costDerivative(vector){
        let ret = [];
        for(let i = 0; i < this.elements.length; i++){
            ret.push(this.elements[i]-vector.elements[i]);
        }
        return new Vector(ret);
    }
}
class Layer{
    constructor(weight, bias){
        this.weights = weight;
        this.bias = bias;
    }
    compute(input){
        let weighted = this.weights.multiply(input. activation).sum(this.bias);
        return {weighted: weighted, activation: weighted.sigmoid()}
    }
}
class TrainingDatum{
    constructor(input, expectedOutput){
        this.input = input;
        this.output = expectedOutput;
    }
    static generateFromWeights(weights, number){
        let ret = [];
        let w = [];
        for(let i = 0; i < weights; i++){
            w.push(Math.random());
        }
        for(let i = 0; i < number; i++){
            let inputs = [];
            let output = 0;
            for(let j = 0; j < weights; j++){
                let a = Math.random();
                inputs.push(a);
                output+=a*w[j];
            }
            ret.push(new TrainingDatum(new Vector(inputs),new Vector([sigmoid(output)])));
        }
        return ret;
    }
}
class Network{
    constructor(layers){
        this.layers = layers;
        this.learnRate = 0.5;
    }
    static generate(input, layers){//layers is just an array of numbers signifing the nodes in each layer
        let lays = [];
        for(let layer = 0; layer < layers.length; layer++){
            let bias = [];
            let weight = [];
            let inputs = (layer)?layers[layer-1]:input;
            for(let w = 0; w < layers[layer]; w++){
                bias.push(0);
                let subWeight = [];
                for(let i = 0; i < inputs; i++){
                    subWeight.push(Math.random());
                }
                weight.push(subWeight);
            }
            lays.push(new Layer(new Matrix(weight),new Vector(bias)));
        }
        return new Network(lays);
    }
    static generateTest(){
       return new Network([new Layer(new Matrix([[0.15,0.2],[0.25,0.3]]),new Vector([0.35,0.35])), new Layer(new Matrix([[0.4,0.45],[0.5,0.55]]),new Vector([0.6,0.6]))]);
    }
    compute(input){
        let values = [{weighted: input.inverseSigmoid(), activation: input}]; //values at each layer
        this.layers.forEach(layer => {
            values.push(layer.compute(values[values.length-1]));
        });
        return values;
    }
    weight(l,j,k){
        return this.layers[l].weights.elements[j][k];
    }
    bias(l,j){
        return this.layers[l].bias.elements[j];
    }
    shakeUp(){
        for(let layer = 0; layer<this.layers.length; layer++){
            for(let node = 0; node < this.layers[layer].bias.elements.length; node++){
                this.layers[layer].bias.elements[node]+=((Math.random()>0.5)?1:-1);
                for(let entryNode = 0; entryNode < this.layers[layer].weights.elements[0].length; entryNode++){
                    this.layers[layer].weights.elements[node][entryNode]+=((Math.random()>0.5)?1:-1)
                }
            }
        }
    }
    learn(dataSet, repititions){
        let preCost;
        let postCost;
        for(let rep = 0; rep < repititions; rep ++){
            if(rep%100==0){
                console.log(100*rep/repititions+"%");
            }
            let desiredWeights = [];
            let desiredBiases = [];
            let totalCost = 0;
            this.layers.forEach(lay=>{
                desiredBiases.push([]);
                lay.bias.elements.forEach(bias=>{
                    desiredBiases[desiredBiases.length-1].push(0);
                });
                desiredWeights.push([])
                lay.weights.elements.forEach(ele=>{
                    desiredWeights[desiredWeights.length-1].push([]);
                    ele.forEach(e=>{
                        desiredWeights[desiredWeights.length-1][desiredWeights[desiredWeights.length-1].length-1].push([]);
                    });
                });
            })
            dataSet.forEach(ele=>{
                let data = this.compute(ele.input);
                let errors = new Array(this.layers.length);
                let error = data[data.length-1].activation.costDerivative(ele.output).hadamond(data[data.length-1].weighted.derivativeSigmoid());
                totalCost += data[data.length-1].activation.C(ele.output);
                errors[errors.length-1]=error;
                for(let layer = this.layers.length-2; layer>=0; layer--){
                    //if(isNaN(this.layers[layer+1].weights.T().multiply(error).hadamond(data[layer+1].weighted.derivativeSigmoid()).elements[0])){
                    //    throw "oof";
                    //}
                    error = this.layers[layer+1].weights.transposeMultiply(error).hadamond(data[layer+1].weighted.derivativeSigmoid());
                    errors[layer]=error;
                }
                
                for(let layer = 0; layer<this.layers.length; layer++){
                    for(let node = 0; node < this.layers[layer].bias.elements.length; node++){
                        desiredBiases[layer][node]-=errors[layer].elements[node]*this.learnRate;
                        for(let entryNode = 0; entryNode < data[layer].weighted.elements.length; entryNode++){
                            desiredWeights[layer][node][entryNode]-=errors[layer].elements[node]*data[layer].activation.elements[entryNode]*this.learnRate;
                        }
                    }
                }

                /*for(let layer = 0; layer<this.layers.length; layer++){
                    for(let node = 0; node < this.layers[layer].bias.elements.length; node++){
                        this.layers[layer].bias.elements[node]-=errors[layer].elements[node]*this.learnRate;
                        for(let entryNode = 0; entryNode < data[layer].weighted.elements.length; entryNode++){
                            this.layers[layer].weights.elements[node][entryNode]-=errors[layer].elements[node]*data[layer].activation.elements[entryNode]*this.learnRate;
                        }
                    }
                }*/
            });
            for(let layer = 0; layer<this.layers.length; layer++){
                for(let node = 0; node < this.layers[layer].bias.elements.length; node++){
                    this.layers[layer].bias.elements[node]+=desiredBiases[layer][node];
                    for(let entryNode = 0; entryNode < this.layers[layer].weights.elements[0].length; entryNode++){
                        this.layers[layer].weights.elements[node][entryNode]+=desiredWeights[layer][node][entryNode];
                    }
                }
            }
            if(rep==0){
                preCost = totalCost/dataSet.length;
            }
            if(rep == repititions-1){
                postCost = totalCost/dataSet.length;
            }
        }
        console.log("cost was: " + preCost + ". Now it is: " + postCost);
        //let dumbSolution = (this.layers[this.layers.length-1].bias.elements.length-1);
        //dumbSolution = dumbSolution/(dumbSolution+1);
        if(preCost-postCost<0.01&&0.5-postCost<0.1){
            console.log("shaking up");
            for(let i = 0; i < repititions*postCost; i++){
                this.shakeUp();
            }
        }
    }
    draw(){
        ctx.clearRect(visulizationPos.x,visulizationPos.y,window.innerWidth-visulizationPos.x,window.innerHeight-visulizationPos.y);
        for(let lay = 0; lay < this.layers.length; lay++){
            this.layers[lay].weights.elements.forEach(function(e, index){
                e.forEach(function(ele, subIndex){
                    ctx.beginPath();
                    ctx.lineWidth = ele;
                    ctx.moveTo(visulizationPos.x+lay*50,visulizationPos.y+subIndex*30);
                    ctx.lineTo(visulizationPos.x+50+lay*50,visulizationPos.y+index*30);
                    ctx.stroke();
                });
            });
        }
    }
}
function sigmoid(x){
    return 1/(1+Math.pow(Math.E,-x));
}
function inverseSigmoid(x){
    if(x==0){
        return -1000;
    }
    if(x==1){
        return 1000;
    }
    return -Math.log(1/x-1);
}
function derivativeSigmoid(x){
    let a = sigmoid(x)
    return a*(1-a);
}

var canvas;
var ctx;
var visulizationPos = {x:100, y:100}
var network;
init();