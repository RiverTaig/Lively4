let prevX = -1;
let prevY = -1;
let plotHookSet = false;
function clearCanvas() {
    //the canvas starts at column 26
    let canvas = document.getElementById('myCanvas');
    let w = document.getElementById('canvasDiv').offsetWidth;
    let h = document.getElementById('canvasDiv').offsetHeight;
    canvas.height = h;
    canvas.width = canvas.height;
    let originalCanvasDivWidth = document.getElementById('canvasDiv').width  ;
    document.getElementById("canvasDiv").style.width = canvas.width + "px";
    
    let windowWidth = window.innerWidth;
    let percentOccupiedLeftOfGrid = .25  + (parseInt(document.getElementById("canvasDiv").style.width) / windowWidth);

    let spaceForInstructions = (100 * (.97 -   percentOccupiedLeftOfGrid))-1;
    let yaxis = document.getElementById("yAxis");
    let xaxis = document.getElementById("xAxis");
    let loadDataButton = document.getElementById("loadData");
    yaxis.style.top = (-20 + canvas.offsetTop + canvas.height  - (1 * yaxis.offsetWidth))+ "px"
    xaxis.style.left = canvas.offsetLeft + loadDataButton.offsetWidth   + 40 + "px"; //(canvas.offsetLeft + (windowWidth * .1)) + "px";
    xaxis.style.top = (canvas.offsetTop + canvas.height + - (1 * xaxis.offsetHeight) ) + "px"
    let rotateWidth = (-.45 * yaxis.offsetWidth) + canvas.offsetLeft 
    yaxis.style.left = rotateWidth + "px";

    let ctx = DrawResiliancyLine();
    if (plotHookSet === false) {
        //var elementsArray = document.querySelectorAll('.livelyInput');

        $(".livelyInput").bind('keyup input', function () {
            let canvas = document.getElementById('myCanvas');
            drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height);
        });


        plotHookSet = true;
        document.getElementById("btnPlot").onclick = () => {
            let canvas = document.getElementById('myCanvas');
            drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height);
        }
    }
    canvas.onmousemove = function (e) {
        let x = e.layerX;
        document.getElementById("x").innerText = x;
        let h = document.getElementById("myCanvas").height;
        let w = document.getElementById("myCanvas").width;
        //console.log("mouse move hw: " + h + "," + w);
        let y = Math.abs(h - e.layerY);
        document.getElementById("y").innerText = y;

        var p = {
            x,
            y
        }
        let lineFromPoint = {
            x: 0,
            y: h,
        }
        let lineToPoint = {
            x: w,
            y: 0,
        }
        let outReturnPoint = { x: 0, y: 0 };
        let d = distToSegment(p, lineFromPoint, lineToPoint, outReturnPoint);

        document.getElementById("distance").innerText = d;//distToSegment(p, lineFromPoint, lineToPoint, outReturnPoint);
        document.getElementById("returnPoint").innerText = Math.round(outReturnPoint.x) + "," + Math.round(outReturnPoint.y);
        document.getElementById("w").innerText = w;
        let plusOrMinus = 1;
        if (outReturnPoint.x >= x) {
            document.getElementById("plusOrMinus").innerText = "NEGATIVE"
            plusOrMinus = -1;
        }
        else {
            document.getElementById("plusOrMinus").innerText = "POSITIVE"
        }
        document.getElementById("liveliness").innerText = (plusOrMinus * d).toFixed(2);


    }

    //$('#canvasDiv').css('border''3px solid gray');
    //$('#canvasDiv').css('border-radius''5px');

}
function drawPlotPointAndCalculateLiveliness(h, w, erase = true) {
    //console.log("input hw: " + h + "," + w);
    let plotPoint = getPlotPoint();
    //console.log("plot point before invert: " + plotPoint.y);
    document.getElementById("plotPoint").innerText = plotPoint.x.toFixed(1) + "," + plotPoint.y.toFixed(1);
    let y = Math.abs(h - plotPoint.y);

    var p = {
        x: plotPoint.x,
        y
    }
    //console.log("Point p after invert: " + p.y);
    let lineFromPoint = {
        x: 0,
        y: h,
    };
    let lineToPoint = {
        x: w,
        y: 0,
    };

    let outReturnPlotPoint = { x: 0, y: 0 };
    //At this point p is in cartesian space which is what we need for the distance and return calculations
    let dEntered = distToSegment(plotPoint, lineFromPoint, lineToPoint, outReturnPlotPoint);
    //console.log("outReturn: " + outReturnPlotPoint.y);

    let plusOrMinus = 1;
    if (outReturnPlotPoint.x >= plotPoint.x) {
        plusOrMinus = -1;
    }
    document.getElementById("livelinessEntered").innerText = (plusOrMinus * dEntered).toFixed(2);

    //but before drawing, we have to invert
    //console.log("outReturn before invert: " + outReturnPlotPoint.y);
    document.getElementById("livelyPoint").innerText = outReturnPlotPoint.x.toFixed(2) + "," + outReturnPlotPoint.y.toFixed(2)
    outReturnPlotPoint.y = h - outReturnPlotPoint.y;
    
    let canvas = document.getElementById('myCanvas');
    let ctx = canvas.getContext("2d");
    if(erase){
        DrawResiliancyLine();
    }
    
    ctx.fillStyle = "#FF00FF";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(outReturnPlotPoint.x, outReturnPlotPoint.y);
    ctx.lineWidth = .5;
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
    let sample = document.getElementById("sampleId").value;
    ctx.font = "10px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(sample , p.x+9, p.y);
    let livelyness = (plusOrMinus * dEntered).toFixed(2);
    ctx.fillText(livelyness , p.x+9, p.y+12);

}

