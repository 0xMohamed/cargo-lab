import { createEffect, onCleanup } from "solid-js";
import * as d3 from "d3";
import styles from "../../styles/Stats.module.css";

export default function DonutChart(props) {
  let svgRef;
  let containerRef;
  let resizeObserver;

  const drawChart = () => {
    const data = props.data;
    if (!svgRef || !containerRef || !data || data.length === 0) return;

    const rect = containerRef.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const radius = Math.min(width, height) / 2;

    const total = data.reduce((acc, val) => acc + val, 0);

    const svg = d3.select(svgRef);
    svg.selectAll("g").remove();

    const chart = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3
      .scaleOrdinal()
      .domain(data.map((_, i) => i))
      .range(
        d3.quantize((t) => d3.interpolateSpectral(t * 0.8 + 0.1), data.length)
      );

    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    const labelArc = d3
      .arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    const arcs = chart
      .selectAll(".arc")
      .data(pie(data))
      .join("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", (d) => arc(d))
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 0.8);

    arcs
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#000")
      .style("opacity", 0)
      .transition()
      .delay(800)
      .duration(500)
      .style("opacity", 1)
      .text((d) => {
        const percentage = Math.round((d.data / total) * 100);
        return percentage > 5 ? `${percentage}%` : "";
      });

    chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".25rem")
      .style("font-size", "24px")
      .style("fill", "#333")
      .style("opacity", 0)
      .transition()
      .delay(1200)
      .duration(500)
      .style("opacity", 1)
      .text(`${total}`);

    chart
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .style("font-size", "14px")
      .style("fill", "#666")
      .style("opacity", 0)
      .transition()
      .delay(1400)
      .duration(500)
      .style("opacity", 1)
      .text("Total");
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
    <div ref={containerRef} class={styles.chart}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
