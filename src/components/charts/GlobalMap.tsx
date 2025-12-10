import { createSignal, createEffect, onCleanup, onMount } from "solid-js";
import * as d3 from "d3";
import { geoOrthographic, geoPath, geoDistance } from "d3-geo";
import { feature as topojsonFeature } from "topojson-client";
import worldData from "../../assets/world-110m.json";
import { formatDateTime, getCargoStatusColor } from "../../utils/cargoStats";
import styles from "../../styles/InsightsPanel.module.css";

const GlobalMap = (props) => {
  let svgRef;
  let canvasRef;
  let containerRef;

  const [rotation, setRotation] = createSignal([0, 0, 0]);
  const [scale, setScale] = createSignal(220);
  const [selectedCargo, setSelectedCargo] = createSignal(null);
  const [tooltipPos, setTooltipPos] = createSignal({ x: 0, y: 0 });
  const [dimensions, setDimensions] = createSignal({ width: 0, height: 0 });
  const [isAutoRotate, setIsAutoRotate] = createSignal(true);

  const minScale = 150;
  const maxScale = 400;

  let isDragging = false;
  let lastPos;
  let lastTouch = null;
  let lastDistance = null;
  let animationFrameId = null;

  // تحسين كفاءة استخدام الذاكرة عن طريق تخزين المرجع
  let projection = null;
  let path = null;

  // دالة مخصصة للدوران التلقائي
  const handleAutoRotation = () => {
    if (!isAutoRotate()) return;

    setRotation((prev) => {
      const [x, y, z] = prev;
      return [x + 0.05, y, z];
    });

    animationFrameId = requestAnimationFrame(handleAutoRotation);
  };

  // دالة مخصصة للتعامل مع أحداث عجلة الماوس
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY;
    setScale((s) => {
      const newScale = s - delta * 0.1;
      return Math.max(minScale, Math.min(maxScale, newScale));
    });
  };

  // دالة لعمل الإسقاط الجغرافي والمسار
  const setupProjection = () => {
    const { width, height } = dimensions();

    projection = geoOrthographic()
      .scale(scale())
      .translate([width / 2, height / 2])
      .rotate(rotation());

    path = geoPath().projection(projection);

    return { projection, path };
  };

  // رسم النقاط (الشحنات) على Canvas
  const drawMarkers = () => {
    if (!canvasRef || !projection || !props.cargoItems) return;

    const ctx = canvasRef.getContext("2d");
    const { width, height } = dimensions();
    const center = [width / 2, height / 2];

    // مسح Canvas
    ctx.clearRect(0, 0, width, height);

    // رسم نقاط البضائع
    props.cargoItems.forEach((cargo) => {
      const coordinate = [cargo.longitude, cargo.latitude];

      // حساب المسافة الجيوديسية للتحقق مما إذا كانت النقطة مرئية
      // geoDistance يقيس المسافة على سطح الكرة، إذا كانت > 1.57 (حوالي 90 درجة)، فهي على الجانب غير المرئي
      const gdistance = geoDistance(coordinate, projection.invert(center));

      // تخطي النقاط التي لا ينبغي أن تكون مرئية (على الجانب الآخر من الكرة)
      if (gdistance > 1.57) {
        return;
      }

      const pos = projection(coordinate);
      if (!pos) return;

      const [x, y] = pos;
      const radius = cargo.size || 3;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = getCargoStatusColor(cargo.status);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.3;
      ctx.fill();
      ctx.stroke();
    });
  };

  // معالج لأحداث الفأرة لتحديد الشحنة المختارة
  const handleMouseMove = (e) => {
    if (!canvasRef || !projection || !props.cargoItems) return;

    const rect = canvasRef.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const center = [dimensions().width / 2, dimensions().height / 2];

    // البحث عن أقرب شحنة للموقع الحالي للمؤشر
    let closestCargo = null;
    let minDistance = 10; // حد أدنى للمسافة (للتعرف على الضغطة)

    props.cargoItems.forEach((cargo) => {
      const coordinate = [cargo.longitude, cargo.latitude];

      // التحقق مما إذا كانت النقطة على الجانب المرئي
      const gdistance = geoDistance(coordinate, projection.invert(center));
      if (gdistance > 1.57) return;

      const pos = projection(coordinate);
      if (!pos) return;

      const [x, y] = pos;
      const distance = Math.sqrt(
        Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2)
      );
      const radius = cargo.size || 3;

      if (distance < radius + 2 && distance < minDistance) {
        minDistance = distance;
        closestCargo = cargo;
      }
    });

    if (closestCargo) {
      setSelectedCargo(closestCargo);
      setTooltipPos({ x: mouseX, y: mouseY });
    } else {
      setSelectedCargo(null);
    }
  };

  // تعيين قياسات الحاوية (الاستدعاء مرة واحدة عند التثبيت)
  onMount(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef);

    // إضافة معالجات الأحداث للكشف عن الشحنات
    if (canvasRef) {
      canvasRef.addEventListener("mousemove", handleMouseMove);
      canvasRef.addEventListener("mouseout", () => setSelectedCargo(null));

      // إضافة مستمع لحدث عجلة الماوس على Canvas
      canvasRef.addEventListener("wheel", handleWheel, { passive: false });
    }

    // ابدأ الدوران التلقائي
    if (isAutoRotate()) {
      animationFrameId = requestAnimationFrame(handleAutoRotation);
    }

    // تنظيف عند إزالة المكون
    onCleanup(() => {
      resizeObserver.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (canvasRef) {
        canvasRef.removeEventListener("wheel", handleWheel);
        canvasRef.removeEventListener("mousemove", handleMouseMove);
        canvasRef.removeEventListener("mouseout", () => setSelectedCargo(null));
      }
    });
  });

  // إعادة رسم الخريطة عند تغيير أي من العوامل المهمة
  createEffect(() => {
    // متابعة التغييرات في القياسات والدوران والمقياس
    const { width, height } = dimensions();
    const currentRotation = rotation();
    const currentScale = scale();

    if (!width || !height || !svgRef || !canvasRef) return;

    // تعيين أبعاد SVG و Canvas
    const svg = d3.select(svgRef);
    svg.attr("width", width);
    svg.attr("height", height);

    canvasRef.width = width;
    canvasRef.height = height;

    const { projection, path } = setupProjection();

    // تنظيف svg قبل إعادة الرسم
    svg.selectAll("*").remove();

    // رسم اليابسة
    svg
      .selectAll("path.land")
      .data([topojsonFeature(worldData, worldData.objects.land)])
      .join("path")
      .attr("class", "land")
      .attr("d", path)
      .attr("fill", "var(--color-surface)")
      .attr("stroke", "var(--color-border)")
      .attr("stroke-width", 0.5);

    // رسم خطوط الشبكة
    svg
      .selectAll("path.graticule")
      .data([d3.geoGraticule10()])
      .join("path")
      .attr("class", "graticule")
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#1f4b6d")
      .attr("stroke-width", 0.2)
      .attr("opacity", 0.3);

    // رسم نقاط البضائع في Canvas
    drawMarkers();

    // أضف أحداث السحب إلى Canvas بدلاً من SVG
    const canvasElement = d3.select(canvasRef);

    canvasElement
      .on("pointerdown", (e) => {
        isDragging = true;
        lastPos = [e.clientX, e.clientY];
        setIsAutoRotate(false);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      })
      .on("pointermove", (e) => {
        if (isDragging) {
          const dx = e.clientX - lastPos[0];
          const dy = e.clientY - lastPos[1];
          lastPos = [e.clientX, e.clientY];
          const [lambda, phi, gamma] = rotation();
          setRotation([lambda + dx * 0.5, phi - dy * 0.5, gamma]);
        }
      })
      .on("pointerup", () => {
        isDragging = false;
        setIsAutoRotate(true);
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(handleAutoRotation);
        }
      })
      .on("pointerleave", () => {
        isDragging = false;
        setIsAutoRotate(true);
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(handleAutoRotation);
        }
      });
    // نقل أحداث اللمس إلى Canvas أيضًا

    canvasElement
      .on("touchstart", (e) => {
        if (e.touches.length === 1) {
          lastTouch = [e.touches[0].clientX, e.touches[0].clientY];
        } else if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          lastDistance = Math.sqrt(dx * dx + dy * dy);
        }
        setIsAutoRotate(false);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      })
      .on("touchmove", (e) => {
        if (e.touches.length === 1 && lastTouch) {
          const dx = e.touches[0].clientX - lastTouch[0];
          const dy = e.touches[0].clientY - lastTouch[1];
          lastTouch = [e.touches[0].clientX, e.touches[0].clientY];
          const [lambda, phi, gamma] = rotation();
          setRotation([lambda + dx * 0.5, phi - dy * 0.5, gamma]);
        } else if (e.touches.length === 2 && lastDistance !== null) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const scaleDiff = distance - lastDistance;
          lastDistance = distance;

          setScale((s) => {
            const newScale = s + scaleDiff * 0.5;
            return Math.max(minScale, Math.min(maxScale, newScale));
          });
        }
      })
      .on("touchend", () => {
        lastTouch = null;
        lastDistance = null;
        setIsAutoRotate(true);
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(handleAutoRotation);
        }
      });
  });

  // إعادة رسم النقاط عندما تتغير البيانات أو الإسقاط
  createEffect(() => {
    // شاهد التغييرات في الدوران والمقياس وبيانات الشحن
    const currentRotation = rotation();
    const currentScale = scale();
    const items = props.cargoItems;

    if (projection) {
      drawMarkers();
    }
  });

  return (
    <div
      class={styles.globeContainer}
      style={{ position: "relative" }}
      ref={(el) => (containerRef = el)}
    >
      <svg
        ref={(el) => (svgRef = el)}
        style={{ position: "absolute", top: 0, left: 0 }}
      ></svg>
      <canvas
        ref={(el) => (canvasRef = el)}
        style={{ position: "absolute", top: 0, left: 0 }}
      ></canvas>

      {selectedCargo() && (
        <div
          class="tooltip"
          style={{
            position: "absolute",
            left: `${tooltipPos().x + 10}px`,
            top: `${tooltipPos().y + 10}px`,
            background: "var(--color-background)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-primary)",
            padding: "8px",
            "border-radius": "8px",
            "pointer-events": "none",
            "font-size": "14px",
            "z-index": 10,
          }}
        >
          <strong>Cargo #{selectedCargo().id}</strong>
          <br />
          Type: {selectedCargo().type}
          <br />
          Status: {selectedCargo().status}
          <br />
          ETA: {formatDateTime(selectedCargo().eta)}
        </div>
      )}
    </div>
  );
};

export default GlobalMap;
