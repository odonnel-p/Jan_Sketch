d3_queue.queue()
    .defer(d3_request.csv, "data/links_example.csv")
    .defer(d3_request.csv, "data/nodes_example.csv")
    .await(ready);

function ready(err, links, nodes) {
    if (err) throw err;
    //console.log(links);
    //console.log(nodes);

    // link_columns = links.slice(-1);
    // node_columns = nodes.slice(-1);
    

    var data = { "nodes": nodes, "links": links}

    //console.log(data);

    drawGraph(data);

} //--end of ready


function drawGraph(json) {

  console.log(json);
  //from: https://bl.ocks.org/mbostock/4062045
  var canvas = d3.select(".canvas");
  var width = +canvas.node().getBoundingClientRect().width;
  var height = +canvas.node().getBoundingClientRect().height;

  var svg = canvas.append("svg").attr("width", width).attr("height", height);
  //console.log(width+", "+height);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  // var map = d3.map(json, function(d){ return d.nodes.ID });

  //   var trial = map.get(000574303);
  //   console.log(trial);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d){ return d.ID; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    var link = svg.append("g")
        .attr("class", "links")
      .selectAll("line")
      .data(json.links)
      .enter().append("line")
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    var node = svg.append("g")
        .attr("class", "nodes")
      .selectAll("circle")
      .data(json.nodes)
      .enter().append("circle")
        .attr("r", 6)
        .attr("fill", "#205166")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

     node.append("title")
         .text(function(d) { return d.Full_Name; });

    simulation
        .nodes(json.nodes)
        .on("tick", ticked);

    simulation
        .force("link")
        .links(json.links);


    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    } //--end ticked

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
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

} //--end of drawGraph
  

    





























//HELP FROM ARMIN

/*

var linkpath = ("data/links_2.csv");
var nodepath = ("data/nodes_2.csv");


var width = 1500,
    height = 725;

// var color = d3.scale.category20();


var svg = d3.select(".canvas").append("svg")
    .attr("width", width)
    .attr("height", height);

      
//Want to have different labels
// SETTING UP THE FORCE LAYOUT

    var lookupMap = d3.map();
 
d3.csv(nodepath, function(nodes) {
 
  var nodelookup = {};
  var nodecollector = {};

   count = 0; 
// we want to create a lookup table that will relate the links file and the nodes file
    nodes.forEach(function(row) {
      console.log(row)
    nodelookup[row.node] = count; 
    lookupMap.set(row.ID, [row["Full_Name"], row["Individual"]])
    nodecollector[row.node] = {id_num: row.ID, name: row["Full_Name"], group: row["Individual"]};
    //console.log(nodecollector)
     
    //console.log(row.node)
    //console.log(nodelookup)
    
    count++; 
 });

//Get all the links out of of the csv in a way that will match up with the nodes
 var linkcollector = {};
d3.csv(linkpath, function(linkchecker) {
  console.log(linkchecker)
  console.log(nodelookup)
  
  indexsource = 0;
  indextarget = 0; 
    count= 0;
    //console.log(nodelookup['celery'])
    linkchecker.forEach(function(link) {
      console.log(link.ID1,lookupMap,lookupMap.get(link.ID1),lookupMap.get(link.ID1))
    var source_obj = {'id': link.ID1, 'full_name':lookupMap.get(link.ID1)[0],'individual':lookupMap.get(link.ID1)[1]};
    var target_obj = {'id': link.ID2, 'full_name':lookupMap.get(link.ID2)[0],'individual':lookupMap.get(link.ID2)[1]};
  linkcollector[count] = {source: source_obj, target: target_obj, type: link.LINK_TYPE };
    //console.log(linkcollector[count]) 
  count++
});

//console.log(linkcollector)
var nodes = d3.values(nodecollector);
var links = d3.values(linkcollector);
console.log(links)
var simulation = d3.forceSimulation()
  //using width/height from above, but size is mainly det'd by linkDistance and charge
    // .force("size", [width, height])  
    // changes how close nodes will get to each other. Neg is farther apart.
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink(links).distance(50))
//console.log(nodes)
//console.log(links)

  // Create the link lines.
  var link = svg.selectAll(".link")
      .data(links)
     .enter().append("line")
     .attr("class", function(d) { return "link " + d.type; })
        
  // Create the node circles.
  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
    .call(d3.drag);
 
 //put in little circles to drag
  node.append("circle")
      .attr("r", 4.5)
    .attr("class", function(d) { return "node " + d.group; })
    .call(d3.drag);
    
//add the words  
 node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });   
      
//get it going!
 simulation
      .nodes(nodes)
      // .on("tick", ticked);

  // simulation
  //     .force("link", d3.forceLink(links).distance(50));

//   simulation.on("tick", function() {
  
  
//     link.attr("x1", function(d) { return d.source.x; })
//         .attr("y1", function(d) { return d.source.y; })
//         .attr("x2", function(d) { return d.target.x; })
//         .attr("y2", function(d) { return d.target.y; });

// //I think that translate changes all of the x and ys at once instead of one by one?
//     node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
   
//   })
 

  });
  });


  */