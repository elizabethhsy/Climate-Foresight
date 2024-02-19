import Plotly from 'plotly.js-dist';
import data from '../../../../data/climate/ssp585/clean/pos_generative.json' assert { type: 'json' };

// Wrangle data
var graphData = []; // data to be graphed
var annotations = [];
let year = data["year"];
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
            yaxis: 'y' + i,
            hovertemplate:
                `${column.replaceAll('_', ' ')}: %{y:.1f}<br>`
                + `Year: %{x}`
                + `<extra></extra>`,
        })

        annotations.push({
            text: column,
            xref: 'paper',
            yref: 'paper',
            x: (col - (0.75 * (4 - col)/3 + 0.25 * (col - 1)/3)) / ncols,  // weighted average to have centered titles
            y: 1.0 - (row - (1.0 * (6-row)/5 + 0.8 * (row-1)/5)) / nrows,
            yanchor: 'bottom',
            showarrow: false
        })
    }
}

// Prepare graph inputs
var graphDiv = document.getElementById('graph');

var layout = {
    title: 'Posterior Generative Data',
    grid: {rows: nrows, columns: ncols, pattern: 'independent'},
    annotations: annotations,
    autosize: true,
    height: 2000,
    showlegend: false
};

var config = {
    responsive: true,       // graph size adjusts to window
    displayModeBar: true,   // helper icons at top right
    displaylogo: false,     // Plotly logo
    modeBarButtonsToRemove: []
}

// Create ribbon graph
Plotly.newPlot(graphDiv, graphData, layout, config);
