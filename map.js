let map;
let userMarker;
let centerMarker;
let routeLine;

// Initialize map with user location and waste type
function initMap(lat, lng, wasteType) {
  const mapDiv = document.getElementById("map");
  mapDiv.classList.remove("hidden");

  // Create map
  map = L.map("map").setView([lat, lng], 14);

  // OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // User location marker
  userMarker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup("You are here")
    .openPopup();

  // Dummy disposal centers
  const disposalCenters = {
    Biodegradable: { lat: lat + 0.01, lng: lng + 0.01, name: "Compost Yard" },
    Recyclable: { lat: lat + 0.015, lng: lng - 0.01, name: "Recycling Center" },
    Hazardous: {
      lat: lat - 0.01,
      lng: lng + 0.015,
      name: "Hazardous Facility",
    },
  };

  const center = disposalCenters[wasteType] || disposalCenters["Recyclable"];

  // Disposal center marker
  centerMarker = L.marker([center.lat, center.lng])
    .addTo(map)
    .bindPopup(center.name)
    .openPopup();

  // Draw route (simple line)
  routeLine = L.polyline(
    [
      [lat, lng],
      [center.lat, center.lng],
    ],
    { color: "green" },
  ).addTo(map);

  // Fit map bounds
  map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
}

// Get user location and show map
function showMapForWaste(wasteType) {
  const defaultLocation = { lat: 13.0827, lng: 80.2707 }; // fallback: Chennai

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        initMap(position.coords.latitude, position.coords.longitude, wasteType);
      },
      (error) => {
        console.warn("Geolocation failed, using default location", error);
        initMap(defaultLocation.lat, defaultLocation.lng, wasteType);
      },
    );
  } else {
    console.warn("Geolocation not supported, using default location");
    initMap(defaultLocation.lat, defaultLocation.lng, wasteType);
  }
}
