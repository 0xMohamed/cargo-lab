import { createSignal, onCleanup, onMount } from "solid-js";
import styles from "../styles/AIBrain.module.css";
import AIBrainStats from "../components/AIBrainStats";

export default function CargoAIBrain() {
  let canvasEl;
  let containerEl;
  const [reasonTitle, setReasonTitle] = createSignal("Cargo AI Brain");
  const [reasonText, setReasonText] = createSignal(
    "Optimizing vessel equilibrium to reduce the risk of container displacement"
  );

  onMount(() => {
    const ctx = canvasEl.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = Math.max(1, window.devicePixelRatio || 1);

    // Config
    const NODE_COUNT = 90; // number of nodes
    const HIGHLIGHT_COUNT = 8; // bigger nodes
    const RADIUS = 300; // base sphere radius in CSS pixels (will scale)
    const ROTATION_SPEED = 0.00009; // radians per ms
    const EDGE_ALPHA = 0.07;

    // State
    let nodes = [];
    let edges = [];
    let lastTime = performance.now();
    let rotY = 0;
    let animationId;
    let mouse = { x: 0, y: 0, isOver: false };

    function randRange(a, b) {
      return a + Math.random() * (b - a);
    }

    function buildNodes() {
      nodes = [];
      // generate points on unit sphere via spherical coordinates
      for (let i = 0; i < NODE_COUNT; i++) {
        // using Golden Section Spiral for even distribution
        const iFrac = i / NODE_COUNT;
        const theta = Math.acos(1 - 2 * iFrac); // polar
        const phi = Math.PI * (1 + Math.sqrt(5)) * i; // azimuthal
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);

        nodes.push({
          id: i,
          x,
          y,
          z,
          size: 2 + Math.random() * 4,
          highlight: i < HIGHLIGHT_COUNT, // first ones bigger
          meta: {
            label: `Node #${i}`,
            importance: `${Math.floor(randRange(10, 95))}%`,
            note:
              i % 7 === 0
                ? "Potential imbalance detected in aft stack"
                : "Stable reading",
          },
        });
      }

      // make some bigger ones distributed randomly
      for (let i = 0; i < HIGHLIGHT_COUNT; i++) {
        const idx = Math.floor(Math.random() * nodes.length);
        nodes[idx].size = randRange(6, 10);
        nodes[idx].highlight = true;
      }

      // build edges by connecting nearest neighbors (k-nn style)
      edges = [];
      const K = 3; // neighbors per node
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        // compute distances
        const dists = nodes
          .map((b, j) => ({
            j,
            d: Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z),
          }))
          .sort((p, q) => p.d - q.d)
          .slice(1, 1 + K);
        dists.forEach((p) => {
          const j = p.j;
          // avoid duplicate edges - only create if i < j
          if (i < j) edges.push([i, j]);
        });
      }
    }

    function resize() {
      width = containerEl.clientWidth;
      height = containerEl.clientHeight;
      canvasEl.width = Math.floor(width * dpr);
      canvasEl.height = Math.floor(height * dpr);
      canvasEl.style.width = width + "px";
      canvasEl.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function project(p) {
      // rotate around Y by rotY
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x = p.x * cosY + p.z * sinY;
      const z = -p.x * sinY + p.z * cosY;
      const y = p.y;

      // perspective projection
      const fov = 600; // focal length
      const scale = fov / (fov + z * RADIUS);
      const px = x * RADIUS * scale + width / 2;
      const py = y * RADIUS * scale + height / 2;
      const pz = z; // keep z for depth sorting
      return { px, py, pz, scale };
    }

    function draw(now) {
      const dt = now - lastTime;
      lastTime = now;
      rotY += ROTATION_SPEED * dt;

      // clear
      ctx.clearRect(0, 0, width, height);

      // subtle background vignette
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "rgba(0,0,0,0.02)");
      grad.addColorStop(1, "rgba(0,0,0,0.03)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // compute projected positions
      const projected = nodes.map((n) => ({
        ...n,
        p: project(n),
      }));

      // sort by depth
      projected.sort((a, b) => a.p.pz - b.p.pz);

      // draw edges first
      ctx.lineWidth = 0.8;
      ctx.globalCompositeOperation = "lighter";
      edges.forEach(([i, j]) => {
        const A = projected.find((p) => p.id === i).p;
        const B = projected.find((p) => p.id === j).p;
        // fade by depth
        const depth = (A.pz + B.pz) / 2;
        const alpha = Math.max(0.02, EDGE_ALPHA * (1 - depth * 0.5));
        ctx.strokeStyle = `rgba(64,255,240,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(A.px, A.py);
        ctx.lineTo(B.px, B.py);
        ctx.stroke();
      });

      // find nearest node to mouse (if over)
      let nearest = null;
      if (mouse.isOver) {
        let best = Infinity;
        for (const p of projected) {
          const dx = p.p.px - mouse.x;
          const dy = p.p.py - mouse.y;
          const dd = dx * dx + dy * dy;
          if (dd < best) {
            best = dd;
            nearest = p;
          }
        }
        if (nearest && best < 2500) {
          // show metadata
          setReasonTitle(nearest.meta.label);
          setReasonText(
            `${nearest.meta.note} • Importance ${nearest.meta.importance}`
          );
        } else {
          setReasonTitle("Cargo AI Brain");
          setReasonText(
            "Optimizing vessel equilibrium to reduce the risk of container displacement"
          );
        }
      }

      // draw nodes
      for (const p of projected) {
        const s = p.size * p.p.scale * (p.highlight ? 1.6 : 1);
        const glow = s * 3;
        // glow
        ctx.beginPath();
        ctx.fillStyle = `rgba(64,255,240,${0.06})`;
        ctx.arc(p.p.px, p.p.py, glow, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.beginPath();
        const pulse = 0.6 + 0.4 * Math.sin(now / 350 + p.id);
        const baseAlpha = p.highlight ? 0.98 : 0.6;
        ctx.fillStyle = p.highlight
          ? `rgba(255,195,90,${baseAlpha * pulse})`
          : `rgba(64,255,240,${baseAlpha * pulse})`;
        ctx.arc(p.p.px, p.p.py, s, 0, Math.PI * 2);
        ctx.fill();

        // outline for hovered node
        if (nearest && nearest.id === p.id) {
          ctx.beginPath();
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = "rgba(255,255,255,0.8)";
          ctx.arc(p.p.px, p.p.py, s + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";

      animationId = requestAnimationFrame(draw);
    }

    function handlePointerMove(e) {
      const rect = canvasEl.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.isOver = true;
    }
    function handlePointerLeave() {
      mouse.isOver = false;
      setReasonTitle("Cargo AI Brain");
      setReasonText(
        "Optimizing vessel equilibrium to reduce the risk of container displacement"
      );
    }

    function handleClick(e) {
      // on click, if nearest exists, open a deeper reasoning (simulated)
      if (!mouse.isOver) return;
      const rect = canvasEl.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      // find nearest
      let best = Infinity;
      let nearest = null;
      for (const n of nodes) {
        const p = project(n);
        const dx = p.px - mx;
        const dy = p.py - my;
        const d = dx * dx + dy * dy;
        if (d < best) {
          best = d;
          nearest = n;
        }
      }
      if (nearest && best < 2500) {
        setReasonTitle(`Deep Reasoning — ${nearest.meta.label}`);
        setReasonText(
          `Simulated chain-of-thought:\n• Rebalancing suggestion: move 2 containers from port aft to starboard mid.\n• Confidence: ${Math.floor(
            randRange(60, 96)
          )}%`
        );
      }
    }

    // init
    buildNodes();
    resize();
    lastTime = performance.now();
    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", () => {
      resize();
    });
    canvasEl.addEventListener("pointermove", handlePointerMove);
    canvasEl.addEventListener("pointerleave", handlePointerLeave);
    canvasEl.addEventListener("click", handleClick);

    onCleanup(() => {
      cancelAnimationFrame(animationId);
      canvasEl.removeEventListener("pointermove", handlePointerMove);
      canvasEl.removeEventListener("pointerleave", handlePointerLeave);
      canvasEl.removeEventListener("click", handleClick);
    });
  });

  return (
    <>
      <AIBrainStats />

      <div class={styles.conatiner}>
        <div class={styles.left}>
          <h1 class={styles.title}>
            Cargo AI
            <br />
            Brain
          </h1>
          <p class={styles.subtitle}>
            Optimizing vessel equilibrium to reduce the risk of container
            displacement
          </p>

          <div class={styles.reason}>
            <h4>{reasonTitle()}</h4>
            <p>{reasonText()}</p>
          </div>
        </div>

        <div ref={containerEl} class={styles.right}>
          <canvas ref={canvasEl} class={styles["brain-canvas"]}></canvas>
        </div>
      </div>
    </>
  );
}
