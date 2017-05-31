var WIDTH = 3000;
var HEIGHT = 3000;

var svg = d3.select("#graph").append("svg")
    .attr("class", "axis")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

var sizeScale = d3.scaleLinear().domain([0, 100]).range([1,10]);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.username; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));


/* Functions */

function parseLinks(row) {
    return row;
}

function parseNodes(row) {
    return row;
}

var version = "1-100";

d3.queue()
    .defer(d3.csv, "data/seniors" + version + ".csv", parseNodes)
    .defer(d3.csv, "data/seniorLinks" + version + ".csv", parseLinks)
    .await(function (error, nodes, links) {

        console.log(nodes);
        console.log(links);

        // Plot
        plotGraph(nodes, links);
    });


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

function getColor(name) {
    if (name === "SimplySilent") {
        console.log("here");
        return "red";
    }
    if (name === "fourteenthstar") {
        return "blue";
    }
    return "black";
}

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
        .attr("r", function(d) { return 3; })
        .attr("fill", function(d) { return getColor(d.username); })
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
    if (!d3.event.active) simulation.alphaTarget(0.01).restart();
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
