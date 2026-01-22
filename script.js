async function uploadImage() {
  const input = document.getElementById("wasteImage");
  if (!input.files.length) {
    alert("Please select an image");
    return;
  }

  document.getElementById("loader").classList.remove("hidden");
  document.getElementById("wasteResult").classList.add("hidden");

  let formData = new FormData();
  formData.append("image", input.files[0]);

  const response = await fetch("/analyze", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  let icon = "♻️";
  if (data.result === "Biodegradable") icon = "🌱";
  if (data.result === "Hazardous") icon = "☠️";

  document.getElementById("loader").classList.add("hidden");

  document.getElementById("wasteResult").innerHTML = `
        <p style="font-size:22px">${icon} <b>${data.result}</b></p>
        <p>📍 Disposal: <b>${data.advice}</b></p>
        <p>🌍 CO₂ Saved: <b>${data.co2} kg</b></p>
    `;

  document.getElementById("wasteResult").classList.remove("hidden");

  // Show Leaflet map
  showMapForWaste(data.result);
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}
