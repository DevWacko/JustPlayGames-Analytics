/*
 * Drawings for signs, road markings, traffic lights and hand signals.
 * window.SIGN(id) returns an inline SVG string (viewBox 0 0 120 120).
 * Real-world sign colours are fixed so they look the same in light and dark themes.
 */
(function () {
  var RED = "#c8102e", BLUE = "#1554a5", BLK = "#1a1a1a", WHT = "#ffffff", YEL = "#f2b705", ROAD = "#4a4d52", GRN = "#1f9d55";

  function svg(inner, label) {
    return '<svg viewBox="0 0 120 120" role="img" aria-label="' + (label || "illustration") + '" xmlns="http://www.w3.org/2000/svg">' + inner + "</svg>";
  }
  // Arrowhead (filled triangle) with its tip at x,y pointing toward angle (degrees, 0 = up, clockwise)
  function head(x, y, ang, size, fill) {
    size = size || 12;
    return '<polygon points="0,0 ' + (-size * 0.8) + "," + size * 1.3 + " " + size * 0.8 + "," + size * 1.3 +
      '" fill="' + (fill || BLK) + '" transform="translate(' + x + "," + y + ") rotate(" + ang + ')"/>';
  }
  function line(d, color, w) {
    return '<path d="' + d + '" fill="none" stroke="' + (color || BLK) + '" stroke-width="' + (w || 8) + '" stroke-linecap="butt" stroke-linejoin="round"/>';
  }
  function triangle(content) {
    return '<polygon points="60,10 112,104 8,104" fill="' + WHT + '" stroke="' + RED + '" stroke-width="9" stroke-linejoin="round"/>' + content;
  }
  function redRing(content, fill) {
    return '<circle cx="60" cy="60" r="51" fill="' + (fill || WHT) + '" stroke="' + RED + '" stroke-width="11"/>' + content;
  }
  function blueDisc(content) {
    return '<circle cx="60" cy="60" r="54" fill="' + BLUE + '" stroke="' + WHT + '" stroke-width="3"/>' + content;
  }
  function blueSquare(content) {
    return '<rect x="10" y="10" width="100" height="100" rx="8" fill="' + BLUE + '" stroke="' + WHT + '" stroke-width="3"/>' + content;
  }
  var slash = '<line x1="25" y1="25" x2="95" y2="95" stroke="' + RED + '" stroke-width="10"/>';
  function upArrow(color, rot) {
    return '<g transform="rotate(' + (rot || 0) + ' 60 60)">' + line("M60 96 V44", color, 12) + head(60, 22, 0, 16, color) + "</g>";
  }
  function circArrows(cx, cy, r, color, w, hs) {
    var out = "";
    for (var k = 0; k < 3; k++) {
      var a0 = (k * 120 + 20) * Math.PI / 180, a1 = (k * 120 + 100) * Math.PI / 180;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      out += '<path d="M' + x0.toFixed(1) + " " + y0.toFixed(1) + " A" + r + " " + r + " 0 0 1 " + x1.toFixed(1) + " " + y1.toFixed(1) +
        '" fill="none" stroke="' + color + '" stroke-width="' + w + '"/>';
      var tipA = a1 + 0.35, tx = cx + r * Math.cos(tipA), ty = cy + r * Math.sin(tipA);
      var deg = (tipA * 180 / Math.PI) + 180; // tangent direction for clockwise travel
      out += head(tx.toFixed(1), ty.toFixed(1), deg, hs, color);
    }
    return out;
  }
  function person(x, y, s, color) {
    s = s || 1; color = color || BLK;
    return '<g transform="translate(' + x + "," + y + ") scale(" + s + ')" fill="none" stroke="' + color + '" stroke-width="5" stroke-linecap="round">' +
      '<circle cx="0" cy="-26" r="6" fill="' + color + '" stroke="none"/>' +
      '<path d="M0 -18 L-2 2 M-2 2 L-10 20 M-2 2 L8 20 M0 -14 L-10 -2 M0 -14 L10 -6"/></g>';
  }
  function car(x, y, color) {
    return '<g transform="translate(' + x + "," + y + ')"><rect x="0" y="12" width="24" height="22" rx="4" fill="' + color + '"/>' +
      '<rect x="4" y="2" width="16" height="14" rx="3" fill="' + color + '"/>' +
      '<rect x="2" y="32" width="5" height="6" fill="' + color + '"/><rect x="17" y="32" width="5" height="6" fill="' + color + '"/></g>';
  }
  function road(content) {
    return '<rect x="0" y="0" width="120" height="120" rx="6" fill="' + ROAD + '"/>' + content;
  }
  function lightHousing(on) {
    var r = on === "red" ? RED : "#3b1010", a = on === "amber" ? YEL : "#3b3210", g = on === "green" ? GRN : "#10301e";
    return '<rect x="38" y="6" width="44" height="108" rx="10" fill="' + BLK + '"/>' +
      '<circle cx="60" cy="27" r="13" fill="' + r + '"/><circle cx="60" cy="60" r="13" fill="' + a + '"/><circle cx="60" cy="93" r="13" fill="' + g + '"/>';
  }
  function topCar(arm) {
    // car seen from above, travelling up the page; driver sits on the RIGHT
    return road('<rect x="38" y="30" width="40" height="70" rx="10" fill="#e8e2d6"/>' +
      '<rect x="43" y="44" width="30" height="18" rx="4" fill="#9fb3c8"/><circle cx="66" cy="70" r="5" fill="' + BLK + '"/>' + arm);
  }
  function officer(view, arm) {
    var body = '<rect x="0" y="0" width="120" height="120" rx="6" fill="#dfe6ee"/>' +
      '<circle cx="60" cy="28" r="11" fill="#7a5235"/>' +
      '<path d="M48 22 h24 v-6 h-24z" fill="#14213d"/>' +
      '<rect x="46" y="40" width="28" height="40" rx="6" fill="#14213d"/>' +
      '<rect x="48" y="80" width="10" height="34" fill="#14213d"/><rect x="62" y="80" width="10" height="34" fill="#14213d"/>';
    if (view === "back") body += '<circle cx="60" cy="28" r="11" fill="#3a2414"/>';
    body += '<text x="6" y="14" font-size="10" font-family="sans-serif" fill="#14213d">' + (view === "back" ? "back to you" : "facing you") + "</text>";
    return body + arm;
  }

  var S = {
    stop: function () {
      var pts = [];
      for (var i = 0; i < 8; i++) { var a = (22.5 + 45 * i) * Math.PI / 180; pts.push((60 + 56 * Math.cos(a)).toFixed(1) + "," + (60 + 56 * Math.sin(a)).toFixed(1)); }
      return svg('<polygon points="' + pts.join(" ") + '" fill="' + RED + '" stroke="' + WHT + '" stroke-width="3"/>' +
        '<text x="60" y="71" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="30" fill="' + WHT + '">STOP</text>', "Stop sign");
    },
    giveway: function () {
      return svg('<polygon points="8,14 112,14 60,108" fill="' + WHT + '" stroke="' + RED + '" stroke-width="9" stroke-linejoin="round"/>' +
        '<text x="60" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="' + BLK + '">GIVE</text>' +
        '<text x="60" y="59" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="' + BLK + '">WAY</text>', "Give way sign");
    },
    noentry: function () { return svg('<circle cx="60" cy="60" r="55" fill="' + RED + '"/><rect x="22" y="50" width="76" height="20" fill="' + WHT + '"/>', "No entry sign"); },
    speed50: function () { return svg(redRing('<text x="60" y="76" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="44" fill="' + BLK + '">50</text>'), "50 speed limit sign"); },
    speed80: function () { return svg(redRing('<text x="60" y="76" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="44" fill="' + BLK + '">80</text>'), "80 speed limit sign"); },
    nouturn: function () { return svg(redRing(line("M44 92 V56 A16 16 0 0 1 76 56 V66", BLK, 9) + head(76, 81, 180, 11) + slash), "No U-turn sign"); },
    noright: function () { return svg(redRing(line("M48 94 V58 H74", BLK, 9) + head(89, 58, 90, 11) + slash), "No right turn sign"); },
    noleft: function () { return svg(redRing(line("M72 94 V58 H46", BLK, 9) + head(31, 58, 270, 11) + slash), "No left turn sign"); },
    noovertaking: function () { return svg(redRing(car(28, 38, BLK) + car(66, 38, RED)), "No overtaking sign"); },
    noparking: function () { return svg(redRing(slash, BLUE), "No parking sign"); },
    nostopping: function () { return svg(redRing(slash + '<line x1="95" y1="25" x2="25" y2="95" stroke="' + RED + '" stroke-width="10"/>', BLUE), "No stopping sign"); },
    keepleft: function () { return svg(blueDisc(upArrow(WHT, 225)), "Keep left sign"); },
    turnleft: function () { return svg(blueDisc(line("M72 96 V60 H52", WHT, 12) + head(28, 60, 270, 15, WHT)), "Turn left sign"); },
    aheadonly: function () { return svg(blueDisc(upArrow(WHT, 0)), "Ahead only sign"); },
    minirb: function () { return svg(blueDisc(circArrows(60, 60, 28, WHT, 9, 10)), "Roundabout sign"); },
    roundaboutahead: function () { return svg(triangle(circArrows(60, 74, 17, BLK, 6, 7)), "Roundabout ahead sign"); },
    crossroads: function () { return svg(triangle('<rect x="55" y="42" width="10" height="56" fill="' + BLK + '"/><rect x="34" y="65" width="52" height="10" fill="' + BLK + '"/>'), "Crossroads sign"); },
    tjunction: function () { return svg(triangle('<rect x="55" y="62" width="10" height="36" fill="' + BLK + '"/><rect x="34" y="54" width="52" height="10" fill="' + BLK + '"/>'), "T-junction sign"); },
    sidejunction: function () { return svg(triangle('<rect x="57" y="42" width="10" height="56" fill="' + BLK + '"/><rect x="38" y="66" width="22" height="9" fill="' + BLK + '"/>'), "Side road sign"); },
    bendright: function () { return svg(triangle(line("M50 98 V78 Q50 62 66 56", BLK, 8) + head(75, 52, 68, 9)), "Bend to the right sign"); },
    doublebend: function () { return svg(triangle(line("M64 98 C64 84 48 84 50 72 C52 62 66 62 64 52", BLK, 7) + head(64, 40, 0, 9)), "Double bend sign"); },
    pedestrian: function () { return svg(triangle(person(60, 76, 1)), "Pedestrian crossing sign"); },
    children: function () { return svg(triangle(person(50, 78, 0.95) + person(70, 82, 0.8)), "Children crossing sign"); },
    narrows: function () { return svg(triangle(line("M42 100 V88 L52 76 V48", BLK, 7) + line("M78 100 V88 L68 76 V48", BLK, 7)), "Road narrows sign"); },
    signals: function () {
      return svg(triangle('<rect x="50" y="44" width="20" height="54" rx="4" fill="' + BLK + '"/><circle cx="60" cy="55" r="6" fill="' + RED + '"/><circle cx="60" cy="71" r="6" fill="' + YEL + '"/><circle cx="60" cy="87" r="6" fill="' + GRN + '"/>'), "Traffic signals ahead sign");
    },
    twoway: function () { return svg(triangle(line("M52 98 V62", BLK, 6) + head(52, 98, 180, 8) + line("M68 54 V90", BLK, 6) + head(68, 46, 0, 8)), "Two-way traffic sign"); },
    hump: function () { return svg(triangle('<path d="M26 96 H44 Q60 66 76 96 H94 Z" fill="' + BLK + '"/>'), "Hump sign"); },
    hill: function () { return svg(triangle('<path d="M30 96 H90 L30 64 Z" fill="' + BLK + '"/><text x="72" y="80" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="14" fill="' + BLK + '">10%</text>'), "Steep hill sign"); },
    roadworks: function () {
      return svg(triangle(person(54, 80, 0.9) + line("M64 74 L80 96", BLK, 4) + '<path d="M74 98 H96 L86 86 Z" fill="' + BLK + '"/>'), "Road works sign");
    },
    oneway: function () {
      return svg('<rect x="6" y="34" width="108" height="52" rx="6" fill="' + BLUE + '" stroke="' + WHT + '" stroke-width="3"/>' + line("M18 60 H84", WHT, 12) + head(106, 60, 90, 14, WHT) +
        '<text x="50" y="49" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="11" fill="' + WHT + '">ONE WAY</text>', "One-way sign");
    },
    hospital: function () { return svg(blueSquare('<text x="60" y="84" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="68" fill="' + WHT + '">H</text>'), "Hospital sign"); },
    parking: function () { return svg(blueSquare('<text x="60" y="84" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="68" fill="' + WHT + '">P</text>'), "Parking sign"); },
    deadend: function () { return svg(blueSquare('<rect x="52" y="44" width="16" height="56" fill="' + WHT + '"/><rect x="34" y="26" width="52" height="16" fill="' + RED + '"/>'), "No through road sign"); },

    "shape-octagon": function () { return S.stop(); },
    "shape-triangle": function () { return svg(triangle('<text x="60" y="90" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="40" fill="' + BLK + '">!</text>'), "Triangle sign shape"); },
    "shape-circle": function () { return svg(redRing(""), "Red circle sign shape"); },
    "shape-bluecircle": function () { return svg(blueDisc(""), "Blue circle sign shape"); },
    "shape-rect": function () { return svg('<rect x="6" y="28" width="108" height="64" rx="6" fill="' + BLUE + '" stroke="' + WHT + '" stroke-width="3"/>', "Rectangle sign shape"); },

    "light-red": function () { return svg(lightHousing("red"), "Red traffic light"); },
    "light-amber": function () { return svg(lightHousing("amber"), "Amber traffic light"); },
    "light-green": function () { return svg(lightHousing("green"), "Green traffic light"); },
    "light-filter": function () {
      return svg('<rect x="26" y="6" width="44" height="108" rx="10" fill="' + BLK + '"/><circle cx="48" cy="27" r="13" fill="' + RED + '"/><circle cx="48" cy="60" r="13" fill="#3b3210"/><circle cx="48" cy="93" r="13" fill="#10301e"/>' +
        '<rect x="70" y="78" width="32" height="30" rx="6" fill="' + BLK + '"/>' + line("M78 93 H88", GRN, 5) + head(98, 93, 90, 6, GRN), "Red light with green filter arrow");
    },

    "mark-broken": function () { return svg(road('<line x1="60" y1="0" x2="60" y2="120" stroke="' + WHT + '" stroke-width="4" stroke-dasharray="14 14"/>'), "Broken white centre line"); },
    "mark-longbroken": function () { return svg(road('<line x1="60" y1="0" x2="60" y2="120" stroke="' + WHT + '" stroke-width="4" stroke-dasharray="30 6"/>'), "Long broken warning line"); },
    "mark-double": function () { return svg(road('<rect x="55" y="0" width="3" height="120" fill="' + WHT + '"/><rect x="62" y="0" width="3" height="120" fill="' + WHT + '"/>'), "Double solid white lines"); },
    "mark-solidbroken": function () {
      return svg(road('<rect x="55" y="0" width="3" height="120" fill="' + WHT + '"/><line x1="63.5" y1="0" x2="63.5" y2="120" stroke="' + WHT + '" stroke-width="3" stroke-dasharray="12 10"/>' +
        car(18, 64, "#e8e2d6") + '<text x="8" y="116" font-size="10" font-family="sans-serif" fill="' + WHT + '">you</text>'), "Solid line on your side, broken on the far side");
    },
    "mark-box": function () {
      var g = '<rect x="20" y="20" width="80" height="80" fill="none" stroke="' + YEL + '" stroke-width="3"/>';
      for (var i = 0; i <= 80; i += 16) { g += '<line x1="' + (20 + i) + '" y1="20" x2="20" y2="' + (20 + i) + '" stroke="' + YEL + '" stroke-width="2"/><line x1="' + (100 - i) + '" y1="100" x2="100" y2="' + (100 - i) + '" stroke="' + YEL + '" stroke-width="2"/>'; }
      for (i = 0; i <= 80; i += 16) { g += '<line x1="' + (20 + i) + '" y1="100" x2="20" y2="' + (100 - i) + '" stroke="' + YEL + '" stroke-width="2"/><line x1="' + (100 - i) + '" y1="20" x2="100" y2="' + (20 + i) + '" stroke="' + YEL + '" stroke-width="2"/>'; }
      return svg(road(g), "Yellow box junction");
    },
    "mark-zebra": function () {
      var g = "";
      for (var x = 6; x < 118; x += 16) g += '<rect x="' + x + '" y="44" width="9" height="32" fill="' + WHT + '"/>';
      return svg(road(g + person(60, 64, 0.7, YEL)), "Zebra crossing");
    },
    "mark-stopline": function () { return svg(road('<line x1="60" y1="0" x2="60" y2="120" stroke="' + WHT + '" stroke-width="3" stroke-dasharray="12 10"/><rect x="6" y="40" width="50" height="9" fill="' + WHT + '"/><text x="31" y="80" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="16" fill="' + WHT + '">STOP</text>'), "Stop line"); },
    "mark-giveway": function () {
      return svg(road('<line x1="60" y1="0" x2="60" y2="120" stroke="' + WHT + '" stroke-width="3" stroke-dasharray="12 10"/>' +
        '<line x1="6" y1="38" x2="56" y2="38" stroke="' + WHT + '" stroke-width="4" stroke-dasharray="7 5"/><line x1="6" y1="46" x2="56" y2="46" stroke="' + WHT + '" stroke-width="4" stroke-dasharray="7 5"/>' +
        '<polygon points="18,62 44,62 31,96" fill="none" stroke="' + WHT + '" stroke-width="3"/>'), "Give way lines");
    },
    "mark-hatched": function () {
      var g = '<path d="M60 0 L44 40 L44 80 L60 120" fill="none" stroke="' + WHT + '" stroke-width="3"/><path d="M60 0 L76 40 L76 80 L60 120" fill="none" stroke="' + WHT + '" stroke-width="3"/>';
      for (var y = 22; y < 104; y += 12) g += '<line x1="46" y1="' + (y + 8) + '" x2="74" y2="' + y + '" stroke="' + WHT + '" stroke-width="3"/>';
      return svg(road(g), "Hatched area");
    },

    "arm-right": function () { return svg(topCar(line("M78 66 H112", "#c58a5c", 7) + '<circle cx="113" cy="66" r="4" fill="#c58a5c"/>'), "Right arm held straight out"); },
    "arm-left": function () {
      return svg(topCar(line("M78 66 H104", "#c58a5c", 7) + '<path d="M96 46 A16 16 0 1 0 114 60" fill="none" stroke="' + YEL + '" stroke-width="3"/>' + head(114, 52, 0, 6, YEL)), "Right arm circling anti-clockwise");
    },
    "arm-slow": function () {
      return svg(topCar(line("M78 66 H108", "#c58a5c", 7) + line("M100 36 V54", YEL, 3) + head(100, 30, 0, 6, YEL) + line("M100 78 V96", YEL, 3) + head(100, 102, 180, 6, YEL)), "Right arm moving up and down");
    },
    "cop-front": function () { return svg(officer("front", line("M72 46 L84 22 V8", "#7a5235", 7) + '<rect x="78" y="2" width="12" height="10" rx="3" fill="' + WHT + '"/>'), "Officer facing you, hand raised"); },
    "cop-back": function () { return svg(officer("back", line("M74 48 H108", "#14213d", 8) + '<rect x="106" y="42" width="10" height="12" rx="3" fill="' + WHT + '"/>'), "Officer with back to you, arm out"); },
    "cop-beckon": function () {
      return svg(officer("front", line("M72 46 L94 40 L100 26", "#7a5235", 7) + '<path d="M104 46 Q114 32 104 18" fill="none" stroke="' + RED + '" stroke-width="3"/>' + head(102, 14, -30, 6, RED)), "Officer beckoning you on");
    }
  };

  window.SIGN = function (id) { return S[id] ? S[id]() : ""; };
  window.SIGN_IDS = Object.keys(S);
})();
