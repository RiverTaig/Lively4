let prevX = -1;
let prevY = -1;
let plotHookSet = false;

function onResize() {
    //The canvas (which is always square) starts at either column 3 or 26 depending on if "What is Liveliness"
    // is visible the canvas disappears if the height exceeds the width (i.e "portrait"), and "Instructions"
    //is then slid over
    let canvas = canvasRef();
    let canvasDiv = document.getElementById('canvasDiv');
    let relAbs = document.getElementById('relativeAbsolute');
    let showHide = document.getElementById('showHide');
    let xaxis = document.getElementById('xAxis');
    let yaxis = document.getElementById('yAxis');
    let loadData = document.getElementById('loadData');
    let dataTable = document.getElementById('dataTable');
    let addButton = document.getElementById('addButton');
    let whatIsLiveliness = document.getElementById('whatIsLiveliness');
    let w = canvasDiv.offsetWidth;
    let h = canvasDiv.offsetHeight;
    let whatIsVisible = true

    if (window.innerWidth < 900) { //NARROW WIDTH MODE
        whatIsLiveliness.style.visibility = 'hidden';
        whatIsVisible = false
    }
    else {
        whatIsLiveliness.style.visibility = 'unset';
    }
    if (window.innerHeight > window.innerWidth || whatIsVisible === false) { //PORTRAIT MODE HIDES CANVAS AND "WHAT IS" 
        canvasDiv.style.visibility = 'hidden';
        relAbs.style.visibility = 'hidden';
        showHide.style.visibility = 'hidden';
        xaxis.style.visibility = 'hidden';
        yaxis.style.visibility = 'hidden';
        loadData.style.visibility = 'hidden';
        $('#instructions').css('grid-column', '3/98');
        $('#instructionsContentContainer').css('grid-column', '3/98');
        $('#dataTable').css('grid-column', '3/98');
        $('#addButton').css('grid-column', '3/98');
        $('.hiddenAnchor').each((i, val) => {
            val.style.visibility = 'unset'
        })
    }
    else {
        canvasDiv.style.visibility = 'unset';
        canvasDiv.style.visibility = 'unset';
        relAbs.style.visibility = 'unset';
        showHide.style.visibility = 'unset';
        xaxis.style.visibility = 'unset';
        yaxis.style.visibility = 'unset';
        loadData.style.visibility = 'unset';
        $('.hiddenAnchor').each((i, val) => {
            val.style.visibility = 'hidden'
        })
        $('#dataTable').css('grid-column', '26/98');
        $('#addButton').css('grid-column', '26/98');
        resizeInstructionsAndCanvas(canvas, h, w);
    }
}
function resizeInstructionsAndCanvas(canvas, h, w) {
    redrawCanvas(canvas);
    //canvas.height = h < w ? w : h;
    //canvas.width = canvas.height;
    let originalCanvasDivWidth = document.getElementById('canvasDiv').width;
    document.getElementById("canvasDiv").style.width = canvas.width + "px";
    let windowWidth = window.innerWidth;
    let percentOccupiedLeftOfGrid = .25 + (parseInt(document.getElementById("canvasDiv").style.width) / windowWidth);
    let spaceForInstructions = (100 * (.98 - percentOccupiedLeftOfGrid)) - 1;

    let yaxis = document.getElementById("yAxis");
    let xaxis = document.getElementById("xAxis");
    let loadDataButton = document.getElementById("loadData");
    yaxis.style.top = (canvas.offsetTop + (canvas.height / 1.5) - (1 * yaxis.offsetWidth)) + "px";
    xaxis.style.left = canvas.offsetLeft + (canvas.width / 2) + "px"; //(canvas.offsetLeft + (windowWidth * .1)) + "px";
    xaxis.style.top = (canvas.offsetTop + canvas.height + -(1 * xaxis.offsetHeight)) + "px";
    let rotateWidth = (-.45 * yaxis.offsetWidth) + canvas.offsetLeft;
    yaxis.style.left = rotateWidth + "px";
    let ctx = DrawResiliancyLine();


    if (plotHookSet === false) {
        //var elementsArray = document.querySelectorAll('.livelyInput');
        $(".livelyInput").bind('keyup input', function () {
            let canvas = canvasRef();
            drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height);
        });
        plotHookSet = true;
        document.getElementById("btnPlot").onclick = () => {
            let canvas = canvasRef();
            drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height);
        };
    }

    /*tooltips*/
    // var graph = canvasRef();
    // var ctx = graph.getContext("2d");
    // var tipCanvas = document.getElementById("tip");
    // var tipCtx = tipCanvas.getContext("2d");

    // var canvasOffset = $("#graph").offset();
    // var offsetX = canvasOffset.left;
    // var offsetY = canvasOffset.top;

    // var graph;
    // var xPadding = 30;
    // var yPadding = 30;
  


    canvas.onmousemove = function (e) {
        try{
            
            handleMouseMove(e);
        }
        catch(ex){
            console.log(ex);
        }
        
        return;
        let x = e.layerX;
        document.getElementById("x").innerText = x;
        let h = document.getElementById("myCanvas").height;
        let w = document.getElementById("myCanvas").width;
        let y = Math.abs(h - e.layerY);
        document.getElementById("y").innerText = y;
        var p = {
            x,
            y
        };
        let lineFromPoint = {
            x: 0,
            y: h,
        };
        let lineToPoint = {
            x: w,
            y: 0,
        };
        let outReturnPoint = { x: 0, y: 0 };
        let d = distToSegment(p, lineFromPoint, lineToPoint, outReturnPoint);
        document.getElementById("distance").innerText = d; //distToSegment(p, lineFromPoint, lineToPoint, outReturnPoint);
        document.getElementById("returnPoint").innerText = Math.round(outReturnPoint.x) + "," + Math.round(outReturnPoint.y);
        document.getElementById("w").innerText = w;
        let plusOrMinus = 1;
        if (outReturnPoint.x >= x) {
            document.getElementById("plusOrMinus").innerText = "NEGATIVE";
            plusOrMinus = -1;
        }
        else {
            document.getElementById("plusOrMinus").innerText = "POSITIVE";
        }
        document.getElementById("liveliness").innerText = (plusOrMinus * d).toFixed(2);
    };
}

