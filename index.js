let prevX = -1;
let prevY = -1;
//plotHookset is whether the event handler has been established for input boxes
let plotHookSet = false;

function onResize() {
    //The canvas (which is always square) starts at either column 3 or 26 depending on if "What is Liveliness"
    // is visible the canvas disappears if the height exceeds the width (i.e "portrait"), and "Instructions"
    //is then slid over
    let canvas = canvasRef();
    let canvasDiv = document.getElementById('canvasDiv');
    let relAbs = document.getElementById('relativeAbsolute');
    let xaxis = document.getElementById('xAxis');
    let yaxis = document.getElementById('yAxis');
    let loadData = document.getElementById('loadData');
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
    document.getElementById("canvasDiv").style.width = canvas.width + "px";
    let yaxis = document.getElementById("yAxis");
    let xaxis = document.getElementById("xAxis");
    yaxis.style.top = (canvas.offsetTop + (canvas.height / 1) - (1 * yaxis.offsetWidth)) + "px";
    xaxis.style.left = canvas.offsetLeft + (canvas.width / 8) + "px"; //(canvas.offsetLeft + (windowWidth * .1)) + "px";
    xaxis.style.top = (canvas.offsetTop + canvas.height + -(1 * xaxis.offsetHeight)) + "px";
    let rotateWidth = (-.45 * yaxis.offsetWidth) + canvas.offsetLeft;
    yaxis.style.left = rotateWidth + "px";
    DrawResiliancyLine();

    if (plotHookSet === false) {
        $(".livelyInput").bind('keyup input', function () {
            let canvas = canvasRef();
            drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height);
        });
        plotHookSet = true;
    }

    canvas.onmousemove = function (e) {
        try {
            handleMouseMove(e);
        }
        catch (ex) {
            console.error("ERROR " + ex);
        }
    };
}

