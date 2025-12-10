import styles from "../styles/Hero.module.css";

export default function Hero() {
  return (
    <section class={styles.hero}>
      <h1>The Ocean Thinks</h1>
      <hr class="separator" />
      <div>
        <p>
          Billions of cargo signals interpreted instantly. Routes re-calculated.
          Risks predicted. Your fleet continuously optimized by a neural network
          built for maritime cognition.
        </p>
        <button class={styles.arrowButton}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 12L31 24L19 36"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>
      </div>
    </section>
  );
}
