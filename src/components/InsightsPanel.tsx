import { createSignal, createEffect, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import styles from "../styles/InsightsPanel.module.css";
import GlobalMap from "./charts/GlobalMap";
import { subscribeToCargoMovements } from "../services/cargoService";
import {
  getAverageTransitTime,
  getOnTimePercentage,
} from "../utils/cargoStats";
import { generateInsightMessage } from "../utils/generateInsightMessage";

export default function InsightsPanel() {
  const [cargoItems, setCargoItems] = createStore([]);
  const [avgTime, setAvgTime] = createSignal("0d");
  const [percentOnTime, setPercentOnTime] = createSignal(0);
  const [message, setMessage] = createSignal("");
  const [animate, setAnimate] = createSignal(false);

  createEffect(() => {
    const subscription = subscribeToCargoMovements((data) => {
      setAnimate(true);
      setCargoItems(data);

      setAvgTime(getAverageTransitTime(data));
      setPercentOnTime(getOnTimePercentage(data));
      console.log(generateInsightMessage(data));

      setMessage(generateInsightMessage(data));

      setTimeout(() => setAnimate(false), 1500);
    });

    onCleanup(() => subscription.unsubscribe());
  });

  return (
    <div class={styles.insightsPanel}>
      <h2>Global Cargo Tracker</h2>
      <hr />
      <GlobalMap cargoItems={cargoItems} />
      <div class={styles.shipmentInsights}>
        <h4>Shipment Insights</h4>
        <p class={animate() ? styles.fadeUpdate : ""}>
          <span class={styles.onTimePercent}>{percentOnTime()}%</span> of{" "}
          <strong>{cargoItems.length}</strong> active shipments are{" "}
          <span class={styles.onTime}>on time</span> or{" "}
          <span class={styles.delivered}>delivered</span>.
        </p>
        <p class={animate() ? styles.fadeUpdate : ""}>
          Current average transit time:{" "}
          <span class={styles.avgTime}>{avgTime()}</span>
        </p>
        <p
          class={`${styles.insightMessage} ${
            animate() ? styles.fadeUpdate : ""
          }`}
        >
          {message()}
        </p>
      </div>
    </div>
  );
}
