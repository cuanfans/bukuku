// File: functions/api/setor/index.js

export const onRequestGet = async ({ request, env, data }) => {
  try {
    const user = data.user;
    
    // Query: Ambil transaksi yang bank_tujuannya 'SETOR_ADMIN'
    // Join dengan tabel users untuk mengambil nama kasir
    let query = `
      SELECT t.*, u.username as nama_kasir 
      FROM transfer t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.bank_tujuan = 'SETOR_ADMIN'
    `;

    // Filter: Kasir hanya lihat datanya sendiri, Owner lihat semua
    if (user.role !== 'owner') {
      query += ` AND t.user_id = ${user.id}`;
    }

    // Urutkan: Pending paling atas, lalu tanggal terbaru
    query += ` ORDER BY CASE WHEN t.status = 'pending' THEN 0 ELSE 1 END, t.created_at DESC`;

    const { results } = await env.DB.prepare(query).all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestPost = async ({ request, env, data }) => {
  try {
    const { nominal, keterangan } = await request.json();
    const userId = data.user.id;

    if (!nominal || nominal <= 0) {
      return new Response(JSON.stringify({ error: 'Nominal harus diisi' }), { status: 400 });
    }

    // Insert dengan status PENDING
    const result = await env.DB.prepare(`
      INSERT INTO transfer (tanggal, bank_tujuan, nomor_rekening, nama_pemilik, nominal, biaya, keterangan, status, user_id)
      VALUES (DATE('now'), 'SETOR_ADMIN', '-', 'ADMIN', ?, 0, ?, 'pending', ?)
    `).bind(nominal, keterangan, userId).run();

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// INI YANG SEBELUMNYA KURANG: Fungsi untuk Admin mengubah status jadi LUNAS
export const onRequestPut = async ({ request, env, data }) => {
  try {
    // HANYA OWNER YANG BOLEH APPROVE
    if (data.user.role !== 'owner') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const { id, status, nominal } = await request.json();

    // Jika ada perubahan nominal (Edit)
    if (nominal !== undefined) {
      await env.DB.prepare(`UPDATE transfer SET status = ?, nominal = ? WHERE id = ?`)
        .bind(status, nominal, id).run();
    } else {
      // Jika hanya ubah status (Approve)
      await env.DB.prepare(`UPDATE transfer SET status = ? WHERE id = ?`)
        .bind(status, id).run();
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
