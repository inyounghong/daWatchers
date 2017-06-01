
var mappedSeniorData;
var typeColors = {
    "volunteer": colorArray[1],
    "staff": colorArray[2],
    "normal": colorArray[0],
    "deactivated": colorArray[3],
}

d3.queue()
.defer(d3.csv, "data/seniorData.csv", parseLine)
.defer(d3.csv, "data/seniorPie.csv", parsePieLine)
.defer(d3.csv, "data/seniorLinksFull.csv")
.await(function (error, seniorData, seniorPieData, seniorLinksData) {
    console.log(seniorData);
    mappedSeniorData = d3.map(seniorData, function(d) { return d.username });
    console.log(mappedSeniorData);

    processAverages(seniorLinksData);

    drawPie(seniorPieData);
});

function unmap(mappedData) {
    var array = [];
    Object.keys(mappedData).forEach( function(key) {
        array.push(mappedData.get(key.slice(1)));
    })
    return array;
}



function parsePieLine(row) {
    row["count"] = parseInt(row["count"]);
    return row;
}

function parseLine(row) {
    row.num_volunteer_friends = parseInt(row.num_volunteer_friends);
    row.num_staff_friends = parseInt(row.num_staff_friends);
    row.num_normal_friends = parseInt(row.num_normal_friends);
    row.num_deactivated_friends = parseInt(row.num_deactivated_friends);
    row.num_total_friends = parseInt(row.num_total_friends);
    return row;
}


function processAverages(linksData) {

}

function processForPie(rawData) {
    var data = {
        "volunteer": 0,
        "staff": 0,
        "normal": 0,
        "deactivated": 0
    };

    rawData.forEach(function(d) {
        data[d.type]++;
    });

    var dataArray = [];
    Object.keys(data).forEach(function(key) {
        var o = {};
        o.type = key;
        o.count = data[key];
        dataArray.push(o);
    });

    return dataArray;
}

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 2,
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var pie = d3.pie()
    .sort(function(a, b) {
		return a.count < b.count;
	})
    .value(function(d) { return d.count; });

var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);


function drawPie(data) {
  var arc = g.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  arc.append("path")
      .attr("d", path)
      .attr("fill", function(d) { return typeColors[d.data.type]; });

  arc.append("text")
      .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return d.data.type; });
}
