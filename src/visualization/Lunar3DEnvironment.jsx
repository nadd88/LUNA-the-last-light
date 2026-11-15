import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Eye,
  RotateCw,
  RotateCcw,
  Compass,
  Sun,
  AlertTriangle,
  Camera,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Navigation,
  Crosshair
} from 'lucide-react';
import {
  map2DToWorld3D,
  world3DToMap2D,
  getTerrainHeight,
  getTerrainNormal,
  getWheelContactHeights,
  CRATERS_2D,
  LUNAR_BOULDERS
} from './proceduralLunarTerrain';
import { buildLunarRover } from './LunarRoverModel';
import {
  createRegolithTexture,
  createRegolithBumpTexture,
  createRegolithRoughnessTexture,
  createEarthTexture
} from './lunarPBRTextures';

export default function Lunar3DEnvironment({
  roverPos,
  roverHeading,
  onRoverUpdate,
  driveCommand,
  speedMode = 'NORMAL',
  isMoving,
  isDrilling,
  isScanning,
  selectedSite,
  iceDeposits = [],
  waypoint = null,
  onSetWaypoint,
  onWaypointReached,
  onFallbackTo2D,
  isFullScreen = false,
  hideInternalHUD = false,
  externalCameraMode,
  onCameraModeChange,
  resetCameraTrigger = 0,
  minimapCollapsed: externalMinimapCollapsed,
  hideMinimap = false
}) {
  const mountRef = useRef(null);
  const [cameraMode, setCameraMode] = useState(externalCameraMode || 'ORBIT'); // 'ORBIT' | 'CHASE' | 'PANORAMA'
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [telemetry, setTelemetry] = useState({
    pitchDeg: 0,
    rollDeg: 0,
    elevationM: 0,
    illumPercent: 88,
    speedMps: '0.0'
  });

  // Sync external camera mode
  useEffect(() => {
    if (externalCameraMode && externalCameraMode !== cameraMode) {
      setCameraMode(externalCameraMode);
    }
  }, [externalCameraMode]);

  // Live Interactive Lunar Minimap HUD State
  const [minimapZoom, setMinimapZoom] = useState(1.4); // 1.0 (overview) to 2.2 (tactical close-up)
  const [minimapOrientation, setMinimapOrientation] = useState('NORTH'); // 'NORTH' | 'ROVER'
  const [minimapCollapsed, setMinimapCollapsed] = useState(externalMinimapCollapsed !== undefined ? externalMinimapCollapsed : false);

  useEffect(() => {
    if (externalMinimapCollapsed !== undefined) {
      setMinimapCollapsed(externalMinimapCollapsed);
    }
  }, [externalMinimapCollapsed]);
  const minimapCanvasRef = useRef(null);
  const breadcrumbsRef = useRef([]);
  const lastMinimapDrawTime = useRef(0);
  const drawMinimapRef = useRef(null);

  // State refs for animation loop
  const animFrameIdRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const terrainMeshRef = useRef(null);
  const waypointBeaconGroupRef = useRef(null);
  const prevRoverFocus = useRef(null);
  const roverGroupRef = useRef(null);
  const bodyGroupRef = useRef(null);
  const wheelsRef = useRef([]);
  const wheelRimsRef = useRef([]);
  const wheelOffsetsRef = useRef([]);
  const drillGroupRef = useRef(null);
  const solarGroupRef = useRef(null);
  const dustParticlesRef = useRef(null);
  const iceCrystalsGroupRef = useRef(null);
  const earthMeshRef = useRef(null);

  // 6-Wheel Heavy Vehicle Rover Physics State
  const roverPhysics = useRef({
    x: 0,
    y: 0,
    z: 0,
    velocity: 0,
    heading: 0,
    steerAngle: 0,
    pitch: 0,
    roll: 0,
    wheelSuspensionYs: [0, 0, 0, 0, 0, 0],
    camFocus: new THREE.Vector3(0, 0, 0),
    camYaw: 0,
    lastSyncTime: 0,
    isInitialized: false
  });

  // Keyboard input tracker for active 3D canvas viewport
  const keysDownRef = useRef(new Set());

  // Function to smoothly reset camera to comfortable default viewing angle
  const handleResetCamera = () => {
    const phys = roverPhysics.current;
    if (!phys || !controlsRef.current || !cameraRef.current) return;

    setCameraMode('ORBIT');

    const roverCenter = new THREE.Vector3(phys.x, phys.y + 1.1, phys.z);
    controlsRef.current.target.copy(roverCenter);

    // Default comfortable angle: 18m behind along rover heading, 8m elevation
    const offsetBack = 18.0;
    const offsetUp = 8.0;
    const camX = phys.x + Math.sin(phys.heading) * offsetBack;
    const camZ = phys.z + Math.cos(phys.heading) * offsetBack;
    const camY = Math.max(phys.y + offsetUp, getTerrainHeight(camX, camZ) + 2.0);

    cameraRef.current.position.set(camX, camY, camZ);
    controlsRef.current.update();
  };

  useEffect(() => {
    if (resetCameraTrigger > 0) {
      handleResetCamera();
    }
  }, [resetCameraTrigger]);

  // Dynamic prop refs for renderLoop to read without recreating WebGL context
  const driveCommandRef = useRef(driveCommand);
  useEffect(() => { driveCommandRef.current = driveCommand; }, [driveCommand]);

  const speedModeRef = useRef(speedMode);
  useEffect(() => { speedModeRef.current = speedMode; }, [speedMode]);

  const onRoverUpdateRef = useRef(onRoverUpdate);
  useEffect(() => { onRoverUpdateRef.current = onRoverUpdate; }, [onRoverUpdate]);

  const isDrillingRef = useRef(isDrilling);
  useEffect(() => { isDrillingRef.current = isDrilling; }, [isDrilling]);

  const selectedSiteRef = useRef(selectedSite);
  useEffect(() => { selectedSiteRef.current = selectedSite; }, [selectedSite]);

  const waypointRef = useRef(waypoint);
  useEffect(() => { waypointRef.current = waypoint; }, [waypoint]);

  const onSetWaypointRef = useRef(onSetWaypoint);
  useEffect(() => { onSetWaypointRef.current = onSetWaypoint; }, [onSetWaypoint]);

  const onWaypointReachedRef = useRef(onWaypointReached);
  useEffect(() => { onWaypointReachedRef.current = onWaypointReached; }, [onWaypointReached]);

  const cameraModeRef = useRef(cameraMode);
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  // Main Three.js Lifecycle
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. WebGL Support Test
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setHasWebGLError(true);
      if (onFallbackTo2D) onFallbackTo2D();
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 560;

    // 2. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000205); // True deep outer space black
    scene.fog = new THREE.FogExp2(0x000205, 0.0028); // Subtle space distance falloff

    // 3. Camera Setup
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.5, 750);
    cameraRef.current = camera;
    camera.position.set(0, 16, 28);

    // 4. Renderer Setup (High-Fidelity Polar Visuals)
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.error('WebGL initialization error:', e);
      setHasWebGLError(true);
      if (onFallbackTo2D) onFallbackTo2D();
      return;
    }

    // 5. Photorealistic Lunar Lighting (Low-angle grazing polar sunlight + faint secondary Earthshine)
    // Low polar sun angle (~2.4° above horizon) creates dramatic lunar shadows, accentuating micro-relief
    const ambientLight = new THREE.AmbientLight(0x080f1a, 0.16);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.8);
    sunLight.position.set(55, 12, -180);
    sunLight.target.position.set(0, -10, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 420;
    sunLight.shadow.camera.left = -125;
    sunLight.shadow.camera.right = 125;
    sunLight.shadow.camera.top = 125;
    sunLight.shadow.camera.bottom = -125;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);
    scene.add(sunLight.target);

    // Subtle blue secondary fill representing faint Earthshine reflected off slopes
    const earthshineLight = new THREE.DirectionalLight(0x1e3a8a, 0.28);
    earthshineLight.position.set(-100, 38, 125);
    scene.add(earthshineLight);

    // 6. Deep Outer Space Starfield
    const starsGeom = new THREE.BufferGeometry();
    const starCount = 2500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 320 + Math.random() * 80;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.max(12, r * Math.cos(phi)); // Keep above lunar horizon
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xf1f5f9,
      size: 1.25,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.92
    });
    const starField = new THREE.Points(starsGeom, starsMat);
    scene.add(starField);

    // 7. Photorealistic Earthrise Skybox: Distant Earth Floating Above Horizon
    // Recreates the iconic Earthrise perspective photographed by Apollo and NASA LRO
    const earthGroup = new THREE.Group();
    earthGroup.position.set(150, 34, -210); // Low on south polar horizon (~4.5° elevation)

    const earthTexture = createEarthTexture();
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy() || 16;
    earthTexture.anisotropy = maxAnisotropy;
    const earthGeom = new THREE.SphereGeometry(11.2, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.05,
      emissive: 0x1e3a5f, // Space oceanic blue baseline
      emissiveMap: earthTexture,
      emissiveIntensity: 0.72 // Makes the brilliant blue oceans, green continents, and white clouds radiant in the sky!
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthMesh.rotation.z = 0.41; // 23.4° Earth axial obliquity
    earthMeshRef.current = earthMesh;
    earthGroup.add(earthMesh);

    // Atmospheric Rayleigh Blue Glow Halo (Standard Three.js Material, 100% bug-free on all GPUs)
    const haloGeom = new THREE.SphereGeometry(11.6, 64, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    earthGroup.add(haloMesh);
    scene.add(earthGroup);

    // 8. 3D Lunar Terrain Surface with Procedural Regolith PBR Textures
    const terrainGridRes = 240; // High-definition terrain surface (115,200 detailed facets)
    const terrainGeom = new THREE.PlaneGeometry(300, 300, terrainGridRes, terrainGridRes);
    terrainGeom.rotateX(-Math.PI / 2);

    const posAttr = terrainGeom.attributes.position;
    const vertexCount = posAttr.count;
    const colors = new Float32Array(vertexCount * 3);

    const colorSunlitAnorthosite = new THREE.Color(0xc5ccd6); // Highland anorthosite silvery-grey
    const colorSlopeTransition = new THREE.Color(0x606c7d);   // Terrace breccia titanium-grey
    const colorPSRColdTrap = new THREE.Color(0x111723);       // Basaltic cold trap deep charcoal
    const tempColor = new THREE.Color();

    for (let i = 0; i < vertexCount; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const vy = getTerrainHeight(vx, vz);
      posAttr.setY(i, vy);

      // Height & latitude-based geological stratigraphy
      const t = (vz + 150) / 300;
      if (t < 0.35) {
        tempColor.lerpColors(colorSunlitAnorthosite, colorSlopeTransition, t / 0.35);
      } else {
        tempColor.lerpColors(colorSlopeTransition, colorPSRColdTrap, (t - 0.35) / 0.65);
      }

      // Elevation-correlated brightness (ejecta crests & peaks are slightly brighter)
      const elevBoost = (vy - 5.0) * 0.008;
      tempColor.r = Math.min(0.95, Math.max(0.04, tempColor.r + elevBoost));
      tempColor.g = Math.min(0.95, Math.max(0.04, tempColor.g + elevBoost));
      tempColor.b = Math.min(0.98, Math.max(0.05, tempColor.b + elevBoost * 1.1));

      // Micro-texture rock stratigraphy noise
      const noise = (Math.sin(vx * 0.35 + vz * 0.2) * Math.cos(vz * 0.35 - vx * 0.2)) * 0.025;
      tempColor.r = Math.max(0.03, tempColor.r + noise);
      tempColor.g = Math.max(0.03, tempColor.g + noise);
      tempColor.b = Math.max(0.04, tempColor.b + noise);

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    terrainGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeom.computeVertexNormals();

    const regolithTexture = createRegolithTexture();
    const regolithBump = createRegolithBumpTexture();
    const regolithRoughness = createRegolithRoughnessTexture();

    const maxAniso = renderer.capabilities.getMaxAnisotropy() || 16;
    regolithTexture.anisotropy = maxAniso;
    regolithBump.anisotropy = maxAniso;
    regolithRoughness.anisotropy = maxAniso;

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: regolithTexture,
      bumpMap: regolithBump,
      bumpScale: 0.12,
      roughnessMap: regolithRoughness,
      roughness: 0.95,
      metalness: 0.04,
      flatShading: false
    });
    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMeshRef.current = terrainMesh;
    scene.add(terrainMesh);

    // 9. High-Performance Instanced Lunar Boulders & Regolith Rock Fragments
    // Reduced by ~60% (from 186 to ~74 rocks) to eliminate clutter and provide an open, expansive lunar regolith vista.
    // Unnecessary noisy micro-pebbles removed; prominent landmark boulders and crater ejecta preserved.
    const rockInstances = [];

    // Safety exclusion zone helper: prevents rocks from obstructing:
    // 1) Rover starting spawn (0, -110) and forward departure lane
    // 2) Any mission objectives / ice deposit drilling sites
    // 3) Overlapping clumps (guarantees natural open spacing)
    const isObstruction = (x, z) => {
      // Clear rover spawn (0, -110) with 16m safety radius
      if (Math.hypot(x - 0, z - (-110)) < 16) return true;
      // Clear initial forward driving corridor (X: -5 to +5, Z: -110 to -75)
      if (Math.abs(x) < 5.0 && z > -110 && z < -75) return true;
      // Clear mission ice deposit drilling sites (10m radius)
      const targets3D = [
        { x: -20, z: -10 },
        { x: 40, z: 20 },
        { x: -40, z: 70 },
        { x: 60, z: 110 }
      ];
      for (const t of targets3D) {
        if (Math.hypot(x - t.x, z - t.z) < 10) return true;
      }
      return false;
    };

    // 1. Prominent landmark boulders (curated 14 realistic megablocks)
    LUNAR_BOULDERS.forEach((b) => {
      if (!isObstruction(b.x, b.z)) {
        rockInstances.push({
          x: b.x,
          z: b.z,
          scale: b.scale,
          rot: b.rot,
          isBasalt: b.z > 0
        });
      }
    });

    // 2. Realistic asymmetrical crater ejecta rubble (selected major impact craters only)
    // Avoids circular "necklaces"; deposits natural ray clumps on the outer rim scarp
    const majorCraters = CRATERS_2D.filter(c => c.r >= 28);
    majorCraters.forEach((c, cIdx) => {
      const count = c.r > 40 ? 3 : 2;
      for (let k = 0; k < count; k++) {
        const ang = (k / count) * Math.PI * 1.3 + (cIdx * 1.7);
        const dist2d = c.r * (1.12 + Math.abs(Math.sin(k * 3.7 + cIdx)) * 0.28);
        const p2d = {
          x: c.x + Math.cos(ang) * dist2d,
          y: c.y + Math.sin(ang) * dist2d
        };
        const wPos = map2DToWorld3D(p2d.x, p2d.y);
        if (Math.abs(wPos.x) < 140 && Math.abs(wPos.z) < 140 && !isObstruction(wPos.x, wPos.z)) {
          const tooClose = rockInstances.some(r => Math.hypot(r.x - wPos.x, r.z - wPos.z) < 6.5);
          if (!tooClose) {
            rockInstances.push({
              x: wPos.x,
              z: wPos.z,
              scale: 1.1 + Math.abs(Math.sin(k * 4.3 + cIdx)) * 1.5,
              rot: ang * 1.5,
              isBasalt: wPos.z > -10
            });
          }
        }
      }
    });

    // 3. Natural scattered boulders along ridge crests and slopes (decluttered by ~60%)
    // Filtered to remove tiny noisy pebbles (<0.85m) and keep open, expansive lunar terrain
    const scatterRand = (seed) => {
      let v = seed % 2147483647;
      return () => {
        v = (v * 16807) % 2147483647;
        return (v - 1) / 2147483646;
      };
    };
    const sRand = scatterRand(42069);
    for (let i = 0; i < 48; i++) {
      const sx = (sRand() - 0.5) * 260;
      const sz = (sRand() - 0.5) * 260;
      if (!isObstruction(sx, sz)) {
        const tooClose = rockInstances.some(r => Math.hypot(r.x - sx, r.z - sz) < 7.0);
        if (!tooClose && rockInstances.length < 74) {
          rockInstances.push({
            x: sx,
            z: sz,
            scale: 0.85 + sRand() * 1.45, // Substantial, visible rocks (no small noise)
            rot: sRand() * Math.PI * 2,
            isBasalt: sz > 20 || sRand() > 0.6
          });
        }
      }
    }

    const totalRocks = rockInstances.length;
    const rockGeom = new THREE.DodecahedronGeometry(1.0, 1);
    const pArr = rockGeom.attributes.position;
    for (let k = 0; k < pArr.count; k++) {
      const px = pArr.getX(k);
      const py = pArr.getY(k);
      const pz = pArr.getZ(k);
      pArr.setXYZ(
        k,
        px * (0.76 + Math.abs(Math.sin(k * 13.7)) * 0.42),
        py * (0.62 + Math.abs(Math.cos(k * 19.3)) * 0.38),
        pz * (0.76 + Math.abs(Math.sin(k * 29.1)) * 0.42)
      );
    }
    rockGeom.computeVertexNormals();

    const rockMat = new THREE.MeshStandardMaterial({
      roughness: 0.94,
      metalness: 0.08,
      flatShading: true
    });

    const instancedRocks = new THREE.InstancedMesh(rockGeom, rockMat, totalRocks);
    const dummy = new THREE.Object3D();
    const clastColor = new THREE.Color();

    for (let i = 0; i < totalRocks; i++) {
      const rock = rockInstances[i];
      const groundH = getTerrainHeight(rock.x, rock.z);
      dummy.position.set(rock.x, groundH + rock.scale * 0.38, rock.z);
      dummy.rotation.set(rock.rot * 0.6, rock.rot, rock.rot * 0.35);
      dummy.scale.set(rock.scale, rock.scale * 0.82, rock.scale);
      dummy.updateMatrix();
      instancedRocks.setMatrixAt(i, dummy.matrix);

      if (rock.isBasalt) {
        clastColor.setHex(0x384152).offsetHSL((sRand() - 0.5) * 0.04, 0, (sRand() - 0.5) * 0.06);
      } else {
        clastColor.setHex(0x9ca3af).offsetHSL((sRand() - 0.5) * 0.04, 0, (sRand() - 0.5) * 0.08);
      }
      instancedRocks.setColorAt(i, clastColor);
    }

    instancedRocks.castShadow = true;
    instancedRocks.receiveShadow = true;
    instancedRocks.instanceMatrix.needsUpdate = true;
    if (instancedRocks.instanceColor) instancedRocks.instanceColor.needsUpdate = true;
    scene.add(instancedRocks);

    // 10. Heavy-Duty Aerospace 6-Wheel Exploration Rover Model
    const roverData = buildLunarRover();
    roverGroupRef.current = roverData.root;
    bodyGroupRef.current = roverData.bodyGroup;
    wheelsRef.current = roverData.wheels;
    wheelRimsRef.current = roverData.wheelRims;
    wheelOffsetsRef.current = roverData.wheelOffsets;
    drillGroupRef.current = roverData.drillGroup;
    solarGroupRef.current = roverData.solarGroup;
    scene.add(roverData.root);

    // 11. Cryogenic Water Ice Deposit Markers
    const iceGroup = new THREE.Group();
    iceCrystalsGroupRef.current = iceGroup;
    const crystalGeom = new THREE.OctahedronGeometry(0.85, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.88,
      roughness: 0.18
    });

    iceDeposits.forEach((dep) => {
      const wPos = map2DToWorld3D(dep.x, dep.y);
      const elev = getTerrainHeight(wPos.x, wPos.z);
      const crystal = new THREE.Mesh(crystalGeom, crystalMat);
      crystal.position.set(wPos.x, elev + 0.65, wPos.z);
      crystal.castShadow = true;
      iceGroup.add(crystal);
    });
    scene.add(iceGroup);

    // 12. Regolith Dust Particle System
    const dustCount = 90;
    const dustGeom = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 4.2;
      dustPositions[i * 3 + 1] = Math.random() * 0.9;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.2;
    }
    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.35,
      transparent: true,
      opacity: 0.4
    });
    const dustPoints = new THREE.Points(dustGeom, dustMat);
    dustParticlesRef.current = dustPoints;
    scene.add(dustPoints);

    // 13. Responsive Resize Observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 14. Interactive Three.js OrbitControls (Desktop Mouse & Mobile Touchscreen)
    const domEl = renderer.domElement;
    const controls = new OrbitControls(camera, domEl);
    controlsRef.current = controls;

    // Smooth camera movement using damping
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;

    // Mouse configuration: Left = Rotate, Wheel/Middle = Dolly Zoom, Right = Pan
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };

    // Touchscreen gesture configuration: 1-finger = Rotate, 2-fingers = Pinch Zoom & Pan
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    // Camera orbit limits: full 360° horizontal orbit; clamp vertical angle to prevent going under ground
    controls.minDistance = 6.0;   // Minimum zoom distance: close inspection without rover body clipping
    controls.maxDistance = 75.0;  // Maximum zoom distance: wide tactical surrounding view
    controls.minPolarAngle = 0.05; // Prevent camera flipping at exact zenith
    controls.maxPolarAngle = Math.PI / 2.08; // ~86.5°: prevents camera from dipping beneath terrain

    // Initial camera target centered on rover
    const initWPos = map2DToWorld3D(roverPos.x, roverPos.y);
    const initGroundH = getTerrainHeight(initWPos.x, initWPos.z);
    const initialCenter = new THREE.Vector3(initWPos.x, initGroundH + 1.1, initWPos.z);
    controls.target.copy(initialCenter);

    // Initial comfortable viewing angle: 18m behind along heading, 8m above
    const initHeadingRad = -((roverHeading - 90) * Math.PI) / 180;
    const initCamX = initWPos.x + Math.sin(initHeadingRad) * 18.0;
    const initCamZ = initWPos.z + Math.cos(initHeadingRad) * 18.0;
    const initCamY = Math.max(initGroundH + 8.0, getTerrainHeight(initCamX, initCamZ) + 2.0);
    camera.position.set(initCamX, initCamY, initCamZ);
    controls.update();

    prevRoverFocus.current = initialCenter.clone();

    // Immediately initialize physical rover state to match initial world position
    const phys = roverPhysics.current;
    phys.x = initWPos.x;
    phys.z = initWPos.z;
    phys.y = initGroundH;
    phys.heading = initHeadingRad;
    phys.velocity = 0;
    phys.camFocus.set(initWPos.x, initGroundH, initWPos.z);
    phys.camYaw = initHeadingRad;
    phys.isInitialized = true;

    if (roverGroupRef.current) {
      roverGroupRef.current.position.set(initWPos.x, initGroundH, initWPos.z);
      roverGroupRef.current.rotation.y = initHeadingRad;
    }

    // Auto-transition to ORBIT mode when dragging canvas in CHASE mode
    const onCanvasPointerDown = () => {
      if (cameraModeRef.current === 'CHASE') {
        setCameraMode('ORBIT');
        if (onCameraModeChange) onCameraModeChange('ORBIT');
      }
    };
    domEl.addEventListener('pointerdown', onCanvasPointerDown);

    // Active keyboard listeners for smooth 3D driving
    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      keysDownRef.current.add(e.code);
    };

    const onKeyUp = (e) => {
      keysDownRef.current.delete(e.code);
    };

    const onBlur = () => {
      keysDownRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // 15. Main Render Loop
    let lastTime = performance.now();
    const renderLoop = (time) => {
      const delta = Math.min(0.064, (time - lastTime) / 1000);
      lastTime = time;

      if (delta <= 0) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // Axial rotation of distant Earth
      if (earthMeshRef.current) {
        earthMeshRef.current.rotation.y += delta * 0.015;
      }

      // Pulse Ice crystals
      if (iceCrystalsGroupRef.current) {
        iceCrystalsGroupRef.current.children.forEach((crystal, idx) => {
          crystal.rotation.y += delta * 0.8;
          crystal.position.y += Math.sin(time * 0.003 + idx) * 0.004;
        });
      }

      // -------------------------------------------------------------
      // 1. PROCESS UNIFIED INPUTS (Keyboard + UI Buttons)
      // -------------------------------------------------------------
      const cmd = driveCommandRef.current;
      const keys = keysDownRef.current;
      const forward = Boolean(cmd?.forward || keys.has('KeyW') || keys.has('ArrowUp'));
      const reverse = Boolean(cmd?.reverse || keys.has('KeyS') || keys.has('ArrowDown'));
      const steerLeft = Boolean(cmd?.left || keys.has('KeyA') || keys.has('ArrowLeft'));
      const steerRight = Boolean(cmd?.right || keys.has('KeyD') || keys.has('ArrowRight'));
      const brake = Boolean(cmd?.brake || keys.has('Space'));
      const boost = Boolean(cmd?.boost || keys.has('ShiftLeft') || keys.has('ShiftRight') || speedModeRef.current === 'DASH');

      const phys = roverPhysics.current;

      // -------------------------------------------------------------
      // 2. SPEED LIMITS, SLOPE GRAVITY & REGOLITH TRACTION (Responsive High-Speed Tuning)
      // -------------------------------------------------------------
      let maxForwardSpeed = 9.0; // Nominal m/s (~32.4 km/h) - fast responsive lunar exploration
      if (speedModeRef.current === 'CAUTIOUS') maxForwardSpeed = 4.5;
      else if (boost || speedModeRef.current === 'DASH') maxForwardSpeed = 16.0; // Dash / Boost (~57.6 km/h)
      const maxReverseSpeed = -5.5;

      // Calculate terrain normal & directional slope gradient
      const normal = getTerrainNormal(phys.x, phys.z);
      // In Three.js, heading is around Y; rover local forward is -Z:
      const fwdX = -Math.sin(phys.heading);
      const fwdZ = -Math.cos(phys.heading);

      // Slope gradient: dot product between surface normal and forward vector
      const slopeGrad = -(normal.x * fwdX + normal.z * fwdZ);

      // Gravitational acceleration component along slope (Lunar g = 1.62 m/s^2)
      const gravitySlopeAccel = -slopeGrad * 1.62;

      // Lunar regolith traction factor (slip on steep slopes > 15°)
      const tractionCoeff = Math.max(0.35, 1.0 - Math.max(0, Math.abs(slopeGrad) - 0.24) * 2.2);

      // -------------------------------------------------------------
      // 3. ACCELERATION & DECELERATION PHYSICS (Punchy, Agile Driving)
      // -------------------------------------------------------------
      const currentV = phys.velocity;

      if (brake) {
        // Friction brake - rapid response
        const brakeForce = 18.0 * delta;
        if (currentV > 0) phys.velocity = Math.max(0, currentV - brakeForce);
        else if (currentV < 0) phys.velocity = Math.min(0, currentV + brakeForce);
      } else if (forward && !reverse) {
        // High-torque brushless hub motors acceleration (~6.5 m/s^2)
        const accel = 6.5 * tractionCoeff * delta;
        const uphillOppose = slopeGrad > 0 ? gravitySlopeAccel * 0.8 * delta : 0;
        const effMaxSpeed = Math.max(2.0, maxForwardSpeed * tractionCoeff - (slopeGrad > 0 ? slopeGrad * 2.0 : 0));
        phys.velocity = Math.min(effMaxSpeed, currentV + accel + uphillOppose);
      } else if (reverse && !forward) {
        // Progressive footbrake first if rolling forward
        if (currentV > 0.25) {
          phys.velocity = Math.max(0, currentV - 14.0 * delta);
        } else {
          // Reverse acceleration (~4.5 m/s^2)
          const revAccel = 4.5 * tractionCoeff * delta;
          phys.velocity = Math.max(maxReverseSpeed, currentV - revAccel);
        }
      } else {
        // Coasting with regolith rolling resistance
        const coastDrag = 3.5 * delta;
        if (currentV > 0) {
          phys.velocity = Math.max(0, currentV - coastDrag + (gravitySlopeAccel * 0.3 * delta));
        } else if (currentV < 0) {
          phys.velocity = Math.min(0, currentV + coastDrag);
        }
      }

      if (Math.abs(phys.velocity) < 0.005) phys.velocity = 0;

      // -------------------------------------------------------------
      // 4. SPEED-DEPENDENT STEERING & POINT-TURN RADIUS
      // -------------------------------------------------------------
      const maxSteerAngle = 0.52; // ~30 degrees max steer
      let targetSteer = 0;
      if (steerLeft && !steerRight) targetSteer = -maxSteerAngle;
      else if (steerRight && !steerLeft) targetSteer = maxSteerAngle;

      // Smooth steering interpolation (rapid response)
      phys.steerAngle += (targetSteer - phys.steerAngle) * Math.min(1.0, delta * 7.5);

      // Kinematic turning rate: omega = (v / Wheelbase) * tan(steerAngle)
      const wheelbase = 2.24;
      let angularVelocity = (phys.velocity / wheelbase) * Math.tan(phys.steerAngle);

      // Responsive point-turn / zero-radius pivot when steering at standstill or low speed
      if (Math.abs(phys.velocity) < 1.2 && (steerLeft || steerRight)) {
        const turnSign = steerRight ? 1 : -1;
        angularVelocity = turnSign * 1.35;
      }

      // Smoothly cap turning rate at high speed to prevent spinouts
      angularVelocity = Math.max(-2.2, Math.min(2.2, angularVelocity));

      // Update rover heading
      phys.heading += angularVelocity * delta;
      while (phys.heading > Math.PI) phys.heading -= Math.PI * 2;
      while (phys.heading < -Math.PI) phys.heading += Math.PI * 2;

      // -------------------------------------------------------------
      // 5. POSITION DISPLACEMENT & BOUNDARY CONSTRAINTS
      // -------------------------------------------------------------
      const distanceTraveled = phys.velocity * delta;
      phys.x += fwdX * distanceTraveled;
      phys.z += fwdZ * distanceTraveled;

      // Boundary clamping matching 2D tactical map [40, 560]
      const pos2d = world3DToMap2D(phys.x, phys.z);
      const clampedX2d = Math.max(40, Math.min(560, pos2d.x));
      const clampedY2d = Math.max(60, Math.min(560, pos2d.y));
      const clampedWorld = map2DToWorld3D(clampedX2d, clampedY2d);
      phys.x = clampedWorld.x;
      phys.z = clampedWorld.z;

      // -------------------------------------------------------------
      // 6. SIX-WHEEL SUSPENSION & TERRAIN ADAPTATION
      // -------------------------------------------------------------
      const wheelsList = wheelsRef.current;
      const defaultWheelY = 0.61;
      const wheelRadius = 0.57;

      if (wheelOffsetsRef.current && wheelOffsetsRef.current.length === 6) {
        const contact = getWheelContactHeights(phys.x, phys.z, phys.heading, wheelOffsetsRef.current);
        phys.y = contact.avgGroundHeight;

        for (let i = 0; i < 6; i++) {
          const wheelGroundY = contact.wheelGroundYs[i];
          const targetDeflection = wheelGroundY - contact.avgGroundHeight;
          const clampedDeflection = Math.max(-0.32, Math.min(0.32, targetDeflection));

          // Spring-damper smoothing per wheel
          phys.wheelSuspensionYs[i] += (clampedDeflection - phys.wheelSuspensionYs[i]) * Math.min(1.0, delta * 12.0);

          if (wheelsList && wheelsList[i]) {
            wheelsList[i].position.y = defaultWheelY + phys.wheelSuspensionYs[i];

            // Dual Ackermann Steering:
            if (i === 0 || i === 1) {
              // Front wheels steer with steerAngle
              wheelsList[i].rotation.y = phys.steerAngle;
            } else if (i === 2 || i === 3) {
              // Middle wheels stay straight
              wheelsList[i].rotation.y = 0;
            } else if (i === 4 || i === 5) {
              // Rear wheels counter-steer with -steerAngle
              wheelsList[i].rotation.y = -phys.steerAngle;
            }
          }
        }

        // Dynamic chassis pitch and roll from 6 terrain contact points
        const frontAvgY = (contact.wheelGroundYs[0] + contact.wheelGroundYs[1]) * 0.5;
        const rearAvgY = (contact.wheelGroundYs[4] + contact.wheelGroundYs[5]) * 0.5;
        const targetPitch = -Math.atan2(frontAvgY - rearAvgY, wheelbase);

        const leftAvgY = (contact.wheelGroundYs[0] + contact.wheelGroundYs[2] + contact.wheelGroundYs[4]) / 3.0;
        const rightAvgY = (contact.wheelGroundYs[1] + contact.wheelGroundYs[3] + contact.wheelGroundYs[5]) / 3.0;
        const targetRoll = Math.atan2(rightAvgY - leftAvgY, 2.50);

        // Inertia damping on body tilt (rate = 6.5)
        phys.pitch += (targetPitch - phys.pitch) * Math.min(1.0, delta * 6.5);
        phys.roll += (targetRoll - phys.roll) * Math.min(1.0, delta * 6.5);
      } else {
        phys.y = getTerrainHeight(phys.x, phys.z);
      }

      // Apply to 3D rover root node
      if (roverGroupRef.current) {
        roverGroupRef.current.position.set(phys.x, phys.y, phys.z);
        roverGroupRef.current.rotation.y = phys.heading;
        roverGroupRef.current.rotation.x = phys.pitch;
        roverGroupRef.current.rotation.z = phys.roll;
      }

      // -------------------------------------------------------------
      // 7. SIX-WHEEL ROTATION MATCHING ACTUAL DISTANCE TRAVELED
      // -------------------------------------------------------------
      if (wheelRimsRef.current && wheelRimsRef.current.length > 0) {
        const rollDelta = distanceTraveled / wheelRadius;
        wheelRimsRef.current.forEach((rim) => {
          rim.rotation.x += rollDelta;
        });
      }

      // TRIDENT Drill animation when drilling
      if (isDrillingRef.current && drillGroupRef.current) {
        drillGroupRef.current.position.y = 0.22 + Math.sin(time * 0.08) * 0.24;
      } else if (drillGroupRef.current) {
        drillGroupRef.current.position.y = 0.5;
      }

      // Dust particles follow rover
      if (dustParticlesRef.current && roverGroupRef.current) {
        dustParticlesRef.current.position.copy(roverGroupRef.current.position);
        if (Math.abs(phys.velocity) > 0.1 || isDrillingRef.current) {
          dustParticlesRef.current.visible = true;
          dustParticlesRef.current.rotation.y += delta * 1.8;
        } else {
          dustParticlesRef.current.visible = false;
        }
      }

      // -------------------------------------------------------------
      // 8. JITTER-FREE CAMERA TRACKING & ORBITCONTROLS
      // -------------------------------------------------------------
      const activeCamMode = cameraModeRef.current;
      const controls = controlsRef.current;
      const roverCenter = new THREE.Vector3(phys.x, phys.y + 1.1, phys.z);

      if (!prevRoverFocus.current) {
        prevRoverFocus.current = roverCenter.clone();
      }
      const deltaMove = new THREE.Vector3().subVectors(roverCenter, prevRoverFocus.current);
      prevRoverFocus.current.copy(roverCenter);

      if (activeCamMode === 'ORBIT') {
        if (controls) {
          controls.enabled = true;
          // Synchronously translate camera and target by the rover displacement delta
          // This preserves the player's orbit angle and zoom distance while driving!
          if (deltaMove.lengthSq() > 0.000001) {
            camera.position.add(deltaMove);
            controls.target.add(deltaMove);
          }
          controls.update();

          // Terrain anti-clipping: guarantee camera never dips beneath local terrain surface
          const terrainHUnderCam = getTerrainHeight(camera.position.x, camera.position.z);
          if (camera.position.y < terrainHUnderCam + 1.2) {
            camera.position.y = terrainHUnderCam + 1.2;
          }
        }
      } else if (activeCamMode === 'CHASE') {
        if (controls) controls.enabled = false;

        phys.camFocus.x += (phys.x - phys.camFocus.x) * Math.min(1.0, delta * 8.0);
        phys.camFocus.z += (phys.z - phys.camFocus.z) * Math.min(1.0, delta * 8.0);
        phys.camFocus.y += (phys.y - phys.camFocus.y) * Math.min(1.0, delta * 5.5);
        const targetPos = phys.camFocus;

        let diffH = phys.heading - phys.camYaw;
        while (diffH < -Math.PI) diffH += Math.PI * 2;
        while (diffH > Math.PI) diffH -= Math.PI * 2;
        phys.camYaw += diffH * Math.min(1.0, delta * 5.5);

        const offsetBack = 18.0;
        const offsetUp = 7.5;
        const camX = targetPos.x + Math.sin(phys.camYaw) * offsetBack;
        const camZ = targetPos.z + Math.cos(phys.camYaw) * offsetBack;
        const camY = Math.max(targetPos.y + offsetUp, getTerrainHeight(camX, camZ) + 1.5);

        camera.position.set(camX, camY, camZ);
        camera.lookAt(targetPos.x, targetPos.y + 1.2, targetPos.z);

        if (controls) {
          controls.target.copy(targetPos);
        }
      } else if (activeCamMode === 'PANORAMA') {
        if (controls) controls.enabled = false;
        const panPos = new THREE.Vector3(25, 34, -95);
        camera.position.lerp(panPos, delta * 2.0);
        camera.lookAt(roverCenter.x, roverCenter.y, roverCenter.z);

        if (controls) {
          controls.target.copy(roverCenter);
        }
      }

      // -------------------------------------------------------------
      // 9. THROTTLED TELEMETRY & 2D SIMULATION SYNCHRONIZATION
      // -------------------------------------------------------------
      const now = performance.now();
      const isMovingNow = Math.abs(phys.velocity) > 0.05;

      if (now - phys.lastSyncTime > 45 || isMovingNow) {
        phys.lastSyncTime = now;

        let deg2d = (-phys.heading * 180) / Math.PI + 90;
        while (deg2d < 0) deg2d += 360;
        while (deg2d >= 360) deg2d -= 360;

        if (onRoverUpdateRef.current) {
          onRoverUpdateRef.current(
            { x: clampedX2d, y: clampedY2d },
            deg2d,
            isMovingNow,
            Math.abs(distanceTraveled)
          );
        }

        // Record breadcrumbs for live minimap exploration trail
        if (isMovingNow) {
          const bList = breadcrumbsRef.current;
          const lastB = bList[bList.length - 1];
          if (!lastB || Math.hypot(clampedX2d - lastB.x, clampedY2d - lastB.y) > 2.8) {
            bList.push({ x: clampedX2d, y: clampedY2d });
            if (bList.length > 250) bList.shift();
          }
        }

        let illum = 88;
        if (clampedY2d < 140) illum = selectedSiteRef.current?.peakIllumination || 88;
        else if (clampedY2d < 230) {
          const ratio = (clampedY2d - 140) / 90;
          illum = Math.max(0, Math.round((selectedSiteRef.current?.peakIllumination || 88) * (1 - ratio)));
        } else {
          illum = 0;
        }

        setTelemetry({
          pitchDeg: Math.round((phys.pitch * 180) / Math.PI),
          rollDeg: Math.round((phys.roll * 180) / Math.PI),
          elevationM: Math.round(phys.y * 50 + 1200),
          illumPercent: illum,
          speedMps: (Math.abs(phys.velocity)).toFixed(1)
        });
      }

      try {
        renderer.render(scene, camera);
      } catch (renderError) {
        console.error('Three.js render loop error:', renderError);
      }
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    // 16. Resource Cleanup on Unmount
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();

      domEl.removeEventListener('pointerdown', onCanvasPointerDown);
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      if (renderer) {
        renderer.dispose();
        if (domEl && domEl.parentNode) {
          domEl.parentNode.removeChild(domEl);
        }
      }
    };
  }, []);

  // Synchronize external changes from 2D sim (initial mount, landing site switch, emergency jumps)
  useEffect(() => {
    const wPos = map2DToWorld3D(roverPos.x, roverPos.y);
    const headingRad = -((roverHeading - 90) * Math.PI) / 180;
    const phys = roverPhysics.current;

    const distSq = (wPos.x - phys.x) ** 2 + (wPos.z - phys.z) ** 2;
    if (!phys.isInitialized || distSq > 120) {
      phys.x = wPos.x;
      phys.z = wPos.z;
      phys.y = getTerrainHeight(wPos.x, wPos.z);
      phys.heading = headingRad;
      phys.velocity = 0;
      phys.camFocus.set(wPos.x, phys.y, wPos.z);
      phys.camYaw = headingRad;
      phys.isInitialized = true;

      if (roverGroupRef.current) {
        roverGroupRef.current.position.set(phys.x, phys.y, phys.z);
        roverGroupRef.current.rotation.y = headingRad;
      }
    }
  }, [roverPos.x, roverPos.y, roverHeading]);

  // Live Interactive Lunar Minimap HUD Canvas Renderer
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas || minimapCollapsed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Deep space tactical radar background
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.7);
      bgGrad.addColorStop(0, '#090f1d');
      bgGrad.addColorStop(0.85, '#040711');
      bgGrad.addColorStop(1, '#02040a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Rover coordinates
      const r3d = map2DToWorld3D(roverPos.x, roverPos.y);
      const headingRad = ((-roverHeading + 90) * Math.PI) / 180;

      // View range in meters (zoom scale)
      const rangeM = 95 / minimapZoom;
      const scale = (w * 0.44) / rangeM; // pixels per 3D world meter

      // World to minimap screen transform helper
      const worldToMinimap = (wx, wz) => {
        let dx = wx - r3d.x;
        let dz = wz - r3d.z;

        if (minimapOrientation === 'ROVER') {
          const rotAngle = -headingRad + Math.PI / 2;
          const rx = dx * Math.cos(rotAngle) - dz * Math.sin(rotAngle);
          const rz = dx * Math.sin(rotAngle) + dz * Math.cos(rotAngle);
          return {
            x: cx + rx * scale,
            y: cy + rz * scale
          };
        } else {
          return {
            x: cx + dx * scale,
            y: cy + dz * scale
          };
        }
      };

      // 1. Tactical Range Rings (25m and 50m)
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.16)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      [25, 50].forEach((rM) => {
        const rPx = rM * scale;
        if (rPx < w * 0.8) {
          ctx.beginPath();
          ctx.arc(cx, cy, rPx, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Crosshairs
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy);
      ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12);
      ctx.stroke();
      ctx.restore();

      // 2. Sunlit Ridge vs PSR Cold Trap Boundary Line (Y_2D = 220 -> Z_3D = -40)
      const psrPt1 = worldToMinimap(-150, -40);
      const psrPt2 = worldToMinimap(150, -40);
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(psrPt1.x, psrPt1.y);
      ctx.lineTo(psrPt2.x, psrPt2.y);
      ctx.stroke();
      ctx.restore();

      // 3. Topographic Impact Craters
      CRATERS_2D.forEach((c) => {
        const cw = map2DToWorld3D(c.x, c.y);
        const cp = worldToMinimap(cw.x, cw.z);
        const cRadPx = (c.r * 0.5) * scale;

        if (cp.x + cRadPx < -10 || cp.x - cRadPx > w + 10 || cp.y + cRadPx < -10 || cp.y - cRadPx > h + 10) return;

        // Crater bowl shadow
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, Math.max(2, cRadPx), 0, Math.PI * 2);
        ctx.fillStyle = c.inSun ? 'rgba(15, 23, 42, 0.65)' : 'rgba(2, 6, 23, 0.88)';
        ctx.fill();

        // Raised rim ring
        ctx.strokeStyle = c.inSun ? 'rgba(245, 158, 11, 0.45)' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = Math.max(1, cRadPx * 0.12);
        ctx.stroke();
      });

      // 4. Breadcrumb Exploration Trail
      if (breadcrumbsRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        let first = true;
        breadcrumbsRef.current.forEach((pt) => {
          const pw = map2DToWorld3D(pt.x, pt.y);
          const pp = worldToMinimap(pw.x, pw.z);
          if (first) {
            ctx.moveTo(pp.x, pp.y);
            first = false;
          } else {
            ctx.lineTo(pp.x, pp.y);
          }
        });
        ctx.stroke();
        ctx.restore();
      }

      // 5. Mission Science Targets (Water Ice Deposits)
      iceDeposits.forEach((dep) => {
        const dw = map2DToWorld3D(dep.x, dep.y);
        const dp = worldToMinimap(dw.x, dw.z);

        if (dp.x >= -10 && dp.x <= w + 10 && dp.y >= -10 && dp.y <= h + 10) {
          ctx.save();
          ctx.fillStyle = dep.scanned ? '#22c55e' : '#00f0ff';
          ctx.shadowColor = dep.scanned ? '#22c55e' : '#00f0ff';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          const dSize = 4.5;
          ctx.moveTo(dp.x, dp.y - dSize);
          ctx.lineTo(dp.x + dSize, dp.y);
          ctx.lineTo(dp.x, dp.y + dSize);
          ctx.lineTo(dp.x - dSize, dp.y);
          ctx.closePath();
          ctx.fill();

          ctx.font = '8px monospace';
          ctx.fillStyle = '#67e8f9';
          ctx.fillText(`ICE ${dep.concentration}%`, dp.x + 6, dp.y + 3);
          ctx.restore();
        }
      });

      // 6. Live Rover Marker
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.stroke();

      const chevronAngle = minimapOrientation === 'ROVER' ? -Math.PI / 2 : headingRad - Math.PI / 2;
      ctx.translate(cx, cy);
      ctx.rotate(chevronAngle);

      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -6.5);
      ctx.lineTo(4.5, 4.5);
      ctx.lineTo(0, 2.5);
      ctx.lineTo(-4.5, 4.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 7. North Cardinal Indicator
      ctx.save();
      if (minimapOrientation === 'ROVER') {
        const nAngle = -headingRad + Math.PI / 2;
        const nx = 18 + Math.cos(nAngle - Math.PI / 2) * 8;
        const ny = 18 + Math.sin(nAngle - Math.PI / 2) * 8;
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('N', nx - 3, ny + 3);
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('▲ N', 8, 14);
      }
      ctx.restore();
    } catch (mapErr) {
      console.warn('Minimap draw issue:', mapErr);
    }
  }, [roverPos.x, roverPos.y, roverHeading, minimapZoom, minimapOrientation, minimapCollapsed, iceDeposits]);

  if (hasWebGLError) {
    return (
      <div className="w-full aspect-square bg-space-950 border border-amber-500/40 rounded-lg p-6 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
        <h3 className="font-display font-bold text-slate-100 text-lg mb-1">
          3D WebGL Acceleration Unavailable
        </h3>
        <p className="text-xs font-mono text-slate-300 max-w-md mb-4 leading-relaxed">
          Your browser or graphics environment does not support accelerated WebGL. The mission simulation continues uninterrupted in standard 2D tactical mode.
        </p>
        <button
          onClick={onFallbackTo2D}
          className="btn-primary flex items-center space-x-2 text-xs"
        >
          <span>SWITCH TO 2D TACTICAL MAP</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={isFullScreen ? "relative w-full h-full overflow-hidden bg-black select-none" : "relative w-full aspect-square rounded-lg overflow-hidden border border-cyan-500/30 bg-black shadow-[0_0_25px_rgba(0,240,255,0.15)] group"}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Telemetry Banner */}
      {!hideInternalHUD && (
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="bg-space-950/85 backdrop-blur border border-cyan-500/40 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 flex items-center space-x-2.5 shadow-lg">
            <span className={`w-2 h-2 rounded-full ${telemetry.illumPercent === 0 ? 'bg-red-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
            <span className="font-bold text-cyan-300">3D POLAR HORIZON</span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px] text-slate-300">
              SUN: <strong className={telemetry.illumPercent > 0 ? 'text-amber-300' : 'text-red-400'}>{telemetry.illumPercent}%</strong>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px] text-slate-300">
              PITCH: <strong>{telemetry.pitchDeg}°</strong>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px] text-cyan-300">
              SPD: <strong>{telemetry.speedMps} m/s</strong>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px] text-slate-300">
              ALT: <strong>{telemetry.elevationM}m</strong>
            </span>
          </div>

          {/* Camera Selector Pills & Reset Button */}
          <div className="pointer-events-auto flex items-center space-x-1 bg-space-950/85 backdrop-blur border border-slate-700/80 p-1 rounded-lg">
            <button
              onClick={() => {
                setCameraMode('CHASE');
                if (onCameraModeChange) onCameraModeChange('CHASE');
              }}
              className={`px-2.5 py-1 rounded font-mono text-[10px] transition-all cursor-pointer ${cameraMode === 'CHASE'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Follow directly behind rover"
            >
              CHASE
            </button>
            <button
              onClick={() => {
                setCameraMode('ORBIT');
                if (onCameraModeChange) onCameraModeChange('ORBIT');
              }}
              className={`px-2.5 py-1 rounded font-mono text-[10px] transition-all cursor-pointer ${cameraMode === 'ORBIT'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Click and drag to rotate 360°"
            >
              ORBIT
            </button>
            <button
              onClick={() => {
                setCameraMode('PANORAMA');
                if (onCameraModeChange) onCameraModeChange('PANORAMA');
              }}
              className={`px-2.5 py-1 rounded font-mono text-[10px] transition-all cursor-pointer ${cameraMode === 'PANORAMA'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              title="Wide panoramic ridge view"
            >
              PANORAMA
            </button>
            <button
              onClick={handleResetCamera}
              className="px-2 py-1 rounded font-mono text-[10px] text-amber-300 hover:text-amber-100 hover:bg-amber-500/20 transition-all border border-amber-500/40 flex items-center space-x-1 cursor-pointer"
              title="Reset camera view to default rover follow angle"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      )}

      {/* Top-Right Live Interactive Lunar Minimap HUD Overlay */}
      {!hideMinimap && (
        <div className="absolute top-14 right-3 z-10 pointer-events-auto">
          {minimapCollapsed ? (
            <button
              onClick={() => setMinimapCollapsed(false)}
              className="bg-space-950/85 backdrop-blur border border-cyan-500/40 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold text-cyan-300 hover:text-cyan-100 hover:border-cyan-400 flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
              title="Expand Lunar Radar Minimap"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>RADAR [EXPAND]</span>
            </button>
          ) : (
            <div className="w-44 bg-space-950/90 backdrop-blur-md border border-cyan-500/40 rounded-lg p-2 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex flex-col space-y-1.5 transition-all">
              {/* Header: Title & Map Controls */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[9px] font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-bold text-cyan-300 tracking-wider">NAV RADAR</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setMinimapOrientation(prev => prev === 'NORTH' ? 'ROVER' : 'NORTH')}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-all cursor-pointer ${minimapOrientation === 'NORTH'
                        ? 'border-amber-500/50 text-amber-300 bg-amber-500/10'
                        : 'border-cyan-500/50 text-cyan-300 bg-cyan-500/10'
                      }`}
                    title="Toggle North-Up vs Rover-Heading Up"
                  >
                    {minimapOrientation === 'NORTH' ? 'N-UP' : 'R-UP'}
                  </button>
                  <button
                    onClick={() => setMinimapZoom(prev => Math.min(2.4, prev + 0.3))}
                    className="px-1.5 py-0.5 rounded text-[9px] text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700 cursor-pointer"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setMinimapZoom(prev => Math.max(0.8, prev - 0.3))}
                    className="px-1.5 py-0.5 rounded text-[9px] text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700 cursor-pointer"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setMinimapCollapsed(true)}
                    className="p-0.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Collapse Radar"
                  >
                    <Minimize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Radar Canvas */}
              <div className="relative w-full aspect-square rounded overflow-hidden border border-slate-800 bg-black">
                <canvas
                  ref={minimapCanvasRef}
                  width={160}
                  height={160}
                  className="w-full h-full block"
                />
              </div>

              {/* Minimap Footer Readouts */}
              <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 px-0.5">
                <span>X:{Math.round(roverPos.x)} Y:{Math.round(roverPos.y)}</span>
                <span className="text-cyan-300">{Math.round(roverHeading)}°</span>
                <span className="text-amber-400">R:{(95 / minimapZoom).toFixed(0)}m</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Center-Bottom Floating Control Hint Overlay */}
      {!hideInternalHUD && (
        <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-space-950/80 backdrop-blur-md border border-cyan-500/30 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider text-cyan-300 flex items-center space-x-2 shadow-lg">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>DRAG TO ROTATE • SCROLL TO ZOOM</span>
          </div>
        </div>
      )}

      {/* Bottom Educational Disclaimer & Controls Advice */}
      {!hideInternalHUD && (
        <div className="absolute bottom-2 left-3 right-3 z-10 flex items-center justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
          <span className="bg-space-950/80 backdrop-blur px-2 py-0.5 rounded border border-slate-800">
            NASA Artemis High-Fidelity Exploration Simulation // 6-Wheel Heavy Rover
          </span>
          <span className="bg-space-950/80 backdrop-blur px-2 py-0.5 rounded border border-slate-800">
            Controls: WASD / Arrows to Drive • Orbit: Drag / Scroll
          </span>
        </div>
      )}
    </div>
  );
}
