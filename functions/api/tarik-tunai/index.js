export const onRequestGet = async ({ request, env, data }) => {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const user = data.user;

    let query = `SELECT * FROM tarik_tunai WHERE 1=1`;
    
    if (user.role !== 'owner') {
      query += ` AND user_id = ${user.id}`;
    }

    if (startDate && endDate) {
      query += ` AND tanggal BETWEEN '${startDate}' AND '${endDate}'`;
    }

    query += ` ORDER BY created_at DESC`;

    const { results } = await env.DB.prepare(query).all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestPost = async ({ request, env, data }) => {
  try {
    const { tanggal, bank, nominal_tarik, biaya_tarik, keterangan, foto_struk } = await request.json();
    const userId = data.user.id;

    if (!nominal_tarik || nominal_tarik <= 0) {
      return new Response(JSON.stringify({ error: 'Nominal tarik harus diisi' }), { status: 400 });
    }

    // Insert ke Database
    const result = await env.DB.prepare(`
      INSERT INTO tarik_tunai (tanggal, bank, nominal_tarik, biaya_tarik, keterangan, status, user_id, foto_struk)
      VALUES (?, ?, ?, ?, ?, 'lunas', ?, ?)
    `).bind(
      tanggal, 
      bank, 
      nominal_tarik, 
      biaya_tarik || 0, 
      keterangan, 
      userId,
      foto_struk || null
    ).run();

    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
