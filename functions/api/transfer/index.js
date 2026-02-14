export const onRequestGet = async ({ request, env, data }) => {
  try {
    const url = new URL(request.url);
    const user = data.user;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM transfer WHERE bank_tujuan != 'SETOR_ADMIN'`;
    let params = [];

    if (user.role !== 'owner') {
      query += ` AND user_id = ?`;
      params.push(user.id);
    }

    // Hitung total untuk pagination
    const totalRow = await env.DB.prepare(`SELECT COUNT(*) as total FROM (${query})`).bind(...params).first();
    
    // Ambil data dengan LIMIT dan OFFSET
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const finalParams = [...params, limit, offset];
    
    const { results } = await env.DB.prepare(query).bind(...finalParams).all();

    return new Response(JSON.stringify({
      data: results,
      pagination: {
        page,
        limit,
        total: totalRow.total,
        totalPages: Math.ceil(totalRow.total / limit)
      }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestPost = async ({ request, env, data }) => {
  try {
    const { tanggal, bank_tujuan, nomor_rekening, nama_pemilik, nominal, biaya, keterangan, foto_struk } = await request.json();
    const userId = data.user.id;

    if (!nominal || nominal <= 0) return new Response(JSON.stringify({ error: 'Nominal tidak valid' }), { status: 400 });

    // Status diset LUNAS agar saldo langsung terpotong (Konsistensi Bisnis)
    await env.DB.prepare(`
      INSERT INTO transfer (tanggal, bank_tujuan, nomor_rekening, nama_pemilik, nominal, biaya, keterangan, status, user_id, foto_struk)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'lunas', ?, ?)
    `).bind(tanggal, bank_tujuan, nomor_rekening, nama_pemilik, nominal, biaya || 0, keterangan, userId, foto_struk || null).run();

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
