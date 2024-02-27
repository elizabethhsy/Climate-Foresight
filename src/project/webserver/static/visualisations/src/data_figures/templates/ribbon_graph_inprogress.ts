// import { Figure } from './figure';
// import Plotly from 'plotly.js-dist';

class RibbonGraph extends Figure {
    private data: any[] = [];
    private graphData: any[] = [];
    private layout: any;
    private config: any;
    private scenarios: Array<string> = ["ssp119", "ssp126", "ssp245", "ssp370", "ssp434", "ssp534-over", "ssp585"];

    constructor(DOMElement: HTMLElement, config) {
        super(DOMElement, config);
    }

    public async init(): void {
        // Fetch data for each species

        for (let i = 0; i < this.scenarios.length; i++) {
            const scenario = this.scenarios[i];
            console.log(scenario);
            const url = `/api/climate?scenario=${scenario}&file=pos_generative`;
            const response = await fetch(url);
            const data = await response.json();
            this.data[scenario] = data;
        }

        await this.update(false);
    }
    
    public async update(render: boolean = true) {
        // this.scenarios = this.getCheckedBoxes();
        // console.log(this.scenarios);
        
        this.scenarios.forEach((scenario, i) => {
            const data = this.data[scenario];
            const years = data["year"];
            const metricToDisplay = data["atmospheric_temp"];

            this.graphData.push({
                name: scenario,
                type: 'surface',
                x: years.map(v => [v, v]),
                y: Array.from({length: years.length}, () => [i+1 - 0.375, i+1 + 0.375]),
                z: metricToDisplay.map(v => [v, v]),
                colorscale: 'Picnic',
                showscale: false,
                lighting: {specular: 0.3}
            });
        })

        if (render) {
            this.render();
        }
    }

    private getCheckedBoxes() {
        const checkedBoxes = [];
        for (const key in this.config.values) {
            if (key.includes("checkbox") && this.config.values[key]) {
                checkedBoxes.push(key.replace("checkbox", "").toLowerCase());
            }
        }
        return checkedBoxes;
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
                yaxis: { title: 'Scenario', showgrid: false, zeroline: true },
                zaxis: { title: 'Atmospheric Temperature', showgrid: true, zeroline: true }
            },
            showlegend: true,
            legend: {
                title: { text: 'Legend' },
                x: 1.05,
                xanchor: 'left',
                y: 0.5,
                yanchor: 'middle'
            },
            margin: { l: 100, r: 50, b: 30, t: 30 }
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
