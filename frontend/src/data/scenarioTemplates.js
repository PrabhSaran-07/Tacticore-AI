// ═══════════════════════════════════════════════════════════════
// Scenario Map Templates — Data-driven SVG scenarios
// Each template defines the visual elements for a GPE map.
// The accessor picks one when creating a session.
// ═══════════════════════════════════════════════════════════════

const SCENARIO_TEMPLATES = {

  // ── 1) Village Fire + Train Emergency ──────────────────────
  village_fire: {
    id: 'village_fire',
    name: 'Village Fire & Train Emergency',
    description: 'A village is on fire with an approaching train heading towards a damaged track section. Cadets must coordinate fire suppression, evacuation, and train diversion.',
    difficulty: 'medium',
    thumbnail: '🔥🚂',
    terrain: '#3d6b47', // green ground
    elements: [
      // Village zone
      { type: 'zone', x: 80, y: 80, w: 320, h: 280, fill: '#7c6a4a', label: '🏘 VILLAGE', labelY: -8 },
      // Roads
      { type: 'road', x1: 0, y1: 195, x2: 800, y2: 195, width: 18 },
      { type: 'road', x1: 240, y1: 0, x2: 240, y2: 550, width: 18 },
      // Houses
      ...[[100,100],[160,100],[220,100],[100,170],[160,170],[220,170],[100,240],[160,240],[220,240]].map(([x,y]) => ({
        type: 'house', x, y
      })),
      // Fires
      ...[[100,100],[160,100],[100,170]].map(([x,y]) => ({ type: 'fire', x: x+20, y: y-5 })),
      // River
      { type: 'river', path: 'M 500 0 Q 520 120 490 200 Q 460 280 510 550', label: '🌊 RIVER', labelX: 510, labelY: 140, labelRotate: 15 },
      // Train track
      { type: 'track', x1: 0, y1: 460, x2: 800, y2: 400 },
      { type: 'danger_zone', cx: 350, cy: 440, rx: 40, ry: 20, label: '⚠ DAMAGED' },
      { type: 'vehicle', icon: '🚂', x: 720, y: 420, sublabel: 'APPROACHING' },
    ],
    legend: [
      { color: '#ef4444', label: '🔥 Fire Zone' },
      { color: '#fbbf24', label: '⚠ Damaged Track' },
      { color: '#1e90ff', label: '🌊 River' },
      { color: '#6b7280', label: '🛤 Road' },
      { color: '#7c6a4a', label: '🏘 Village' },
    ],
    defaultResources: { volunteers: 4, fireTrucks: 1, waterPumps: 1 },
    problems: [
      { description: 'Extinguish the fire in 3 burning houses before it spreads', priority: 'critical', isPrimary: true },
      { description: 'Stop or divert the approaching train before it hits the damaged track', priority: 'critical' },
      { description: 'Evacuate villagers in the fire zone to safety', priority: 'important' },
    ]
  },

  // ── 2) Flood Rescue Operation ──────────────────────────────
  flood_rescue: {
    id: 'flood_rescue',
    name: 'Flood Rescue Operation',
    description: 'A flash flood has submerged a low-lying area. A school with trapped children, a collapsed bridge, and rising water levels require immediate multi-team coordination.',
    difficulty: 'hard',
    thumbnail: '🌊🏫',
    terrain: '#2d5a3d',
    elements: [
      // Flood zone
      { type: 'flood_zone', x: 100, y: 200, w: 600, h: 250, label: '🌊 FLOODED AREA' },
      // High ground (safe zone)
      { type: 'zone', x: 20, y: 20, w: 200, h: 150, fill: '#6b8c4a', label: '⛰ HIGH GROUND (SAFE)', labelY: -8 },
      { type: 'zone', x: 580, y: 20, w: 200, h: 150, fill: '#6b8c4a', label: '⛰ RELIEF CAMP', labelY: -8 },
      // School (trapped children)
      { type: 'building', x: 300, y: 280, w: 80, h: 60, fill: '#8b4513', label: '🏫 SCHOOL', sublabel: '45 CHILDREN TRAPPED' },
      // Collapsed bridge
      { type: 'bridge', x1: 250, y1: 190, x2: 350, y2: 190, label: '🌉 BRIDGE COLLAPSED' },
      // Road to relief camp (partially submerged)
      { type: 'road', x1: 0, y1: 100, x2: 800, y2: 100, width: 14 },
      { type: 'road', x1: 400, y1: 0, x2: 400, y2: 550, width: 14 },
      // River (overflowing)
      { type: 'river', path: 'M 0 350 Q 200 300 400 370 Q 600 440 800 380', label: '🌊 RIVER (OVERFLOWING)', labelX: 400, labelY: 360, labelRotate: 0 },
      // Stranded people
      { type: 'poi', icon: '🧍', x: 200, y: 320, label: 'STRANDED FAMILY' },
      { type: 'poi', icon: '🧍', x: 500, y: 290, label: 'ELDERLY COUPLE' },
      // Medical camp location
      { type: 'poi', icon: '⛺', x: 650, y: 80, label: 'MEDICAL CAMP' },
      // Boats available
      { type: 'vehicle', icon: '🚤', x: 60, y: 130, sublabel: 'RESCUE BOATS' },
      // Helicopter pad
      { type: 'poi', icon: '🚁', x: 680, y: 50, label: 'HELIPAD' },
    ],
    legend: [
      { color: '#1e90ff', label: '🌊 Flooded Zone' },
      { color: '#6b8c4a', label: '⛰ Safe Ground' },
      { color: '#8b4513', label: '🏫 Structure' },
      { color: '#ef4444', label: '⚠ Danger' },
      { color: '#6b7280', label: '🛤 Road' },
    ],
    defaultResources: { volunteers: 8, fireTrucks: 0, waterPumps: 2, customItems: [{ name: 'Rescue Boat', quantity: 3, capability: 'Water transport' }, { name: 'Life Jackets', quantity: 20, capability: 'Flotation' }] },
    problems: [
      { description: 'Rescue 45 children trapped in the flooded school building', priority: 'critical', isPrimary: true },
      { description: 'Evacuate stranded families to the relief camp on high ground', priority: 'critical' },
      { description: 'Set up a temporary crossing to replace the collapsed bridge', priority: 'important' },
      { description: 'Establish a medical triage point for the injured', priority: 'important' },
    ]
  },

  // ── 3) Border Security Incident ────────────────────────────
  border_security: {
    id: 'border_security',
    name: 'Border Area Security Incident',
    description: 'Suspicious movement detected near a border outpost. A civilian convoy is approaching the checkpoint while an unidentified group has been spotted crossing the fence line.',
    difficulty: 'hard',
    thumbnail: '🛡🚧',
    terrain: '#5c5a4e',
    elements: [
      // Border fence line
      { type: 'border_fence', x1: 0, y1: 275, x2: 800, y2: 275 },
      // Our side label
      { type: 'label', x: 400, y: 265, text: '── OUR TERRITORY ──', color: '#22c55e' },
      { type: 'label', x: 400, y: 295, text: '── HOSTILE TERRITORY ──', color: '#ef4444' },
      // Outpost
      { type: 'building', x: 350, y: 150, w: 100, h: 70, fill: '#4a5d3a', label: '🏕 BORDER OUTPOST', sublabel: 'COMMAND POST' },
      // Watchtower
      { type: 'poi', icon: '🗼', x: 200, y: 130, label: 'WATCHTOWER A' },
      { type: 'poi', icon: '🗼', x: 600, y: 130, label: 'WATCHTOWER B' },
      // Checkpoint
      { type: 'checkpoint', x: 395, y: 270, label: '🚧 CHECKPOINT' },
      // Road
      { type: 'road', x1: 400, y1: 0, x2: 400, y2: 550, width: 20 },
      { type: 'road', x1: 0, y1: 150, x2: 800, y2: 150, width: 12 },
      // Suspicious movement
      { type: 'threat', icon: '⚠', x: 150, y: 350, label: 'UNIDENTIFIED GROUP', sublabel: '5-6 PERSONS' },
      { type: 'threat', icon: '⚠', x: 600, y: 380, label: 'SUSPICIOUS VEHICLE', sublabel: 'PARKED' },
      // Civilian convoy approaching
      { type: 'vehicle', icon: '🚛', x: 400, y: 480, sublabel: 'CIVILIAN CONVOY' },
      { type: 'vehicle', icon: '🚛', x: 420, y: 510, sublabel: '' },
      // Patrol routes
      { type: 'zone', x: 50, y: 100, w: 700, h: 170, fill: 'rgba(34,197,94,0.08)', label: '🛡 PATROL ZONE', labelY: -8 },
      // Dense vegetation
      { type: 'vegetation', x: 80, y: 310, w: 120, h: 80, label: '🌿 DENSE BUSH' },
      { type: 'vegetation', x: 500, y: 320, w: 140, h: 60, label: '🌿 TALL GRASS' },
    ],
    legend: [
      { color: '#ef4444', label: '⚠ Threat/Suspicious' },
      { color: '#22c55e', label: '🛡 Our Territory' },
      { color: '#f59e0b', label: '🚧 Checkpoint' },
      { color: '#6b7280', label: '🛤 Road/Path' },
      { color: '#4a5d3a', label: '🏕 Structure' },
    ],
    defaultResources: { volunteers: 12, fireTrucks: 0, waterPumps: 0, customItems: [{ name: 'Patrol Vehicle', quantity: 2, capability: 'Mobility' }, { name: 'Night Vision', quantity: 4, capability: 'Surveillance' }, { name: 'Radio Set', quantity: 6, capability: 'Communication' }] },
    problems: [
      { description: 'Intercept and identify the unidentified group crossing the fence line', priority: 'critical', isPrimary: true },
      { description: 'Process the civilian convoy at the checkpoint without compromising security', priority: 'important' },
      { description: 'Investigate the suspicious parked vehicle', priority: 'critical' },
      { description: 'Maintain patrol coverage while handling the incidents', priority: 'important' },
    ]
  },

  // ── 4) Earthquake Disaster Response ────────────────────────
  earthquake_response: {
    id: 'earthquake_response',
    name: 'Earthquake Disaster Response',
    description: 'A 6.2 magnitude earthquake has struck a small town. Multiple buildings have collapsed, gas leaks reported, and roads are blocked by debris. Coordinate search & rescue.',
    difficulty: 'hard',
    thumbnail: '🏚💥',
    terrain: '#6b6b60',
    elements: [
      // Town blocks
      { type: 'zone', x: 50, y: 50, w: 300, h: 200, fill: '#7c7c6e', label: '🏙 TOWN CENTER', labelY: -8 },
      { type: 'zone', x: 450, y: 50, w: 300, h: 200, fill: '#7c7c6e', label: '🏘 RESIDENTIAL AREA', labelY: -8 },
      { type: 'zone', x: 200, y: 350, w: 350, h: 150, fill: '#8b7355', label: '🏭 INDUSTRIAL ZONE', labelY: -8 },
      // Collapsed buildings
      ...[[100,100],[200,120],[500,80],[550,150]].map(([x,y]) => ({
        type: 'collapsed', x, y, label: '🏚 COLLAPSED'
      })),
      // Gas leak
      { type: 'hazard', icon: '☢', x: 300, y: 400, label: 'GAS LEAK', sublabel: 'EVACUATE 200m' },
      // Blocked roads
      { type: 'road_blocked', x1: 370, y1: 0, x2: 370, y2: 250, label: '🚧 ROAD BLOCKED' },
      { type: 'road', x1: 0, y1: 280, x2: 800, y2: 280, width: 20 },
      { type: 'road', x1: 370, y1: 280, x2: 370, y2: 550, width: 20 },
      // Hospital
      { type: 'building', x: 620, y: 300, w: 100, h: 60, fill: '#dc2626', label: '🏥 HOSPITAL', sublabel: 'OPERATIONAL' },
      // Survivor signals
      { type: 'poi', icon: '🆘', x: 120, y: 110, label: 'SURVIVORS (est. 12)' },
      { type: 'poi', icon: '🆘', x: 520, y: 90, label: 'SURVIVORS (est. 8)' },
      // Fire from gas
      { type: 'fire', x: 310, y: 390 },
      // Staging area
      { type: 'poi', icon: '⛺', x: 100, y: 460, label: 'STAGING AREA' },
    ],
    legend: [
      { color: '#ef4444', label: '🏚 Collapsed' },
      { color: '#f59e0b', label: '☢ Hazard' },
      { color: '#dc2626', label: '🏥 Medical' },
      { color: '#6b7280', label: '🛤 Road' },
      { color: '#22c55e', label: '🆘 Survivors' },
    ],
    defaultResources: { volunteers: 10, fireTrucks: 2, waterPumps: 0, customItems: [{ name: 'Excavator', quantity: 1, capability: 'Debris removal' }, { name: 'Search Dog Team', quantity: 2, capability: 'Survivor detection' }, { name: 'Stretcher', quantity: 8, capability: 'Casualty transport' }] },
    problems: [
      { description: 'Locate and rescue survivors trapped in 2 collapsed buildings', priority: 'critical', isPrimary: true },
      { description: 'Contain the gas leak and prevent explosion', priority: 'critical' },
      { description: 'Clear the blocked road to enable ambulance access to the hospital', priority: 'important' },
      { description: 'Set up a triage station and coordinate medical evacuation', priority: 'important' },
    ]
  },

  // ── 5) Hostage Rescue Operation ──────────────────────────────
  hostage_rescue: {
    id: 'hostage_rescue',
    name: 'Hostage Rescue Operation',
    description: 'An armed group has taken hostages in a remote resort. Cadets must coordinate intelligence gathering, perimeter security, and a tactical rescue operation without alerting the hostiles.',
    difficulty: 'hard',
    thumbnail: '🥷🚁',
    terrain: '#4a5d3a',
    elements: [
      // Background enhancements
      { type: 'zone', x: 600, y: 50, w: 100, h: 80, fill: '#3b82f6', label: '💧 LAKE', labelY: -8 },
      { type: 'vegetation', x: 20, y: 20, w: 80, h: 80, label: '' },
      { type: 'vegetation', x: 700, y: 400, w: 90, h: 100, label: '' },
      { type: 'vegetation', x: 150, y: 350, w: 100, h: 80, label: '' },
      { type: 'road', x1: 250, y1: 400, x2: 400, y2: 400, width: 8 }, // dirt path
      // Main elements
      { type: 'zone', x: 250, y: 150, w: 300, h: 250, fill: '#8b7355', label: '🏕 RESORT COMPOUND', labelY: -8 },
      { type: 'building', x: 300, y: 200, w: 200, h: 100, fill: '#7c7c6e', label: '🏨 MAIN LODGE', sublabel: 'HOSTAGES HELD HERE' },
      { type: 'building', x: 280, y: 320, w: 60, h: 40, fill: '#4a5d3a', label: '🏚 OUTHOUSE' },
      { type: 'road', x1: 400, y1: 400, x2: 400, y2: 550, width: 14 },
      { type: 'road', x1: 0, y1: 100, x2: 800, y2: 100, width: 20 },
      { type: 'threat', icon: '🥷', x: 350, y: 280, label: 'HOSTILES', sublabel: 'PATROLLING' },
      { type: 'poi', icon: '🚁', x: 100, y: 450, label: 'INSERTION POINT' },
      { type: 'vegetation', x: 50, y: 150, w: 150, h: 200, label: '🌲 THICK FOREST' },
      { type: 'vegetation', x: 600, y: 200, w: 150, h: 250, label: '🌲 THICK FOREST' },
      { type: 'checkpoint', x: 400, y: 400, label: '🚧 ROADBLOCK' }
    ],
    legend: [
      { color: '#ef4444', label: '🥷 Hostiles' },
      { color: '#8b7355', label: '🏕 Compound' },
      { color: '#22c55e', label: '🌲 Cover' },
    ],
    defaultResources: { volunteers: 4, fireTrucks: 1, waterPumps: 1, customItems: [{ name: 'Assault Team', quantity: 2, capability: 'Tactical' }, { name: 'Sniper Unit', quantity: 1, capability: 'Overwatch' }] },
    problems: [
      { description: 'Secure the perimeter and prevent hostiles from escaping', priority: 'critical' },
      { description: 'Rescue the hostages from the Main Lodge', priority: 'critical', isPrimary: true },
    ]
  },

  // ── 6) Chemical Plant Accident ──────────────────────────────
  chemical_accident: {
    id: 'chemical_accident',
    name: 'Chemical Plant Leak',
    description: 'A toxic gas leak at an industrial plant threatens a nearby residential colony. Wind is spreading the gas rapidly. Manage evacuation and contain the leak.',
    difficulty: 'hard',
    thumbnail: '🏭☣',
    terrain: '#5c5c5c',
    elements: [
      // Background enhancements
      { type: 'zone', x: 80, y: 40, w: 340, h: 270, fill: '#333333', label: '', labelY: 0 }, // industrial compound base
      { type: 'road', x1: 150, y1: 100, x2: 300, y2: 100, width: 6 }, // pipe
      { type: 'road', x1: 300, y1: 100, x2: 300, y2: 200, width: 6 }, // pipe
      { type: 'zone', x: 480, y: 40, w: 290, h: 470, fill: '#6b7280', label: '', labelY: 0 }, // residential base
      { type: 'vegetation', x: 650, y: 150, w: 60, h: 100, label: 'PARK' },
      // Main elements
      { type: 'zone', x: 100, y: 50, w: 300, h: 250, fill: '#4a4a4a', label: '🏭 CHEMICAL PLANT', labelY: -8 },
      { type: 'hazard', icon: '☣', x: 250, y: 150, label: 'TOXIC LEAK', sublabel: 'SOURCE' },
      { type: 'zone', x: 500, y: 50, w: 250, h: 450, fill: '#7c7c6e', label: '🏘 RESIDENTIAL COLONY', labelY: -8 },
      { type: 'road', x1: 450, y1: 0, x2: 450, y2: 550, width: 20 },
      { type: 'poi', icon: '💨', x: 350, y: 200, label: 'WIND DIRECTION ➡' },
      { type: 'poi', icon: '💨', x: 400, y: 250, label: 'WIND DIRECTION ➡' },
      { type: 'building', x: 550, y: 100, w: 80, h: 60, fill: '#8b4513', label: '🏫 SCHOOL' },
      { type: 'building', x: 550, y: 300, w: 80, h: 60, fill: '#dc2626', label: '🏥 HOSPITAL' },
    ],
    legend: [
      { color: '#f59e0b', label: '☣ Toxic Hazard' },
      { color: '#4a4a4a', label: '🏭 Industrial' },
      { color: '#7c7c6e', label: '🏘 Residential' },
    ],
    defaultResources: { volunteers: 4, fireTrucks: 2, waterPumps: 0, customItems: [{ name: 'Hazmat Team', quantity: 2, capability: 'Containment' }, { name: 'Ambulance', quantity: 3, capability: 'Medical transport' }] },
    problems: [
      { description: 'Contain the toxic leak at the chemical plant', priority: 'critical', isPrimary: true },
      { description: 'Evacuate the school and residential colony before the gas reaches them', priority: 'critical' },
    ]
  },

  // ── 7) Mountain Avalanche Rescue ────────────────────────────
  mountain_avalanche: {
    id: 'mountain_avalanche',
    name: 'Mountain Avalanche Rescue',
    description: 'An avalanche has struck a mountain pass, burying a tourist bus and blocking the only supply route to an army post. High altitude and freezing temperatures limit time.',
    difficulty: 'hard',
    thumbnail: '🏔❄',
    terrain: '#e0e0e0',
    elements: [
      // Background enhancements
      { type: 'zone', x: 300, y: 50, w: 100, h: 60, fill: '#bae6fd', label: '❄ FROZEN LAKE', labelY: -8 },
      { type: 'vegetation', x: 100, y: 450, w: 120, h: 80, label: '🌲 PINE TREES' },
      { type: 'vegetation', x: 500, y: 100, w: 100, h: 100, label: '🌲 PINE TREES' },
      // Main elements
      { type: 'zone', x: 0, y: 0, w: 800, h: 550, fill: '#f8fafc', label: '', labelY: 0 },
      { type: 'zone', x: 50, y: 50, w: 200, h: 150, fill: '#cbd5e1', label: '⛰ MOUNTAIN PEAK', labelY: -8 },
      { type: 'zone', x: 550, y: 400, w: 200, h: 120, fill: '#cbd5e1', label: '⛰ STAGING BASE', labelY: -8 },
      { type: 'road_blocked', x1: 200, y1: 200, x2: 600, y2: 300, label: '🚧 AVALANCHE DEBRIS' },
      { type: 'vehicle', icon: '🚌', x: 350, y: 240, sublabel: 'BURIED BUS' },
      { type: 'building', x: 650, y: 100, w: 80, h: 60, fill: '#4a5d3a', label: '🏕 ARMY POST', sublabel: 'CUT OFF' },
      { type: 'poi', icon: '🚁', x: 650, y: 450, label: 'RESCUE CHOPPER' },
      { type: 'hazard', icon: '❄', x: 300, y: 150, label: 'AVALANCHE RISK', sublabel: 'UNSTABLE SNOW' }
    ],
    legend: [
      { color: '#cbd5e1', label: '⛰ Elevation' },
      { color: '#ef4444', label: '🚧 Blockage' },
      { color: '#4a5d3a', label: '🏕 Outpost' }
    ],
    defaultResources: { volunteers: 4, fireTrucks: 0, waterPumps: 0, customItems: [{ name: 'Snowmobile', quantity: 2, capability: 'Mobility' }, { name: 'Thermal Scanner', quantity: 1, capability: 'Detection' }] },
    problems: [
      { description: 'Locate and rescue passengers trapped in the buried bus', priority: 'critical', isPrimary: true },
      { description: 'Clear the debris blocking the supply route to the Army Post', priority: 'important' }
    ]
  },

  // ── 8) Highway Multi-Vehicle Pileup ───────────────────────
  highway_pileup: {
    id: 'highway_pileup',
    name: 'Highway Pileup Emergency',
    description: 'A massive 10-vehicle pileup on a major highway has caused casualties and a fuel truck leak. Traffic is completely jammed in both directions.',
    difficulty: 'medium',
    thumbnail: '🛣🚗',
    terrain: '#4b5563',
    elements: [
      // Background enhancements
      { type: 'zone', x: 0, y: 0, w: 800, h: 210, fill: 'rgba(34,197,94,0.15)', label: '', labelY: 0 }, // top grass
      { type: 'zone', x: 0, y: 290, w: 800, h: 260, fill: 'rgba(34,197,94,0.15)', label: '', labelY: 0 }, // bottom grass
      { type: 'road', x1: 0, y1: 210, x2: 800, y2: 210, width: 4 }, // top shoulder
      { type: 'road', x1: 0, y1: 290, x2: 800, y2: 290, width: 4 }, // bottom shoulder
      // Main elements
      { type: 'road', x1: 0, y1: 250, x2: 800, y2: 250, width: 80 },
      { type: 'road', x1: 0, y1: 250, x2: 800, y2: 250, width: 2 }, // Fake divider
      { type: 'threat', icon: '💥', x: 400, y: 250, label: 'PILEUP CORE', sublabel: '10 VEHICLES' },
      { type: 'hazard', icon: '⛽', x: 420, y: 230, label: 'FUEL LEAK', sublabel: 'HIGH FIRE RISK' },
      { type: 'vehicle', icon: '🚑', x: 100, y: 230, sublabel: 'AMBULANCE' },
      { type: 'vehicle', icon: '🚓', x: 100, y: 270, sublabel: 'POLICE' },
      { type: 'poi', icon: '🆘', x: 380, y: 280, label: 'CASUALTIES' },
      { type: 'zone', x: 600, y: 50, w: 150, h: 100, fill: '#dc2626', label: '🏥 CITY HOSPITAL', labelY: -8 }
    ],
    legend: [
      { color: '#fbbf24', label: '🛣 Highway' },
      { color: '#ef4444', label: '💥 Crash Zone' },
      { color: '#f59e0b', label: '⛽ Hazard' }
    ],
    defaultResources: { volunteers: 4, fireTrucks: 2, waterPumps: 0, customItems: [{ name: 'Tow Truck', quantity: 2, capability: 'Clearance' }] },
    problems: [
      { description: 'Extricate and treat casualties from the pileup', priority: 'critical', isPrimary: true },
      { description: 'Contain the fuel leak to prevent a massive explosion', priority: 'critical' },
      { description: 'Clear at least one lane to allow emergency vehicles through', priority: 'important' }
    ]
  },

  // ── 9) Airport Hijacking Attempt ──────────────────────────
  hijack_attempt: {
    id: 'hijack_attempt',
    name: 'Airport Hijacking Attempt',
    description: 'Armed terrorists have breached the airport perimeter and boarded a commercial airliner on the tarmac. Passengers are held hostage while the plane is being refueled.',
    difficulty: 'hard',
    thumbnail: '✈🥷',
    terrain: '#9ca3af',
    elements: [
      // Background enhancements
      { type: 'zone', x: 450, y: 0, w: 160, h: 550, fill: '#4b5563', label: '', labelY: 0 }, // runway outline
      { type: 'road', x1: 200, y1: 200, x2: 500, y2: 200, width: 30 }, // taxiway
      { type: 'zone', x: 0, y: 0, w: 450, h: 180, fill: 'rgba(34,197,94,0.1)', label: '🌱 GRASS FIELD', labelY: -8 },
      // Main elements
      { type: 'zone', x: 50, y: 350, w: 400, h: 150, fill: '#6b7280', label: '🏢 TERMINAL BUILDING', labelY: -8 },
      { type: 'road', x1: 500, y1: 50, x2: 500, y2: 500, width: 60 },
      { type: 'vehicle', icon: '✈', x: 500, y: 200, sublabel: 'FLIGHT 818 (HIJACKED)' },
      { type: 'threat', icon: '🥷', x: 480, y: 230, label: 'TERRORISTS', sublabel: 'HEAVILY ARMED' },
      { type: 'hazard', icon: '⛽', x: 530, y: 220, label: 'FUEL TRUCK', sublabel: 'EXPOSED' },
      { type: 'poi', icon: '🚁', x: 100, y: 100, label: 'SWAT STAGING' },
      { type: 'checkpoint', x: 50, y: 500, label: '🚧 MAIN GATE (BREACHED)' }
    ],
    legend: [
      { color: '#6b7280', label: '🏢 Buildings' },
      { color: '#ef4444', label: '🥷 Hostiles' }
    ],
    defaultResources: { volunteers: 4, fireTrucks: 2, waterPumps: 0, customItems: [{ name: 'SWAT Team', quantity: 3, capability: 'Assault' }, { name: 'Negotiator', quantity: 1, capability: 'De-escalation' }] },
    problems: [
      { description: 'Prevent the hijacked plane from taking off', priority: 'critical', isPrimary: true },
      { description: 'Rescue the passengers and neutralize the terrorists safely', priority: 'critical' },
      { description: 'Secure the exposed fuel truck to prevent an explosion', priority: 'important' }
    ]
  },

  // ── 10) River Smuggling Interception ───────────────────────
  smuggling_interception: {
    id: 'smuggling_interception',
    name: 'River Smuggling Interception',
    description: 'Intelligence indicates a major smuggling ring is using speedboats to move illicit cargo across the river delta tonight. Intercept the drop-off without letting them escape into international waters.',
    difficulty: 'medium',
    thumbnail: '🚤📦',
    terrain: '#111827',
    elements: [
      // Background enhancements
      { type: 'zone', x: 100, y: 220, w: 80, h: 40, fill: '#064e3b', label: '🏝 ISLAND', labelY: 0 },
      { type: 'zone', x: 450, y: 270, w: 120, h: 50, fill: '#064e3b', label: '🏝 ISLAND', labelY: 0 },
      { type: 'vegetation', x: 600, y: 50, w: 150, h: 100, label: '🌲 MANGROVES' },
      { type: 'vegetation', x: 250, y: 400, w: 200, h: 120, label: '🌲 THICK SWAMP' },
      // Main elements
      { type: 'river', path: 'M 0 250 Q 400 300 800 200', label: '🌊 RIVER DELTA', labelX: 400, labelY: 280, labelRotate: 0 },
      { type: 'zone', x: 0, y: 0, w: 800, h: 200, fill: '#1f2937', label: '🌲 NORTH BANK (DENSE JUNGLE)', labelY: -8 },
      { type: 'zone', x: 0, y: 350, w: 800, h: 200, fill: '#1f2937', label: '🌲 SOUTH BANK (SWAMP)', labelY: -8 },
      { type: 'threat', icon: '🚤', x: 600, y: 220, label: 'SMUGGLER BOAT', sublabel: 'MOVING FAST ⬅' },
      { type: 'poi', icon: '📦', x: 200, y: 180, label: 'SUSPECTED DROP POINT' },
      { type: 'vehicle', icon: '🛥', x: 100, y: 260, sublabel: 'PATROL BOAT A' },
      { type: 'building', x: 50, y: 50, w: 80, h: 60, fill: '#374151', label: '⛺ HIDEOUT', sublabel: 'UNCONFIRMED' }
    ],
    legend: [
      { color: '#1e90ff', label: '🌊 Waterway' },
      { color: '#ef4444', label: '🚤 Suspects' },
      { color: '#374151', label: '⛺ Structures' }
    ],
    defaultResources: { volunteers: 4, fireTrucks: 0, waterPumps: 0, customItems: [{ name: 'Patrol Boat', quantity: 2, capability: 'Water Pursuit' }, { name: 'Searchlight', quantity: 2, capability: 'Illumination' }] },
    problems: [
      { description: 'Intercept the smuggler boat before it drops the cargo or escapes', priority: 'critical', isPrimary: true },
      { description: 'Raid and secure the suspected hideout on the North Bank', priority: 'important' }
    ]
  },

  // ── 11) Blank / Custom Map ─────────────────────────────────
  blank: {
    id: 'blank',
    name: 'Blank Map (Custom)',
    description: 'Empty terrain map for custom scenarios. The accessor describes the situation verbally; cadets plan on a blank canvas.',
    difficulty: 'custom',
    thumbnail: '📄✏',
    terrain: '#3d6b47',
    elements: [],
    legend: [],
    defaultResources: { volunteers: 4, fireTrucks: 1, waterPumps: 1 },
    problems: []
  }
};

export default SCENARIO_TEMPLATES;