var yarnIds = {};
function Init() {
    //document.getElementById("highlighter").visibility = 'unset';
    $( "#highlighter" ).hide()
    
    onResize();

    adjustElRlImagesOnCanvas();
    $('input[type=number]').change(function () {
        adjustElRlImagesOnCanvas();
    });
    $('input[type=radio][name=colorRadios]').change(function () {
        $('.yarnSymbol').each((index, element) => {
            color = this.value;
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
            if(relAbsMode === 'Relative'){
                $('#relAbsToggle').click();
            }
            let yarnID = $("#txtYarnId").val();
            let yarnNotes = $("#txtYarnNotes").val();
            let elasticLength = parseFloat($("#txtElasticLength").val())
            let resilancyLength = parseFloat($("#txtResiliancyLength").val())
            let color = document.querySelector('input[name="colorRadios"]:checked').value;
            color = color === 'blue' ? '#0000FF' : (color === 'green' ? '#00FF00' : '#FF0000')
            let symbol = document.querySelector('input[name="symbolRadios"]:checked').value;
            let error = false;
            error = checkForFormErrors(yarnID, yarnNotes, elasticLength, resilancyLength, error);
            if (error) {
                event.preventDefault();
                return false;
            }
            yarnIds[yarnID] = 1
            let svgSymbol = getSVGSymbol(color, symbol);

            let data = drawPlotPointAndCalculateLiveliness(canvasRef().width, canvasRef().height, false, elasticLength, 10, resilancyLength, yarnID, color, symbol, 8, yarnNotes);
            console.log("about to add: " + yarnID + " LI=" + data.livelyness)
            dataTableReference().row.add([
                yarnID, svgSymbol, elasticLength, resilancyLength,
                "<span class='lively'>" + data.livelyness + "</span>",
                yarnNotes,
                "<img width='32px' yarnid='" + yarnID + "' id='img" + yarnID + "' class='icon-delete' height='32px' src='trash.png'></img>",
                data.plotPoint.x.toString() + "," + data.plotPoint.y.toString()
            ]).draw(false);
        }
        catch (ex) {
            console.error("ERROR " + ex.toString())
        }
    });
}

function checkForFormErrors(yarnID, yarnNotes, elasticLength, resilancyLength, error) {
    if ([yarnID, yarnNotes, elasticLength, resilancyLength].some((el) => el === '')) {
        alert("Please fill in all values");
        error = true;
    }
    if (elasticLength < resilancyLength) {
        alert("Resiliency Length must be less than Elastic Length");
        error = true;
    }
    if (yarnIds[yarnID] === 1) {
        alert("Sorry, that yarn ID is already in use. Please delete it first.");
        error = true;
    }
    return error;
}

function PlotDataTableOnCanvasUsingRelativeScale(e) {
let ids = {}
    let t = dataTableReference().table();
    let rows = dataTableReference().table().rows();
    if(rows.count() < 2){
        alert("Sorry - you must have at least two rows to use relative scaling.")
        return;
    }
    let minMaxXY = getMinMaxAbsXY()
    let erase = true;
    useRelative = true
    let w = parseFloat(canvasRef().width);
    let minX = 9999; let minY = 9999; let maxX = -9999; let maxY = -9999;
    let sl = 10;
    dots = [];
    let size = 8;

    var table = $('#example').DataTable();
    let cntr = 0;
    table.rows().every( function () {
        var d = this.data();
        console.log("TEST " + d[0])
        let row = d;
        let el = parseFloat(row[2]);
        let rl = parseFloat(row[3]);
        let svgSymbol = (row[1]).toString();
        let { color, symbol } = getSymbolAndColorFromSvgSymbol(svgSymbol);
        let yarnNotes = row[5]
        let sample = row[0]
        if(sample == "#15.2"){
            //debugger
        }
        if (ids.hasOwnProperty(sample)){
            //debugger
        }
        ids[sample]=cntr.toString();
        let absXY = row[7].split(',')
        let absX = parseFloat(absXY[0]);
        let absY = parseFloat(absXY[1]);
        let percentRangeX = (absX - minMaxXY.minRLAdj) / (minMaxXY.maxRLAdj - minMaxXY.minRLAdj)
        let newX = w * percentRangeX;
        let percentRangeY = (absY - minMaxXY.minELAdj) / (minMaxXY.maxELAdj - minMaxXY.minELAdj)
        let newY = w * percentRangeY;
        let rp = { x: newX, y: newY }

        let { plotPoint, livelyness } = drawPlotPointAndCalculateLiveliness(w, w, erase, el, sl, rl, sample, color, symbol, 8, yarnNotes, sample, rp)
        plotPoint.y = w - plotPoint.y;
        erase = false;
        var { lineFromPoint, lineToPoint, outReturnPlotPoint, p } = readyCallForDistToSegment(w, plotPoint, w);

        let dEntered = distToSegment(plotPoint, lineFromPoint, lineToPoint, outReturnPlotPoint);
        livelyness = correctLivelinessSign(outReturnPlotPoint, plotPoint, dEntered);
        //var temp = row;// t.row(i).data();
        //row[4] = "<span class='lively'>" +  livelyness + "</span>" ;
        console.log("PlotDataTableOnCanvasUsingRelativeScale: " + row[0] + " : "  + row[4]) + " : " + livelyness
        //$('#example').dataTable().fnUpdate(row,i, undefined, false);
        table.cell(this, 4).data("<span class='lively'>" +  livelyness + "</span>").draw();
        //"<span class='lively'>" +  livelyness + "</span>" 

        //dots is the array that holds informatio for the tooltip

        //but before drawing, we have to invert
        outReturnPlotPoint.y = w - outReturnPlotPoint.y;
        drawLeaderLine(getContext2D(), p, outReturnPlotPoint)
        dots.push({ x: p.x, y: p.y, size, rXr: size * size, tip: livelyness + ": " + yarnNotes, yarnID: sample, toPoint: outReturnPlotPoint });
        addTextToCanvasAtPoint(getContext2D(), sample, p, livelyness)
        erase = false;

        d.counter++; // update data source for the row
        this.invalidate(); // invalidate the data DataTables has cached for this row
        cntr++;
    } );


return;

    for (let i = 0; i < rows.count(); i++) {
        let row = rows.data()[i];
        let el = parseFloat(row[2]);
        let rl = parseFloat(row[3]);
        let svgSymbol = (row[1]).toString();
        let { color, symbol } = getSymbolAndColorFromSvgSymbol(svgSymbol);
        let yarnNotes = row[5]
        let sample = row[0]
        if (ids.hasOwnProperty(sample)){
            //debugger
        }
        ids[sample]=i.toString();
        let absXY = row[7].split(',')
        let absX = parseFloat(absXY[0]);
        let absY = parseFloat(absXY[1]);
        let percentRangeX = (absX - minMaxXY.minRLAdj) / (minMaxXY.maxRLAdj - minMaxXY.minRLAdj)
        let newX = w * percentRangeX;
        let percentRangeY = (absY - minMaxXY.minELAdj) / (minMaxXY.maxELAdj - minMaxXY.minELAdj)
        let newY = w * percentRangeY;
        let rp = { x: newX, y: newY }

        let { plotPoint, livelyness } = drawPlotPointAndCalculateLiveliness(w, w, erase, el, sl, rl, i.toString(), color, symbol, 8, yarnNotes, i.toString(), rp)
        plotPoint.y = w - plotPoint.y;
        erase = false;
        var { lineFromPoint, lineToPoint, outReturnPlotPoint, p } = readyCallForDistToSegment(w, plotPoint, w);

        let dEntered = distToSegment(plotPoint, lineFromPoint, lineToPoint, outReturnPlotPoint);
        livelyness = correctLivelinessSign(outReturnPlotPoint, plotPoint, dEntered);
        //var temp = row;// t.row(i).data();
        row[4] = "<span class='lively'>" +  livelyness + "</span>" ;
        console.log("PlotDataTableOnCanvasUsingRelativeScale: " + row[0] + " : "  + row[4]) + " : " + livelyness
        $('#example').dataTable().fnUpdate(row,i, undefined, false);
        
        //dots is the array that holds informatio for the tooltip

        //but before drawing, we have to invert
        outReturnPlotPoint.y = w - outReturnPlotPoint.y;
        drawLeaderLine(getContext2D(), p, outReturnPlotPoint)
        dots.push({ x: p.x, y: p.y, size, rXr: size * size, tip: livelyness + ": " + yarnNotes, yarnID: sample, toPoint: outReturnPlotPoint });
        addTextToCanvasAtPoint(getContext2D(), sample, p, livelyness)
        erase = false;
    }

}
function getSymbolAndColorFromSvgSymbol(svgSymbol) {
    let pointsInStringPosition = svgSymbol.toUpperCase().indexOf("POINTS");
    let fillInStringPosition = svgSymbol.toUpperCase().indexOf("FILL");
    let symbol = 'circle';
    if (pointsInStringPosition > -1) {
        //Either a triangle or a square depending on space-delimited coordinate pairs in points
        let pointsString = svgSymbol.substring(pointsInStringPosition, fillInStringPosition).trim();
        let sideCount = pointsString.split(' ').length;
        if (sideCount === 3) {
            symbol = 'triangle';
        }
        else {
            symbol = 'square';
        }
    }
    let color = svgSymbol.substring(fillInStringPosition + 6, fillInStringPosition + 13);
    return { color, symbol };
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
                trashImage.click();
            }
        });
    }
    else {
        document.getElementById('imgSample').src = "RemoveSample.png"
        $('#loadDataButton').click();
    }
}
function getContext2D() {
    return canvasRef().getContext('2d')
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
}

