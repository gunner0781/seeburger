//var for the pie chart
var xValues = ["test", "France", "Spain", "USA", "Argentina"];
var yValues = [55, 49, 44, 24, 15];
var barColors = ["red", "green","blue","orange","brown"];

// script.js
var xyValues = [
    {x: 50, y: 7},
    {x: 60, y: 8},
    {x: 70, y: 8},
    {x: 80, y: 9},
    {x: 90, y: 9},
    {x: 100, y: 9},
    {x: 110, y: 10},
    {x: 120, y: 11},
    {x: 130, y: 14},
    {x: 140, y: 14},
    {x: 150, y: 15}
  ];
  
  new Chart("myChart", {
    type: "pie",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options: {
      title: {
        display: true,
        text: "World Wide Wine Production"
      }
    }
  });
  
  
  new Chart("TestmyChart", {
    type: "scatter",
    data: {
      datasets: [{
        pointRadius: 4,
        pointBackgroundColor: "rgb(0,0,255)",
        data: xyValues
      }]
    },
    options: {
      legend: {display: false},
      scales: {
        xAxes: [{ticks: {min: 40, max:160}}],
        yAxes: [{ticks: {min: 6, max:16}}],
      }
    }
  });
  