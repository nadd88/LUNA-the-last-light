import * as THREE from 'three';

// Procedural PBR Texture Generators for LUNA Lunar Simulation
// Photorealistic lunar regolith, Multi-Layer Insulation (MLI), and Earth textures
// Inspired by Apollo lunar surface photography, LRO NAC imagery, and Lunar Sourcebook data.

/**
 * Generates a wrinkled gold Multi-Layer Insulation (MLI) normal/bump texture.
 * Real aerospace MLI has characteristic diamond and crinkle quilt patterns from hand-application.
 */
export function createGoldMLITexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base metallic amber-gold background
  ctx.fillStyle = '#b45309';
  ctx.fillRect(0, 0, size, size);

  // Draw quilted insulation seam grid
  const gridSize = 64;
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2;
  for (let x = 0; x < size; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Draw simulated foil wrinkles and crinkles
  for (let i = 0; i < 450; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 10 + Math.random() * 35;
    const angle = Math.random() * Math.PI * 2;
    const brightness = Math.random();

    ctx.strokeStyle = brightness > 0.5 
      ? `rgba(253, 224, 71, ${0.25 + brightness * 0.35})` 
      : `rgba(69, 26, 3, ${0.3 + (1 - brightness) * 0.4})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  // Add micro-noise flecks for metallic foil sheen
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 25;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));         // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.8)); // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.2)); // B
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// -------------------------------------------------------------
// PHOTOREALISTIC PROCEDURAL LUNAR REGOLITH PBR TEXTURES
// -------------------------------------------------------------

/**
 * Generates a photorealistic seamless lunar regolith albedo/color map (1024x1024).
 * Recreates the authentic optical appearance of Apollo lunar soil:
 * - High-roughness diffuse grey regolith with subtle variations (highland anorthosite vs mare basalt)
 * - Fine-grained sub-millimeter dusty soil texture
 * - Small embedded angular lithic rock fragments & bright plagioclase clasts
 * - Tiny impact pits with raised sunlit rims and micro-shadow interiors
 * - Agglutinate glass spherules and dark pyroclastic specks
 */
export function createRegolithTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 1. Base lunar regolith neutral grey
  ctx.fillStyle = '#6e7683';
  ctx.fillRect(0, 0, size, size);

  // 2. Multi-octave broadband geological mottling (darker basaltic patches & brighter anorthosite swirls)
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Simple deterministic integer hash for texture generation
  const prng = (seed) => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  const rand = prng(19690720); // Apollo 11 landing date seed

  // Generate multi-frequency Perlin-style value noise for color variation
  const noiseGrid1 = 64;
  const gridVals1 = new Float32Array(noiseGrid1 * noiseGrid1);
  for (let i = 0; i < gridVals1.length; i++) gridVals1[i] = (rand() - 0.5) * 48;

  const noiseGrid2 = 128;
  const gridVals2 = new Float32Array(noiseGrid2 * noiseGrid2);
  for (let i = 0; i < gridVals2.length; i++) gridVals2[i] = (rand() - 0.5) * 26;

  for (let y = 0; y < size; y++) {
    const gy1 = (y / size) * noiseGrid1;
    const iy1 = Math.floor(gy1);
    const fy1 = gy1 - iy1;
    const sy1 = fy1 * fy1 * (3 - 2 * fy1);

    const gy2 = (y / size) * noiseGrid2;
    const iy2 = Math.floor(gy2);
    const fy2 = gy2 - iy2;
    const sy2 = fy2 * fy2 * (3 - 2 * fy2);

    for (let x = 0; x < size; x++) {
      const gx1 = (x / size) * noiseGrid1;
      const ix1 = Math.floor(gx1);
      const fx1 = gx1 - ix1;
      const sx1 = fx1 * fx1 * (3 - 2 * fx1);

      const gx2 = (x / size) * noiseGrid2;
      const ix2 = Math.floor(gx2);
      const fx2 = gx2 - ix2;
      const sx2 = fx2 * fx2 * (3 - 2 * fx2);

      // Bilinear sample with wrapping
      const ix1_next = (ix1 + 1) % noiseGrid1;
      const iy1_next = (iy1 + 1) % noiseGrid1;
      const n1 = (gridVals1[iy1 * noiseGrid1 + ix1] * (1 - sx1) + gridVals1[iy1 * noiseGrid1 + ix1_next] * sx1) * (1 - sy1) +
                 (gridVals1[iy1_next * noiseGrid1 + ix1] * (1 - sx1) + gridVals1[iy1_next * noiseGrid1 + ix1_next] * sx1) * sy1;

      const ix2_next = (ix2 + 1) % noiseGrid2;
      const iy2_next = (iy2 + 1) % noiseGrid2;
      const n2 = (gridVals2[iy2 * noiseGrid2 + ix2] * (1 - sx2) + gridVals2[iy2 * noiseGrid2 + ix2_next] * sx2) * (1 - sy2) +
                 (gridVals2[iy2_next * noiseGrid2 + ix2] * (1 - sx2) + gridVals2[iy2_next * noiseGrid2 + ix2_next] * sx2) * sy2;

      // High-frequency sub-millimeter regolith dust noise
      const grain = (rand() - 0.5) * 32;

      const baseVal = 110 + n1 + n2 + grain;
      const r = Math.min(240, Math.max(30, baseVal));
      const g = Math.min(240, Math.max(30, baseVal * 0.99));
      const b = Math.min(245, Math.max(35, baseVal * 1.02)); // Subtle cold titanium/space weathering tint

      const idx = (y * size + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Helper for drawing seamless wrapped features
  const drawSeamless = (drawFn, cx, cy, margin) => {
    drawFn(cx, cy);
    if (cx < margin) drawFn(cx + size, cy);
    if (cx > size - margin) drawFn(cx - size, cy);
    if (cy < margin) drawFn(cx, cy + size);
    if (cy > size - margin) drawFn(cx, cy - size);
    if (cx < margin && cy < margin) drawFn(cx + size, cy + size);
    if (cx > size - margin && cy > size - margin) drawFn(cx - size, cy - size);
    if (cx < margin && cy > size - margin) drawFn(cx + size, cy - size);
    if (cx > size - margin && cy < margin) drawFn(cx - size, cy + size);
  };

  // 3. Draw small embedded stones & lithic rock fragments (sharp angular polygonal clasts)
  for (let i = 0; i < 350; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const rad = 1.2 + rand() * 4.8;
    const sides = 4 + Math.floor(rand() * 4);
    const rot = rand() * Math.PI * 2;
    const isAnorthosite = rand() > 0.45; // 55% light anorthosite, 45% dark pyroxene/basalt
    const brightness = isAnorthosite ? (180 + rand() * 55) : (45 + rand() * 35);

    drawSeamless((ox, oy) => {
      // Soft shadow under stone
      ctx.beginPath();
      ctx.ellipse(ox + rad * 0.35, oy + rad * 0.35, rad * 1.1, rad * 0.8, rot, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 15, 25, 0.45)';
      ctx.fill();

      // Stone body
      ctx.beginPath();
      for (let s = 0; s < sides; s++) {
        const angle = rot + (s / sides) * Math.PI * 2;
        const rVar = rad * (0.75 + rand() * 0.45);
        const px = ox + Math.cos(angle) * rVar;
        const py = oy + Math.sin(angle) * rVar;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.98}, ${brightness * 1.02})`;
      ctx.fill();

      // Sharp sunward facet highlight (simulating grazing sunlight)
      ctx.beginPath();
      ctx.arc(ox - rad * 0.25, oy - rad * 0.25, rad * 0.6, Math.PI * 0.7, Math.PI * 1.7);
      ctx.strokeStyle = isAnorthosite ? 'rgba(255, 255, 255, 0.75)' : 'rgba(180, 190, 205, 0.55)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }, cx, cy, rad * 3);
  }

  // 4. Draw tiny impact pits (micro-craters with raised ejecta lips)
  for (let i = 0; i < 220; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const rad = 2.0 + rand() * 7.5;

    drawSeamless((ox, oy) => {
      // Outer ejecta halo (slightly lighter powdered soil)
      ctx.beginPath();
      ctx.arc(ox, oy, rad * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220, 228, 240, 0.12)';
      ctx.fill();

      // Shadowed crater interior bowl
      ctx.beginPath();
      ctx.arc(ox, oy, rad, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(12, 18, 28, 0.65)';
      ctx.fill();

      // Raised sunlit rim crest facing the low sun (top-left)
      ctx.beginPath();
      ctx.arc(ox - rad * 0.2, oy - rad * 0.2, rad * 1.05, Math.PI * 0.75, Math.PI * 1.85);
      ctx.strokeStyle = 'rgba(240, 246, 255, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }, cx, cy, rad * 3);
  }

  // 5. Agglutinate glass spherules & micro-specks
  for (let i = 0; i < 600; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const rad = 0.6 + rand() * 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = rand() > 0.5 ? 'rgba(15, 20, 30, 0.85)' : 'rgba(255, 255, 255, 0.6)';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Generates a high-precision lunar regolith bump / height displacement map (1024x1024).
 * Translates micro-topography, stone facets, and crater rims into height data for grazing light response.
 */
export function createRegolithBumpTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Neutral height baseline (128 = 0 displacement)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  const prng = (seed) => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  const rand = prng(19721207); // Apollo 17 landing date seed

  // Porous "fairy-castle" regolith micro-roughness noise
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * 38;
    const h = Math.min(255, Math.max(0, 128 + n));
    data[i] = h;
    data[i + 1] = h;
    data[i + 2] = h;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const drawSeamless = (drawFn, cx, cy, margin) => {
    drawFn(cx, cy);
    if (cx < margin) drawFn(cx + size, cy);
    if (cx > size - margin) drawFn(cx - size, cy);
    if (cy < margin) drawFn(cx, cy + size);
    if (cy > size - margin) drawFn(cx, cy - size);
  };

  // Elevated stones in bump map (bright = raised height)
  for (let i = 0; i < 350; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const rad = 1.2 + rand() * 4.8;
    const sides = 4 + Math.floor(rand() * 4);
    const rot = rand() * Math.PI * 2;
    const heightOffset = 180 + Math.floor(rand() * 55);

    drawSeamless((ox, oy) => {
      ctx.beginPath();
      for (let s = 0; s < sides; s++) {
        const angle = rot + (s / sides) * Math.PI * 2;
        const rVar = rad * (0.8 + rand() * 0.4);
        const px = ox + Math.cos(angle) * rVar;
        const py = oy + Math.sin(angle) * rVar;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `rgb(${heightOffset}, ${heightOffset}, ${heightOffset})`;
      ctx.fill();
    }, cx, cy, rad * 3);
  }

  // Micro-craters in bump map (dark bowl = negative height, bright rim = elevated ejecta lip)
  for (let i = 0; i < 220; i++) {
    const cx = rand() * size;
    const cy = rand() * size;
    const rad = 2.0 + rand() * 7.5;

    drawSeamless((ox, oy) => {
      // Raised rim ring (elevated height 170-195)
      ctx.beginPath();
      ctx.arc(ox, oy, rad * 1.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgb(185, 185, 185)';
      ctx.lineWidth = rad * 0.5;
      ctx.stroke();

      // Depressed crater bowl (deep depression 45-75)
      ctx.beginPath();
      ctx.arc(ox, oy, rad, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(60, 60, 60)';
      ctx.fill();
    }, cx, cy, rad * 3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Generates a lunar regolith roughness variation map (512x512).
 * Porous regolith dust is extremely matte (0.95-0.98), whereas crystalline rock facets
 * and glassy agglutinate spherules exhibit sharper specular reflection (0.70-0.78).
 */
export function createRegolithRoughnessTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Baseline ultra-matte soil (~0.95 roughness => ~242 byte value)
  ctx.fillStyle = '#f2f2f2';
  ctx.fillRect(0, 0, size, size);

  // Micro-variation in dust compaction
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    const val = Math.min(255, Math.max(225, 242 + n));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Glassy spherules and polished stone facets (lower roughness = shinier, ~175-195)
  for (let i = 0; i < 280; i++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const rad = 1.0 + Math.random() * 3.5;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(180, 180, 180)';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Generates a photorealistic Earth equirectangular texture (2048x1024)
 * inspired by NASA Apollo 8/17 "Blue Marble" and LRO Earthrise photography.
 *
 * Features:
 * - Natural ocean depth gradients (deep abyssal navy to vibrant shelf turquoise)
 * - Geographically accurate continental coastlines with fractal mid-point displacement
 * - Distinct, scientifically plausible biomes:
 *     * Lush temperate and tropical green rainforests (Amazon, Congo, Europe, East Asia)
 *     * Arid deserts and golden-brown plateaus (Sahara, Arabia, Gobi, Australian Outback)
 *     * Rocky mountain ranges with snow caps (Himalayas, Andes, Rockies)
 *     * Polar glacial ice sheets (Antarctica, Greenland)
 * - Natural swirling cloud formations (equatorial ITCZ, mid-latitude cyclonic spirals, trade-wind cumulus)
 * - Soft orbital cloud drop shadows cast onto land and sea for true 3D planetary relief
 */
export function createEarthTexture() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Pseudo-random deterministic generator for consistent high-detail rendering
  let seed = 987654321;
  const rand = () => {
    seed = (seed * 16807 + 11) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Convert longitude (-180 to 180) and latitude (-90 to 90) to canvas (X, Y)
  const lonLatToXY = (lon, lat) => ({
    x: ((lon + 180) / 360) * width,
    y: ((90 - lat) / 180) * height
  });

  // -----------------------------------------------------------------
  // 1. DEEP OCEAN & BATHYMETRY
  // -----------------------------------------------------------------
  // Base deep oceanic gradient from equatorial tropical waters to cold polar depths
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0.00, '#021832'); // Arctic Ocean
  oceanGrad.addColorStop(0.18, '#03264d'); // North Atlantic / North Pacific
  oceanGrad.addColorStop(0.38, '#063f78'); // Subtropical open sea
  oceanGrad.addColorStop(0.50, '#0a4b8c'); // Equatorial vibrant oceanic blue
  oceanGrad.addColorStop(0.62, '#063f78'); // South tropical ocean
  oceanGrad.addColorStop(0.82, '#03264d'); // Southern Ocean
  oceanGrad.addColorStop(1.00, '#021832'); // Antarctic waters
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ocean gyres & currents (deep navy vs sapphire variations)
  for (let i = 0; i < 28; i++) {
    const cx = rand() * width;
    const cy = 200 + rand() * (height - 400);
    const rx = 140 + rand() * 260;
    const ry = 40 + rand() * 90;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    g.addColorStop(0, 'rgba(10, 75, 140, 0.18)');
    g.addColorStop(0.7, 'rgba(4, 45, 95, 0.08)');
    g.addColorStop(1, 'rgba(2, 24, 50, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, (rand() - 0.5) * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // -----------------------------------------------------------------
  // 2. FRACTAL COASTLINE SUBDIVISION & CONTINENT RENDERING
  // -----------------------------------------------------------------
  // Subdivides key polygonal control points with pseudo-fractal displacement
  // to produce natural jagged coastlines, bays, headlands, and fjords.
  const buildFractalCoast = (points, iterations = 2, maxDisplace = 4.5) => {
    let current = points.map(pt => lonLatToXY(pt[0], pt[1]));

    for (let iter = 0; iter < iterations; iter++) {
      const next = [];
      const disp = maxDisplace / (iter + 1);
      for (let i = 0; i < current.length; i++) {
        const p1 = current[i];
        const p2 = current[(i + 1) % current.length];
        next.push(p1);

        // Midpoint with normal-perpendicular displacement
        const midX = (p1.x + p2.x) * 0.5;
        const midY = (p1.y + p2.y) * 0.5;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy) || 1;
        const perpX = -dy / len;
        const perpY = dx / len;
        const offset = (rand() - 0.5) * disp * Math.min(len * 0.35, 18);

        next.push({
          x: midX + perpX * offset,
          y: midY + perpY * offset
        });
      }
      current = next;
    }
    return current;
  };

  const drawPath = (pts) => {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
  };

  // -----------------------------------------------------------------
  // CONTINENTAL GEOGRAPHY DEFINITIONS (Accurate global landmasses)
  // -----------------------------------------------------------------

  // 1. AFRICA
  const africaGeo = [
    [-5, 36], [10, 37], [25, 32], [32, 31], [34, 27], [43, 13], [51, 12],
    [49, 9], [42, 2], [39, -5], [36, -15], [33, -27], [26, -34], [18, -34],
    [12, -26], [12, -15], [9, -4], [3, 5], [-8, 4], [-13, 8], [-17, 14],
    [-16, 21], [-11, 28], [-5, 36]
  ];

  // 2. EURASIA
  const eurasiaGeo = [
    [-9, 43], [-2, 43], [3, 42], [8, 44], [14, 40], [18, 40], [21, 37],
    [26, 40], [29, 41], [35, 36], [35, 32], [42, 30], [50, 26], [58, 24],
    [68, 24], [72, 19], [77, 8], [80, 13], [87, 21], [92, 21], [98, 16],
    [103, 10], [108, 14], [107, 21], [118, 24], [122, 31], [121, 38],
    [126, 38], [129, 35], [128, 40], [131, 43], [140, 48], [155, 58],
    [170, 65], [178, 67], [165, 70], [140, 73], [110, 75], [80, 73],
    [50, 69], [30, 70], [18, 68], [12, 57], [6, 54], [1, 51], [-4, 48]
  ];

  // 3. NORTH AMERICA
  const northAmericaGeo = [
    [-168, 65], [-160, 70], [-140, 70], [-120, 69], [-95, 68], [-80, 62],
    [-65, 58], [-55, 52], [-58, 46], [-66, 44], [-74, 40], [-76, 35],
    [-80, 31], [-80, 25], [-82, 25], [-85, 30], [-94, 29], [-97, 26],
    [-97, 21], [-90, 21], [-87, 18], [-93, 16], [-100, 18], [-105, 22],
    [-110, 23], [-115, 30], [-117, 32], [-122, 37], [-124, 45], [-125, 49],
    [-132, 56], [-140, 60], [-152, 60], [-162, 55], [-168, 65]
  ];

  // 4. SOUTH AMERICA
  const southAmericaGeo = [
    [-76, 9], [-72, 12], [-62, 10], [-52, 5], [-44, 0], [-35, -5],
    [-35, -8], [-38, -13], [-40, -20], [-48, -28], [-53, -33], [-58, -38],
    [-65, -43], [-68, -50], [-66, -55], [-73, -53], [-74, -45], [-72, -35],
    [-70, -20], [-76, -14], [-81, -5], [-78, 2], [-76, 9]
  ];

  // 5. AUSTRALIA
  const australiaGeo = [
    [114, -22], [118, -20], [126, -14], [136, -12], [142, -11], [145, -15],
    [149, -21], [153, -28], [150, -35], [146, -39], [138, -36], [130, -32],
    [118, -35], [115, -34], [113, -27], [114, -22]
  ];

  // 6. GREENLAND
  const greenlandGeo = [
    [-52, 60], [-43, 60], [-25, 70], [-20, 80], [-40, 83], [-55, 78], [-55, 68], [-52, 60]
  ];

  // 7. ANTARCTICA (South Polar Continent)
  const antarcticaGeo = [
    [-180, -78], [-140, -74], [-100, -73], [-65, -63], [-58, -63], [-45, -72],
    [0, -70], [45, -67], [90, -65], [135, -66], [160, -72], [180, -78],
    [180, -90], [-180, -90]
  ];

  // Convert to fractal coastlines
  const africaPts = buildFractalCoast(africaGeo, 3, 5.0);
  const eurasiaPts = buildFractalCoast(eurasiaGeo, 3, 5.5);
  const northAmericaPts = buildFractalCoast(northAmericaGeo, 3, 5.2);
  const southAmericaPts = buildFractalCoast(southAmericaGeo, 3, 5.0);
  const australiaPts = buildFractalCoast(australiaGeo, 3, 4.2);
  const greenlandPts = buildFractalCoast(greenlandGeo, 2, 4.0);
  const antarcticaPts = buildFractalCoast(antarcticaGeo, 2, 6.0);

  const landmasses = [
    africaPts,
    eurasiaPts,
    northAmericaPts,
    southAmericaPts,
    australiaPts,
    greenlandPts,
    antarcticaPts
  ];

  // -----------------------------------------------------------------
  // 3. CONTINENTAL SHELVES & TURQUOISE SHALLOWS
  // -----------------------------------------------------------------
  // Renders beautiful, photorealistic cyan/turquoise shallows around coasts
  ctx.save();
  ctx.lineJoin = 'round';

  // Broad soft turquoise shelf
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.38)';
  ctx.lineWidth = 14;
  landmasses.forEach(pts => {
    drawPath(pts);
    ctx.stroke();
  });

  // Brighter azure coastal margin
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)';
  ctx.lineWidth = 6;
  landmasses.forEach(pts => {
    drawPath(pts);
    ctx.stroke();
  });

  // Vivid cyan tropical reef fringes (Bahamas, Great Barrier Reef, Caribbean, Red Sea)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 2.5;
  landmasses.forEach(pts => {
    drawPath(pts);
    ctx.stroke();
  });
  ctx.restore();

  // -----------------------------------------------------------------
  // 4. CONTINENTAL LAND BIOMES (Natural green vegetation & warm deserts)
  // -----------------------------------------------------------------
  // Base land fill: balanced fertile earth-green (#1b6832) for temperate land
  ctx.fillStyle = '#1e6b35';
  landmasses.forEach(pts => {
    drawPath(pts);
    ctx.fill();
  });

  // A. DESERTS & ARID REGIONS (Sahara, Arabia, Gobi, Australian Outback, US Southwest)
  const drawDesertRegion = (lon, lat, rx, ry, color) => {
    const pt = lonLatToXY(lon, lat);
    const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, rx);
    grad.addColorStop(0, color);
    grad.addColorStop(0.7, color);
    grad.addColorStop(1, 'rgba(30, 107, 53, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, rx, ry, 0.1, 0, Math.PI * 2);
    ctx.fill();
  };

  ctx.save();
  // Sahara Desert: warm golden-ochre and desert sand tan
  drawDesertRegion(18, 23, 140, 55, '#d97706');
  drawDesertRegion(25, 25, 110, 45, '#ca8a04');
  drawDesertRegion(10, 20, 90, 40, '#b45309');
  // Arabian Peninsula: sandy desert
  drawDesertRegion(46, 23, 50, 45, '#d97706');
  // Gobi & Taklamakan Deserts: Central Asia cold desert tan
  drawDesertRegion(95, 41, 80, 32, '#ca8a04');
  drawDesertRegion(85, 39, 45, 22, '#b45309');
  // Australian Outback: iconic red-ochre sandstone
  drawDesertRegion(134, -25, 75, 48, '#b45309');
  drawDesertRegion(130, -26, 50, 35, '#9a3412');
  // US Southwest / Mojave / Sonoran: dry chaparral & sand
  drawDesertRegion(-110, 32, 45, 28, '#ca8a04');
  // Atacama Desert: coastal South American arid stripe
  drawDesertRegion(-70, -22, 18, 55, '#b45309');
  // Kalahari Desert (Southern Africa)
  drawDesertRegion(22, -23, 35, 30, '#ca8a04');
  ctx.restore();

  // B. LUSH TROPICAL & TEMPERATE RAINFORESTS (Clearly visible deep emerald green)
  const drawRainforest = (lon, lat, rx, ry, color = '#14532d') => {
    const pt = lonLatToXY(lon, lat);
    const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, rx);
    grad.addColorStop(0, color);
    grad.addColorStop(0.75, color);
    grad.addColorStop(1, 'rgba(20, 83, 45, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, rx, ry, (rand() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  ctx.save();
  // Amazon Basin: massive lush tropical rainforest
  drawRainforest(-60, -3, 120, 75, '#14532d');
  drawRainforest(-55, -8, 90, 60, '#15803d');
  drawRainforest(-65, 2, 70, 45, '#166534');

  // Congo Basin (Central Africa): dense tropical rainforest
  drawRainforest(22, 0, 75, 55, '#14532d');
  drawRainforest(25, -2, 55, 40, '#166534');

  // Southeast Asia & Indonesian Archipelago: rich equatorial rainforest
  drawRainforest(103, 14, 45, 35, '#15803d');
  drawRainforest(112, 0, 85, 30, '#166534');

  // North American Eastern Temperate Forest & Great Lakes
  drawRainforest(-84, 38, 70, 50, '#15803d');
  drawRainforest(-75, 42, 50, 35, '#166534');
  drawRainforest(-122, 48, 25, 40, '#166534'); // Pacific Northwest lush forest

  // European Mixed Forests
  drawRainforest(15, 50, 75, 35, '#15803d');
  drawRainforest(28, 55, 80, 38, '#166534');

  // Siberian Taiga (Immense northern boreal spruce/pine forest)
  drawRainforest(70, 60, 160, 40, '#14532d');
  drawRainforest(110, 60, 160, 42, '#164e29');
  drawRainforest(145, 62, 100, 35, '#14532d');

  // Canadian Boreal Forest (North of Great Lakes)
  drawRainforest(-105, 56, 130, 38, '#164e29');
  drawRainforest(-80, 52, 90, 35, '#14532d');

  // Eastern Australia Coastal Green Belt
  drawRainforest(151, -29, 22, 60, '#15803d');
  ctx.restore();

  // C. MOUNTAIN RANGES & HIMALAYAS SNOW CRESTS
  const drawMountainRidge = (coords, widthPx, color) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = widthPx;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const start = lonLatToXY(coords[0][0], coords[0][1]);
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < coords.length; i++) {
      const p = lonLatToXY(coords[i][0], coords[i][1]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  };

  // Himalayas & Tibetan Plateau: grey slate rock + pure snow crest
  drawMountainRidge([[73, 34], [80, 30], [88, 28], [97, 28]], 10, '#57534e');
  drawMountainRidge([[74, 34], [81, 30], [88, 28], [96, 28]], 4, '#f8fafc'); // White snow crests
  // Andes: North-South high mountain spine
  drawMountainRidge([[-75, 4], [-77, -8], [-71, -18], [-70, -32], [-72, -45]], 6, '#57534e');
  drawMountainRidge([[-75, 4], [-77, -8], [-71, -18], [-70, -32], [-72, -45]], 2.5, '#e2e8f0');
  // Rocky Mountains
  drawMountainRidge([[-115, 52], [-111, 44], [-106, 36]], 7, '#57534e');
  drawMountainRidge([[-115, 52], [-111, 44], [-106, 36]], 2.5, '#e2e8f0');

  // D. POLAR GLACIAL ICE SHEETS (Antarctica & Greenland pure white)
  ctx.fillStyle = '#f8fafc';
  drawPath(greenlandPts);
  ctx.fill();
  drawPath(antarcticaPts);
  ctx.fill();

  // Glacial ice shelf borders (subtle ice-blue tint)
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
  ctx.lineWidth = 3.5;
  drawPath(greenlandPts);
  ctx.stroke();
  drawPath(antarcticaPts);
  ctx.stroke();

  // E. ICONIC ISLAND ARCHIPELAGOS
  const drawIsland = (lon, lat, rx, ry, color = '#15803d') => {
    const pt = lonLatToXY(lon, lat);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(pt.x, pt.y, rx, ry, (rand() - 0.5) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  };

  // Japan
  drawIsland(140, 38, 14, 28, '#15803d');
  drawIsland(142, 43, 10, 12, '#166534');
  // Great Britain & Ireland
  drawIsland(-2, 54, 12, 22, '#15803d');
  drawIsland(-8, 53, 8, 12, '#16a34a');
  // Madagascar
  drawIsland(47, -19, 11, 26, '#ca8a04');
  drawIsland(48, -19, 6, 20, '#15803d');
  // New Zealand
  drawIsland(175, -39, 7, 16, '#15803d');
  drawIsland(170, -44, 7, 18, '#15803d');
  // Caribbean Arc
  drawIsland(-77, 21, 16, 5, '#15803d'); // Cuba
  drawIsland(-69, 19, 12, 5, '#166534'); // Hispaniola

  // -----------------------------------------------------------------
  // 5. PHOTOREALISTIC DYNAMIC CLOUD SYSTEMS & DROP SHADOWS
  // -----------------------------------------------------------------
  // A. Soft orbital cloud drop shadows cast onto land/sea beneath (3D relief depth)
  ctx.save();
  ctx.shadowColor = 'rgba(1, 15, 30, 0.42)';
  ctx.shadowBlur = 9;
  ctx.shadowOffsetX = 3.5;
  ctx.shadowOffsetY = 4.0;

  // Helper for drawing feathered cloud puffs
  const drawCloudBand = (pts, w, opacity = 0.72) => {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  // 1. Equatorial Intertropical Convergence Zone (ITCZ)
  // Characteristic intermittent cloud bands along equator
  for (let x = 0; x < width; x += 18) {
    const waveY = (height * 0.5) + Math.sin(x * 0.015) * 24 + (rand() - 0.5) * 16;
    const radX = 25 + rand() * 55;
    const radY = 10 + rand() * 20;
    const g = ctx.createRadialGradient(x, waveY, 0, x, waveY, radX);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
    g.addColorStop(0.6, 'rgba(255, 255, 255, 0.65)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, waveY, radX, radY, (rand() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Northern Mid-Latitude Storm Fronts & Cyclones (North Atlantic & North Pacific)
  const drawCycloneSpiral = (cx, cy, radius, arms = 2, clockwise = true) => {
    for (let a = 0; a < arms; a++) {
      const startAngle = (a / arms) * Math.PI * 2;
      const pts = [];
      const dir = clockwise ? 1 : -1;
      for (let t = 0; t <= Math.PI * 2.8; t += 0.15) {
        const r = (t / (Math.PI * 2.8)) * radius;
        const angle = startAngle + t * dir;
        pts.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r * 0.65 // Equirectangular latitude foreshortening
        });
      }
      drawCloudBand(pts, 18, 0.80);
      drawCloudBand(pts, 8, 0.95);
    }
  };

  // Cyclones in North Pacific, North Atlantic, and Southern Ocean
  drawCycloneSpiral(520, 260, 95, 2, false);  // North Pacific storm
  drawCycloneSpiral(880, 240, 85, 2, false);  // North Atlantic hurricane/low
  drawCycloneSpiral(1460, 270, 90, 2, false); // Western Pacific typhoon
  drawCycloneSpiral(460, 720, 110, 2, true);  // Roaring Forties cyclone (South Pacific)
  drawCycloneSpiral(1180, 740, 105, 2, true); // South Indian Ocean polar storm

  // 3. Sprawling Cold Fronts (Long wavy comma-shaped frontal cloud bands)
  const drawColdFront = (x1, y1, x2, y2, waveAmp = 28) => {
    const pts = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const lx = x1 + (x2 - x1) * t;
      const ly = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * waveAmp;
      pts.push({ x: lx, y: ly });
    }
    drawCloudBand(pts, 24, 0.70);
    drawCloudBand(pts, 10, 0.90);
  };

  drawColdFront(600, 310, 820, 220, 35);
  drawColdFront(960, 290, 1220, 190, 40);
  drawColdFront(250, 760, 560, 680, -38);
  drawColdFront(1260, 780, 1580, 690, -42);

  // 4. Scattered Trade-Wind Cumulus Field (fine wispy fair-weather clouds)
  for (let c = 0; c < 75; c++) {
    const qx = rand() * width;
    const qy = 120 + rand() * (height - 240);
    const rad = 15 + rand() * 45;
    const g = ctx.createRadialGradient(qx, qy, 0, qx, qy, rad);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.78)');
    g.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(qx, qy, rad, rad * 0.45, (rand() - 0.5) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Create high-fidelity canvas texture with seamless equirectangular spherical wrapping
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates an aerospace solar panel photovoltaic cell grid texture.
 */
export function createSolarGridTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Photovoltaic silicon blue base
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, size, size);

  // Silicon cell division borders
  const cellSize = 32;
  ctx.strokeStyle = '#082f49';
  ctx.lineWidth = 2;
  for (let x = 0; x < size; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y < size; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Silver conductor collector gridlines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.8;
  for (let x = 0; x < size; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}
