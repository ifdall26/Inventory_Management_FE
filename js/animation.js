document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        console.log(
          `Entry: ${entry.target}, isIntersecting: ${entry.isIntersecting}`
        );
        if (entry.isIntersecting) {
          // Menambahkan class visible dan memberikan delay untuk memulai animasi
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, 50); // Memberikan delay sedikit agar animasi terlihat
          observer.unobserve(entry.target); // Hentikan pengamatan
        }
      });
    },
    {
      threshold: 0.1, // Mulai animasi saat elemen terlihat 10%
      rootMargin: "0px 0px -50px 0px", // Sesuaikan root margin
    }
  );

  const fadeInElements = document.querySelectorAll(".fade-in");
  console.log("Jumlah elemen fade-in ditemukan:", fadeInElements.length);
  fadeInElements.forEach((el) => {
    console.log("Mengamati elemen:", el);
    observer.observe(el);
  });
});
