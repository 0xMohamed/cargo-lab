import Hero from "../components/Hero";
import InsightsPanel from "../components/InsightsPanel";
import Stats from "../components/Stats";
import "../styles/Home.css";

export default function Home() {
  return (
    <>
      <main class="mainContent">
        <Hero />
        <Stats />
      </main>
      <InsightsPanel />
    </>
  );
}