var _dataTableReference = null;
function dataTableReference() {
    if (_dataTableReference === null) {
        _dataTableReference = $('#example').DataTable({
            "scrollY": "20vh",
            "columns": [
                { "width": "80px" }, null, null, null, null, null, null, { visible: false }
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
        let idToRemove = -1;
        let thisYarnId = this.attributes["yarnid"].value;
        for (let i = 0; i < dots.length; i++) {
            if (dots[i].yarnID === thisYarnId) {
                idToRemove = i;
                break;
            }
        }
        if (idToRemove != -1) {
            dots.splice(idToRemove, 1);
        }
        t.row($(this).parents('tr'))
            .remove()
            .draw();
    });

    $('#example tbody').on('click', 'tr', function () {
        //$(this).toggleClass('selected');

        if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
            //$( "#highlighter" ).hide()
        }
        else {
            $('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            let selectedId = this.children[0].innerText;
            for(let i = 0 ; i < dots.length; i++){
                let yarnId = dots[i].yarnID;
                if(selectedId === yarnId){
                    let x = dots[i].x;
                    let y = dots[i].y;                 
                    let canvasDiv = document.getElementById("canvasDiv")
                    var bodyRect = document.body.getBoundingClientRect()
                    var rect = canvasDiv.getBoundingClientRect();
                    let w = rect.left;// canvasDiv.offsetLeft;
                    let h =   rect.top;//canvasDiv.offsetTop;
                    document.getElementById("highlighter" ).style.top = (rect.top +y) + "px";//y +  h +  bodyRect.top) + "px"
                    document.getElementById("highlighter" ).style.left = (rect.left-16+x) + "px";//x +  w - 12) + "px"
                    $( "#highlighter" ).show()
                }
            }
        }
    });

    $('#loadDataButton').on('click', function () {
        var table = $('#example').DataTable();
 
table
    .clear()
    .draw();
        let sampleSets = [sampleSet1(), sampleSet2()];//,sampleSet3(),sampleSet4(),sampleSet5(),sampleSet6()]
        let canvas = canvasRef();
        sampleSets.forEach((sampleSet, index) => {
            for (let i = 0; i < sampleSet.length; i++) {
                let data = sampleSet[i].split(',');
                let id = data[0];
                let sl = data[1];
                let el = data[2];
                let rl = data[3];
                let color = data[4];
                let symbol = data[5];
                let notes = data[6];
                let svgSymbol = getSVGSymbol(color, symbol);
                let { plotPoint, livelyness } = drawPlotPointAndCalculateLiveliness(canvas.width, canvas.height, false, el, sl, rl, id, color, symbol, 8, notes, id);
                t.row.add([
                    id, svgSymbol, el, rl,
                    "<span class='lively'>" + livelyness + "</span>",
                    notes,
                    "<img width='32px' yarnId='" + id + "' id='img" + id.replace('#', 'x') + "' class='icon-delete' height='32px' src='trash.png'></img>",
                    plotPoint.x.toString() + "," + plotPoint.y.toString()
                ]).draw(false);
                counter++;
            }
        });
        //RefreshCanvas() ;
    });
    
}

var _canvasRef = null;
function canvasRef() {
    if (_canvasRef == null) {
        _canvasRef = document.getElementById("myCanvas")
    }
    return _canvasRef;
}

function getSVGSymbol(color, symbol) {
    let svgSymbol = '<svg height="16" width="16"><circle cx="8" cy="8" r="8"  fill="' + color + '" />xx</svg>';
    if (symbol === 'triangle') {
        svgSymbol = '<svg height="16" width="16"><polygon  points="8,0 16,16 0,16"  fill="' + color + '" />xx</svg>';
    }
    if (symbol === 'square') {
        svgSymbol = '<svg height="16" width="16"><polygon points="0,0 0,16 16,16 16,0"  fill="' + color + '"  /></svg>';
    }
    return svgSymbol;
}

function getMinMaxAbsXY() {
    let dt = dataTableReference();
    let ret = { minEL: 999, maxEL: -999, minRL: 999, maxRL: -999 }

    for (let i = 0; i < dt.rows().count(); i++) {
        let plotPoint = dt.table().rows().data()[i][7];
        let el = parseFloat(plotPoint.split(',')[1])
        let rl = parseFloat(plotPoint.split(',')[0])
        ret.minEL = el < ret.minEL ? el : ret.minEL;
        ret.maxEL = el > ret.maxEL ? el : ret.maxEL;
        ret.minRL = rl < ret.minRL ? rl : ret.minRL;
        ret.maxRL = rl > ret.maxRL ? rl : ret.maxRL;
    }
    let deltaX = ret.maxRL - ret.minRL;
    let deltaY = ret.maxEL - ret.minEL;
    ret.minELAdj = ret.minEL - (.05 * deltaY)
    ret.minRLAdj = ret.minRL - (.05 * deltaX)
    ret.maxELAdj = ret.maxEL + (.05 * deltaY)
    ret.maxRLAdj = ret.maxRL + (.05 * deltaX)
    return ret
}
var useRelative = false;
function getPlotPointFromDataPoint(el, rl, sl) {
    el = parseFloat(el);
    rl = parseFloat(rl);
    sl = parseFloat(sl);
    let minELAdj = 1;
    let maxELAdj = 1;
    let minRLAdj = 1;
    let maxRLAdj = 1;
    if (useRelative) {
        //EL
        let { minEL, maxEL, minRL, maxRL } = getMinMaxAbsXY();
        minELAdj = parseFloat(minEL) - parseFloat(.05 * (maxEL - minEL));
        maxELAdj = parseFloat(maxEL) + parseFloat(.05 * (maxEL - minEL));
        deltaEL = maxELAdj - minELAdj;
        //RL
        minRLAdj = parseFloat(minRL) - parseFloat(.05 * (maxRL - minRL));
        maxRLAdj = parseFloat(maxRL) + parseFloat(.05 * (maxRL - minRL));
        deltaRL = maxRLAdj - minRLAdj;
    }
    let w = canvasRef().width;
    let elasticityPercent = (el - sl) / sl;
    let resiliancyPercent = (el - rl) / (el - sl);

    let plotPointX = w * resiliancyPercent;
    let plotPointY = (w * elasticityPercent);
    return { x: plotPointX, y: plotPointY }
}

function drawPlotPointAndCalculateLiveliness(h, w, erase = true, el = -1, sl = -1, rl = -1, sample = '', color = 'magenta', symbol = 'circle', size = 4, yarnNotes = 'unset', yarnID = "-1", relativePlotPoint = null) {
    size = 6;
    let outReturnPlotPoint = null; let p = null; let livelyness = -999;
    if (relativePlotPoint === null) {
        // outReturnPlotPoint is the point on the line of zero liveliness, and p is plot point for the sample
        let ret = getLivelyness(el, rl, sl, h, w);
        outReturnPlotPoint = ret.outReturnPlotPoint;
        p = ret.p;
        livelyness = ret.livelyness;
        //dots is the array that holds informatio for the tooltip
        dots.push({ x: p.x, y: p.y, size, rXr: size * size, tip: livelyness + "::" + yarnNotes, yarnID: sample });
        //but before drawing, we have to invert
        outReturnPlotPoint.y = h - outReturnPlotPoint.y;
    }
    else {
        p = relativePlotPoint;
        //we have the plot point already (because we are in relative mode)
        //but we don't know the liveliness or the point on the line
    }

    let ctx = getContext2D()
    if (erase) {
        DrawResiliancyLine();
    }
    ctx.fillStyle = color
    ctx.beginPath();
    if (symbol === 'circle') {
        ctx.arc(p.x, p.y, size, 0, size * Math.PI);
    }
    else if (symbol === 'triangle') {
        ctx.moveTo(p.x, p.y - size);
        ctx.lineTo(p.x + size, p.y + size);
        ctx.lineTo(p.x - size, p.y + size);
        ctx.fill();
    }
    else if (symbol === 'square') {
        ctx.fillRect(p.x - size, p.y - size, size * 2, size * 2);
    }
    ctx.fill();
    ctx.beginPath();

    //TODO support lines for relative scale
    if (relativePlotPoint === null) {
        drawLeaderLine(ctx, p, outReturnPlotPoint);
        addTextToCanvasAtPoint(ctx, sample, p, livelyness);
    }
    let plotPoint = p
    return { plotPoint, livelyness }
}

function addTextToCanvasAtPoint(ctx, sample, p, livelyness) {
    ctx.font = "10px Arial";
    ctx.fillStyle = "#000000";
    let percentX = p.x / canvasRef().width
    if(percentX < .9){
        ctx.textAlign = "start"; 
        ctx.fillText(sample, p.x + 8, p.y);
        //ctx.fillText(livelyness, p.x + 11, p.y + 11);
    }
    else{
        ctx.textAlign = "end"; 
        ctx.fillText( sample, p.x - 8, p.y);
        //ctx.fillText( livelyness, p.x - 11, p.y -11);
    }
}

function drawLeaderLine(ctx, p, outReturnPlotPoint) {
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(outReturnPlotPoint.x, outReturnPlotPoint.y);
    ctx.lineWidth = .5;
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
}

function readyCallForDistToSegment(h, plotPoint, w) {
    let y = Math.abs(h - plotPoint.y);
    var p = { x: plotPoint.x, y };
    let lineFromPoint = { x: 0, y: h, };
    let lineToPoint = { x: w, y: 0, };
    let outReturnPlotPoint = { x: 0, y: 0 };
    return { lineFromPoint, lineToPoint, outReturnPlotPoint, p };
}

function getLivelyness(el, rl, sl, h, w, useRelativeScale) {
    let plotPoint = getPlotPointFromDataPoint(el, rl, sl, useRelativeScale);
    var { lineFromPoint, lineToPoint, outReturnPlotPoint, p } = readyCallForDistToSegment(h, plotPoint, w);
    let dEntered = distToSegment(plotPoint, lineFromPoint, lineToPoint, outReturnPlotPoint);
    let livelyness = correctLivelinessSign(outReturnPlotPoint, plotPoint, dEntered);
    return { outReturnPlotPoint, p, livelyness };
}

function correctLivelinessSign(outReturnPlotPoint, plotPoint, dEntered) {
    let plusOrMinus = 1;
    if (outReturnPlotPoint.x >= plotPoint.x) {
        plusOrMinus = -1;
    }
    let livelyness = (plusOrMinus * dEntered).toFixed(2);
    return livelyness;
}

function DrawResiliancyLine() {
    let ctx = getContext2D()
    ctx.clearRect(0, 0, canvasRef().width, canvasRef().height);
    drawLine(ctx, canvasRef().width, canvasRef().height);
    return ctx;
}

counter = 0;
function redrawCanvas(canvas) {
    if (!canvas) {
        canvas = canvasRef();
    }
    let pixelsToDataTable = window.innerHeight * (.76 - .14);
    let pixelsToInstructions = window.innerWidth * (.57 - .26);
    if (pixelsToDataTable < pixelsToInstructions) {
        $('#myCanvas').css('grid-row', '14/70');
        canvas.height = pixelsToDataTable - 10;
        canvas.width = canvas.height
    }
    else {
        let percentWeCanGoDown = pixelsToInstructions / pixelsToDataTable
        let pixelsToGoDown = percentWeCanGoDown * pixelsToDataTable;
        let percentOfWindowWeWantToGoDown = 100 * pixelsToGoDown / window.innerHeight
        let endPercent = percentOfWindowWeWantToGoDown + 14 - 2;
        $('#myCanvas').css('grid-row', '14/' + endPercent.toString());
        canvas.width = pixelsToInstructions 
        canvas.height = canvas.width
    }

    $('#myCanvas').css('z-index', '0');
    let canvasPercentAtRightSide = 26 + parseInt(100 * (canvas.width) / window.innerWidth);
    let showHidePosition = (canvasPercentAtRightSide - 16).toString() + '/' + (canvasPercentAtRightSide).toString()
    $('#showHide').css('grid-column', showHidePosition);
    counter++
    //Now that the canvas has been drawn into position we can draw the instructions.
    //The assumption for canvas placement is that the instructions were at .57% (which may have
    //therefore constrained the canvas).  Now that the canvas has been drawn though, the instructions
    //will actually go just to their left
    let canvasRightEdgePercentPosition = (canvas.offsetLeft + canvas.width) / window.innerWidth;
    let instructionPosition = parseInt(2.5 + (100 * canvasRightEdgePercentPosition)) + "/100"
    $('#instructions').css('grid-column', instructionPosition);
    $('#instructionsContentContainer').css('grid-column', instructionPosition);
}

function toggleSwitch(subclass, leftAction, rightAction) {
    var x = document.getElementsByClassName("toggleLabel");
    let xx = Array.prototype.filter.call(x, item => item.classList.contains(subclass));
    for (var i = 0; i < xx.length; i++) {
        let cl = xx[i].classList;
        if (cl.contains("on")) {
            cl.remove("on")
        }
        else {
            cl.add("on")
            if (cl.contains('left')) {
                leftAction();
            }
            else {
                rightAction()
            }
        }
    }
}
var relAbsMode = 'Absolute'
function drawRel(e) {
    
    relAbsMode = 'Relative'
    dots = [];
    PlotDataTableOnCanvasUsingRelativeScale(e);
}

function drawAbs() {
    relAbsMode = 'Absolute'
    dots = [];
    let erase = true;
    let t  = dataTableReference().table();
    for (let i = 0; i < dataTableReference().rows().count(); i++) {
        let row = dataTableReference().rows().data()[i]
        let id = row[0];
        let svgSymbol = row[1];
        let el = row[2]
        let rl = row[3]
        let notes = row[5]
        let { color, symbol } = getSymbolAndColorFromSvgSymbol(svgSymbol)
        let { plotPoint, livelyness } = drawPlotPointAndCalculateLiveliness(canvasRef().width, canvasRef().height, erase, el, 10, rl, id, color, symbol, 8, notes);
        erase = false

        //var temp = row;//t.row(i).data();
        row[4] = "<span class='lively'>" +  livelyness + "</span>" ;
        $('#example').dataTable().fnUpdate(row,i, undefined, false);
    }
    //
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
    let d = getD(w);
    let adjustedAnswer = (originalAnswer * 100) / d;
    return adjustedAnswer;
}
function getD() {
    let canvas = canvasRef();
    let width = canvas.width
    let twoWSquared = 2 * sqr(width);
    let sqrtTwoWSquared = Math.sqrt(twoWSquared);
    let twoWSquaredOverTwo = sqrtTwoWSquared / 2;
    return twoWSquaredOverTwo;
}
function drawLine(ctx, x, y, startX = 0, startY = 0, strokeStyle = "#000000", lineWidth=2) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle
    ctx.stroke();
}

// show tooltip when mouse hovers over dot
var dots = [];
var previousHighlightedRow = null;
var previousYarnId = "";
let previousLine = null;
function handleMouseMove(e) {
    let toPoint = null
    startX = 0;
    startY = 0;
    var canvasOffset = $('#myCanvas')[0].getBoundingClientRect()
    //var { left, top } = canvasOffset;
    var left = canvasOffset.x;
    var top = canvasOffset.top;
    let mouseX = parseInt(e.clientX - left);
    let mouseY = parseInt(e.clientY - top);
    var graph = canvasRef();
    let ctx = getContext2D();
    ctx.font = "12px Arial";
    ctx.fillStyle = "#555555";
    ctx.clearRect(0,0,50,16)
    ctx.fillRect(0,0,50,16);
    ctx.textAlign = "start"; 
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(mouseX.toString() + "," + mouseY.toString(),2,12,50)
    var tipCanvas = document.getElementById("tip");
    var tipCtx = tipCanvas.getContext("2d");
    var hit = false;
    let yarnIDToSelectInTable = ""
    let closestSoFar = 9999;
    for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        var dx = mouseX - dot.x;
        var dy = mouseY - dot.y;
        let overTheLine = false
        let dts = distToSegment({x:mouseX,y:mouseY}, {x:dot.x,y:dot.y},{x:dot.toPoint.x,y:dot.toPoint.y},{x:0,y:0})

        if (dts < 3 && dts < closestSoFar) {// (dx * dx + dy * dy < dot.rXr)
            closestSoFar = dts;
            let { x, y } = graph.getClientRects()[0]
            tipCanvas.style.left = (x + dot.x) + "px";
            tipCanvas.style.top = (y + dot.y - 20) + "px";
            tipCtx.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
            tipCtx.fillText(dot.tip, 5, 15);
            startX = dot.x
            startY = dot.y
            yarnIDToSelectInTable = dot.yarnID
            toPoint = dot.toPoint;
            hit = true;
            //break;
        }
    }
    if (!hit) {
        tipCanvas.style.left = "-200px";
        if(previousLine !== null){
            //drawLine(getContext2D(), previousLine.x, previousLine.y, previousLine.xx, previousLine.yy,"rgba(255,0,0,5)",2)
            RefreshCanvas() ;
        }
        previousYarnId = ""
    }
    else{
        if(yarnIDToSelectInTable !== "" && previousYarnId !== yarnIDToSelectInTable ){
            let ctx = getContext2D();
            if(previousYarnId !== ""){
                RefreshCanvas() ;
            }
            let td = $('td:contains("' + yarnIDToSelectInTable + '")')
            let tr = td[0].parentElement;
            tr.scrollIntoView(true);
            if(previousHighlightedRow !== null){
                previousHighlightedRow.style.backgroundColor = 'unset'
            }
            tr.style.backgroundColor = "yellow"
            previousHighlightedRow = tr;
            
            //ctx.save();
            previousYarnId = yarnIDToSelectInTable;
            drawLine(ctx,startX,startY,toPoint.x,toPoint.y, "yellow",2)
            previousLine = {x:startX,y:startY,xx:toPoint.x,yy:toPoint.y}
        }

    }
}
function debugTest(){
    alert(dataTableReference().table().rows().count());
}
function RefreshCanvas() {
    if (relAbsMode === "absolute") {
        drawAbs();
    }
    else {
        drawRel();
    }
    previousLine = null;
}

