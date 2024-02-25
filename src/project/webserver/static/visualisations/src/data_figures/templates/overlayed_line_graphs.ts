import * as d3 from "d3";
import { Figure } from './figure';

export class OverlayedLineGraph extends Figure {
    private graphData: any[] = [];
    private layout: any;
    private config: any;
    private metrics = ["emissions", "airborne_emissions", "concentration", "forcing"]

    constructor(DOMElement: HTMLElement) {
        super(DOMElement);
    }

    public prepareData(data: any): void {
        const sp = "CO2";
        const specie_data = data["year"].map((year, i) => ({
            year: year,
            emissions: data[sp.concat("_emissions") as keyof typeof data][i],
            airborne_emissions: data[sp.concat("_airborne_emissions") as keyof typeof data][i],
            concentration:data[sp.concat("_concentration") as keyof typeof data][i],
            forcing: data[sp.concat("_forcing") as keyof typeof data][i],
            run: data["run"][i]
        }))

        this.graphData = specie_data;
    }

    public create(): void {
        const sp = "CO2";

        for (var metric of this.metrics) {
            // Declare the chart dimensions and margins.
            const width = 928;
            const height = 500;
            const marginTop = 20;
            const marginRight = 30;
            const marginBottom = 30;
            const marginLeft = 40;

            // Create the positional scales.
            const x = d3.scaleUtc()
            .domain(d3.extent(this.graphData, d => d.year))
            .range([marginLeft, width - marginRight]);

            const y = d3.scaleLinear()
            .domain([0, d3.max(this.graphData, d => this.getMetric(d, metric))]).nice()
            .range([height - marginBottom, marginTop]);

            // Create the SVG container.
            const svg = d3.select("#graph").append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;");

            // Add the horizontal axis.
            svg.append("g")
                .attr("transform", `translate(0,${height - marginBottom})`)
                .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

            // Add the vertical axis.
            svg.append("g")
                .attr("transform", `translate(${marginLeft},0)`)
                .call(d3.axisLeft(y))
                .call(g => g.select(".domain").remove())
                .call(g => g.append("text")
                    .attr("x", -marginLeft)
                    .attr("y", 10)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "start")
                    .text(sp.concat(" " + metric)));

            const points = this.graphData.map((d) => [x(d.year), y(this.getMetric(d, metric)), d.run]);
            const groups = d3.rollup(points, v => Object.assign(v, {z: v[0][2]}), d => d[2]);

            const line = d3.line();
            svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", 0.1)
                .selectAll("path")
                .data(groups.values())
                .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("d", line);
        }
    }

    private getMetric(d:any, metric:string):any {
        switch(metric) {
            case "emissions": {
                return d.emissions;
            }
            case "airborne_emissions": {
                return d.airborne_emissions;
            }
            case "concentration": {
                return d.concentration;
            }
            case "forcing":
                return d.forcing;
        }
        return;
    }
}