import { Card } from "./Card";
import styles from "../styles/Stats.module.css";

export default function Stats() {
  return (
    <section class={styles.stats}>
      <Card
        label="Maritime Predictions"
        color="yellow"
        data={[31, 54, 12, 68, 19, 63, 97, 85]}
        chartType="donut"
        percentage="+18.65%"
      >
        <p>
          The system forecasts route delays, weather shifts, and risk zones
          using its evolving neural model.
        </p>
      </Card>
      <Card
        label="Cargo State Pulse"
        color="cyan"
        data={[31, 54, 12, 21, 76, 63, 42, 52]}
        chartType="bar"
        percentage="+27.42%"
      >
        <p>
          Continuous monitoring of temperature, weight variance, and movement
          vibration trends.
        </p>
      </Card>
    </section>
  );
}
