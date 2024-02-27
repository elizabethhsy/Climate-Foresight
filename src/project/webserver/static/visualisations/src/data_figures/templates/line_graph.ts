import { Figure } from './figure';

import * as d3 from "d3";

// TODO: move stuff from create to prepareData
export class LineGraph extends Figure {
    private data: any[] = [];

    constructor(DOMElement: HTMLElement) {
        super(DOMElement);
    }

    public prepareData(data: any): void {
        this.data = data;
    }

    public create(): void {

        // Data processing
        const numRuns = this.data["run"][this.data["run"].length - 1];
        const species = ["CO2", "CH4", "N2O"];

        // Convert to d3 preferred format (array of objects)
        const emissions = this.data["year"].map((year, i) => ({
            year: year,
            CO2: this.data["CO2_emissions"][i],
            CH4: this.data["CH4_emissions"][i],
            N2O: this.data["N2O_emissions"][i],
            run: this.data["run"][i]
        }));

        const years = emissions.filter(d => d.run == 1).map(d => d.year); // TODO: make more efficient

        // Position and size of graph
        const width = 1450;
        const height = 750;
        const margin = {
            top: 250,
            right: 50,
            bottom: 30,
            left: 220
        }

        const x = d3.scaleBand()
            .domain(years)
            .rangeRound([margin.left, width - margin.right])
            .padding(0.08);

        const xAxis = d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 20 === 0)); // only display every other x-tick label

        // y-scale to map emissions values
        const y = d3.scaleLinear()
            .domain([0, d3.max(emissions, d => Math.max(d.CO2, d.CH4, d.N2O))])
            .nice()
            .range([height - margin.bottom, margin.top]);

        // Color scale for species
        const color = d3.scaleOrdinal()
            .domain(["CO2", "CH4", "N2O"])
            .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Example colors, adjust as needed

        // SVG container
        const svg = d3.select("#graph").append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto; height: auto;");


        // Draw lines for each species and run
        species.forEach((specie, i) => {

            // Line generator for each species
            const line = d3.line()
                .x(d => x(d.year))
                .y(d => y(d[specie]));

            for (let run = 1; run <= numRuns; run++) {
                let start = this.data["run"].indexOf(run); 
                let end = this.data["run"].lastIndexOf(run) + 1;
                let yz = emissions.slice(start, end);

                svg.append("path")
                    .datum(emissions.filter(d => d.run == run))
                    .attr("fill", "none")
                    .attr("stroke", color(specie))
                    .attr("stroke-width", 1)
                    .attr("stroke-opacity", 0.05)
                    .attr("d", line(yz))
                    .attr("class", `line line-${specie}-run-${run}`);
            }
        });


        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));





        // Legend (simplified for brevity)
        // const legend = svg.selectAll(".legend")
        //     .data(species)
        //     .enter().append("g")
        //     .attr("class", "legend")
        //     .attr("transform", (d, i) => `translate(0,${i * 20})`);

        // legend.append("rect")
        //     .attr("x", width - 18)
        //     .attr("width", 18)
        //     .attr("height", 18)
        //     .style("fill", color);

        // legend.append("text")
        //     .attr("x", width - 24)
        //     .attr("y", 9)
        //     .attr("dy", ".35em")
        //     .style("text-anchor", "end")
        //     .text(d => d.replace("Emissions", ""));

    }
}
