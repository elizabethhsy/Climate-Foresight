// import { Figure } from './figure';
// import Plotly from 'plotly.js-dist';

class RibbonGraph extends Figure {
    private data: any[] = [];
    private graphData: any[] = [];
    private layout: any;
    private plotlyConfig: any;
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

        this.prepareGraphData();
    }
    
    public async update(render: boolean = true) {
        // this.scenarios = this.getCheckedBoxes();
        // console.log(this.scenarios);
        this.prepareGraphData();
        
        if (render) {
            this.render(true);
        }
    }

    private prepareGraphData() {
        this.graphData = [];
        const checkedScenarios = this.getCheckedBoxes();

        let zMin = Number.POSITIVE_INFINITY;
        let zMax = Number.NEGATIVE_INFINITY;

        // First, determine the global min and max z values
        checkedScenarios.forEach(scenario => {
            const data = this.data[scenario];
            const metricName = this.getMetricName();
            const metricToDisplay = data[metricName];

            // Update zMin and zMax based on the current data
            const currentMax = Math.max(...metricToDisplay);
            const currentMin = Math.min(...metricToDisplay);

            if (currentMax > zMax) zMax = currentMax;
            if (currentMin < zMin) zMin = currentMin;
        });

        checkedScenarios.forEach((scenario, i) => {
            const data = this.data[scenario];
            const years = data["year"];
            const metricName = this.getMetricName();
            const metricToDisplay = data[metricName];

            this.graphData.push({
                name: scenario,
                type: 'surface',
                x: years.map(v => [v, v]),
                y: Array.from({length: years.length}, () => [i+1 - 0.3, i+1 + 0.3]),
                z: metricToDisplay.map(v => [v, v]),
                colorscale: 'Picnic',
                cmin: zMin,
                cmax: zMax,
                showscale: false
            });
        })
    }

    private getMetricName() {
        const metricType = this.config.values["dropdownRibbonMetric"];
        const species = this.config.values["dropdownRibbonSpecies"];

        if (metricType === "temperature") {
            return "atmospheric_temp";
        }

        return species + "_" + metricType.replaceAll(" ", "_");
    }

    private getFormattedName(includeSpecies: boolean) {
        if (this.config.values["dropdownRibbonMetric"] == "temperature") {
            return "Temperature Anomaly (K)";
        }
        let name = this.getMetricName();
        name = name.replaceAll("_", " ");
        name = name.replace(/\b\w/g, function(char) {
            return char.toUpperCase();
        });
        if (!includeSpecies) {
            name = name.split(" ").slice(1).join(" ");
        }
        console.log("Formatted name: " + name);
        return name;
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

    public render(plotExists: boolean = false): void {
        const checkedScenarios = this.getCheckedBoxes();
        this.layout = {
            title: {
                text: this.getFormattedName(true) + ' (1750-2100)',
                font: {
                    family: 'Courier New, monospace',
                    size: 28
                },
                yref: 'paper',
                y: 0.95
            },
            autosize: false,
            width: 1200,
            height: 850,
            scene: {
                xaxis: {
                    title: 'Year',
                    showgrid: true,
                    zeroline: true,
                    autorange: 'reversed'
                },
                yaxis: {
                    title: {
                        text: 'Scenario',
                        standoff: 34
                    },
                    showgrid: false,
                    zeroline: true,
                    tickvals: Array.from({length: checkedScenarios.length}, (_, i) => i + 1),
                    ticktext: checkedScenarios, // string labels to display
                    tickfont: {
                        size: 11
                    }
                },
                zaxis: {
                    title: this.getFormattedName(false),
                    showgrid: true,
                    zeroline: true
                },
                camera: {
                    eye: { x: 1.75, y: 1.75, z: 0.5 },
                    center: { x: 0, y: 0, z: 0 }
                },
                default: {
                    eye: { x: 1.75, y: 1.75, z: 0.5 },
                    center: { x: 0, y: 0, z: 0 }
                }
            },
            showlegend: true,
            legend: {
                title: { text: 'Legend' },
                x: 1.05,
                xanchor: 'left',
                y: 0.5,
                yanchor: 'middle'
            },
            margin: { l: 160, r: 0, b: 0, t: 30 }
        };

        this.plotlyConfig = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['zoom3d', 'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraLastSave3d']
        };

        Plotly.react(this.DOMElement, this.graphData, this.layout, this.plotlyConfig);
    }

}
