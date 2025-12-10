import { createSignal, createMemo, For, Show } from "solid-js";
import styles from "../styles/Cargo.module.css";

export default function Cargo() {
  const IMO = 9876543;

  // Define the grid layout (4 rows x 20 columns)
  const rows = 2;
  const cols = 20;

  // Create an array to store all slots data
  const [slots, setSlots] = createSignal(
    Array(rows * cols)
      .fill()
      .map((_, index) => ({
        id: index,
        row: Math.floor(index / cols),
        col: index % cols,
        // Real slots start at index 3 and skip every gap (3 slots per section)
        isRealSlot:
          (index % cols) % 5 !== 4 && index % cols !== 0 && index % cols !== 1,
        containers: [], // Will store container objects
        maxTiers: 3,
      }))
  );

  // Track the selected slot for the control panel
  const [selectedSlot, setSelectedSlot] = createSignal(null);

  // New container form state
  const [newContainer, setNewContainer] = createSignal({
    id: "",
    weight: "",
    content: "",
    destination: "",
  });

  // Create a filtered list of real slots (remove gaps)
  const realSlots = createMemo(() => {
    return slots().filter((slot) => slot.isRealSlot);
  });

  // Handle slot hover to show tooltip
  const handleSlotHover = (event, slot) => {
    if (!slot.isRealSlot) return;

    const tooltip = document.getElementById("slotTooltip");
    if (!tooltip) return;

    // Update tooltip content
    const tierInfo = `${slot.containers.length}/${slot.maxTiers} containers`;
    const containerInfo =
      slot.containers.length > 0
        ? `\n${slot.containers
            .map((c, i) => `Tier ${i + 1}: ${c.id} - ${c.content}`)
            .join("\n")}`
        : "\nEmpty slot - Click to add containers";

    tooltip.innerHTML = `
      <strong>Slot #${slot.id}</strong><br>
      Row ${slot.row + 1}, Column ${slot.col + 1}<br>
      <span class="${styles.tierInfo}">${tierInfo}</span>
      <div class="${styles.tooltipDetails}">
        ${containerInfo}
      </div>
    `;

    // Position the tooltip near the cursor
    tooltip.style.display = "block";
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY - 10}px`;
  };

  // Handle slot click to select it
  const handleSlotClick = (slot) => {
    if (!slot.isRealSlot) return;

    if (selectedSlot()?.id === slot.id) {
      setSelectedSlot(null); // Deselect if already selected
    } else {
      setSelectedSlot(slot); // Select the new slot
    }
  };

  // Add a new container to the selected slot
  const addContainer = (e) => {
    e.preventDefault();

    const slot = selectedSlot();
    if (!slot || slot.containers.length >= slot.maxTiers) return;

    const container = {
      id: newContainer().id,
      weight: newContainer().weight,
      content: newContainer().content,
      destination: newContainer().destination,
      addedAt: new Date(),
    };

    // Update the slots with the new container
    setSlots((prev) => {
      const newSlots = [...prev];
      const slotIndex = newSlots.findIndex((s) => s.id === slot.id);

      if (slotIndex !== -1) {
        newSlots[slotIndex] = {
          ...newSlots[slotIndex],
          containers: [...newSlots[slotIndex].containers, container],
        };
      }

      return newSlots;
    });

    // Reset the form
    setNewContainer({
      id: "",
      weight: "",
      content: "",
      destination: "",
    });
    setSelectedSlot(null);
  };

  // Calculate slot fill color based on container count
  const getSlotStyle = (slot) => {
    if (!slot.isRealSlot) return { display: "none" };

    const containerCount = slot.containers.length;

    if (containerCount === 0) {
      return { fill: "url(#diagonal-stripes)" };
    } else {
      // Colors get darker as more containers are added
      const fillColors = [
        "#4A7DFF", // Light blue for 1 container
        "#2B5EE8", // Medium blue for 2 containers
        "#0A3DD1", // Dark blue for 3 containers
      ];

      return {
        fill: fillColors[containerCount - 1],
        stroke: containerCount === slot.maxTiers ? "#FF5C5C" : "#D9D9D9", // Red border for full slots
      };
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewContainer((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate container stack visualization
  const filledContainers = () => selectedSlot()?.containers.length || 0;
  const maxContainers = () => selectedSlot()?.maxTiers || 0;
  const emptySlots = () => maxContainers() - filledContainers();

  return (
    <>
      <div class={styles.shipContainer}>
        <h2>Ship #{IMO}</h2>
        <hr />

        <div class={styles.ship}>
          <svg
            width="755"
            height="154"
            viewBox="0 0 755 154"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="diagonal-stripes"
                patternUnits="userSpaceOnUse"
                width="10"
                height="10"
                patternTransform="rotate(45)"
              >
                <rect width="5" height="10" fill="rgba(255,255,255,0.2)" />
              </pattern>
            </defs>

            <g class={styles.slots} id="slots">
              <For each={realSlots()}>
                {(slot) => {
                  const y = slot.row === 0 ? 8.5 : 79.5;
                  // Calculate x position based on column index
                  // Add gaps after every 3 slots
                  let colIndex = slot.col;
                  let xPos = 181.5 + colIndex * 25;
                  if (colIndex > 5) xPos += 10;
                  if (colIndex > 10) xPos += 10;
                  if (colIndex > 15) xPos += 10;

                  return (
                    <path
                      d={`M${xPos} ${y}H${xPos + 24}V${y + 66}H${xPos}V${y}Z`}
                      stroke="#D9D9D9"
                      style={getSlotStyle(slots()[slot.id])}
                      onClick={[handleSlotClick, slots()[slot.id]]}
                      onMouseEnter={(e) => handleSlotHover(e, slots()[slot.id])}
                      onMouseMove={(e) => {
                        const tooltip = document.getElementById("slotTooltip");
                        if (tooltip) {
                          tooltip.style.left = `${e.clientX + 10}px`;
                          tooltip.style.top = `${e.clientY - 10}px`;
                        }
                      }}
                      onMouseLeave={() => {
                        const tooltip = document.getElementById("slotTooltip");
                        if (tooltip) tooltip.style.display = "none";
                      }}
                      class={styles.slot}
                      data-slot-id={slot.id}
                      data-containers={slots()[slot.id].containers.length}
                    />
                  );
                }}
              </For>
            </g>

            <g>
              <path d="M148 93V61H162V93H148Z" stroke="#D9D9D9" />
              <path d="M109 53H117V61H109V53Z" stroke="#D9D9D9" />
              <path d="M95 53H103V61H95V53Z" stroke="#D9D9D9" />
              <path d="M95 93H103V101H95V93Z" stroke="#D9D9D9" />
              <path d="M109 93H117V101H109V93Z" stroke="#D9D9D9" />
              <path
                d="M45.5135 50.1304C93.5519 28.7177 172.325 8.97383 172.325 8.97383V145.026C172.325 145.026 93.5519 126.005 45.5135 105.032M45.5135 50.1304C24.4403 59.5236 9.28158 69.2379 9.28158 77.7476C9.28158 86.2572 24.4403 95.8325 45.5135 105.032M45.5135 50.1304V105.032M172.325 1.00006L754 1V153L172.325 153C172.325 153 0.999878 113.63 1 77.7476C1.00012 41.8656 172.325 1.00006 172.325 1.00006Z"
                stroke="#D9D9D9"
              />
              <rect x="748" y="0.5" width="6" height="153" fill="#D9D9D9" />
            </g>
          </svg>
        </div>

        {/* Tooltip that follows the mouse when hovering over slots */}
        <div class={styles.tooltip} id="slotTooltip"></div>

        {/* Control panel for adding containers */}
      </div>
      <Show when={selectedSlot() !== null}>
        <div class={styles.controlPanel}>
          {/* Header with close button */}
          <div class={styles.controlHeader}>
            <h3 class={styles.slotTitle}>
              <span class="text-blue-400">#</span>
              {selectedSlot().id}
              <span class={styles.locationBadge}>
                Row {selectedSlot().row + 1}, Col {selectedSlot().col + 1}
              </span>
            </h3>

            <button
              class={styles.closeButton}
              onClick={() => {
                setNewContainer({
                  id: "",
                  weight: "",
                  content: "",
                  destination: "",
                });
                setSelectedSlot(null);
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {/* Visual Container Stack Status */}
          <div class={styles.containerStatusWrapper}>
            <div class={styles.containerStatusTitle}>
              <div class={styles.containerStatusLabel}>Container Stack</div>
              <div class={styles.containerCount}>
                {filledContainers}/{maxContainers}
              </div>
            </div>

            <div class={styles.containerVisualizer}>
              {/* Tier lines */}
              {/* <div class={styles.containerTierMarker}>
                <span class="text-xs text-slate-500">1</span>
                <span class="text-xs text-slate-500">{maxContainers}</span>
              </div> */}

              {/* Show existing containers */}
              {selectedSlot().containers.map((container, index) => (
                <div key={container.id} class={styles.containerUnit}>
                  <div class={styles.containerBox}>
                    {container.id.slice(-4)}
                  </div>
                </div>
              ))}

              {/* Show empty container spaces */}
              {[...Array(emptySlots())].map((_, index) => (
                <div key={`empty-${index}`} class={styles.containerUnit}>
                  <div
                    class={styles.emptyContainer}
                    style={{
                      opacity: 0.5 - index * 0.1,
                    }}
                  >
                    +
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Container Details List */}
          <Show when={selectedSlot().containers.length > 0}>
            <div class={styles.containerInfo}>
              {selectedSlot().containers.map((container, index) => (
                <div key={container.id} class={styles.containerListItem}>
                  <div class={styles.containerIcon}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="2"
                        y="4"
                        width="20"
                        height="16"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line
                        x1="2"
                        y1="10"
                        x2="22"
                        y2="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div class={styles.containerData}>
                    <div>
                      Container <strong>{container.id}</strong>
                    </div>
                    <div class={styles.containerMeta}>
                      {container.content}
                      <span class={styles.containerDestination}>
                        {container.destination}
                      </span>
                      <span class={styles.containerWeight}>
                        {container.weight} tons
                      </span>
                    </div>
                  </div>
                  <div class="text-white font-bold bg-slate-600 h-8 w-8 flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </Show>

          {/* Add Container Form */}
          <Show
            when={selectedSlot().containers.length < selectedSlot().maxTiers}
          >
            <form onSubmit={addContainer} class={styles.containerForm}>
              <h4 class={styles.formTitle}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6V18M18 12H6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Add New Container
              </h4>

              <div class={styles.formGrid}>
                <div class={styles.formGroup}>
                  <label htmlFor="containerId" class={styles.formLabel}>
                    Container ID:
                  </label>
                  <input
                    id="containerId"
                    type="text"
                    value={newContainer().id}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                    required
                    placeholder="CONT0000"
                    class={styles.formInput}
                  />
                </div>

                <div class={styles.formGroup}>
                  <label htmlFor="containerWeight" class={styles.formLabel}>
                    Weight (tons):
                  </label>
                  <input
                    id="containerWeight"
                    type="number"
                    min="1"
                    max="30"
                    value={newContainer().weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    required
                    placeholder="1-30"
                    class={styles.formInput}
                  />
                </div>
              </div>

              <div class={styles.formGroup}>
                <label htmlFor="containerContent" class={styles.formLabel}>
                  Content:
                </label>
                <input
                  id="containerContent"
                  type="text"
                  value={newContainer().content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  required
                  placeholder="Cargo description"
                  class={styles.formInput}
                />
              </div>

              <div class={styles.formGroup}>
                <label htmlFor="containerDestination" class={styles.formLabel}>
                  Destination:
                </label>
                <input
                  id="containerDestination"
                  type="text"
                  value={newContainer().destination}
                  onChange={(e) =>
                    handleInputChange("destination", e.target.value)
                  }
                  required
                  placeholder="Port city"
                  class={styles.formInput}
                />
              </div>

              <button type="submit" class={styles.addButton}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M12 5V19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add Container
              </button>
            </form>
          </Show>
        </div>
      </Show>
      <Show when={selectedSlot() === null}>
        <div class={styles.unselected}>{"<-"} Select Your Slot</div>
      </Show>
    </>
  );
}
