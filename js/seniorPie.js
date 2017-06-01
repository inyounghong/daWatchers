var types = ["normal", "volunteer", "staff", "deactivated"];
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

    averageData = processAverages(seniorData, seniorPieData);
    processMedians(seniorData);

    drawPie(seniorPieData);
    drawStackedGraph(averageData);
    drawFriendsLineGraph(seniorData);
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

function produceTotals() {
    var totals = {};
    types.forEach(function(type) {
        var o = {};
        types.forEach(function(type2) {
            o[type2] = 0;
        });
        totals[type] = o;
    })
    return totals;
}

var counts = {
    "volunteer": 451,
    "staff": 114,
    "normal": 937,
    "deactivated": 104,
}

function processMedians(seniorData) {
    // normal
    var volunteerSeniors = seniorData.filter(function(d) { return d.type === "volunteer"});
    console.log(volunteerSeniors)
    var median = d3.median(volunteerSeniors, function(d) { return d.num_volunteer_friends });
    console.log(median);
}


// Dumping fourteenthstar
function processAverages(seniorData, seniorPieData) {
    var totals = produceTotals();

    seniorData.forEach(function(d) {
        if (d.username !== "fourteenthstar") {
            types.forEach(function(t) {
                totals[d.type][t] += d["num_" + t + "_friends"];
            })
        }
    })

    // Produce averages
    types.forEach(function(type) {
        types.forEach(function(t) {
            totals[type][t] /= counts[type];
        })
    })

    var arr = [];
    Object.keys(totals).forEach(function(key) {
        var o = {};
        o.type = key;
        o.normal = totals[key]["normal"];
        o.volunteer = totals[key]["volunteer"]
        o.staff = totals[key]["staff"]
        o.deactivated = totals[key]["deactivated"]
        arr.push(o);
    })

    return arr;
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

function drawStackedGraph(averageData) {
    console.log(averageData);
    var height = 100;
    var width = 800;
    var padding = 20;
    var rectHeight = 20;

    function getY(type) {
        if (type === "volunteer") {
            return 0;
        }
        if (type === "staff") {
            return 1;
        }
        return 2;
    }

    var svg = d3.select("#stackedGraph").append("svg")
        .attr("height", height + padding * 2)
        .attr("width", width + padding * 2);

    var scaleX = d3.scaleLinear().domain([0, 10]).range([0, width]);
    var scaleY = d3.scaleLinear().domain([0, 3]).range([0, height]);
    var plot = svg.append("g").attr("transform", "translate(" + padding + "," + padding + ")");

    var rects = plot.selectAll("rect")
        .data(averageData)
        .enter().append("rect")
        .attr("x", function(d) { return 0; })
        .attr("y", function(d) { return scaleY(getY(d.type)) })
        .attr("width", function(d) { return scaleX(d.normal); })
        .attr("height", rectHeight)
        .attr("fill", function(d) { return typeColors[d.type];
        })
        .attr("r", 5)
        ;
}

// Num friends line graph
function drawFriendsLineGraph(seniorData) {

    function getY(type) {
        if (type === "volunteer") {
            return 0;
        }
        if (type === "staff") {
            return 1;
        }
        return 2;
    }

    var height = 100;
    var width = 800;
    var padding = 20;

    var svg = d3.select("#friendsGraph").append("svg")
        .attr("height", height + padding * 2)
        .attr("width", width + padding * 2);

    var numFriendsExtent = d3.extent(seniorData, function(d) { return d.num_total_friends; });
    var scaleX = d3.scaleLinear().domain(numFriendsExtent).range([0, width]);
    var scaleY = d3.scaleLinear().domain([0, 3]).range([0, height]);
    var plot = svg.append("g").attr("transform", "translate(" + padding + "," + padding + ")");

    var circles = plot.selectAll("circle.seniors")
        .data(seniorData)
        .enter().append("circle")
        .attr("cx", function(d) { return scaleX(d.num_total_friends); })
        .attr("cy", function(d) { return scaleY(getY(d.type)) })
        .attr("fill", function(d) {
            if (d.username === "SimplySilent") {
                return colorArray[8];
            }
            return typeColors[d.type];
        })
        .attr("r", 5)
        ;
}
