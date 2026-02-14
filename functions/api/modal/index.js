export const onRequestPost = async ({ request, env, data }) => {
  const { modal_type, nominal } = await request.json();
  const userId = data.user.id; // Didapat dari middleware

  // Validasi Input
  if (!modal_type || !nominal) {
    return new Response(JSON.stringify({ error: 'Data tidak lengkap' }), { status: 400 });
  }

  // Insert ke D1
  try {
    const result = await env.DB.prepare(
      'INSERT INTO modal (modal_type, nominal, user_id) VALUES (?, ?, ?)'
    ).bind(modal_type, nominal, userId).run();

    // Catat Log
    await env.DB.prepare(
      'INSERT INTO logs (user_id, action, table_name, new_values) VALUES (?, ?, ?, ?)'
    ).bind(userId, 'INSERT', 'modal', JSON.stringify({ modal_type, nominal })).run();

    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