var yarnIds = {};
function Init() {
    onResize();
  
    adjustElRlImagesOnCanvas();
    $('input[type=number]').change(function () {
        adjustElRlImagesOnCanvas();
    });
    $('input[type=radio][name=colorRadios]').change(function () {
        $('.yarnSymbol').each((index, element) => {
            color = this.value;
            console.log('color: ' + color);
            element.setAttribute("fill", color);
        })

    });
    $('input[type=radio][name=symbolRadios]').change(function () {
        let symbolSquare = document.getElementById("symbolSquare");
        let symbolTriangle = document.getElementById("symbolTriangle");
        let symbolCircle = document.getElementById("symbolCircle");
        symbolCircle.style.visibility = 'hidden';
        symbolTriangle.style.visibility = 'hidden';
        symbolSquare.style.visibility = 'hidden';
        if (this.value == 'circle') {
            symbolCircle.style.visibility = 'unset';
        }
        else if (this.value == 'triangle') {
            symbolTriangle.style.visibility = 'unset';
        }
        else { //Square
            symbolSquare.style.visibility = 'unset';
        }
    });
    $("#btnAddYarn").click((event) => {
        try {
            let yarnID = $("#txtYarnId").val();
            let yarnNotes = $("#txtYarnNotes").val();
            let elasticLength = parseFloat($("#txtElasticLength").val())
            let resilancyLength = parseFloat($("#txtResiliancyLength").val())
            let color = document.querySelector('input[name="colorRadios"]:checked').value;
            let symbol = document.querySelector('input[name="symbolRadios"]:checked').value;

            let error = false;
            if ([yarnID, yarnNotes, elasticLength, resilancyLength].some((el) => el === '')) {
                alert("Please fill in all values");
                error = true;
            }
            if (elasticLength < resilancyLength) {
                alert("Resiliancy Length must be less than Elastic Length");
                error = true;
            }
            if (yarnIds[yarnID !== undefined]) {
                alert("Sorry, that yarn ID is already in use. Please delete it first.")
                error = true;
            }
            if (error) {
                event.preventDefault();
                return false;
            }
            let svgSymbol = '<svg height="16" width="16"><circle class="yarnSymbol" style="visibility:unset"  cx="8" cy="8" r="8"  fill="' + color + '" />xx</svg>'
            //h, w, erase = true, el = -1, sl = -1, rl = -1, sample = '', color = 'magenta', symbol = 'circle',size=4,yarnNotes='unset' ) {
            let lively = drawPlotPointAndCalculateLiveliness(canvasRef().width, canvasRef().height, false, elasticLength, 10, resilancyLength, yarnID, color, symbol,8, yarnNotes);
            dataTableReference().row.add([
                yarnID,
                svgSymbol,
                elasticLength,
                resilancyLength,
                "<span class='lively'>" + lively + "</span>",
                yarnNotes,
                "<img width='32px' id='img" + yarnID + "' class='icon-delete' height='32px' src='trash.png'></img>"
            ]).draw(false);
        }
        catch (ex) {
            debugger;
            console.log("ERROR " + ex.toString())
        }
    });
}
function loadSamples(x) {
    let sampleButton = document.getElementById('imgSample')
    if (sampleButton.src.toString().toUpperCase().indexOf("REMOVESAMPLE.PNG") > -1) {
        document.getElementById('imgSample').src = "Sample.png"
        DrawResiliancyLine();
        $("td:first-child").each((index, el) => {
            let id = el.innerText;
            if (id.startsWith('#')) {
                //REMOVE this row
                let selector = 'img' + id.replace('#', 'x'); //# are illegal in ids
                let trashImage = document.getElementById(selector);
                //debugger;
                trashImage.click();
            }
        });
    }
    else {
        document.getElementById('imgSample').src = "RemoveSample.png"
        $('#loadDataButton').click();
    }
}
function adjustElRlImagesOnCanvas(image = "ruler,original,elastic,resiliancy") {
    if (image.indexOf("ruler") > -1) {
        var c = document.getElementById("rulerCanvas");
        var ctx = c.getContext("2d");
        var img = new Image();
        img.onload = drawImageScaled.bind(null, img, ctx);
        drawImageScaled(img, ctx);
        img.src = 'ruler2.jpg';
    }
    if (image.indexOf("original") > -1) {
        var c1 = document.getElementById("originalCanvas");
        var ctx1 = c1.getContext("2d");
        var img1 = new Image();
        img1.onload = drawImageScaled.bind(null, img1, ctx1);
        drawImageScaled(img1, ctx1);
        img1.src = 'stretched.jpg';
    }
    if (image.indexOf("elastic") > -1) {
        var c2 = document.getElementById("stretchedCanvas");
        var ctx2 = c2.getContext("2d");
        var img2 = new Image();
        img2.onload = drawImageScaled.bind(null, img2, ctx2);
        drawImageScaled(img2, ctx2);
        img2.src = 'stretched.jpg';
    }
    if (image.indexOf("resiliancy") > -1) {
        var c3 = document.getElementById("relaxedCanvas");
        var ctx3 = c3.getContext("2d");
        var img3 = new Image();
        img3.onload = drawImageScaled.bind(null, img3, ctx3);
        drawImageScaled(img3, ctx3);
        img3.src = 'stretched.jpg';
    }
}

