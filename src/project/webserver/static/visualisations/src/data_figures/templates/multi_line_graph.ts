// import * as d3 from "d3";
// import { Figure } from './figure';

type MetricGraph = {
    metric: string,
    delaunay: any,
    points: any,
    groups: any,
    x: any,
    y: any,
    run: any
}

// Declare the chart dimensions and margins.
const width = 1200;
const height = 800;
const margin = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 40
}
const tooltipRadius = 100;

class OverlayedLineGraph extends Figure {
    private layout: any;
    private config: any;
    private metrics = ["emissions", "airborne_emissions", "concentration", "forcing"]
    private metricGraphs: MetricGraph[] = [];

    constructor(DOMElement: HTMLElement, config) {
        super(DOMElement, config);
    }

    public async init(): void {
        const start = Date.now();
        const data = await this.getDataForScenario("ssp245");

        const sp = "CO2";
        const specie_data = data["year"].map((year, i) => ({
            year: year,
            emissions: data[sp.concat("_emissions") as keyof typeof data][i],
            airborne_emissions: data[sp.concat("_airborne_emissions") as keyof typeof data][i],
            concentration:data[sp.concat("_concentration") as keyof typeof data][i],
            forcing: data[sp.concat("_forcing") as keyof typeof data][i],
            run: data["run"][i]
        }))

        for (var metric of this.metrics) {
            let graph:MetricGraph = {
                metric: metric,
                delaunay: null,
                points: null,
                groups: null,
                x: specie_data.map((d)=>d.year),
                y: specie_data.map((d)=>this.getMetric(d, metric)),
                run: specie_data.map((d)=>d.run)
            }
            this.metricGraphs.push(graph);
        }

        const end = Date.now();
        console.log(end-start);
    }

    private async getDataForScenario(scenario: string): void {
        const url = `/api/climate?scenario=${scenario}&file=pos_generative_rand`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    public update() {
        return;
    }

    public render(): void {
        const start = Date.now();
        const sp = "CO2";

        // Create container for the screen
        const graphContainer = d3.select("#multi-line-graph").style("display", "flex").style("flex-wrap", "wrap");

        this.metricGraphs.forEach(graph => {
            console.log(graph);
            // Generate unique IDs for each graph
            const chartId = `chart-${graph.metric}`;
            // Create container for each graph
            const chartContainer = graphContainer.append("div").attr("id", chartId).style("position", "relative").style("width", "50%").style("height", "50%");

            // Append the SVG to the chart container
            const svg = chartContainer.append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif;")
            
            const svgRect = svg.node().getBoundingClientRect();
            console.log(svgRect);

            // Create the positional scales.
            const x = d3.scaleUtc()
            .domain(d3.extent(graph.x))
            .range([margin.left, svgRect.width - margin.right]);

            const y = d3.scaleLinear()
            .domain(d3.extent(graph.y)).nice()
            .range([svgRect.height - margin.bottom, margin.top]);

            const scaled_x = graph.x.map(v => x(v));
            const scaled_y = graph.y.map(v => y(v));

            const points = scaled_x.map(function(e, i) {
                return [e, scaled_y[i], graph.run[i]];
            });

            const groups = d3.rollup(points, v => Object.assign(v, {z: v[0][2]}), d => d[2]);
            const delaunay = d3.Delaunay.from(points);

            graph.points = points;
            graph.groups = groups;
            graph.delaunay = delaunay;

            // Add the horizontal axis.
            svg.append("g")
                .attr("transform", `translate(0,${svgRect.height - margin.bottom})`)
                .call(d3.axisBottom(x).tickSizeOuter(0));

            // Add the vertical axis.
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .call(g => g.select(".domain").remove())
                .call(g => g.append("text")
                    .attr("x", 0)
                    .attr("y", 10)
                    .attr("fill", "currentColor")
                    .attr("text-anchor", "start")
                    .text(sp.concat(" " + graph.metric)));

            const line = d3.line();
            const path = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-opacity", 0.1)
                .selectAll("path")
                .data(graph.groups.values())
                .join("path")
                .style("mix-blend-mode", "multiply")
                .attr("d", line);
            
            const tooltip = svg.append("g")
                .attr("display", "none");

            tooltip.append("circle")
                .attr("r", tooltipRadius)
                .attr("fill", "rgba(255, 255, 255, 0.8)")
                .attr("stroke", "black");

            tooltip.append("text")
                .attr("text-anchor", "middle")
                .attr("y", -8);
            
            svg
                .on("click", (event) => {
                    console.log(graph.metric);
                    let [mx, my] = d3.pointer(event);
                    console.log("%d, %d", mx, my);
                    const i = graph.delaunay.find(mx, my);
                    console.log(i);
                    const [x, y, k] = points[i]
                    tooltip.attr("transform", `translate(${x},${y})`);
                    tooltip.attr("display", null);
                })
        })

        const end = Date.now();
        console.log(end-start);
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