var WIDTH = 960;
var HEIGHT = 600;

var colors = {
    "banned": "gray",
    "regular": "green",
    "premium": "orange",
    "beta": "orange",
    "senior": "blue"
}

var svg = d3.select("#watcherGraph").append("svg")
    .attr("class", "axis")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);


d3.queue()
    .defer(d3.csv, "data/watchers100.csv", parseLine)
    .defer(d3.csv, "data/links100.csv", parseLinks)
    .await(function (error, watcherData, linkData) {
        console.log(watcherData);

        // Sort links
        sortedLinksFlat = sortByKey(linkData, "numWatchers", false);
        console.log(sortedLinksFlat);

        // Flatten links
        linksFlat = processLinkData(linkData, watcherData);
        console.log(linksFlat);

        // Plot
        plotGraph(watcherData, linksFlat);
    });

function processLinkData(linkData, watcherData) {
    var linksFlat = [];

    // Add simply links
    watcherData.forEach(function(d) {
        var o = {};
        o.source = d.username;
        o.target = "simplysilent";
        linksFlat.push(o);
    })

    // Flatten all links
    linkData.forEach(function(d) {
        d.targets.forEach(function(t) {
            var o = {};
            o.source = d.source; // source watches target
            o.target = t;
            linksFlat.push(o);
        });
    })
    return linksFlat;
}

function parseLinks(row) {
    var targets = row["targets"].split(" ");
    var arr = [];
    targets.forEach(function(t) {
        arr.push(t);
    })
    row["targets"] = arr;
    row["numWatchers"] = targets.length;
    return row;
}

function parseLine(row) {
    row["username"] = row["username"].trim();
    row["date"] = row["date"].trim();
    row["type"] = row["type"].trim();
    return row;
}

// Sorts an array of objects by key
function sortByKey(array, key, asc) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        if (asc) {
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    });
}

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.username; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));

function plotGraph(nodes, links) {

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke-width", function(d) { return 1; });

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 3)
        .attr("fill", function(d) { return colors[d.type]; })
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("title")
        .text(function(d) { return d.username; });

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        }
};

function dragstarted(d) {
if (!d3.event.active) simulation.alphaTarget(0.1).restart();
d.fx = d.x;
d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