/* ********************************************************************** */

















function sampleSet1() {
    return ['#1.1,10,10.75,10,#8EB4E3,triangle,100% Alpaca / 0% Merino Wool',
        '#2.1,10,11.25,10,#8EB4E3,triangle,90% Alpaca / 10% Merino Wool',
        '#3.1,10,11.75,10.125,#8EB4E3,triangle,80% Alpaca / 20% Merino Wool',
        '#4.1,10,11.875,10.125,#8EB4E3,triangle,70% Alpaca / 30% Merino Wool',
        '#5.1,10,12.375,10,#8EB4E3,triangle,60% Alpaca / 40% Merino Wool',
        '#6.1,10,12.5,10.125,#8EB4E3,triangle,50% Alpaca / 50% Merino Wool',
        '#7.1,10,13.5,10,#8EB4E3,triangle,0% Alpaca / 100% Merino Wool',
        '#8.1,10,10.5,10,#FAC090,triangle,100% Tussah Silk / 0% Cormo Wool',
        '#9.1,10,10.625,10.125,#FAC090,triangle,90% Tussah Silk / 10% Cormo Wool',
        '#10.1,10,10.75,10,#FAC090,triangle,80% Tussah Silk / 20% Cormo Wool',
        '#11.1,10,11,10,#FAC090,triangle,70% Tussah Silk / 30% Cormo Wool',
        '#12.1,10,11.25,10,#FAC090,triangle,60% Tussah Silk / 40% Cormo Wool',
        '#13.1,10,12.5,10.125,#FAC090,triangle,50% Tussah Silk / 50% Cormo Wool',
        '#14.1,10,12.375,10.25,#FAC090,triangle,34% Tussah Silk / 66% Cormo Wool',
        '#15.1,10,13.0,10.25,#FAC090,triangle,17% Tussah Silk / 83% Cormo Wool',
        '#16.1,10,14.5,10.25,#FAC090,triangle,0% Tussah Silk / 100% Cormo Wool']
}

