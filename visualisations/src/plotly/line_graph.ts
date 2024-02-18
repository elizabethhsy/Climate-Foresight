import Plotly from 'plotly.js-dist';
import data from '../../../data/climate/ssp585/clean/pos_generative_rand.json' assert { type: 'json' };

// Wrangle data
var graphData = []; // data to be graphed
var numRuns = data["run"][data["run"].length - 1];

for (let r = 1; r <= numRuns; r++) {
    let start = data["run"].indexOf(r); 
    let end = data["run"].lastIndexOf(r) + 1;
    let year = data["year"].slice(start, end);
    let atmosphericTemp = data["atmospheric_temp"].slice(start, end);
    let N2OAirborneEmissions = data["N2O_airborne_emissions"].slice(start, end);
    
    graphData.push({
        name: 'run ' + r,
        type: 'scatter3d',
        mode: 'lines',
        x: atmosphericTemp,
        y: N2OAirborneEmissions,
        z: year,
        opacity: 0.7,
        line: {
            width: 7,
            color: atmosphericTemp,
            colorscale: [
                ['0.0', 'rgb(0,90,205)'],
                ['1.0', 'rgb(0,240,90)']
            ]
        },
        hovertemplate:
            `<b>Run ${r}</b><br>`
            + `Temperature Anomaly: %{x:.2f}<br>`
            + `N2O Airborne Emissions: %{y:.0f}`
            + `<extra></extra>`,
    })
}


// Prepare graph inputs
var graphDiv = document.getElementById('graph');

var layout = {
    title: {
      text: 'Temperature Anomaly and N2O Airborne Emissions (1750-2100)',
      font: {
        family: 'Courier New, monospace',
        size: 28
      },
      yref: 'paper',
      y: 0.95
    },
    scene: { // specifies 3D scene
        xaxis: {
            title: 'Temperature Anomaly (K)',
            showgrid: true,
            zeroline: true
        },
        yaxis: {
            title: 'N2O Airborne Emissions',
            showgrid: true,
            zeroline: true
        },
        zaxis: {
            title: 'Year',
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
