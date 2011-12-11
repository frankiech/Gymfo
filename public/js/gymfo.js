var t = 1297110663, // start time (seconds since epoch)
    v = 70, // start value (subscribers)
    gymfo_data = d3.range(30).map(function(d) { return {time:t++, light: 0, sound: 0, humidity: 0, temperature: 0}; }); // starting dataset

var w = 10, h = 150;
var x = d3.scale.linear().domain([0, 1]).range([0, w]);
var y = d3.scale.linear().domain([0, 100]).rangeRound([0, h]);

function next(light, sound, temp, humidity) {
  return {
      time: t++,
      light: light,
      sound: sound,
      temperature: temp,
      humidity: humidity,
  };
};

function redraw(chart, chartdata) {
  // Update…
  var rect = chart.selectAll("rect")
      .data(chartdata, function(d) {return d.time});
  
  rect.enter().insert("svg:rect", "line")
      .attr("x", function(d, i) { return x(i + 1) - .5; })
      .attr("y", function(d) { return h - y(d.value) - .5; })
      .attr("width", w)
      .attr("height", function(d) { return y(d.value); })
    .transition()
      .duration(1000)
      .attr("x", function(d, i) { return x(i) - .5; });
 
   rect.transition()
       .duration(1000)
       .attr("x", function(d, i) { return x(i) - .5; });
 
  rect.exit().transition()
       .duration(1000)
       .attr("x", function(d, i) { return x(i - 1) - .5; })
       .remove();
}

function avg(items) {
  return Math.round(d3.sum(items)/items.length);
}

// get data every few  seconds
setInterval(function() {
  $.ajax({
    type: "GET",
    url: "http://www.itpcakemix.com/project/Gymfo_OnSite?limit=30",
    dataType: "jsonp",
    success : function(data) {
      // calculate smoothed values
      light = avg(data.map(function(d) {return d.AD0;})),
      sound = avg(data.map(function(d) {return d.AD1;})),
      temperature = avg(data.map(function(d) {return d.AD2;})),
      humidity = avg(data.map(function(d) {return d.AD3;}));

      // update numbers on dashboard
      $("#temperature").text(temperature);
      $("#humidity").text(humidity);
      $("#sound").text(sound);
      $("#light").text(light);

      // push into data
      gymfo_data.shift();
      gymfo_data.push(next(light, sound, temperature, humidity));

      // prep for chart redraw
      temperatures = gymfo_data.map(function(d) { return {time: d.time, value: d.temperature}; });
      humidities = gymfo_data.map(function(d) { return {time: d.time, value: d.humidity}; });
      sounds = gymfo_data.map(function(d) { return {time: d.time, value: d.sound}; });
      lights = gymfo_data.map(function(d) { return {time: d.time, value: d.light}; });

      // redraw charts
      redraw(tempchart, temperatures);
      redraw(humchart, humidities);
      redraw(soundchart, sounds);
      redraw(lightchart, lights);
   }
  });
  
}, 2000);

var tempchart   = initChart("#temp-container"),
    humchart    = initChart("#hum-container");
    lightchart  = initChart("#light-container");
    soundchart  = initChart("#sound-container");

function initChart(id) { 
  // add chart
  var chart = d3.select(id)
    .append("svg:svg")
    .attr("class", "chart")
    .attr("width", w * gymfo_data.length - 1)
    .attr("height", h);

  // populate initial bars
  chart.selectAll("rect")
    .data(gymfo_data)
    .enter().append("svg:rect")
    .attr("x", function(d, i) { return x(i) - .5; })
    .attr("y", function(d) { return h - y(0) - .5; })
    .attr("width", w)
    .attr("height", function(d) { return y(0); });

  chart.append("svg:line")
    .attr("x1", 0)
    .attr("x2", w * gymfo_data.length)
    .attr("y1", h - .5)
    .attr("y2", h - .5)
    .attr("stroke", "#79DCF2");

  return chart;
}