function sampleSet2() {
    return ['#1.2,10,10.75,10,#17375E,square,100% Alpaca / 0% Merino Wool',
        '#2.2,10,11.0,10.125,#17375E,square,90% Alpaca / 10% Merino Wool',
        '#3.2,10,11.75,10,#17375E,square,80% Alpaca / 20% Merino Wool',
        '#4.2,10,12.125,10,#17375E,square,70% Alpaca / 30% Merino Wool',
        '#5.2,10,11.875,10.125,#17375E,square,60% Alpaca / 40% Merino Wool',
        '#6.2,10,13.25,10.125,#17375E,square,50% Alpaca / 50% Merino Wool',
        '#7.2,10,13.125,10.125,#17375E,square,0% Alpaca / 100% Merino Wool',
        '#8.2,10,10.375,10.125,#E46C0A,square,100% Tussah Silk / 0% Cormo Wool',
        '#9.2,10,10.5,10,#E46C0A,square,90% Tussah Silk / 10% Cormo Wool',
        '#10.2,10,10.625,10,#E46C0A,square,80% Tussah Silk / 20% Cormo Wool',
        '#11.2,10,11,10,#E46C0A,square,70% Tussah Silk / 30% Cormo Wool',
        '#12.2,10,11.625,10,#E46C0A,square,60% Tussah Silk / 40% Cormo Wool',
        '#13.2,10,12.5,10,#E46C0A,square,50% Tussah Silk / 50% Cormo Wool',
        '#14.2,10,12.125,10,#E46C0A,square,34% Tussah Silk / 66% Cormo Wool',
        '#15.2,10,13.25,10.25,#E46C0A,square,17% Tussah Silk / 83% Cormo Wool',
        '#16.2,10,14.25,10.25,#E46C0A,square,0% Tussah Silk / 100% Cormo Wool']
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