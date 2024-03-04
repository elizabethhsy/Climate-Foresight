// import * as d3 from "d3";
// import { Figure } from './figure';

type SubGraph =
    |MetricGraph
    |TemperatureGraph

type MetricGraph = {
    specie: string,
    scenario: string,
    metric: string,
    delaunay: any,
    points: any,
    groups: any,
    x: any,
    y: any,
    run: any
}

type TemperatureGraph = {
    scenario: string,
    layer: string,
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
const NUM_RUNS_TO_USE = 50;

const tooltipWidth = 100;
const tooltipHeight = 75;
var scalingFactor = 10;

const margin = {
    top: tooltipHeight/2,
    right: tooltipWidth/2,
    bottom: 50,
    left: 40
}

const metrics = ["emissions", "airborne_emissions", "concentration", "forcing"];
const layers = ["atmospheric_temp", "sea_layer1_temp", "sea_layer2_temp", "sea_layer3_temp"]

class OverlayedLineGraph extends Figure {
    private temperature_graph: boolean;
    private subGraphs: SubGraph[] = [];
    private specie: string;
    private scenario: string;

    constructor(DOMElement: HTMLElement, config, temperature:boolean = false) {
        super(DOMElement, config);
        this.scenario = "ssp119";
        this.specie = "CO2";
        this.temperature_graph = temperature;
    }

    public async init(): void {
        this.subGraphs = [];
        var url: string;
        if (this.temperature_graph) {
            console.log("is temperature graph");
            this.scenario = this.config.values["radioTemperatureScenario"];
            scalingFactor = 5;
            url = `/api/climate2/${this.scenario}/temps/temps.json`;
        } else {
            console.log("is species graph");
            this.scenario = this.config.values["radioMultilineScenario"];
            this.specie = this.config.values["radioMultilineSpecies"];
            console.log("species: ", this.specie);
            url = `/api/climate2/${this.scenario}/species/${this.specie}.json`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        // console.log(data);

        if (this.temperature_graph == true) {
            let temperature_data200 = data["year"].map((year, i) => ({
                year: year,
                atmospheric_temp: data["atmospheric_temp" as keyof typeof data][i],
                sea_layer1_temp: data["sea_layer1_temp" as keyof typeof data][i],
                sea_layer2_temp: data["sea_layer2_temp" as keyof typeof data][i],
                sea_layer3_temp: data["sea_layer3_temp" as keyof typeof data][i],
                run: data["run"][i]
            }))

            let temperature_data = temperature_data200.filter(d => d.run < NUM_RUNS_TO_USE);

            for (var layer of layers) {
                let graph:TemperatureGraph = {
                    scenario: this.scenario,
                    layer: layer,
                    delaunay: null,
                    points: null,
                    groups: null,
                    x: temperature_data.map((d)=>d.year),
                    y: temperature_data.map((d)=>this.getLayer(d, layer)),
                    run: temperature_data.map((d)=>d.run)
                }
                this.subGraphs.push(graph);
            }
        } else {
            var specie_data200 = data["year"].map((year, i) => ({
                year: year,
                emissions: data[this.specie.concat("_emissions") as keyof typeof data][i],
                airborne_emissions: data[this.specie.concat("_airborne_emissions") as keyof typeof data][i],
                concentration:data[this.specie.concat("_concentration") as keyof typeof data][i],
                forcing: data[this.specie.concat("_forcing") as keyof typeof data][i],
                run: data["run"][i]
            }))

            let specie_data = specie_data200.filter(d => d.run < NUM_RUNS_TO_USE);

            for (var metric of metrics) {
                let graph:MetricGraph = {
                    specie: this.specie,
                    scenario: this.scenario,
                    metric: metric,
                    delaunay: null,
                    points: null,
                    groups: null,
                    x: specie_data.map((d)=>d.year),
                    y: specie_data.map((d)=>this.getMetric(d, metric)),
                    run: specie_data.map((d)=>d.run)
                }
                this.subGraphs.push(graph);
            }
        }
        return;
    }

    public async update(render: boolean = true) {
        this.subGraphs = [];

        var url: string;
        if (this.temperature_graph) {
            console.log("is temperature graph");
            this.scenario = this.config.values["radioTemperatureScenario"];
            url = `/api/climate2/${this.scenario}/temps/temps.json`;
        } else {
            console.log("is species graph");
            this.scenario = this.config.values["radioMultilineScenario"];
            this.specie = this.config.values["radioMultilineSpecies"];
            console.log("species: ", this.specie);
            url = `/api/climate2/${this.scenario}/species/${this.specie}.json`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        // console.log(data);

        if (this.temperature_graph) {
            let temperature_data200 = data["year"].map((year, i) => ({
                year: year,
                atmospheric_temp: data["atmospheric_temp" as keyof typeof data][i],
                sea_layer1_temp: data["sea_layer1_temp" as keyof typeof data][i],
                sea_layer2_temp: data["sea_layer2_temp" as keyof typeof data][i],
                sea_layer3_temp: data["sea_layer3_temp" as keyof typeof data][i],
                run: data["run"][i]
            }))

            let temperature_data = temperature_data200.filter(d => d.run < NUM_RUNS_TO_USE);

            for (var layer of layers) {
                let graph:TemperatureGraph = {
                    scenario: this.scenario,
                    layer: layer,
                    delaunay: null,
                    points: null,
                    groups: null,
                    x: temperature_data.map((d)=>d.year),
                    y: temperature_data.map((d)=>this.getLayer(d, layer)),
                    run: temperature_data.map((d)=>d.run)
                }
                this.subGraphs.push(graph);
            }
        } else {
            let specie_data200 = data["year"].map((year, i) => ({
                year: year,
                emissions: data[this.specie.concat("_emissions") as keyof typeof data][i],
                airborne_emissions: data[this.specie.concat("_airborne_emissions") as keyof typeof data][i],
                concentration:data[this.specie.concat("_concentration") as keyof typeof data][i],
                forcing: data[this.specie.concat("_forcing") as keyof typeof data][i],
                run: data["run"][i]
            }))

            let specie_data = specie_data200.filter(d => d.run < 10);

            for (var metric of metrics) {
                let graph:MetricGraph = {
                    specie: this.specie,
                    scenario: this.scenario,
                    metric: metric,
                    delaunay: null,
                    points: null,
                    groups: null,
                    x: specie_data.map((d)=>d.year),
                    y: specie_data.map((d)=>this.getMetric(d, metric)),
                    run: specie_data.map((d)=>d.run)
                }
                this.subGraphs.push(graph);
            }
        }

        if (render) {
            this.render();
        }
        return;
    }

    public render(): void {
        // Create container for the screen
        this.DOMElement.innerHTML = "";
        const graphContainer = d3.select(this.DOMElement)
        .style("display", "flex").style("flex-wrap", "wrap");

        console.log(this.subGraphs);

        this.subGraphs.forEach(async graph => {
            // console.log(graph);
            // Generate unique IDs for each graph
            var chartId:string;
            if (this.temperature_graph) {
                chartId = `chart-${graph.layer}`;
            } else {
                chartId = `chart-${graph.metric}`;
            }
            // Create container for each graph
            const chartContainer = graphContainer.append("div").attr("id", chartId).style("position", "relative").style("width", "50%");

            // Append the SVG to the chart container
            const svg = chartContainer.append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("style", "max-width: 100%; height: auto; overflow: visible; font: 10px sans-serif; box-sizing: border-box;");

            requestAnimationFrame(() => {
                // Access the bounding client rect after the SVG is rendered
                const elem = document.getElementById(chartId);
                const svgRect = elem.getBoundingClientRect();
                console.log(svgRect);

                // Create the positional scales.
                const xScale = d3.scaleLinear()
                .domain(d3.extent(graph.x))
                .range([margin.left, svgRect.width - margin.right]);

                const yScale = d3.scaleLinear()
                .domain(d3.extent(graph.y)).nice()
                .range([svgRect.height - margin.bottom, margin.top]);

                const scaled_x = graph.x.map(v => xScale(v));
                const scaled_y = graph.y.map(v => yScale(v));

                const points = scaled_x.map(function(e, i) {
                    const x = e;
                    const y = scaled_y[i];
                    const run = graph.run[i];
                    return [x, y, run];
                });

                const groups = d3.rollup(points, v => Object.assign(v, {z: v[0][2]}), d => d[2]);
                // console.log("groups");
                // console.log(groups);
                const delaunay = d3.Delaunay.from(points);

                graph.points = points;
                graph.groups = groups;
                graph.delaunay = delaunay;

                // Add the horizontal axis.
                svg.append("g")
                    .attr("transform", `translate(0,${svgRect.height - margin.bottom})`)
                    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).tickSizeOuter(0));

                // Add the vertical axis.
                var label:string;
                if (this.temperature_graph) {
                    label = graph.layer;
                } else {
                    label = this.specie.concat(" " + graph.metric);
                }
                svg.append("g")
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(d3.axisLeft(yScale))
                    .call(g => g.select(".domain").remove())
                    .call(g => g.append("text")
                        .attr("x", 0)
                        .attr("y", 10)
                        .attr("fill", "currentColor")
                        .attr("text-anchor", "start")
                        .text(label));

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

                tooltip.append("rect")
                    .attr("width", tooltipWidth)
                    .attr("height", tooltipHeight)
                    .attr("fill", "rgba(255, 255, 255, 1)")
                    .attr("stroke", "#999");

                tooltip.append("text")
                    .attr("text-anchor", "middle")
                    .attr("y", -8);

                const tooltipGraph = tooltip.append("svg")
                    .attr("width", tooltipWidth)
                    .attr("height", tooltipHeight);
                
                svg
                    .on("click", (event) => {
                        console.log(label);
                        let [mx, my] = d3.pointer(event);
                        console.log("%d, %d", mx, my);
                        const i = graph.delaunay.find(mx, my);
                        console.log(i);
                        const p = points[i]
                        console.log(points[i]);
                        tooltip.attr("transform", `translate(${p[0]-tooltipWidth/2},${p[1]-tooltipHeight/2})`);
                        tooltip.attr("display", null);

                        const zoomedInData = this.getZoomedInData(points, points[i]);
                        renderZoomedInData(zoomedInData, points[i]);
                        tooltipGraph.attr("transform", `translate(${tooltipWidth/2}, ${tooltipHeight/2})`)
                    })
            
                function renderZoomedInData(data, point) {
                    // Remove existing content
                    tooltipGraph.selectAll("*").remove();

                    const xDomain = d3.extent(data, d=>d[0]);
                    const yDomain = d3.extent(data, d=>d[1]);

                    var miniXScale = d3.scaleLinear()
                        .domain(xDomain)
                        .range([0, tooltipWidth]);

                    const miniYScale = d3.scaleLinear()
                        .domain(yDomain)
                        .range([tooltipHeight, 0]);

                    const scaledData = data.map(d => {
                        const x = miniXScale(d[0]);
                        const y = tooltipHeight - miniYScale(d[1]);
                        const run = d[2];
                        return [x, y, run];
                    })
                    const groupedData = d3.rollup(scaledData, v => Object.assign(v, {z: v[0][2]}), d => d[2]);

                    // console.log(miniXScale.domain(), miniXScale.range(), miniYScale.domain(), miniYScale.range());

                    // // Add the horizontal axis.
                    // tooltip.append("g")
                    // .attr("transform", `translate(0,${tooltipHeight})`)
                    // .call(d3.axisBottom(miniXScale).ticks(5).tickSizeOuter(0));

                    // // Add the vertical axis.
                    // tooltip.append("g")
                    //     .attr("transform", `translate(0,0)`)
                    //     .call(d3.axisLeft(miniYScale).ticks(5))
                    //     .call(g => g.select(".domain").remove())

                    const line = d3.line();
                    tooltipGraph.selectAll("path")
                        .data(groupedData.values()) // Convert Map values to array of arrays
                        .enter()
                        .append("path")
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("stroke-linejoin", "round")
                        .attr("stroke-linecap", "round")
                        .attr("stroke-opacity", 0.1)
                        .style("mix-blend-mode", "multiply")
                        .attr("d", line);
                }
            });
        })
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

    private getLayer(d:any, layer:string):any {
        switch(layer) {
            case "atmospheric_temp": {
                return d.atmospheric_temp;
            }
            case "sea_layer1_temp": {
                return d.sea_layer1_temp;
            }
            case "sea_layer2_temp": {
                return d.sea_layer2_temp;
            }
            case "sea_layer3_temp":
                return d.sea_layer3_temp;
        }
        return;
    }

    private getZoomedInData(points, point):any {
        // console.log(points);
        // console.log(point[0]);
        console.log("max distance: ", tooltipWidth/(2*scalingFactor));
        let coordinates = points.filter(v => (Math.abs(v[0] - point[0]) <= (tooltipWidth/(2*scalingFactor))));
        // console.log(coordinates);
        return coordinates;
    }
}
