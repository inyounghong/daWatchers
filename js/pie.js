var colors = {
    "banned": "gray",
    "regular": "green",
    "premium": "orange",
    "beta": "orange",
    "senior": "blue"
}



d3.queue()
.defer(d3.csv, "data/watchers100.csv", parseLine)
.defer(d3.csv, "data/links100.csv")
.await(function (error, watcherData, linkData) {
    console.log(watcherData);

    pieData = processForPie(watcherData);
    console.log(pieData);
    drawPie(pieData);
});


function parseLine(row) {
    row["username"] = row["username"].trim();
    row["date"] = row["date"].trim();
    row["type"] = row["type"].trim();
    return row;
}

function processForPie(watcherData) {
    var data = {};
    watcherData.forEach(function(d) {
        if (data[d.type] === undefined) {
            data[d.type] = 1;
        } else {
            data[d.type] = data[d.type] + 1;
        }
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
    .sort(null)
    .value(function(d) { return d.count; });

var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);


function drawPie(data) {

    console.log(pie(data));
  var arc = g.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  arc.append("path")
      .attr("d", path)
      .attr("fill", function(d) { return colors[d.data.type]; });

  arc.append("text")
      .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return d.data.type; });
}