function drawImageScaled(img, ctx) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let l = 15.5;
    let adjustLabel = null;
    if (ctx.canvas.id === "originalCanvas") {
        l = 10;
        adjustLabel = $("#startLabel");
    }

    if (ctx.canvas.id === "stretchedCanvas") {
        l = parseFloat($("#txtElasticLength").val());
        adjustLabel = $("#elasticLabel")
        $("#elasticLabelValue")[0].innerHTML = l + '"';
    }
    if (ctx.canvas.id === "relaxedCanvas") {
        l = parseFloat($("#txtResiliancyLength").val());
        adjustLabel = $("#resiliancyLabel")
        $("#resiliancyLabelValue")[0].innerHTML = l + '"';
    }
    if (ctx.canvas.id === "rulerCanvas") {
        l = 15.5;
        adjustLabel = null;
    }
    let len = l - 8.5;
    let percentOfRuler = len / 7;
    let pixels = percentOfRuler * 600
    ctx.drawImage(img, 0, 0, img.width, img.height * percentOfRuler, 0, 0, canvas.width, pixels)
    if (adjustLabel !== null) {
        adjustLabel[0].style.marginTop = (-1 * (600 - pixels)) + "px";
    }
    return;


    //The ruler is 7" long and starts at 8.5". The original, being always at 10" is therefore up
    //1.5". So, 1.5 / 7 = .214. Since the height=600px, the height of the original is
    // .214*600=129 px
    if (ctx.canvas.id === "originalCanvas") {
        ctx.drawImage(img, 0, 0, img.width, img.height * .216, 0, 0, canvas.width, 129)

    }
    else if (ctx.canvas.id === "rulerCanvas") {
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
    }
    else if (ctx.canvas.id === "stretchedCanvas") {
        let el = parseFloat($("#txtElasticLength").val());
        let len = el - 8.5;
        let percentOfRuler = len / 7;
        let pixels = percentOfRuler * 600;
        ctx.drawImage(img, 0, 0, img.width, img.height * percentOfRuler, 0, 0, canvas.width, pixels)
    }
    else if (ctx.canvas.id === "relaxedCanvas") {
        let l = parseFloat($("#txtResiliancyLength").val());
        let len = l - 8.5;
        let percentOfRuler = len / 7;
        let pixels = percentOfRuler * 600;
        ctx.drawImage(img, 0, 0, img.width, img.height * percentOfRuler, 0, 0, canvas.width, pixels)
    }
    else {
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }

}
var _dataTableReference = null;
function dataTableReference() {
    if (_dataTableReference === null) {
        _dataTableReference = $('#example').DataTable({
            "scrollY": "20vh",
            "columns": [
                { "width": "80px" }, null, null, null, null, null, null
            ],
            "searching": false,
            "scrollCollapse": true,
            "paging": false,
            "info": false,
            select: {
                style: 'single'
            }
        });
    }
    return _dataTableReference;
}
function loadTable() {

    let t = dataTableReference();
    $('#example tbody').on('click', 'img.icon-delete', function () {
        //debugger;
        let idToRemove = -1;
        let thisYarnId = this.attributes["yarnid"].value;
        for(let i = 0 ; i < dots.length; i++){
            
            if(dots[i].yarnID === thisYarnId){
                idToRemove = i;
                break;
            }
        }
        if(idToRemove != -1){
            dots.splice(idToRemove, 1);
        }
        //debugger;

        t
            .row($(this).parents('tr'))
            .remove()
            .draw();
    });
    var counter = 1;
    $('#example tbody').on('click', 'tr', function () {
        $(this).toggleClass('selected');
    });
    $('#loadDataButton').on('click', function () {
        let sampleSets = [sampleSet1(), sampleSet2()];//,sampleSet3(),sampleSet4(),sampleSet5(),sampleSet6()]
        let canvas = canvasRef();
        let colors = ['blue', 'red'];
        let symbols = ['triangle', 'square', 'circle'];
        sampleSets.forEach((sampleSet, index) => {
            let color = colors[index]
            let symbol = symbols[index]
            let svgSymbol = '<svg height="16" width="16"><circle   class="yarnSymbol" style="visibility:unset"  cx="8" cy="8" r="8"  fill="' + color + '" />xx</svg>'
            for (let i = 0; i < sampleSet.length; i++) {
                let data = sampleSet[i].split(',');
                let id = data[0];
                let sl = data[1];
                let el = data[2];
                let rl = data[3];
                let lively = drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height, false, el, sl, rl, id);
                t.row.add([
                    id,
                    svgSymbol,
                    el,
                    rl,
                    "<span class='lively'>" + lively + "</span>",
                    'notes',
                    "<img width='32px' yarnId='" + id + "' id='img" + id.replace('#', 'x') + "' class='icon-delete' height='32px' src='trash.png'></img>"
                ]).draw(false);
                counter++;
            }
        });
    });
}
var _canvasRef = null;
function canvasRef() {
    if (_canvasRef == null) {
        _canvasRef = document.getElementById("myCanvas")
    }
    return _canvasRef;
}
function getPlotPointFromDataPoint(el, rl, sl) {
    let w = canvasRef().width;
    let elasticityPercent = (el - sl) / sl;
    let resiliancyPercent = (el - rl) / (el - sl);
    let plotPointX = w * resiliancyPercent;
    let plotPointY = (w * elasticityPercent);
    return { x: plotPointX, y: plotPointY }
}
//https://stackoverflow.com/questions/17064913/display-tooltip-in-canvas-graph

