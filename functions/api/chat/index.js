export const onRequestGet = async ({ env }) => {
  // Ambil 50 chat terakhir
  const { results } = await env.DB.prepare('SELECT * FROM chats ORDER BY created_at DESC LIMIT 50').all();
  return new Response(JSON.stringify(results.reverse()), { headers: { 'Content-Type': 'application/json' } });
};

export const onRequestPost = async ({ request, env, data }) => {
  const { message } = await request.json();
  const user = data.user;
  
  await env.DB.prepare('INSERT INTO chats (sender_id, sender_name, message) VALUES (?, ?, ?)')
    .bind(user.id, user.username, message).run();
    
  return new Response(JSON.stringify({ success: true }), { status: 201 });
};
