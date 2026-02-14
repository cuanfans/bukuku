export const onRequestGet = async ({ request, env, data }) => {
  try {
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('user_id');
    const user = data.user; // User yang sedang login (dari middleware)

    // Logika Filter:
    // 1. Jika Role Owner: Bisa lihat semua, atau filter user tertentu jika ada param user_id
    // 2. Jika Role Kasir: HANYA bisa lihat datanya sendiri (abaikan param user_id lain)
    let targetUserId = null;
    if (user.role === 'owner') {
      if (userIdParam) targetUserId = userIdParam; // Owner mau lihat kasir spesifik
    } else {
      targetUserId = user.id; // Kasir terkunci ke ID sendiri
    }

    // Bangun Klausa WHERE
    const whereClause = targetUserId ? `WHERE user_id = ${targetUserId}` : '';

    // 1. Ambil Data Modal (Saldo Aplikasi 1-13)
    // Revisi: "Total SALDO APLIKASI TERPAKAI (1-13)"
    const modal = await env.DB.prepare(`
      SELECT SUM(nominal) as total FROM modal ${whereClause}
    `).first();

    // 2. Ambil Data Transfer
    // Revisi: "Total TRANSFER", "Total BIAYA TRANSFER"
    // Note: Kita exclude 'SETOR_ADMIN' karena itu masuk kategori Setor User ke Admin
    const transfer = await env.DB.prepare(`
      SELECT 
        SUM(nominal) as total_nominal, 
        SUM(biaya) as total_biaya 
      FROM transfer 
      ${targetUserId ? `WHERE user_id = ${targetUserId}` : 'WHERE 1=1'} 
      AND bank_tujuan != 'SETOR_ADMIN'
    `).first();

    // 3. Ambil Data Transfer Debit
    // Revisi: "Total BIAYA TRANSFER PAKAI KARTU DEBIT"
    const tfDebit = await env.DB.prepare(`
      SELECT SUM(biaya) as total_biaya FROM transfer_debit ${whereClause}
    `).first();

    // 4. Ambil Data Tarik Tunai
    // Revisi: "Total TARIK TUNAI", "Total BIAYA TARIK TUNAI"
    const tarik = await env.DB.prepare(`
      SELECT 
        SUM(nominal_tarik) as total_nominal, 
        SUM(biaya_tarik) as total_biaya 
      FROM tarik_tunai ${whereClause}
    `).first();

    // 5. Ambil Data Setor ke Admin
    // Revisi: "Total Setor User ke Admin"
    const setor = await env.DB.prepare(`
      SELECT SUM(nominal) as total FROM transfer 
      ${targetUserId ? `WHERE user_id = ${targetUserId}` : 'WHERE 1=1'} 
      AND bank_tujuan = 'SETOR_ADMIN'
    `).first();

    // 6. Hitung Total Saldo Keseluruhan
    // Rumus Saldo Fisik (Cash on Hand) biasanya:
    // (+) Modal Awal (Kas)
    // (+) Uang masuk dari Transfer (Pelanggan kasih tunai)
    // (+) Biaya-biaya (Keuntungan)
    // (-) Uang keluar Tarik Tunai (Kita kasih tunai ke pelanggan)
    // (-) Setor ke Admin (Uang fisik diserahkan)
    
    // Namun, kita ikuti Trigger Database yang sudah kita buat di Tahap 2:
    // Trigger saldo = Modal + (Transfer+Biaya) + (TF Debit Biaya) + (Tarik Biaya - Tarik Nominal)
    // Kita gunakan data real dari tabel 'saldo' agar konsisten dengan Dashboard
    const saldoData = await env.DB.prepare(`
       SELECT SUM(total_saldo) as total FROM saldo ${whereClause}
    `).first();


    // Format Respons JSON
    const reportData = {
      saldo_aplikasi_terpakai: modal?.total || 0,
      total_transfer: transfer?.total_nominal || 0,
      total_biaya_transfer: transfer?.total_biaya || 0,
      total_biaya_transfer_debit: tfDebit?.total_biaya || 0,
      total_tarik_tunai: tarik?.total_nominal || 0,
      total_biaya_tarik_tunai: tarik?.total_biaya || 0,
      total_setor_ke_admin: setor?.total || 0,
      // Total Saldo Keseluruhan (Real dari tabel saldo yang di-update trigger)
      total_saldo_keseluruhan: saldoData?.total || 0 
    };

    return new Response(JSON.stringify(reportData), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
