import Plotly from 'plotly.js-dist';
import csv from '../../data/climate_data.csv';

// Wrangle data
var graphData = []; // data to be graphed
var numRuns = Math.max(...csv.map(d => +d.run));

for (let r = 1; r < numRuns; r++) {
    let run = csv.filter(d => (d.run == r));
    var numPoints = run.length;
    var t = [...Array(numPoints).keys()];
    var theta = t.map(x => x / (numPoints - 1) * 2 * Math.PI * 12);
    
    let year = run.map(d => +d.year);
    let atmosphericTemp = run.map(d => +d.atmospheric_temp);
    let CH4Concentration = run.map(d => +d.CH4_concentration);
    
    let x = [];
    let y = [];
    let labels = [];  // labels for each point
    
    for (let i = 0; i < numPoints; i++) {
        x.push(CH4Concentration[i] * Math.cos(theta[i]));
        y.push(CH4Concentration[i] * Math.sin(theta[i]));
        let label = `Year: ${year[i]}<br>`
            + `Temperature Anomaly: ${atmosphericTemp[i].toFixed(2)}<br>`
            + `CH4 Concentration: ${CH4Concentration[i].toFixed(2)}`;
        labels.push(label);
    }
    
    graphData.push({
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: atmosphericTemp,
        opacity: 0.7,
        line: {
            width: 10,
            color: atmosphericTemp,
            colorscale: 'Jet'
        },
        text: labels,
        hovertemplate:
            `<b>Run ${r}</b><br>`
            + `%{text}`
            + `<extra></extra>`,
    })
}


// Prepare graph inputs
var graphDiv = document.getElementById('graph');

var layout = {
    title: {
      text: 'Temperature Anomaly and CH4 Concentration (1750-2100)',
      font: {
        family: 'Courier New, monospace',
        size: 28
      },
      yref: 'paper',
      y: 0.95
    },
    scene: { // specifies 3D scene
        xaxis: {
            title: '',
            showgrid: false,
            zeroline: true
        },
        yaxis: {
            title: '',
            showgrid: false,
            zeroline: true
        },
        zaxis: {
            title: 'Temperature Anomaly (K)',
            showgrid: true,
            zeroline: false
        }
    },
    showlegend: true,
    legend: {
        title: {
            text: 'Legend',
        },
        x: 1.05, // position legend outside the plot area to the right
        xanchor: 'left',
        y: 0.5,
        yanchor: 'middle'
    },
    margin: { // make sure labels are visible
        l: 0,
        r: 0,
        b: 0,
        t: 0
    }
}

var config = {
    responsive: true,       // graph size adjusts to window
    displayModeBar: true,   // helper icons at top right
    displaylogo: false,     // Plotly logo
    modeBarButtonsToRemove: ['zoom3d', 'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraLastSave3d']
}

// Create graph
Plotly.newPlot(graphDiv, graphData, layout, config);


// Note: data can be retrieved via
console.log(graphDiv.data);


// Diagnostic print statements
// console.log(Plotly.version);
// console.log(csv);
// console.log(t);
