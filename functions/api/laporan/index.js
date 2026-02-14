export const onRequestGet = async ({ request, env, data }) => {
  try {
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('user_id');
    const user = data.user; // User yang sedang login

    // Logika Filter:
    // Owner: Bisa lihat semua, atau filter user tertentu
    // Kasir: HANYA lihat data sendiri
    let targetUserId = null;
    if (user.role === 'owner') {
      if (userIdParam) targetUserId = userIdParam;
    } else {
      targetUserId = user.id;
    }

    const whereClause = targetUserId ? `WHERE user_id = ${targetUserId}` : '';
    const whereClauseTf = targetUserId ? `WHERE user_id = ${targetUserId}` : 'WHERE 1=1';

    // 1. Modal / Saldo Aplikasi (1-13)
    const modal = await env.DB.prepare(`
      SELECT SUM(nominal) as total FROM modal ${whereClause}
    `).first();

    // 2. Transfer (Exclude Setor Admin)
    const transfer = await env.DB.prepare(`
      SELECT SUM(nominal) as total_nominal, SUM(biaya) as total_biaya 
      FROM transfer 
      ${whereClauseTf} AND bank_tujuan != 'SETOR_ADMIN'
    `).first();

    // 3. Transfer Debit
    const tfDebit = await env.DB.prepare(`
      SELECT SUM(biaya) as total_biaya FROM transfer_debit ${whereClause}
    `).first();

    // 4. Tarik Tunai
    const tarik = await env.DB.prepare(`
      SELECT SUM(nominal_tarik) as total_nominal, SUM(biaya_tarik) as total_biaya 
      FROM tarik_tunai ${whereClause}
    `).first();

    // 5. Tarik Kartu Kredit (BARU)
    const tarikKredit = await env.DB.prepare(`
      SELECT SUM(nominal) as total_nominal, SUM(admin_fee) as total_biaya 
      FROM tarik_kredit ${whereClause}
    `).first();

    // 6. Biaya Lain-lain (BARU)
    const biayaLain = await env.DB.prepare(`
      SELECT SUM(biaya) as total FROM biaya_lain ${whereClause}
    `).first();

    // 7. Setor ke Admin
    const setor = await env.DB.prepare(`
      SELECT SUM(nominal) as total FROM transfer 
      ${whereClauseTf} AND bank_tujuan = 'SETOR_ADMIN'
    `).first();

    // 8. Total Saldo Keseluruhan (Real dari tabel saldo)
    const saldoData = await env.DB.prepare(`
       SELECT SUM(total_saldo) as total FROM saldo ${whereClause}
    `).first();

    const reportData = {
      saldo_aplikasi_terpakai: modal?.total || 0,
      
      total_transfer: transfer?.total_nominal || 0,
      total_biaya_transfer: transfer?.total_biaya || 0,
      
      total_biaya_transfer_debit: tfDebit?.total_biaya || 0,
      
      total_tarik_tunai: tarik?.total_nominal || 0,
      total_biaya_tarik_tunai: tarik?.total_biaya || 0,
      
      // Tambahan Baru
      total_tarik_kredit: tarikKredit?.total_nominal || 0,
      total_biaya_tarik_kredit: tarikKredit?.total_biaya || 0,
      total_biaya_lain: biayaLain?.total || 0,

      total_setor_ke_admin: setor?.total || 0,
      total_saldo_keseluruhan: saldoData?.total || 0 
    };

    return new Response(JSON.stringify(reportData), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
