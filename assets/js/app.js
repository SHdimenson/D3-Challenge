// @TODO: YOUR CODE HERE!

function makeChart() {
  // 1: Set up our chart
  // Select chart area div
  var svgArea = d3.select("#scatter").select("svg");

  // Clear SVG if any chart exists
  if (!svgArea.empty()) {
    svgArea.remove();
    }
  
  // Set the chart parameters height, width & margins
  // Set Height/Width of SVG
  var svgWidth = 1100;
  var svgHeight = 600;

  var margin = {
  top: 50,
  right: 110,
  bottom: 100,
  left: 80
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  

  // 2: Create an SVG wrapper,
  // append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  // =================================
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // 3: Import data & parse Data
  // =================================
  d3.csv("assets/data/data.csv").then(function(censusData) {
  
    // Parse the data
    // coordinates = []
    censusData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.income = +data.income;
      data.smokes = +data.smokes;
    // coordinates.push([data.poverty, data.healthcare, data.abbr])
    });

    // 4: Create Linear X & Y Scales
  
    var xLScale = xScale(censusData, X, width);
    var yLScale = yScale(censusData, Y, height);
  
    // 5: Create Axis 
  
    var bottomAxis = d3.axisBottom(xLScale);
    var leftAxis = d3.axisLeft(yLScale);

    // 6: Append the axis to the censusGroup : 
    // x- axis to bottom axis
  
    var xAxis = chartGroup.append("g").attr("transform", `translate(0, ${height})`).call(bottomAxis);

    // y-axis to the left side of the display
    var yAxis = chartGroup.append("g").call(leftAxis);

    // Create circles(group) & data for circles
	  var circles = chartGroup.selectAll("circle")
	  	  .data(censusData)
		// Data to circles
    var elemEnter = circles.enter();

		var circle = elemEnter.append("circle")
	  	  .attr("cx", d => xLScale(d[X]))
	   	  .attr("cy", d => yLScale(d[Y]))
	   	  .attr("r","12")
	    	.attr("fill", "red")
	   	  .attr("opacity", ".5")
        .classed("stateCircle", true)
	      ;

	  // Set TEXT for Circles
   	var cText = elemEnter.append("text")            
        .attr("x",d=> xLScale(d[X]))
        .attr("y",d=> yLScale(d[Y]))
        .attr("dy", ".38em") 
        .text(d => d.abbr)
        .classed("stateText", true);


    // Updating tooltip function
    var circles = updateTip(X, Y, circle, cText);

    // Add x-label group.
    var xLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    // Add x-labels.
    var poverty = xLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty %");
    var income = xLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Median Household Income");
    
        
    // Add y-label group.
    var yLabelGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    // Add y-labels.
    var healthcare = yLabelGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 20 - margin.left)
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("No HealthCare");
    var smokes = yLabelGroup.append("text")
        .attr("x", 0 - (height / 2))
        .attr("y", 1-margin.left)
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokers");
    
    
    // Capturing x-label selection (event-listener)
    xLabelGroup.selectAll("text").on("click", function() {
          // Capture the selected label using 'this' reference
          X = d3.select(this).attr("value");
          
          // Scale X-axis height
          xLScale = xScale(censusData, X, width);

          // update data of xAxis according to selection made
          xAxis = updateXAxis(xLScale, xAxis);

          // Updating active,inactive labels by switching 'active', 'inactive'
          if (X === "poverty") {
           
              poverty.classed("active", true)
                  .classed("inactive", false);
              income.classed("active", false)
                  .classed("inactive", true);
            } 
          else { 
             poverty.classed("active", false)
              .classed("inactive", true);
              income.classed("active", true)
              .classed("inactive", false);
            }

          // Bind circles with updated x values
          circle = updateCircles(circles, xLScale, yLScale, X, Y);
          
          // Change new circle Text
          cText = updateText(cText, xLScale, yLScale, X, Y);

          // Update new tool tip info
          circles = updateTip(X, Y, circle, cText);
    });

    // Capturing y-label selection (event-listener)
    yLabelGroup.selectAll("text").on("click", function() {
        // Capture the selected label using 'this' reference
        Y = d3.select(this).attr("value");

        // Scale Y-axis height
        yLScale = yScale(censusData, Y, height);

        // Update data of yAxis according to selection made.
        yAxis = updateYAxis(yLScale, yAxis);
        // Changes classes to change bold text.
        if (Y === "healthcare") {
           
            healthcare.classed("active", true)
                .classed("inactive", false);
            smokes.classed("active", false)
                .classed("inactive", true);
            } 
        else {
            healthcare.classed("active", false)
                .classed("inactive", true);
            smokes.classed("active", true)
                .classed("inactive", false);
            }

        // Bind circles with updated Y values
        circle = updateCircles(circles, xLScale, yLScale, X, Y);

        // Change new circle Text
        cText = updateText(cText, xLScale, yLScale, X, Y);
        
        // Update tool tips with new info.
        circles = updateTip(X, Y, circle, cText);
    });

  });