function DrawResiliancyLine() {
    let canvas = document.getElementById('myCanvas');
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLine(ctx, canvas.width, canvas.height);
    return ctx;
}

function getPlotPoint() {
    //test
    //commit 2
    let w = document.getElementById("myCanvas").width;
    let el = document.getElementById('el').value;
    let rl = document.getElementById('rl').value;
    let sl = document.getElementById('sl').value;
    let elasticityPercent = (el - sl) / sl;
    let resiliancyPercent = (el - rl) / (el - sl);
    document.getElementById("elasticity").innerText = elasticityPercent;
    document.getElementById("resiliancy").innerText = resiliancyPercent;
    let plotPointX = w * resiliancyPercent;
    let plotPointY = (w * elasticityPercent);
    return { x: plotPointX, y: plotPointY }
}

var showingDataTable = true;
function toggleCanvas() {
    showingDataTable = !showingDataTable;
    let canvasDiv = document.getElementById('canvasDiv');
    let canvas = document.getElementById('myCanvas');
    if (showingDataTable) {
        $('#myCanvas').css('grid-row', '14/70');//56%
        $('#myCanvas').css('grid-column', '26/65');
        $('#myCanvas').css('z-index', '0');
        canvas.height = "56%"
        canvas.width = canvas.height;
    }
    else {
        $('#myCanvas').css('grid-row', '14/101');//87%
        $('#myCanvas').css('grid-column', '26/101');
        $('#myCanvas').css('z-index', '99');
        canvas.height = "87%"
        canvas.width = canvas.height;
    }
 
}
function hideDataTable() {
    return;

}
function toggleSwitch(subclass, leftAction, rightAction) {

    var x = document.getElementsByClassName("toggleLabel");
    let xx = Array.prototype.filter.call(x, item => item.classList.contains(subclass));
    for (var i = 0; i < xx.length; i++) {
        if (xx[i].classList.contains("on")) {
            xx[i].classList.remove("on")
        }
        else {
            xx[i].classList.add("on")
            if (xx[i].classList.contains('left')) {
                //toggleCanvas(true);
            }
            else {
                //toggleCanvas(false);
            }
        }
    }
    leftAction();
}


function sqr(x) {
    return x * x
}

function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y)
}

function distToSegmentSquared(p, v, w, outReturnPoint) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    outReturnPoint.x = v.x + t * (w.x - v.x);
    outReturnPoint.y = v.y + t * (w.y - v.y);
    return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w, outReturnPoint) {

    let originalAnswer = Math.sqrt(distToSegmentSquared(p, v, w, outReturnPoint));
    let d = getD();
    let origTimeOneHundred = originalAnswer * 100;
    let adjustedAnswer = origTimeOneHundred / d;
    return adjustedAnswer;
}
function getD(){
    let canvas = document.getElementById('myCanvas');
    let width = canvas.width
    let wSquared = width * width;
    let twoWSquared = 2 * wSquared;
    let sqrtTwoWSquared = Math.sqrt(twoWSquared);
    let twoWSquaredOverTwo = sqrtTwoWSquared/2;
    return twoWSquaredOverTwo;    
}
function drawLine(ctx, w, h) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, h);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000"
    ctx.stroke();
}

