import { createSignal, onMount, onCleanup } from "solid-js";
import styles from "../styles/AIBrainMiniStats.module.css";

export default function AIBrainMiniStats() {
  const [stability, setStability] = createSignal(92);
  const [risk, setRisk] = createSignal(11);
  const [balance, setBalance] = createSignal(87);
  const [efficiency, setEfficiency] = createSignal(21);

  onMount(() => {
    const interval = setInterval(() => {
      setStability((s) => clamp(s + rand(-1.2, 1.2), 88, 97));
      setRisk((s) => clamp(s + rand(-1, 1), 8, 15));
      setBalance((s) => clamp(s + rand(-1, 1), 80, 93));
      setEfficiency((s) => clamp(s + rand(-1, 1), 15, 28));
    }, 1300);

    onCleanup(() => clearInterval(interval));
  });

  return (
    <div class={styles.panel}>
      {/* Title */}
      <div class={styles.title}>AI Metrics</div>

      {/* Divider after title */}
      <div class={styles.mainDivider} />

      {/* KPIs */}
      <div class={styles.kpiRow}>
        <KPI
          label="Stability"
          value={stability()}
          color="#4dd4ac"
          icon={ShieldIcon}
        />

        <div class={styles.kpiDivider} />

        <KPI
          label="Shift Risk"
          value={risk()}
          color="#e8c35d"
          icon={WarningIcon}
        />

        <div class={styles.kpiDivider} />

        <KPI
          label="Load Balance"
          value={balance()}
          color="#53b6ff"
          icon={BalanceIcon}
        />

        <div class={styles.kpiDivider} />

        <KPI
          label="Fuel Efficiency"
          value={efficiency()}
          color="#b46cff"
          icon={LeafIcon}
        />
      </div>
    </div>
  );
}

function KPI(props) {
  const Icon = props.icon;

  return (
    <div class={styles.kpi}>
      <div class={styles.kpiTop}>
        <Icon color={props.color} />
        <span style="opacity:0.6; font-size:13px;">{props.label}</span>
      </div>

      <span class={styles.kpiValue} style={{ color: props.color }}>
        {props.value.toFixed(1)}%
      </span>
    </div>
  );
}

/* Icons */
function ShieldIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3L4 6V11C4 16.52 7.84 21.74 12 23C16.16 21.74 20 16.52 20 11V6L12 3Z"
        stroke={props.color}
        stroke-width="2"
      />
    </svg>
  );
}

function WarningIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 22H22L12 2Z" stroke={props.color} stroke-width="2" />
    </svg>
  );
}

function BalanceIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3V21M6 7L3 12H9L6 7ZM18 7L15 12H21L18 7Z"
        stroke={props.color}
        stroke-width="2"
      />
    </svg>
  );
}

function LeafIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 21C5 14 10 5 21 5C21 16 12 21 5 21Z"
        stroke={props.color}
        stroke-width="2"
      />
    </svg>
  );
}

/* Helpers */
function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}