function drawPlotPointAndCalculateLiveliness(h, w, erase = true, el = -1, sl = -1, rl = -1, sample = '', color = 'magenta', symbol = 'circle',size=4,yarnNotes='unset', yarnID="-1") {
    var { outReturnPlotPoint, p, livelyness } = getLivelyness(el, rl, sl, h, w);
    
    let sizeOverTwo = Math.round (size/2.0);
    dots.push({x:p.x, y:p.y, size, rXr : size*size, tip: yarnNotes, yarnID: sample});
    let posX = p.x;
    let posY = Math.round  (p.y - sizeOverTwo);

    //but before drawing, we have to invert
    outReturnPlotPoint.y = h - outReturnPlotPoint.y;

    let canvas = canvasRef();
    let ctx = canvas.getContext("2d");
    if (erase) {
        DrawResiliancyLine();
    }
    ctx.fillStyle = color
    ctx.beginPath();
    if(symbol === 'circle'){
        ctx.arc(p.x, p.y, size, 0, size * Math.PI);
    }
    else if (symbol === 'triangle'){
        
        ctx.moveTo(posX,posY);
        ctx.lineTo(posX + sizeOverTwo, p.y + sizeOverTwo);
        ctx.lineTo(posX - sizeOverTwo,  p.y + sizeOverTwo);
        ctx.fill();
    }
    else if (symbol === 'square'){
        ctx.fillRect(p.x, p.y, size, size);
    }
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(outReturnPlotPoint.x, outReturnPlotPoint.y);
    ctx.lineWidth = .5;
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
    if (el === -1) {
        sample = document.getElementById("sampleId").value;
    }
    ctx.font = "10px Arial";
    ctx.fillStyle = "#000000";
    ctx.fillText(sample, p.x + 9, p.y);

    ctx.fillText(livelyness, p.x + 9, p.y + 12);
    //TODO push into table to ensure uniqueness
    return livelyness
}

