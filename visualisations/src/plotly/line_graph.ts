import Plotly from 'plotly.js-dist';
import csv from '../../data/climate_data.csv';

// Wrangle data
var graphData = []; // data to be graphed
var numRuns = Math.max(...csv.map(d => +d.run));

for (let r = 1; r < numRuns; r++) {
    let run = csv.filter(d => (d.run == r));
    let years = run.map(d => +d.year);
    let atmosphericTemp = run.map(d => +d.atmospheric_temp);
    let N2OAirborneEmissions = run.map(d => +d.N2O_airborne_emissions);
    
    graphData.push({
        type: 'scatter3d',
        mode: 'lines',
        x: atmosphericTemp,
        y: N2OAirborneEmissions,
        z: years,
        opacity: 0.7,
        line: {
            width: 10,
            color: atmosphericTemp,
            colorscale: 'YlOrRd'
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
