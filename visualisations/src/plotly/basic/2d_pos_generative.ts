import Plotly from 'plotly.js-dist';
import data from '../../../../data/climate/ssp585/clean/pos_generative.json' assert { type: 'json' };

// Wrangle data
var graphData = []; // data to be graphed
let year = data["year"];
let numPoints = year.length;
let columns = Object.keys(data).filter(x => x != 'year');
let nrows = 6;
let ncols = 4;

for (let row = 1; row <= nrows; row += 1) {
    for (let col = 1; col <= ncols; col += 1) {
        let column = columns[(row - 1) * ncols + (col - 1)];  // index into the columns array
        let y = data[column];
        let i = (row - 1) * ncols + col;
        
        graphData.push({
            name: column,
            type: 'scatter',
            x: year,
            y: y,
            xaxis: 'x' + i,
            yaxis: 'y' + i
        })
    }
}

// Prepare graph inputs
var graphDiv = document.getElementById('graph');

var layout = {
    grid: {rows: nrows, columns: ncols, pattern: 'independent'},
    autosize: true,
    height: 2000
};

var config = {
    responsive: true,       // graph size adjusts to window
    displayModeBar: true,   // helper icons at top right
    displaylogo: false,     // Plotly logo
    modeBarButtonsToRemove: []
}

// Create ribbon graph
Plotly.newPlot(graphDiv, graphData, layout, config);
