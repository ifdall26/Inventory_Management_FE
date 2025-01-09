document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
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
  fadeInElements.forEach((el) => {
    observer.observe(el);
  });
});
