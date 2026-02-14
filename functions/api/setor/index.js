export const onRequestPost = async ({ request, env, data }) => {
  // Input dari Kasir
  const { nominal, keterangan } = await request.json();
  const userId = data.user.id;

  try {
    // Kita simpan sebagai transfer tapi dengan bank_tujuan khusus
    const result = await env.DB.prepare(`
      INSERT INTO transfer (tanggal, bank_tujuan, nomor_rekening, nama_pemilik, nominal, biaya, keterangan, status, user_id)
      VALUES (DATE('now'), 'SETOR_ADMIN', 'ADMIN', 'ADMIN', ?, 0, ?, 'pending', ?)
    `).bind(nominal, keterangan || 'Setor Tunai ke Admin', userId).run();

    return new Response(JSON.stringify({ success: true, message: 'Setoran menunggu approval admin' }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

export const onRequestPut = async ({ request, env, data }) => {
  // Approval oleh Admin (Owner)
  if (data.user.role !== 'owner') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const { id, status } = await request.json(); // status: 'lunas'

  try {
    await env.DB.prepare(
      'UPDATE transfer SET status = ?, updated_at = datetime("now") WHERE id = ? AND bank_tujuan = "SETOR_ADMIN"'
    ).bind(status, id).run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