// Function to Scale x-axis upon on-click event on x-label
function updateXAxis(newX, xAxis) {
  var bottomAxis = d3.axisBottom(newX);
  xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  return xAxis;
}

// Function to UPDATE X-axis Scale upon on-click event on x-label
function xScale(data, X, width) {
  // Create scales.
  var xLScale = d3.scaleLinear().domain([d3.min(data, d => d[X])*.8,
                d3.max(data, d => d[X])*1.1]).range([0, width]);
  return xLScale;
}

function yScale(data, Y, height) {
  // Create scales.
  var yLScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[Y]) * .8,
          d3.max(data, d => d[Y]) * 1.1])
      .range([height, 0]);
  return yLScale;
}
// Function used for updating yAxis var upon click on axis label.
function updateYAxis(newY, yAxis) {
  var leftAxis = d3.axisLeft(newY);
  yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  return yAxis;
}

// UPDATE circles to new circles.
function updateCircles(circles, newX, newY, X, Y) {
  circles.transition()
      .duration(1000)
      .attr("cx", d => newX(d[X]))
      .attr("cy", d => newY(d[Y]));
  return circles;
}
// UPDATE circle-text to new text
function updateText(circleText, newX, newY, X, Y) {
  circleText.transition()
      .duration(1000)
      .attr("x", d => newX(d[X]))
      .attr("y", d => newY(d[Y]));
  return circleText;
}

function updateTip(X, Y, circles, textGroup) {
  // X-Axis tooltip label
  if (X === "poverty") {
      var xlabel = "Poverty: ";
   } else {
      var xlabel = "Income: "
  }
  // Y-Axis tooltip label
  if (Y === "healthcare") {
      var ylabel = "No Healthcare: ";
  } else {
      var ylabel = "Smokers: "
  } 

  // Define tooltip.
  var tTip = d3.tip().offset([-20, 0])
      .attr("class", "d3-tip")
      .html(function(d) {
          if (X === "poverty") {
              // All yAxis tooltip labels presented and formated as %.
              // Format xAxis Poverty as %
              return (`<b>${d.state}</b><br>${xlabel}${d[X]}%<br>${ylabel}${d[Y]}%`);
              } else {
              // Format xAxis Income in $.
              return (`<b>${d.state}</b><br>${xlabel}$${d[X]}<br>${ylabel}${d[Y]}%`);
              }
              
      });
  circles.call(tTip);
  // Create "mouseover" event listener to display tool tip.
  circles.on("mouseover", function(data) {
          tTip.show(data, this);
          d3.select(this)
          .transition()
          .duration(1000)
          .attr("r", 20);
      })
      .on("mouseout", function(data) {
          tTip.hide(data);
          d3.select(this)
          .transition()
          .duration(1000)
          .attr("r", 10);
      });
  textGroup.on("mouseover", function(data) {
          tTip.show(data, this);
      })
      .on("mouseout", function(data) {
          tTip.hide(data);
      });
  return circles;
}
}

// Set default X & Y variables
var X = "poverty";
var Y = "healthcare";

// Function call to make dynamic Chart
makeChart();