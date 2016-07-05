var emg = []; // dataPoints Acc Sensor1
var dataLength = 100; // number of dataPoints visible at any point
var chart;
var ws;

window.onload = function () {
	chart = new CanvasJS.Chart("emgPlot",{
		backgroundColor: "transparent",
		axisY:{
			gridColor: "rgba(255,255,255,.05)",
			tickColor: "rgba(255,255,255,.05)",
			labelFontColor: "#a2a2a2"
		},
		axisX:{
			labelFontColor: "#a2a2a2"
		},
		axisY:{
   		maximum: 2500,
			minimum: 0
 		},
		data:[{
			type: "line",
			showInLegend: true,
			name: "EMG",
			dataPoints: emg
		}]
	});
	setupWs();
}

function setupWs(){
	var host = window.document.location.host.replace(/:.*/, '');
  ws = new WebSocket('ws://' + host + ':8080');

  ws.onmessage = function (event) {
		var lecture = JSON.parse(event.data);
		emg.push({
			x: lecture.cont,
			y: parseInt(lecture.value)
		});
		if (emg.length == dataLength){
			emg.shift();
		}
		chart.render();
  };
}
