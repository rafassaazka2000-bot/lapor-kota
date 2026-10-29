
const dataAwal = [
  {
    id: 1,
    title: "Jalan Berlubang di Jalan Melati",
    category: "Jalan Rusak",
    location: "Jalan Melati, Sukamaju",
    description: "Jalan berlubang dan membahayakan pengendara.",
    status: "Dalam Proses",
    date: "18 Okt 2026"
  },
  {
    id: 2,
    title: "Sampah Menumpuk",
    category: "Sampah",
    location: "Jalan Anggrek, Cempaka",
    description: "Sampah menumpuk dan menimbulkan bau.",
    status: "Menunggu",
    date: "17 Okt 2026"
  },
  {
    id: 3,
    title: "Lampu Jalan Mati",
    category: "Fasilitas Umum",
    location: "Jalan Dahlia, Harapan",
    description: "Lampu jalan tidak menyala pada malam hari.",
    status: "Selesai",
    date: "15 Okt 2026"
  }
];

function loadReports() {
  try {
    const saved = localStorage.getItem("laporkota_reports");
    return saved ? JSON.parse(saved) : dataAwal;
  } catch {
    return dataAwal;
  }
}

let reports = loadReports();
let activeCategory = "";

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function saveReports() {
  try {
    localStorage.setItem("laporkota_reports", JSON.stringify(reports));
  } catch {
    alert("Penyimpanan browser penuh. Coba gunakan foto yang lebih kecil.");
  }
}

function renderReports() {
  const query = document.getElementById("search").value
    .toLowerCase().trim();

  const filtered = reports.filter(report => {
    const matchesCategory =
      !activeCategory || report.category === activeCategory;

    const searchable = (
      report.title + " " +
      report.location + " " +
      report.category + " " +
      report.description
    ).toLowerCase();

    return matchesCategory && searchable.includes(query);
  });

  const list = document.getElementById("reportList");

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty">Laporan tidak ditemukan.</div>';
  } else {
    list.innerHTML = filtered.map(report => `
      <article class="report">
        <h3>${escapeHTML(report.title)}</h3>
        <small>📍 ${escapeHTML(report.location)}</small><br>
        <small>📅 ${escapeHTML(report.date)} · ${escapeHTML(report.category)}</small>
        <p>${escapeHTML(report.description)}</p>
        ${report.photo ? `
          <img src="${report.photo}" alt="Foto laporan">
        ` : ""}
        <span class="status ${report.status === "Selesai" ? "selesai" : ""}">
          ${escapeHTML(report.status)}
        </span>
      </article>
    `).join("");
  }

  document.getElementById("total").textContent = reports.length;

  document.getElementById("process").textContent =
    reports.filter(report =>
      report.status === "Dalam Proses" ||
      report.status === "Ditindaklanjuti"
    ).length;

  document.getElementById("done").textContent =
    reports.filter(report => report.status === "Selesai").length;
}

function openModal() {
  document.getElementById("reportModal").classList.add("show");
}

function closeModal() {
  document.getElementById("reportModal").classList.remove("show");
}

document.getElementById("openForm").addEventListener("click", openModal);
document.getElementById("heroButton").addEventListener("click", openModal);
document.getElementById("closeForm").addEventListener("click", closeModal);

document.getElementById("reportModal").addEventListener("click", event => {
  if (event.target.id === "reportModal") closeModal();
});

document.getElementById("search").addEventListener("input", renderReports);

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;

    activeCategory = activeCategory === category ? "" : category;

    document.querySelectorAll(".category").forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.category === activeCategory
      );
    });

    renderReports();
  });
});

document.getElementById("reportForm").addEventListener("submit", event => {
  event.preventDefault();

  const file = document.getElementById("photo").files[0];

  function addReport(photo = "") {
    reports.unshift({
      id: Date.now(),
      title: document.getElementById("title").value.trim(),
      category: document.getElementById("category").value,
      location: document.getElementById("location").value.trim(),
      description: document.getElementById("description").value.trim(),
      status: "Menunggu",
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      photo
    });

    saveReports();

    activeCategory = "";
    document.getElementById("search").value = "";

    document.querySelectorAll(".category").forEach(button => {
      button.classList.remove("active");
    });

    renderReports();
    document.getElementById("reportForm").reset();
    closeModal();

    alert("Laporan berhasil ditambahkan!");
  }

  if (file) {
    if (!file.type.startsWith("image/")) {
      alert("Pilih file gambar yang valid.");
      return;
    }

    if (file.size > 1500000) {
      alert("Ukuran foto maksimal 1,5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => addReport(reader.result);
    reader.onerror = () => alert("Foto gagal dibaca.");
    reader.readAsDataURL(file);
  } else {
    addReport();
  }
});

renderReports();
