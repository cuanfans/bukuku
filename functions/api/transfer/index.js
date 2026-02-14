export const onRequestGet = async ({ request, env, data }) => {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const user = data.user;

    let query = `SELECT * FROM transfer WHERE 1=1`;
    
    // Filter: Kasir hanya lihat datanya sendiri, Owner lihat semua (kecuali difilter)
    if (user.role !== 'owner') {
      query += ` AND user_id = ${user.id}`;
    }
    
    // Filter Tanggal
    if (startDate && endDate) {
      query += ` AND tanggal BETWEEN '${startDate}' AND '${endDate}'`;
    }
    
    // Exclude Setoran Admin (karena ada menu sendiri)
    query += ` AND bank_tujuan != 'SETOR_ADMIN'`;

    query += ` ORDER BY created_at DESC`;

    const { results } = await env.DB.prepare(query).all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestPost = async ({ request, env, data }) => {
  try {
    const { tanggal, bank_tujuan, nomor_rekening, nama_pemilik, nominal, biaya, keterangan, foto_struk } = await request.json();
    const userId = data.user.id;

    // Validasi sederhana
    if (!nominal || nominal <= 0) {
      return new Response(JSON.stringify({ error: 'Nominal harus diisi' }), { status: 400 });
    }

    // Insert ke Database
    const result = await env.DB.prepare(`
      INSERT INTO transfer (tanggal, bank_tujuan, nomor_rekening, nama_pemilik, nominal, biaya, keterangan, status, user_id, foto_struk)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).bind(
      tanggal, 
      bank_tujuan, 
      nomor_rekening, 
      nama_pemilik, 
      nominal, 
      biaya || 0, 
      keterangan, 
      userId,
      foto_struk || null
    ).run();

    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
