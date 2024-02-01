var width = 1125,
    height = 810,
    outerRadius = 310,
    innerRadius = outerRadius - 24;

	circle_y = outerRadius + 100;
	circle_x = outerRadius + 350;

var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

var layout = d3.layout.chord()
 .padding(.03) //padding of 0 means no gaps
    .sortSubgroups(d3.descending) //descending means the thickest chords within a group go first
    .sortChords(d3.ascending); //the thickest chords are drawn on top

var path = d3.svg.chord()
    .radius(innerRadius-3);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("id", "circle")
    .attr("transform", "translate(" + circle_x + "," + circle_y + ")");

var THRESHOLD = 5000; // Don't display links with fewer than THRESHOLD trips between them.

svg.append("circle")
    .attr("r", outerRadius);

d3.csv("../data/districts_MASTER.csv", function(districts) {
  d3.json("../data/districts_matrix_highway.json", function(matrix) {
  	
		// The primary purpose of this visualization is to display the volume
		// of trips BETWEEN districts. The number of trips purely internal to
		// a district is much larger than the number of trips to another district.
		// Displaying these internal trips distorts the visualization. Instead,
		// report the number of internal trips in the district-level tooltip.		
		var i,j;
		for (i = 0; i < matrix.length; i = i + 1) {
			for (j = 0; j < matrix[i].length; j = j + 1) {
				// Save the number of purely internal trips, i.e., trips with the
				// same origin and destination district, as an atrribute of the
				// district, and zero entries on the matrix diagonal.
				if (i === j) {
					districts[i].internal_highway = matrix[i][j]; 
					matrix[i][j] = 0;
				}
				// Filter out matrix entries below the threshold value.	
				if (matrix[i][j] < THRESHOLD) {	
					matrix[i][j] = 0;
				}
			}
		}

    // Compute the chord layout.
    layout.matrix(matrix);

    // Add a group per district.
    var group = svg.selectAll(".group")
        .data(layout.groups)
      .enter().append("g")
        .attr("class", "group")
        .on("mouseover", mouseover);

	group.append("svg:text")
	  .each(function(d,i) { d.angle = (d.startAngle + d.endAngle) / 2; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
	  .attr("transform", function(d) {
		return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
			+ "translate(" + (innerRadius + 30) + ")"
			+ (d.angle > Math.PI ? "rotate(180)" : "");
	  })
	  .text(function(d,i) { return districts[i].name; })
		.attr("shape-rendering","crispEdges")
		.attr("font-family","sans-serif")
		.attr("font-size","12px");

	group.append("svg:text")
	  .text("North")
		.attr({ 
			x: circle_x-690,
			y: circle_y-790,
		})
		.attr("shape-rendering","crispEdges")
		.attr("font-family","sans-serif")
		.attr("font-size","20px");
		
	group.append("svg:text")
	  .text("Northeast")
		.attr({ 
			x: circle_x-315,
			y: circle_y-580,
		})
		.attr("shape-rendering","crispEdges")
		.attr("font-family","sans-serif")
		.attr("font-size","20px");		
	
	group.append("svg:text")
	  .text("Core")
		.attr({ 
			x: circle_x-295,
			y: circle_y-440,
		})
		.attr("shape-rendering","crispEdges")
		.attr("font-family","sans-serif")
		.attr("font-size","20px");
		
	group.append("svg:text")
	  .text("Southeast")
		.attr({ 
			x: circle_x-325,
			y: circle_y-200,
		})
		.attr("shape-rendering","crispEdges")
		.attr("font-family","sans-serif")
		.attr("font-size","20px");

	group.append("svg:text")
	  .text("West")
		.attr({ 
			x: circle_x-1025,
			y: circle_y-200,
		})
		.attr("shape-rendering","crispEdges")
		.attr("font-family","sans-serif")
		.attr("font-size","20px");
		
	group.append("svg:text")
	  .text("Northwest")
		.attr({ 
			x: circle_x-1025,
			y: circle_y-650,
		})
		.attr("shape-rendering","crispEdges")
		.attr("font-family","sans-serif")
		.attr("font-size","20px");
		
    // Add a mouseover title for each district
    group.append("title").text(function(d, i) {
      return districts[i].name + " : " + districts[i].description
	      + "\n" + "Number of trips originating in this district: " + Number(districts[i].origin_highway).toLocaleString()
          + "\n" + "Number of trips ending in this district: " + Number(districts[i].destination_highway).toLocaleString()
		  + "\n" + "Number of trips within this district: " + Number(districts[i].internal_highway).toLocaleString();	
    });

    // Add the group arc.
    var groupPath = group.append("path")
        .attr("id", function(d, i) { return "group" + i; })
        .attr("d", arc)
        .style("fill", function(d, i) { return districts[i].color; });
		
	/*	
    // Add a text label.
    var groupText = group.append("text")
        .attr("x", 6) //how far into the group arc the text starts
        .attr("dy", 16); //how far vertically into the group the text is. 0 = sitting on edge.

    groupText.append("textPath")
        .attr("xlink:href", function(d, i) { return "#group" + i; })
        .text(function(d, i) { return states[i].name; });

    // Remove the labels that don't fit.
    groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
        .remove();
	*/
		
    // Add the chords.
    var chord = svg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d) { return districts[d.source.index].color; })
        .attr("d", path);

    // Add an elaborate title for each chord.
    chord.append("title").text(function(d) {
      return districts[d.source.index].name
          + " to " + districts[d.target.index].name
          + ": " + d.source.value.toLocaleString()
          + "\n" + districts[d.target.index].name
          + " to " + districts[d.source.index].name
          + ": " + d.target.value.toLocaleString();
    });

    function mouseover(d, i) {
      chord.classed("fade", function(p) {
        return p.source.index != i
            && p.target.index != i;
      });
    }
  });
});