export const onRequestGet = async ({ request, env, data }) => {
  const user = data.user;
  let query = 'SELECT * FROM biaya_lain';
  if (user.role !== 'owner') query += ` WHERE user_id = ${user.id}`; // Kasir lihat punya sendiri
  query += ' ORDER BY created_at DESC';
  
  const { results } = await env.DB.prepare(query).all();
  return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
};

export const onRequestPost = async ({ request, env, data }) => {
  try {
    const { tanggal, biaya, keterangan, foto_struk } = await request.json();
    const userId = data.user.id;
    
    await env.DB.prepare(`
      INSERT INTO biaya_lain (tanggal, biaya, keterangan, foto_struk, user_id)
      VALUES (?, ?, ?, ?, ?)
    `).bind(tanggal, biaya, keterangan, foto_struk, userId).run();
    
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
