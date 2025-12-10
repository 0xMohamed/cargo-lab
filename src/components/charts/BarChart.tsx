import { createEffect, onCleanup } from "solid-js";
import * as d3 from "d3";

export default function BarChart(props) {
  let svgRef;
  let containerRef;

  let resizeObserver;

  const drawChart = () => {
    const data = props.data;
    if (!svgRef || !containerRef || !data) return;

    const rect = containerRef.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const margin = { top: 20, right: 10, bottom: 30, left: 10 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef);
    svg.selectAll("g").remove();

    const x = d3
      .scaleBand()
      .domain(data.map((_, i) => i.toString()))
      .range([0, w])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data) || 100])
      .range([h, 0]);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid lines
    chart
      .selectAll("line.grid")
      .data(y.ticks(4))
      .join("line")
      .attr("class", "grid")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#00000075")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5 10");

    // Bars
    chart
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => x(i.toString()))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d))
      .attr("height", (d) => h - y(d))
      .attr("rx", 4)
      .attr("fill", "#000")
      .attr("fill-opacity", 0.8);

    // Labels
    chart
      .selectAll(".label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", (_, i) => x(i.toString()) + x.bandwidth() / 2)
      .attr("y", (d) => y(d) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#000")
      .attr("font-size", "12px")
      .text((d) => `${d}%`);
  };

  createEffect(() => {
    drawChart();

    resizeObserver = new ResizeObserver(() => {
      drawChart();
    });

    resizeObserver.observe(containerRef);
  });

  onCleanup(() => {
    if (resizeObserver) resizeObserver.disconnect();
  });

  return (
    <div ref={containerRef} style="width: 100%; height: 100%;">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