function getLivelyness(el, rl, sl, h, w) {
    let plotPoint = null;
    if (el === -1) {
        plotPoint = getPlotPoint();
    }
    else {
        plotPoint = getPlotPointFromDataPoint(el, rl, sl);
    }
    let y = Math.abs(h - plotPoint.y);
    var p = {
        x: plotPoint.x,
        y
    };
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
    let plusOrMinus = 1;
    if (outReturnPlotPoint.x >= plotPoint.x) {
        plusOrMinus = -1;
    }
    if (el === -1) {
        document.getElementById("livelinessEntered").innerText = (plusOrMinus * dEntered).toFixed(2);
        document.getElementById("livelyPoint").innerText = outReturnPlotPoint.x.toFixed(2) + "," + outReturnPlotPoint.y.toFixed(2);
    }
    let livelyness = (plusOrMinus * dEntered).toFixed(2);
    return { outReturnPlotPoint, p, livelyness };
}

function DrawResiliancyLine() {
    let canvas = canvasRef();
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLine(ctx, canvas.width, canvas.height);
    return ctx;
}

function getPlotPoint() {
    let w = canvasRef().width;
    let el = document.getElementById('el').value;
    let rl = document.getElementById('rl').value;
    let sl = document.getElementById('sl').value;
    let elasticityPercent = (el - sl) / sl;
    let resiliancyPercent = (el - rl) / (el - sl);
    document.getElementById("elasticity").innerText = elasticityPercent;
    document.getElementById("resiliancy").innerText = resiliancyPercent;
    let plotPointX = w * resiliancyPercent;
    let plotPointY = (w * elasticityPercent);
    document.getElementById("plotPoint").innerText = plotPoint.x.toFixed(1) + "," + plotPoint.y.toFixed(1);
    return { x: plotPointX, y: plotPointY }
}
function toggleCanvas() {
    showingDataTable = !showingDataTable;
    redrawCanvas();
}
var showingDataTable = true;
counter = 0;
function redrawCanvas(canvas) {
    //console.log("****  REDRAW CANVAS ****")
    let canvasDiv = document.getElementById('canvasDiv');
    if (!canvas) {
        canvas = canvasRef();
    }

    let pixelsToDataTable = window.innerHeight * (.76 - .14);
    let pixelsToInstructions = window.innerWidth * (.57 - .26);
    //console.log("pixelsToDT | pixelsToInstructions: " + pixelsToDataTable.toString() + "|" + pixelsToInstructions.toString())
    let startColForInstructions = 57;
    if (showingDataTable) {
        if (pixelsToDataTable < pixelsToInstructions) {
            //console.log("We can go all the way down to 70");
            $('#myCanvas').css('grid-row', '14/70');
            canvas.height = pixelsToDataTable;
            canvas.width = canvas.height
        }
        else {
            let percentWeCanGoDown = pixelsToInstructions / pixelsToDataTable
            let pixelsToGoDown = percentWeCanGoDown * pixelsToDataTable;
            let percentOfWindowWeWantToGoDown = 100 * pixelsToGoDown / window.innerHeight
            let endPercent = percentOfWindowWeWantToGoDown + 14 - 2;
            //console.log("Going down to " + endPercent);
            $('#myCanvas').css('grid-row', '14/' + endPercent.toString());
            canvas.width = pixelsToInstructions;
            canvas.height = canvas.width
        }
        //console.log("Canvas Width|Height: " + counter + "| " +  canvas.width + "|" + canvas.height);

        $('#myCanvas').css('z-index', '0');

        let canvasPercentAtRightSide = 26 + parseInt(100 * (canvas.width) / window.innerWidth);
        let showHidePosition = (canvasPercentAtRightSide - 16).toString() + '/' + (canvasPercentAtRightSide).toString()
        $('#showHide').css('grid-column', showHidePosition);
        counter++
        //Now that the canvas has been drawn into position we can draw the instructions.
        //The assumption for canvas placement is that the instructions were at .57% (which may have
        //therefore constrained the canvas).  Now that the canvas has been drawn though, the instructions
        //will actually go just to their left
        console.log("instructions setting to: ")
        let canvasRightEdgePercentPosition = (canvas.offsetLeft + canvas.width) / window.innerWidth;
        console.log("instructions setting to: " + canvasRightEdgePercentPosition)
        let instructionPosition = parseInt(2 + (100 * canvasRightEdgePercentPosition)) + "/100"
        console.log("instructions setting to: " + instructionPosition)
        $('#instructions').css('grid-column', instructionPosition);
        $('#instructionsContentContainer').css('grid-column', instructionPosition);
    }
    else {
        $('#myCanvas').css('grid-row', '14/101');//87%
        $('#myCanvas').css('grid-column', '26/101');
        $('#myCanvas').css('z-index', '99');
        //canvas.height = "87%"
        canvas.width = canvas.height;
    }

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
function getD() {
    let canvas = canvasRef();
    let width = canvas.width
    let wSquared = width * width;
    let twoWSquared = 2 * wSquared;
    let sqrtTwoWSquared = Math.sqrt(twoWSquared);
    let twoWSquaredOverTwo = sqrtTwoWSquared / 2;
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
    let canvas = canvasRef();
    let ctx = canvas.getContext('2d');
    return { ctx, canvas };
}

function runSample() {
    let sampleSets = [sampleSet1(), sampleSet2()];//,sampleSet3(),sampleSet4(),sampleSet5(),sampleSet6()]
    let htmlString = ""
    sampleSets.forEach(sampleSet => {
        let canvas = canvasRef();
        for (let i = 0; i < sampleSet.length; i++) {
            let data = sampleSet[i].split(',');
            let sampleId = data[0];
            document.getElementById("sampleId").value = data[0];
            document.getElementById("sl").value = data[1];
            document.getElementById("el").value = data[2];
            document.getElementById("rl").value = data[3];

            drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height, false);
            htmlString += "<br> " + (sampleId + "," + document.getElementById("livelinessEntered").innerText);

        }
    });

    document.getElementById("output").innerHTML = htmlString;
}//'#1.1,10,10.75,10'

