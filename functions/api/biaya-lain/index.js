export const onRequestGet = async ({ request, env, data }) => {
  try {
    const user = data.user;
    
    // Pastikan user terautentikasi
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    let query = 'SELECT * FROM biaya_lain';
    
    // Jika bukan owner, filter hanya data sendiri
    if (user.role !== 'owner') {
       query += ` WHERE user_id = ${user.id}`; 
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await env.DB.prepare(query).all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    // Menangkap error jika tabel belum dibuat
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestPost = async ({ request, env, data }) => {
  try {
    const { tanggal, biaya, keterangan, foto_struk } = await request.json();
    const userId = data.user.id;
    
    if (!tanggal || !biaya) {
        return new Response(JSON.stringify({ error: 'Data tanggal dan biaya wajib diisi' }), { status: 400 });
    }

    await env.DB.prepare(`
      INSERT INTO biaya_lain (tanggal, biaya, keterangan, foto_struk, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
        tanggal, 
        biaya, 
        keterangan || '', 
        foto_struk || null, 
        userId
    ).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