function getCanvas() {
    let canvas = document.getElementById('myCanvas');
    let ctx = canvas.getContext('2d');
    return { ctx, canvas };
}
function runSample(){
    let sampleSets = [sampleSet1(),sampleSet2(),sampleSet3(),sampleSet4(),sampleSet5(),sampleSet6()]
    let htmlString = ""
    sampleSets.forEach(sampleSet => {
  
        for(let i = 0 ; i < sampleSet.length; i++){
            let data = sampleSet[i].split(',');
            let sampleId = data[0];
            document.getElementById("sampleId").value = data[0];
            document.getElementById("sl").value = data[1];
            document.getElementById("el").value = data[2];
            document.getElementById("rl").value = data[3];
            let canvas = document.getElementById('myCanvas');
            drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height,false);
            htmlString += "<br> " + (sampleId + "," + document.getElementById("livelinessEntered").innerText);

        }
    });
    
    document.getElementById("output").innerHTML = htmlString;
}//'#1.1,10,10.75,10'
function sampleSet1(){
return     ['#1.1,10,10.75,10',
'#2.1,10,11,10',
'#3.1,10,11.625,10.125',
'#4.1,10,11.75,10.125',
'#5.1,10,12.125,10',
'#6.1,10,12.625,10.125',
'#7.1,10,13.875,10',
'#8.1,10,10.625,10',
'#9.1,10,10.75,10.125',
'#10.1,10,10.875,10',
'#11.1,10,11,10',
'#12.1,10,11.625,10',
'#13.1,10,12,10.125',
'#14.1,10,12.125,10.25',
'#15.1,10,13.125,10.25',
'#16.1,10,14.25,10.25']
}
function sampleSet2(){
    return ['#1.2,10,10.75,10',
        '#2.2,10,11.375,10.125',
        '#3.2,10,11.5,10',
        '#4.2,10,12,10',
        '#5.2,10,12.125,10.125',
        '#6.2,10,13,10.125',
        '#7.2,10,14.625,10.125',
        '#8.2,10,10.5,10.125',
        '#9.2,10,10.875,10',
        '#10.2,10,10.625,10',
        '#11.2,10,11,10',
        '#12.2,10,11.375,10',
        '#13.2,10,13.125,10',
        '#14.2,10,12.5,10',
        '#15.2,10,13.75,10.25',
        '#16.2,10,14.125,10.25',
    ]
}
function sampleSet3(){
    return [
        '#1.3,14.0625,15,14.25',
'#2.3,14.0625,15.9375,14.53125',
'#3.3,13.59375,14.8,13.59375',
'#4.3,13.140625,15.5,14.0625',
'#5.3,12.25,14.53125,13.140625',
'#6.3,12.25,14.5,13.140625',
'#7.3,12.6875,14.953125,12.6875',
'#8.3,14.0625,15,14.53125',
'#9.3,14.34375,15.5,14.0625',
'#10.3,14.53125,15.5,14.53125',
'#11.3,14.53125,15,14.53125',
'#12.3,12.25,14.5,12.6875',
'#13.3,12.25,13.5625,12.6875',
'#14.3,12.25,14.5,13.140625',
'#15.3,12.25,15.16,12.25',
'#16.3,12.25,13.59375,12.25']
}
function sampleSet4(){
    return ['#1.4,14.0625,15,14.53125',
        '#2.4,14.0625,15.5,14.53125',
        '#3.4,14.0625,15,14.34375',
        '#4.4,14.0625,15.5,14.0625',
        '#5.4,13.140625,14.53125,14.0625',
        '#6.4,13.140625,14.953125,14.0625',
        '#7.4,12.6875,14.953125,12.6875',
        '#8.4,14.0625,14.53125,14.53125',
        '#9.4,14.53125,15.015625,14.53125',
        '#10.4,15.015625,15.5,14.25',
        '#11.4,14.53125,15,14.53125',
        '#12.4,14.0625,15,14.0625',
        '#13.4,13.140625,14.0625,13.140625',
        '#14.4,13.140625,15.4,14.0625',
        '#15.4,13.140625,13.59375,13.140625',
        '#16.4,14.0625,14.5,14.0625'
    ]
}
function sampleSet5(){
    return ['#1.5,15.9375,26.125,18',
        '#2.5,17.5,26.125,17.5',
        '#3.5,15.9375,24.9375,17',
        '#4.5,14.53125,21.375,16',
        '#5.5,15,21.375,15',
        '#6.5,16.5,26.203125,16.5',
        '#7.5,13,21.375,14.875',
        '#8.5,13.125,18.0625,14.0625',
        '#9.5,13.125,18.5625,15',
        '#10.5,14.0625,21.328125,15.5',
        '#11.5,14.0625,21.375,16',
        '#12.5,14.53125,22.5625,16',
        '#13.5,15,21.375,15.984375',
        '#14.5,15,22.5,15.3',
        '#15.5,14.0625,22.5625,14.53125',
        '#16.5,14.53125,24.9375,15.015625'
        ]
}
function sampleSet6(){
    return [
        '#1.6,17.53125,28.21875,19.140625',
'#2.6,16.46875,30.1875,18.0625',
'#3.6,17,27.5,18.0625',
'#4.6,16.5,26.125,17.53125',
'#5.6,16,26.125,17.5',
'#6.6,16.5,26.71875,18.046875',
'#7.6,14.53125,26.71875,16',
'#8.6,16.5,22.3125,18',
'#9.6,15.5,23.625,17.015625',
'#10.6,15.5,23.75,16.5',
'#11.6,16,24.375,17',
'#12.6,15.015625,24.375,16',
'#13.6,15,24.375,15.984375',
'#14.6,18,23.75,17.015625',
'#15.6,15.984375,25,17.5',
'#16.6,16,26.25,16.5'  ]
}