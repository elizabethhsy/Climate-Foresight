import Plotly from 'plotly.js-dist';
import data from '../../../../../../../../data/climate/ssp585/clean/prior_generative_rand.json' assert { type: 'json' };

// Note: substitute the other generative rand data in above to create 2d graphs for them
// i.e. prior_generative_rand.json

// Wrangle data
var graphData = []; // data to be graphed
var annotations = [];
let columns = Object.keys(data).filter(x => x != 'year');
var numRuns = data["run"][data["run"].length - 1];
let nrows = 6;
let ncols = 4;

for (let r = 1; r <= numRuns; r += 1) {
    for (let row = 1; row <= nrows; row += 1) {
        for (let col = 1; col <= ncols; col += 1) {
            let start = data["run"].indexOf(r); 
            let end = data["run"].lastIndexOf(r) + 1;
            let year = data["year"].slice(start, end);
            let column = columns[(row - 1) * ncols + (col - 1)];  // index into the columns array
            let y = data[column].slice(start, end);
            let i = (row - 1) * ncols + col;
            
            graphData.push({
                name: column,
                type: 'scatter',
                line: {
                    width: 1
                },
                x: year,
                y: y,
                xaxis: 'x' + i,
                yaxis: 'y' + i,
                hovertemplate:
                    `<b>Run ${r}</b><br>`
                    + `${column.replaceAll('_', ' ')}: %{y:.1f}<br>`
                    + `Year: %{x}`
                    + `<extra></extra>`,
            })
            
            if (r == 1) {
                annotations.push({
                    text: column,
                    xref: 'paper',
                    yref: 'paper',
                    x: (col - (0.75 * (ncols - col)/(ncols - 1) + 0.25 * (col - 1)/(ncols - 1))) / ncols,  // weighted average to have centered titles
                    y: 1.0 - (row - (1.0 * (nrows - row)/(nrows - 1) + 0.8 * (row - 1)/(nrows - 1))) / nrows,
                    yanchor: 'bottom',
                    showarrow: false
                })
            }
        }
    }
}

// Prepare graph inputs
var graphDiv = document.getElementById('graph');

var layout = {
    title: 'Prior Generative Random Data',
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
