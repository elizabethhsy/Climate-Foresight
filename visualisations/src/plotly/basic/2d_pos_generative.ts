import Plotly from 'plotly.js-dist';
import data from '../../../../data/climate/ssp585/clean/pos_generative.json' assert { type: 'json' };

// Wrangle data
var graphData = []; // data to be graphed
let numPoints = data["year"].length;
let columns = Object.keys(data).filter(x => x != 'year'); // test

// for (let row = 1; row <= 3; row += 1) {
//     for (let col = 1; col <= 4; col += 1) {
//         let year = data["year"].slice(start, end);
//         let atmosphericTemp = data["atmospheric_temp"].slice(start, end);
        
//         graphData.push({
//             name: 'run ' + r,
//             type: 'surface',
//             x: year.map(v => [v,v]),
//             y: Array.from({length: numPoints}, () => [r - 0.375, r + 0.375]),
//             z: atmosphericTemp.map(v => [v,v]),
//             colorscale: 'Picnic',
//             showscale: false,
//             lighting: {specular: 0.3}
//         })

//     }
// }

// Prepare graph inputs
var graphDiv = document.getElementById('graph');

var layout = {
    title: {
      text: 'Atmospheric Temperature (1750-2100)',
      font: {
        family: 'Courier New, monospace',
        size: 28
      },
      yref: 'paper',
      y: 0.95
    },
    autosize: true,
    scene: { // specifies 3D scene
        xaxis: {
            title: 'Year',
            showgrid: true,
            zeroline: true,
            autorange: 'reversed'  // reverse the year axis to show earlier years closer to viewer
        },
        yaxis: {
            title: 'Run',
            showgrid: false,
            zeroline: true
        },
        zaxis: {
            title: 'Atmospheric Temperature',
            showgrid: true,
            zeroline: true
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
};

var config = {
    responsive: true,       // graph size adjusts to window
    displayModeBar: true,   // helper icons at top right
    displaylogo: false,     // Plotly logo
    modeBarButtonsToRemove: ['zoom3d', 'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraLastSave3d']
}

// Create ribbon graph
Plotly.newPlot(graphDiv, graphData, layout, config);
