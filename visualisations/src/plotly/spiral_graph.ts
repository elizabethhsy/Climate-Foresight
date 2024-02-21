import Plotly from 'plotly.js-dist';
import data from '../../../data/climate/ssp585/clean/pos_generative_rand.json' assert { type: 'json' };

// Wrangle data
var graphData = []; // data to be graphed
var numRuns = data["run"][data["run"].length - 1];

for (let r = 1; r <= numRuns; r++) {
    let start = data["run"].indexOf(r);
    let end = data["run"].lastIndexOf(r) + 1;
    let numPoints = end - start;
    let year = data["year"].slice(start, end);
    let atmosphericTemp = data["atmospheric_temp"].slice(start, end);
    let CH4Concentration = data["CH4_concentration"].slice(start, end);
    var t = [...Array(numPoints).keys()];
    var theta = t.map(x => x / (numPoints - 1) * 2 * Math.PI * 14);
    
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
        name: 'run ' + r,
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: atmosphericTemp,
        opacity: 0.7,
        line: {
            width: 7,
            color: atmosphericTemp,
            colorscale: [
                ['0.0', 'rgb(10,50,180)'],
                ['1.0', 'rgb(10,200,120)']
            ]
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
            showgrid: true,
            zeroline: false,
            showticklabels: false
        },
        yaxis: {
            title: '',
            showgrid: true,
            zeroline: false,
            showticklabels: false
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
