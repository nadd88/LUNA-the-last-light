import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  RotateCw, 
  RotateCcw, 
  Compass, 
  Eye, 
  Layers, 
  Sun, 
  Snowflake, 
  AlertTriangle,
  Target,
  Navigation,
  Info
} from 'lucide-react';
import { 
  getTerrainHeight, 
  getTerrainNormal,
  map2DToWorld3D,
  world3DToMap2D,
  CRATERS_2D, 
  LUNAR_BOULDERS 
} from './proceduralLunarTerrain';
import {
  createRegolithTexture,
  createRegolithBumpTexture,
  createRegolithRoughnessTexture
} from './lunarPBRTextures';

/**
 * Interactive 3D Lunar Surface Visualization
 * Replaces the 2D elevation graph with an interactive 3D terrain scene of the landing site.
 * Displays craters, elevation relief, landing zone, shadow boundary, planned rover traverse, and ice targets.
 */
export default function LunarSurface3D({ site, isEngineerMode = false, className = '' }) {
  const mountRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [activeCamAngle, setActiveCamAngle] = useState('perspective'); // 'perspective' | 'topdown'
  const isReducedMotion = useRef(false);

  // Check user reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      isReducedMotion.current = mediaQuery.matches;
      const listener = (e) => { isReducedMotion.current = e.matches; };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  useEffect(() => {
    const domEl = mountRef.current;
    if (!domEl) return;

    // 1. Scene, Camera & WebGL Renderer
    const width = domEl.clientWidth || 400;
    const height = domEl.clientHeight || 200;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.5, 500);
    camera.position.set(0, 36, 54);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    rendererRef.current = renderer;
    domEl.innerHTML = '';
    domEl.appendChild(renderer.domElement);

    // 2. Interactive OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera dipping below terrain horizon
    controls.minDistance = 20;
    controls.maxDistance = 140;
    controls.target.set(0, -6, 2);
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // 3. Lighting Setup (Brightened Lunar Lighting with Rim Definition & Visible PSR Floor)
    const ambientLight = new THREE.AmbientLight(0x384a68, 1.25);
    scene.add(ambientLight);

    // Hemisphere light adds sky-ground ambient gradient so crater walls and valleys are clear
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.1);
    scene.add(hemiLight);

    // Directional polar sunlight skimming the horizon from the north
    const sunLight = new THREE.DirectionalLight(0xfff6e5, 3.0);
    sunLight.position.set(0, 24, -90);
    sunLight.target.position.set(0, -5, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 220;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.bias = -0.0006;

    scene.add(sunLight);
    scene.add(sunLight.target);

    // Blue cold-trap fill for deep shadow contrast and relief visibility
    const coldFill = new THREE.DirectionalLight(0x2d4a75, 0.7);
    coldFill.position.set(0, 40, 80);
    scene.add(coldFill);

    // 4. Site-Calibrated 3D Lunar Terrain Surface
    // Terrain bounds: 140m x 140m centered at origin
    const terrainSize = 140;
    const gridSegments = 90; // 8,100 high-performance quads
    const terrainGeom = new THREE.PlaneGeometry(terrainSize, terrainSize, gridSegments, gridSegments);
    terrainGeom.rotateX(-Math.PI / 2);

    const posAttr = terrainGeom.attributes.position;
    const count = posAttr.count;
    const colors = new Float32Array(count * 3);

    // Color swatches:
    const cSunlitHighland = new THREE.Color(0xe2e8f0); // Bright silvery highland anorthosite
    const cTransitionSlope = new THREE.Color(0x7a8799); // Intermediate slope breccia
    const cDarkBasalt = new THREE.Color(0x242e3f);      // Distinct cryogenic basalt floor with visible relief
    const tempC = new THREE.Color();

    // Site-specific relief scale modifiers
    let elevationScale = 1.0;
    let craterDepthMod = 1.0;
    if (site?.id === 'malapert-mountain') {
      elevationScale = 1.35; // Towering mountain massif
      craterDepthMod = 0.85;
    } else if (site?.id === 'haworth-crater') {
      elevationScale = 0.90;
      craterDepthMod = 1.45; // Deep crater depression
    } else if (site?.id === 'connecting-ridge') {
      elevationScale = 0.85; // Gentle ridge saddle
      craterDepthMod = 0.95;
    }

    // Shadow line in local 3D coords: scaled according to psrDistance
    // psrDistance typically 180m to 920m -> mapped to Z in [-25, +25]
    const shadowLineZ = site?.psrDistance ? ((site.psrDistance / 600) * 80 - 40) : -5;

    for (let i = 0; i < count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);

      // Query procedural terrain height with site-specific modifiers
      let h = getTerrainHeight(vx * 1.3, vz * 1.3) * elevationScale;
      if (vz > shadowLineZ) {
        h -= (vz - shadowLineZ) * 0.12 * craterDepthMod;
      }
      posAttr.setY(i, h);

      // Latitudinal color stratigraphy
      const normalizedLat = (vz + terrainSize / 2) / terrainSize; // 0 (north sun) to 1 (south dark)
      if (normalizedLat < 0.38) {
        tempC.lerpColors(cSunlitHighland, cTransitionSlope, normalizedLat / 0.38);
      } else {
        tempC.lerpColors(cTransitionSlope, cDarkBasalt, (normalizedLat - 0.38) / 0.62);
      }

      // Elevation boost for crest highlights
      const elevBoost = (h - 2.0) * 0.015;
      tempC.r = Math.min(0.98, Math.max(0.12, tempC.r + elevBoost));
      tempC.g = Math.min(0.98, Math.max(0.12, tempC.g + elevBoost));
      tempC.b = Math.min(1.0, Math.max(0.15, tempC.b + elevBoost * 1.1));

      colors[i * 3] = tempC.r;
      colors[i * 3 + 1] = tempC.g;
      colors[i * 3 + 2] = tempC.b;
    }

    terrainGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeom.computeVertexNormals();

    const regolithTex = createRegolithTexture();
    const regolithBump = createRegolithBumpTexture();
    const regolithRough = createRegolithRoughnessTexture();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: regolithTex,
      bumpMap: regolithBump,
      bumpScale: 0.05,
      roughnessMap: regolithRough,
      roughness: 0.82,
      metalness: 0.08
    });

    const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    // 5. Landing Zone Visual Marker (Sunlit Summit Ridge)
    const landingX = -12;
    const landingZ = Math.min(-28, shadowLineZ - 18);
    const landingY = getTerrainHeight(landingX * 1.3, landingZ * 1.3) * elevationScale + 0.3;

    const landingGroup = new THREE.Group();
    landingGroup.position.set(landingX, landingY, landingZ);

    // Target Concentric Rings
    for (const r of [2.8, 4.5, 6.2]) {
      const ringGeom = new THREE.RingGeometry(r - 0.22, r, 32);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      landingGroup.add(ringMesh);
    }

    // Vertical Landing Beacon Pillar
    const beaconGeom = new THREE.CylinderGeometry(0.12, 0.12, 14, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.65
    });
    const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
    beaconMesh.position.y = 7;
    landingGroup.add(beaconMesh);

    // Pulsing diamond crest
    const diamondGeom = new THREE.OctahedronGeometry(0.8, 0);
    const diamondMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const diamondMesh = new THREE.Mesh(diamondGeom, diamondMat);
    diamondMesh.position.y = 14.5;
    landingGroup.add(diamondMesh);

    scene.add(landingGroup);

    // 6. Glowing Shadow Boundary Line Across Terrain
    const shadowLinePoints = [];
    const step = 4;
    for (let x = -terrainSize / 2 + 8; x <= terrainSize / 2 - 8; x += step) {
      const sy = getTerrainHeight(x * 1.3, shadowLineZ * 1.3) * elevationScale + 0.35;
      shadowLinePoints.push(new THREE.Vector3(x, sy, shadowLineZ));
    }
    const shadowLineGeom = new THREE.BufferGeometry().setFromPoints(shadowLinePoints);
    const shadowLineMat = new THREE.LineDashedMaterial({
      color: 0xf59e0b,
      linewidth: 2,
      scale: 1,
      dashSize: 3,
      gapSize: 2
    });
    const shadowLine = new THREE.Line(shadowLineGeom, shadowLineMat);
    shadowLine.computeLineDistances();
    scene.add(shadowLine);

    // 7. Planned Rover Exploration Route (Spline Traverse Curve)
    // Starts at landing site, descends past shadow line, visits ice pockets, loops back
    const routeWaypoints = [
      new THREE.Vector3(landingX, landingY, landingZ),
      new THREE.Vector3(landingX + 8, (landingY - 3), (landingZ + shadowLineZ) / 2),
      new THREE.Vector3(0, (landingY - 7), shadowLineZ + 4),
      new THREE.Vector3(14, (landingY - 12), shadowLineZ + 18),
      new THREE.Vector3(-10, (landingY - 15), shadowLineZ + 32),
      new THREE.Vector3(8, (landingY - 17), shadowLineZ + 44)
    ];

    // Ensure route hugs the actual 3D terrain profile
    const routePoints = routeWaypoints.map((pt) => {
      const actualY = getTerrainHeight(pt.x * 1.3, pt.z * 1.3) * elevationScale;
      return new THREE.Vector3(pt.x, actualY + 0.45, pt.z);
    });

    const routeCurve = new THREE.CatmullRomCurve3(routePoints);
    const tubeGeom = new THREE.TubeGeometry(routeCurve, 48, 0.28, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85
    });
    const routeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    scene.add(routeMesh);

    // Waypoint dots along the route
    const waypointsGroup = new THREE.Group();
    routePoints.forEach((pt, idx) => {
      if (idx === 0) return; // skip start (covered by landing beacon)
      const dotGeom = new THREE.SphereGeometry(0.55, 12, 12);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const dotMesh = new THREE.Mesh(dotGeom, dotMat);
      dotMesh.position.copy(pt);
      waypointsGroup.add(dotMesh);
    });
    scene.add(waypointsGroup);

    // 8. Candidate Ice Target Beacons inside the Cold Trap
    const iceTargetsGroup = new THREE.Group();
    const sitePockets = site?.iceDepositProfile?.pockets || [
      { x: 300, y: 380, concentration: 5.5 },
      { x: 420, y: 460, concentration: 8.2 },
      { x: 220, y: 510, concentration: 9.8 }
    ];

    // Display top 3 distinct candidate ice targets
    sitePockets.slice(0, 3).forEach((pocket, idx) => {
      const worldP = map2DToWorld3D(pocket.x, pocket.y);
      const px = (worldP.x * 0.45);
      const pz = Math.max(shadowLineZ + 12, worldP.z * 0.45);
      const py = getTerrainHeight(px * 1.3, pz * 1.3) * elevationScale + 0.4;

      const crystalGroup = new THREE.Group();
      crystalGroup.position.set(px, py, pz);

      // Crystalline Volatile Prism
      const crystalGeom = new THREE.OctahedronGeometry(0.85, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.4
      });
      const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
      crystalMesh.position.y = 1.0;
      crystalGroup.add(crystalMesh);

      // Ground glow ring
      const ringGeom = new THREE.RingGeometry(1.2, 1.5, 24);
      ringGeom.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      crystalGroup.add(ringMesh);

      iceTargetsGroup.add(crystalGroup);
    });
    scene.add(iceTargetsGroup);

    // 9. Slope Hazard Marker (Placed on steep descent section)
    const hazardGroup = new THREE.Group();
    const hazardX = 4;
    const hazardZ = shadowLineZ - 6;
    const hazardY = getTerrainHeight(hazardX * 1.3, hazardZ * 1.3) * elevationScale + 0.4;
    hazardGroup.position.set(hazardX, hazardY, hazardZ);

    const warnGeom = new THREE.ConeGeometry(0.9, 1.8, 4);
    const warnMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });
    const warnMesh = new THREE.Mesh(warnGeom, warnMat);
    warnMesh.position.y = 1.0;
    hazardGroup.add(warnMesh);
    scene.add(hazardGroup);

    // 10. Scattered Landmark Boulders for Geological Realism
    const boulderGeom = new THREE.DodecahedronGeometry(1.2, 1);
    const boulderMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      metalness: 0.1
    });

    LUNAR_BOULDERS.slice(0, 8).forEach((b) => {
      const bx = b.x * 0.45;
      const bz = b.z * 0.45;
      const by = getTerrainHeight(bx * 1.3, bz * 1.3) * elevationScale;

      const rock = new THREE.Mesh(boulderGeom, boulderMat);
      rock.scale.setScalar((b.scale || 2.0) * 0.5);
      rock.position.set(bx, by, bz);
      rock.rotation.set(0.2, b.rot || 0, 0.1);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scene.add(rock);
    });

    // 11. Animation & Render Loop
    let time = 0;
    const renderLoop = () => {
      time += 0.025;

      // Subtle pulse on landing diamond and ice crystals
      diamondMesh.position.y = 14.5 + Math.sin(time * 2.0) * 0.35;
      diamondMesh.rotation.y += 0.015;

      iceTargetsGroup.children.forEach((crystal, idx) => {
        crystal.children[0].position.y = 1.0 + Math.sin(time * 2.2 + idx) * 0.25;
        crystal.children[0].rotation.y += 0.02;
      });

      controls.update();
      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    // 12. ResizeObserver for Adaptive Fit
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW > 0 && newH > 0 && camera && renderer) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(domEl);

    // 13. Resource Cleanup on Unmount / Site Change
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      controls.dispose();

      // Dispose all scene geometries & materials
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });

      renderer.dispose();
      if (domEl && renderer.domElement && domEl.contains(renderer.domElement)) {
        domEl.removeChild(renderer.domElement);
      }
    };
  }, [site]);

  // Handler: Reset Camera to Initial Oblique Angle
  const handleResetCamera = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 36, 54);
    controlsRef.current.target.set(0, -6, 2);
    controlsRef.current.update();
    setActiveCamAngle('perspective');
  }, []);

  // Handler: Top-Down Satellite View Toggle
  const handleToggleTopDown = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (activeCamAngle === 'topdown') {
      handleResetCamera();
    } else {
      cameraRef.current.position.set(0, 85, 0.5);
      controlsRef.current.target.set(0, -6, 0);
      controlsRef.current.update();
      setActiveCamAngle('topdown');
    }
  }, [activeCamAngle, handleResetCamera]);

  // Handler: Auto-Rotate Toggle
  const handleToggleAutoRotate = useCallback(() => {
    if (!controlsRef.current) return;
    const next = !isAutoRotate;
    setIsAutoRotate(next);
    controlsRef.current.autoRotate = next;
  }, [isAutoRotate]);

  return (
    <div className={`flex-1 min-h-0 w-full bg-space-950/90 rounded-lg border border-slate-800 p-2 relative flex flex-col justify-between overflow-hidden select-none ${className}`}>
      {/* 1. Header Bar: Title, Interactive Cue & Quick View Controls */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1 z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-cyan-400 font-display flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lunar Surface</span>
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Drag to rotate · Scroll to zoom
          </span>
        </div>

        {/* Action Controls: Reset View · Top-Down · Auto-Rotate */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleToggleTopDown}
            className={`p-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
              activeCamAngle === 'topdown'
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                : 'bg-space-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-space-800'
            }`}
            title="Top-down satellite angle"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleToggleAutoRotate}
            className={`p-1 rounded text-[11px] font-mono border transition-all cursor-pointer ${
              isAutoRotate
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                : 'bg-space-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-space-800'
            }`}
            title="Toggle cinematic orbit rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin-slow' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleResetCamera}
            className="p-1 rounded text-[11px] font-mono border bg-space-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-space-800 transition-all cursor-pointer"
            title="Reset perspective view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Three.js Canvas Mount */}
      <div 
        ref={mountRef} 
        className="w-full flex-1 min-h-0 rounded bg-space-950 relative overflow-hidden cursor-grab active:cursor-grabbing"
      />

      {/* 3. Streamlined Clean Legend Bar (Simple English) */}
      <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-slate-300 pt-1.5 px-0.5 border-t border-slate-800/80 z-10 shrink-0">
        <span className="flex items-center space-x-1 text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-cyan-500/40" />
          <span>Landing Zone</span>
        </span>

        <span className="flex items-center space-x-1 text-cyan-300">
          <span className="w-3.5 h-0.5 bg-cyan-400 rounded" />
          <span>Planned Route</span>
        </span>

        <span className="flex items-center space-x-1 text-amber-400">
          <span className="w-2.5 h-0.5 bg-amber-400 rounded-sm" />
          <span>Shadow Line ({site?.psrDistance || 450}m)</span>
        </span>

        <span className="flex items-center space-x-1 text-emerald-400">
          <span className="w-2 h-2 rotate-45 bg-emerald-400 rounded-[1px]" />
          <span>Ice Target</span>
        </span>

        <span className="flex items-center space-x-1 text-amber-300">
          <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-amber-400" />
          <span>Slope Hazard</span>
        </span>
      </div>
    </div>
  );
}
