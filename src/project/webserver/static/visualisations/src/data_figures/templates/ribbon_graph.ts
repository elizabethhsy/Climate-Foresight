import { Figure } from './graph';
import Plotly from 'plotly.js-dist';

export class PlotlyRibbonGraph extends Figure {
    private graphData: any[] = [];
    private layout: any;
    private config: any;

    constructor(DOMElement: HTMLElement) {
        super(DOMElement);
    }

    public prepareData(data: any): void {
        const numRuns = data["run"][data["run"].length - 1];

        for (let r = 1; r <= numRuns; r += 1) {
            let start = data["run"].indexOf(r);
            let end = data["run"].lastIndexOf(r) + 1;
            let year = data["year"].slice(start, end);
            let atmosphericTemp = data["atmospheric_temp"].slice(start, end);

            this.graphData.push({
                name: 'run ' + r,
                type: 'surface',
                x: year.map(v => [v, v]),
                y: Array.from({length: end - start}, () => [r - 0.375, r + 0.375]),
                z: atmosphericTemp.map(v => [v, v]),
                colorscale: 'Picnic',
                showscale: false,
                lighting: {specular: 0.3}
            });
        }
    }

    public create(): void {
        this.layout = {
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
            scene: {
                xaxis: { title: 'Year', showgrid: true, zeroline: true, autorange: 'reversed' },
                yaxis: { title: 'Run', showgrid: false, zeroline: true },
                zaxis: { title: 'Atmospheric Temperature', showgrid: true, zeroline: true },
                camera: {
                    center: { x: 0, y: 0, z: 0 },
                    eye: { x: 1.25, y: 0.25, z: 0 },
                    projection: { type: 'perspective' }
                },
            },
            showlegend: true,
            legend: {
                title: { text: 'Legend' },
                x: 1.05,
                xanchor: 'left',
                y: 0.5,
                yanchor: 'middle'
            },
            margin: { l: 0, r: 0, b: 0, t: 0 }
        };

        this.config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['zoom3d', 'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraLastSave3d']
        };

        Plotly.newPlot(this.DOMElement, this.graphData, this.layout, this.config);
    }

}
