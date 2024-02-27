// import { Figure } from './figure';
// import Plotly from 'plotly.js-dist';

class RibbonGraph extends Figure {
    private data: any[] = [];
    private layout: any;
    private config: any;

    constructor(DOMElement: HTMLElement, config) {
        super(DOMElement, config);
    }

    public async init(): void {

        const url = `/api/climate?scenario=ssp585&file=pos_generative_rand`;
        const response = await fetch(url);
        const data = await response.json();

        const numRuns = data["run"][data["run"].length - 1];

        for (let r = 1; r <= numRuns; r += 1) {
            let start = data["run"].indexOf(r);
            let end = data["run"].lastIndexOf(r) + 1;
            let year = data["year"].slice(start, end);
            let atmosphericTemp = data["atmospheric_temp"].slice(start, end);

            this.data.push({
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
    
    public async update(render: boolean = true) {
        return;
    }

    public render(): void {
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
            autosize: false,
            width: 800,
            height: 700,
            scene: {
                xaxis: { title: 'Year', showgrid: true, zeroline: true, autorange: 'reversed' },
                yaxis: { title: 'Run', showgrid: false, zeroline: true },
                zaxis: { title: 'Atmospheric Temperature', showgrid: true, zeroline: true },
            },
            showlegend: true,
            legend: {
                title: { text: 'Legend' },
                x: 1.05,
                xanchor: 'left',
                y: 0.5,
                yanchor: 'middle'
            },
            margin: { l: 100, r: 0, b: 0, t: 40 }
        };

        this.config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['zoom3d', 'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraLastSave3d']
        };

        Plotly.newPlot(this.DOMElement, this.data, this.layout, this.config);
    }

}
