export const onRequestGet = async ({ request, env, data }) => {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const user = data.user;

    let query = `
      SELECT * FROM tarik_kredit 
      WHERE 1=1
    `;
    
    // Filter Role: Kasir hanya lihat datanya sendiri
    if (user.role !== 'owner') {
      query += ` AND user_id = ${user.id}`;
    }

    // Filter Tanggal
    if (startDate && endDate) {
      query += ` AND tanggal BETWEEN '${startDate}' AND '${endDate}'`;
    }

    query += ` ORDER BY tanggal DESC, created_at DESC`;

    const { results } = await env.DB.prepare(query).all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestPost = async ({ request, env, data }) => {
  try {
    const { tanggal, nama_user, nominal, admin_fee, sisa, foto_struk, keterangan } = await request.json();
    const userId = data.user.id;

    if (!nominal || !nama_user) {
      return new Response(JSON.stringify({ error: 'Data tidak lengkap' }), { status: 400 });
    }

    const result = await env.DB.prepare(`
      INSERT INTO tarik_kredit (tanggal, nama_user, nominal, admin_fee, sisa, foto_struk, keterangan, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(tanggal, nama_user, nominal, admin_fee, sisa, foto_struk, keterangan, userId).run();

    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