function sampleSet1() {
    return ['#1.1,10,10.75,10',
        '#2.1,10,11.25,10',
        '#3.1,10,11.75,10.125',
        '#4.1,10,11.875,10.125',
        '#5.1,10,12.375,10',
        '#6.1,10,12.5,10.125',
        '#7.1,10,13.5,10',
        '#8.1,10,10.5,10',
        '#9.1,10,10.625,10.125',
        '#10.1,10,10.75,10',
        '#11.1,10,11,10',
        '#12.1,10,11.25,10',
        '#13.1,10,12.5,10.125',
        '#14.1,10,12.375,10.25',
        '#15.1,10,13.0,10.25',
        '#16.1,10,14.5,10.25']
}
function sampleSet2() {
    return ['#1.2,10,10.75,10',
        '#2.2,10,11.0,10.125',
        '#3.2,10,11.75,10',
        '#4.2,10,12.125,10',
        '#5.2,10,11.875,10.125',
        '#6.2,10,13.25,10.125',
        '#7.2,10,13.125,10.125',
        '#8.2,10,10.375,10.125',
        '#9.2,10,10.5,10',
        '#10.2,10,10.625,10',
        '#11.2,10,11,10',
        '#12.2,10,11.625,10',
        '#13.2,10,12.5,10',
        '#14.2,10,12.125,10',
        '#15.2,10,13.25,10.25',
        '#16.2,10,14.25,10.25',
    ]
}
function sampleSet3() {
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
function sampleSet4() {
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
function sampleSet5() {
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
function sampleSet6() {
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
        '#16.6,16,26.25,16.5']
}
var dots = [];

function initToolTip(){
    var graph = canvasRef();
    var ctx = graph.getContext("2d");
    var tipCanvas = document.getElementById("tip");
    var tipCtx = tipCanvas.getContext("2d");
    
    var canvasOffset = $("#graph").offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    
    var graph;
    var xPadding = 30;
    var yPadding = 30;    
}
// show tooltip when mouse hovers over dot
function handleMouseMove(e) {

    if(offsetX === undefined){
        var graph = canvasRef();
        var ctx = graph.getContext("2d");
        var tipCanvas = document.getElementById("tip");
        var tipCtx = tipCanvas.getContext("2d");
        
        var canvasOffset = $('#myCanvas').offset();
        var offsetX = canvasOffset.left;
        var offsetY = canvasOffset.top;
        
        var graph;
        var xPadding = 30;
        var yPadding = 30;  
    }
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mousemove stuff here
    var hit = false;
    for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        var dx = mouseX - dot.x;
        var dy = mouseY - dot.y;
        if (dx * dx + dy * dy < dot.rXr) {
            //debugger;
            let xOff = graph.getClientRects()[0].x
            let yOff = graph.getClientRects()[0].y
            tipCanvas.style.left = (xOff + dot.x) + "px";
            tipCanvas.style.top = (yOff + dot.y - 40) + "px";
            tipCtx.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
            //                  tipCtx.rect(0,0,tipCanvas.width,tipCanvas.height);
            tipCtx.fillText(dot.tip, 5, 15);
            hit = true;
        }
    }
    if (!hit) {
        tipCanvas.style.left = "-200px";
    }
}


// unchanged code follows

// Returns the max Y value in our data list
function getMaxY() {
    var max = 0;

    for (var i = 0; i < data.values.length; i++) {
        if (data.values[i].Y > max) {
            max = data.values[i].Y;
        }
    }

    max += 10 - max % 10;
    return max;
}

// Returns the max X value in our data list
function getMaxX() {
    var max = 0;

    for (var i = 0; i < data.values.length; i++) {
        if (data.values[i].X > max) {
            max = data.values[i].X;
        }
    }

    // omited
    //max += 10 - max % 10;
    return max;
}

// Return the x pixel for a graph point
function getXPixel(val) {
    // uses the getMaxX() function
    return ((graph.width - xPadding) / (getMaxX() + 1)) * val + (xPadding * 1.5);
    // was
    //return ((graph.width - xPadding) / getMaxX()) * val + (xPadding * 1.5);
}

// Return the y pixel for a graph point
function getYPixel(val) {
    return graph.height - (((graph.height - yPadding) / getMaxY()) * val) - yPadding;
}

