var WIDTH = 1200;
var HEIGHT = 1000;
var NODE_SIZE = 8;
var NODE_SIZE_HOVER = 12;

var VERSION = "1-1000";

var dateColors = {
    "08": "red",
    "09": "orange",
    "10": "yellow",
    "11": "green",
    "12": "blue",
    "13": "purple",
    "14": "pink",
}

var typeColors = {
    "volunteer": colorArray[3],
    "staff": colorArray[9],
    "normal": colorArray[1],
    "deactivated": colorArray[0],
}

// data
var mappedSeniorData;

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



d3.queue()
    .defer(d3.csv, "data/seniors" + VERSION + ".csv", parseNodes)
    .defer(d3.csv, "data/seniorLinks" + VERSION + ".csv", parseLinks)
    .defer(d3.csv, "data/seniorData.csv")
    .await(function (error, nodes, links, seniorData) {

        mappedSeniorData = d3.map(seniorData, function(d) { return d.username });

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

// Returns 0 (no date), 1 (>= 2012), 2(<= 2011)
function getGroupByDate2(name) {
    var fullData = mappedSeniorData.get(name);
    if (fullData.date_of_seniority === "") {
        return 0;
    }
    var year = parseInt(fullData.date_of_seniority.split("/")[2]);
    if (year >= 12) {
        return 1;
    } else if (year >= 10){
        return 2;
    } else {
        return 3;
    }
}

function getSizeByDate2(name) {
    if (getGroupByDate2(name) > 0) {
        return 5;
    } else {
        return 3;
    }
}

function getColorByDate2(name) {
    var groupColors = ["gray", "red", "#5fffe1", "yellow"];
    return groupColors[getGroupByDate2(name)];
}

function getColorByDate(name) {
    if (name === "SimplySilent") {
        return "blue";
    }
    var fullData = mappedSeniorData.get(name);
    if (fullData.date_of_seniority === "") {
        return "gray";
    }
    var year = fullData.date_of_seniority.split("/")[2];
    return dateColors[year];
}

function getLinkColorByType(d) {
    var sourceData = mappedSeniorData.get(d.source);
    var targetData = mappedSeniorData.get(d.target);


    if (sourceData.former_volunteer || targetData.former_volunteer) {
        return typeColors["volunteer"];
    }
    if (sourceData.former_staff || targetData.former_staff) {
        return typeColors["staff"];
    }

    return typeColors["other"];
}

function getColorByType(name) {
    if (name === "SimplySilent") {
        return "green";
    }
    var fullData = mappedSeniorData.get(name);

    if (fullData.former_staff) {
        return typeColors["staff"];
    }
    if (fullData.former_volunteer) {
        return typeColors["volunteer"];
    }
    return typeColors["other"];
}

function translate(x, y) {
    return "translate(" + x + "," + y + ")";
}

function plotGraph(nodes, links) {

    var g = svg.append("g");
    g.attr("transform", "scale(0.4) " + translate(600, 300));

    var link = g
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .attr("stroke", function(d) { return getLinkColorByType(d); })
        ;

    var node = g.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .call(d3.drag()

        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return NODE_SIZE; })
        .attr("fill", function(d) { return getColorByType(d.username); })
        .on("mouseover", function(d) {
            d3.select(this).attr("r", NODE_SIZE_HOVER);
        })
        .on("mouseout", function(d) {
            d3.select(this).attr("r", NODE_SIZE);
        })
        // .attr("stroke", function(d) { return getColorByType(d.username); })

    node.append("text")
        .text(function(d) { return d.username; })
        .attr("dx", 20)
        .attr("fill", "black")
        .attr("dy", ".35em");

    // svg.append("rect")
    //     .attr("width", WIDTH)
    //     .attr("height", HEIGHT)
    //     .style("fill", "none")
    //     .style("pointer-events", "all")
    //     // .call(d3.zoom()
    //     //     .scaleExtent([1.5, 2])
    //     //     .on("zoom", zoomed));
    //
    //     // function zoomed() {
    //     //   g.attr("transform", d3.event.transform);
    //     // }


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

        node.attr("transform", function(d) { return translate(d.x,d.y); });
        // node
        //     .attr("cx", function(d) { return d.x; })
        //     .attr("cy", function(d) { return d.y; });
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
