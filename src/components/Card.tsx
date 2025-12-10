import { createMemo } from "solid-js";
import styles from "../styles/Stats.module.css";
import BarChart from "./charts/BarChart";
import DonutChart from "./charts/DonutChart";

const ChartTypes = {
  bar: BarChart,
  donut: DonutChart,
};

export function Card(props) {
  const chartData = createMemo(() => props.data || []);
  const ChartComponent =
    props.chartType && ChartTypes[props.chartType]
      ? ChartTypes[props.chartType]
      : DonutChart;

  return (
    <div class={`${styles.card} ${styles[props.color] || styles.yellow}`}>
      <span class={styles.label}>{props.label}</span>
      <ChartComponent data={chartData()} />
      <h2>{props.percentage}</h2>
      {props.children}
    </div>
  );
}
