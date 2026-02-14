export const onRequestGet = async ({ env }) => {
  // Ambil ringkasan user
  const userSummary = await env.DB.prepare('SELECT * FROM user_summary').all();

  // Ambil detail saldo per tipe modal (untuk logika 1-13)
  // Kita group by modal_type untuk mendapatkan total per aplikasi
  const modalSummary = await env.DB.prepare(`
    SELECT modal_type, SUM(nominal) as total 
    FROM modal 
    GROUP BY modal_type
  `).all();

  // Mapping hasil ke struktur JSON yang mudah dibaca Frontend
  const modalStats = {};
  if (modalSummary.results) {
    modalSummary.results.forEach(row => {
      modalStats[row.modal_type] = row.total;
    });
  }

  // Hitung Total Saldo Keseluruhan (Rumus: Semua Modal + Transfer Masuk - Keluar dll)
  // Ini sudah dihandle oleh TRIGGER di database yang mengupdate tabel 'saldo'
  
  return new Response(JSON.stringify({
    users: userSummary.results,
    modals: modalStats, // Ini berisi data untuk FA420355, FA851085, dll
  }), { headers: { 'Content-Type': 'application/json' } });
};
