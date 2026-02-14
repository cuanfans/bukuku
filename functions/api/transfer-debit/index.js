export const onRequestGet = async ({ request, env, data }) => {
  try {
    const url = new URL(request.url);
    const user = data.user;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let queryBase = `FROM transfer_debit WHERE 1=1`;
    let queryParams = [];

    if (user.role !== 'owner') {
      queryBase += ` AND user_id = ?`;
      queryParams.push(user.id);
    }

    if (startDate && endDate) {
      queryBase += ` AND tanggal BETWEEN ? AND ?`;
      queryParams.push(startDate, endDate);
    }

    // 1. Hitung total data untuk pagination
    const totalRow = await env.DB.prepare(`SELECT COUNT(*) as total ${queryBase}`).bind(...queryParams).first();
    
    // 2. Ambil data dengan urutan terbaru dan limit
    const { results } = await env.DB.prepare(`SELECT * ${queryBase} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .bind(...queryParams, limit, offset)
      .all();

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
    const { tanggal, biaya, keterangan, foto_struk } = await request.json();
    const userId = data.user.id;

    if (!biaya || biaya < 0) {
      return new Response(JSON.stringify({ error: 'Biaya tidak valid' }), { status: 400 });
    }

    // Status langsung 'lunas' agar konsisten dengan pencatatan manual
    const result = await env.DB.prepare(`
      INSERT INTO transfer_debit (tanggal, biaya, keterangan, status, user_id, foto_struk)
      VALUES (?, ?, ?, 'lunas', ?, ?)
    `).bind(
      tanggal, biaya, keterangan, userId, foto_struk || null
    ).run();

    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
