import * as THREE from 'three';
import {
  createGoldMLITexture,
  createSolarGridTexture
} from './lunarPBRTextures';

/**
 * LUNA - THE LAST LIGHT
 * Heavy-duty six-wheel lunar exploration rover.
 *
 * Design goals:
 * - Unified industrial chassis
 * - Integrated rocker-bogie-inspired suspension
 * - Realistic aerospace materials
 * - Cleaner mechanical silhouette
 * - Properly connected components
 */

export function buildLunarRover() {
  const root = new THREE.Group();
  root.name = 'LUNA_Lunar_Rover';

  const goldTexture = createGoldMLITexture();
  const solarTexture = createSolarGridTexture();

  // ------------------------------------------
  // MATERIALS
  // ------------------------------------------

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xc99b49,
    roughness: 0.68,
    metalness: 0.48,
    bumpMap: goldTexture,
    bumpScale: 0.018
  });

  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x929ba4,
    roughness: 0.48,
    metalness: 0.72
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x252d35,
    roughness: 0.65,
    metalness: 0.65
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x343a40,
    roughness: 0.85,
    metalness: 0.28
  });

  const hubMat = new THREE.MeshStandardMaterial({
    color: 0xaeb5b9,
    roughness: 0.38,
    metalness: 0.82
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x15191d,
    roughness: 0.8,
    metalness: 0.25
  });

  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x102f50,
    roughness: 0.4,
    metalness: 0.45,
    map: solarTexture
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x164b68,
    roughness: 0.16,
    metalness: 0.55,
    clearcoat: 0.8
  });

  // ------------------------------------------
  // HELPERS
  // ------------------------------------------

  function addBox(parent, name, size, position, material) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      material
    );

    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);
    return mesh;
  }

  function addCylinder(parent, name, radius, length, position, material) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length, 20),
      material
    );

    mesh.name = name;
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);
    return mesh;
  }

  // Creates a structural beam between two ACTUAL attachment points.
  function addBeam(parent, name, start, end, radius, material) {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);

    const direction = new THREE.Vector3().subVectors(b, a);
    const length = direction.length();

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length, 12),
      material
    );

    mesh.name = name;
    mesh.position.copy(a).add(b).multiplyScalar(0.5);

    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);
    return mesh;
  }

  // ------------------------------------------
  // MAIN CHASSIS
  // ------------------------------------------

  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'Main_Chassis';
  bodyGroup.position.set(0, 1.28, 0);

  root.add(bodyGroup);

  // Main aerospace equipment enclosure
  addBox(
    bodyGroup,
    'Main_Gold_Enclosure',
    [1.95, 0.88, 3.05],
    [0, 0, 0],
    goldMat
  );

  // Lower structural chassis
  addBox(
    bodyGroup,
    'Lower_Chassis',
    [1.78, 0.25, 2.85],
    [0, -0.53, 0],
    darkMetalMat
  );

  // Upper protective equipment deck
  addBox(
    bodyGroup,
    'Upper_Deck',
    [1.85, 0.12, 2.9],
    [0, 0.49, 0],
    titaniumMat
  );

  // Front and rear reinforcement beams
  for (const z of [-1.35, 1.35]) {
    addBox(
      bodyGroup,
      'Chassis_Crossmember',
      [2.05, 0.15, 0.16],
      [0, -0.38, z],
      titaniumMat
    );
  }

  // Side structural rails
  for (const x of [-0.96, 0.96]) {
    addBox(
      bodyGroup,
      'Side_Protection_Rail',
      [0.09, 0.2, 2.9],
      [x, -0.35, 0],
      darkMetalMat
    );
  }

  // ------------------------------------------
  // FRONT EQUIPMENT HOUSING
  // ------------------------------------------

  const frontHousing = new THREE.Group();
  frontHousing.name = 'Front_Equipment_Housing';
  frontHousing.position.set(0, -0.02, -1.65);

  bodyGroup.add(frontHousing);

  const nose = addBox(
    frontHousing,
    'Angular_Front_Housing',
    [1.7, 0.62, 0.72],
    [0, 0, -0.08],
    titaniumMat
  );

  nose.rotation.x = -0.08;

  // Dark front sensor window
  addBox(
    frontHousing,
    'Front_Sensor_Window',
    [1.12, 0.27, 0.035],
    [0, 0.02, -0.455],
    blackMat
  );

  // Protective bumper
  addBox(
    frontHousing,
    'Front_Bumper',
    [2.12, 0.16, 0.16],
    [0, -0.42, -0.48],
    darkMetalMat
  );

  // ------------------------------------------
  // SIX WHEELS
  // ------------------------------------------

  const wheels = [];
  const wheelRims = [];
  const wheelOffsets = [];

  const wheelPositions = [
    { id: 'front-left', x: -1.25, z: -1.12 },
    { id: 'front-right', x: 1.25, z: -1.12 },
    { id: 'middle-left', x: -1.25, z: 0 },
    { id: 'middle-right', x: 1.25, z: 0 },
    { id: 'rear-left', x: -1.25, z: 1.12 },
    { id: 'rear-right', x: 1.25, z: 1.12 }
  ];

  const wheelRadius = 0.57;
  const wheelWidth = 0.40;
  const wheelY = 0.61;

  wheelPositions.forEach((position) => {
    const wheelGroup = new THREE.Group();

    wheelGroup.name = `Wheel_${position.id}`;
    wheelGroup.position.set(
      position.x,
      wheelY,
      position.z
    );

    // Rotating assembly holding rim, cleats, hub and bolts
    // Rotating around X axis rotates the whole wheel assembly smoothly
    const wheelSpinGroup = new THREE.Group();
    wheelSpinGroup.name = `Spin_${position.id}`;
    wheelGroup.add(wheelSpinGroup);
    wheelRims.push(wheelSpinGroup);

    // Main structural wheel drum
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(
        wheelRadius,
        wheelRadius,
        wheelWidth,
        32
      ),
      wheelMat
    );

    rim.rotation.z = Math.PI / 2;
    rim.castShadow = true;
    rim.receiveShadow = true;

    wheelSpinGroup.add(rim);

    // Metallic inner and outer hub assemblies
    for (const side of [-1, 1]) {
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.23, 0.09, 24),
        hubMat
      );

      hub.rotation.z = Math.PI / 2;
      hub.position.x = side * 0.245;
      wheelSpinGroup.add(hub);

      const axleCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.12, 20),
        darkMetalMat
      );

      axleCap.rotation.z = Math.PI / 2;
      axleCap.position.x = side * 0.30;
      wheelSpinGroup.add(axleCap);

      // Hub bolts
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;

        const bolt = new THREE.Mesh(
          new THREE.SphereGeometry(0.025, 8, 8),
          titaniumMat
        );

        bolt.position.set(
          side * 0.30,
          Math.sin(angle) * 0.17,
          Math.cos(angle) * 0.17
        );

        wheelSpinGroup.add(bolt);
      }
    }

    // Deep mechanical traction cleats
    const treadCount = 28;

    for (let i = 0; i < treadCount; i++) {
      const angle = (i / treadCount) * Math.PI * 2;

      const cleat = new THREE.Mesh(
        new THREE.BoxGeometry(
          wheelWidth * 1.05,
          0.075,
          0.14
        ),
        hubMat
      );

      cleat.position.set(
        0,
        Math.sin(angle) * (wheelRadius + 0.018),
        Math.cos(angle) * (wheelRadius + 0.018)
      );

      cleat.rotation.x = angle;
      cleat.castShadow = true;

      wheelSpinGroup.add(cleat);
    }

    root.add(wheelGroup);

    wheels.push(wheelGroup);

    wheelOffsets.push({
      id: position.id,
      x: position.x,
      y: wheelY,
      z: position.z
    });
  });

  // ------------------------------------------
  // INTEGRATED ROCKER-BOGIE SUSPENSION
  // ------------------------------------------

  const suspensionGroup = new THREE.Group();
  suspensionGroup.name = 'Rocker_Bogie_Suspension';

  root.add(suspensionGroup);

  wheelPositions.forEach((wheel) => {
    const side = Math.sign(wheel.x);

    const hubPoint = [
      wheel.x,
      wheelY,
      wheel.z
    ];

    // Main structural rocker arm connects to chassis.
    const chassisPoint = [
      side * 0.83,
      0.91,
      wheel.z * 0.78
    ];

    addBeam(
      suspensionGroup,
      `Suspension_Arm_${wheel.id}`,
      chassisPoint,
      hubPoint,
      0.095,
      darkMetalMat
    );

    // Reinforcement strut
    const strutStart = [
      side * 0.76,
      0.82,
      wheel.z * 0.78
    ];

    const strutEnd = [
      wheel.x - side * 0.05,
      wheelY + 0.06,
      wheel.z
    ];

    addBeam(
      suspensionGroup,
      `Suspension_Strut_${wheel.id}`,
      strutStart,
      strutEnd,
      0.045,
      titaniumMat
    );

    // Mechanical attachment joints
    for (const point of [chassisPoint, hubPoint]) {
      const joint = new THREE.Mesh(
        new THREE.SphereGeometry(0.115, 16, 16),
        hubMat
      );

      joint.position.set(...point);
      suspensionGroup.add(joint);
    }
  });

  // Longitudinal bogie reinforcement
  for (const side of [-1, 1]) {
    addBeam(
      suspensionGroup,
      'Longitudinal_Bogie',
      [side * 0.83, 0.88, -1.0],
      [side * 0.83, 0.88, 1.0],
      0.065,
      darkMetalMat
    );
  }

  // ------------------------------------------
  // SCIENCE AND NAVIGATION EQUIPMENT
  // ------------------------------------------

  // Compact navigation mast
  const mastGroup = new THREE.Group();
  mastGroup.name = 'Navigation_Mast';
  mastGroup.position.set(0.48, 0.52, -0.45);

  bodyGroup.add(mastGroup);

  addCylinder(
    mastGroup,
    'Mast_Base',
    0.09,
    0.22,
    [0, 0, 0],
    darkMetalMat
  );

  addCylinder(
    mastGroup,
    'Mast_Pole',
    0.045,
    0.85,
    [0, 0.48, 0],
    titaniumMat
  );

  addBox(
    mastGroup,
    'Stereo_Camera_Housing',
    [0.58, 0.25, 0.32],
    [0, 0.95, 0],
    darkMetalMat
  );

  for (const x of [-0.19, 0.19]) {
    const lens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.06, 20),
      glassMat
    );

    lens.rotation.x = Math.PI / 2;
    lens.position.set(x, 0.95, -0.18);

    mastGroup.add(lens);
  }

  // ------------------------------------------
  // ROOF-MOUNTED SOLAR ARRAY
  // ------------------------------------------

  const solarGroup = new THREE.Group();
  solarGroup.name = 'Solar_Array';
  solarGroup.position.set(-0.48, 0.55, 0.55);

  bodyGroup.add(solarGroup);

  addBox(
    solarGroup,
    'Solar_Panel_Frame',
    [0.85, 0.055, 1.45],
    [0, 0, 0],
    titaniumMat
  );

  addBox(
    solarGroup,
    'Photovoltaic_Panel',
    [0.78, 0.025, 1.37],
    [0, 0.035, 0],
    solarMat
  );

  // ------------------------------------------
  // COMMUNICATION ANTENNA
  // ------------------------------------------

  const antennaGroup = new THREE.Group();
  antennaGroup.name = 'Communication_Antenna';
  antennaGroup.position.set(-0.65, 0.55, -0.75);

  bodyGroup.add(antennaGroup);

  addCylinder(
    antennaGroup,
    'Antenna_Mount',
    0.11,
    0.18,
    [0, 0, 0],
    darkMetalMat
  );

  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.34,
      24,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    ),
    titaniumMat
  );

  dish.position.y = 0.25;
  dish.rotation.x = Math.PI;
  antennaGroup.add(dish);

  // ------------------------------------------
  // HEADLIGHTS & FORWARD SPOTLIGHTS
  // ------------------------------------------

  const headlights = [];

  for (const x of [-0.72, 0.72]) {
    const light = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.12, 0.12, 20),
      darkMetalMat
    );

    light.rotation.x = Math.PI / 2;
    light.position.set(x, -0.28, -1.56);
    bodyGroup.add(light);

    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.085, 20),
      new THREE.MeshBasicMaterial({
        color: 0xffe9bb
      })
    );

    lens.position.set(x, -0.28, -1.625);
    bodyGroup.add(lens);

    headlights.push(lens);

    // Forward SpotLight cutting through deep shadows
    const spot = new THREE.SpotLight(0xfff1d0, 3.6, 80, Math.PI / 3.8, 0.42, 1.2);
    spot.position.set(x, -0.28, -1.65);
    spot.target.position.set(x, -1.5, -20.0);
    spot.castShadow = true;
    spot.shadow.bias = -0.0008;
    bodyGroup.add(spot);
    bodyGroup.add(spot.target);
  }

  // ------------------------------------------
  // FINAL MODEL SETUP
  // ------------------------------------------

  root.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return {
    root,
    bodyGroup,
    wheels,
    wheelRims,
    wheelOffsets,
    drillGroup: null,
    solarGroup,
    headlights,
    suspensionGroup
  };
}
