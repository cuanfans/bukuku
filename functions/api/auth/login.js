import jwt from '@tsndr/cloudflare-worker-jwt';
import bcrypt from 'bcryptjs';

export const onRequestPost = async ({ request, env }) => {
  try {
    const { username, password } = await request.json();

    // Query ke D1 Database
    const user = await env.DB.prepare('SELECT * FROM users WHERE username = ?')
      .bind(username)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User tidak ditemukan' }), { status: 404 });
    }

    // Cek Password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return new Response(JSON.stringify({ error: 'Password salah' }), { status: 401 });
    }

    // Buat Token
    const token = await jwt.sign({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    }, env.JWT_SECRET);

    return new Response(JSON.stringify({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
