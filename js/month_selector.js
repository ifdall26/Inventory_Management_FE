function initDateSelector() {
  const yearSelect = document.getElementById("yearSelect");
  const monthSelect = document.getElementById("monthSelect");

  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 1; i <= currentYear; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
  }

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  for (let i = 0; i < monthNames.length; i++) {
    const option = document.createElement("option");
    option.value = i + 1; // Nilai berbasis 1
    option.textContent = monthNames[i];
    monthSelect.appendChild(option);
  }

  yearSelect.addEventListener("change", displayChart);
  monthSelect.addEventListener("change", displayChart);
}
