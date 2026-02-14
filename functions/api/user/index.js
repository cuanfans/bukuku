import bcrypt from 'bcryptjs';

// GET: Ambil daftar user
export const onRequestGet = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, username, role, status, created_at FROM users ORDER BY created_at DESC'
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// POST: Tambah User Baru
export const onRequestPost = async ({ request, env }) => {
  try {
    const { username, password, role, status } = await request.json();

    // 1. Validasi Input
    if (!username || !password || !role) {
      return new Response(JSON.stringify({ error: 'Data tidak lengkap' }), { status: 400 });
    }

    // 2. Cek apakah username sudah ada
    const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Username sudah digunakan' }), { status: 409 });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan ke Database
    const result = await env.DB.prepare(
      'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)'
    ).bind(username, hashedPassword, role, status || 'aktif').run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User berhasil dibuat',
      id: result.meta.last_row_id 
    }), { status: 201 });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// PUT: Edit User
export const onRequestPut = async ({ request, env }) => {
  try {
    const { id, username, password, role, status } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'ID user diperlukan' }), { status: 400 });
    }

    // Cek User Lama
    const oldUser = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    if (!oldUser) {
      return new Response(JSON.stringify({ error: 'User tidak ditemukan' }), { status: 404 });
    }

    let finalPassword = oldUser.password;
    
    // Jika password diisi, update password baru
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      finalPassword = await bcrypt.hash(password, salt);
    }

    // Update Database
    await env.DB.prepare(
      'UPDATE users SET username = ?, password = ?, role = ?, status = ?, updated_at = datetime("now") WHERE id = ?'
    ).bind(username || oldUser.username, finalPassword, role || oldUser.role, status || oldUser.status, id).run();

    return new Response(JSON.stringify({ success: true, message: 'User berhasil diupdate' }), { status: 200 });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// DELETE: Hapus User
export const onRequestDelete = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // Ambil ID dari query param ?id=...

    // Jika delete dikirim via body JSON (opsional, tergantung frontend)
    // const { id } = await request.json(); 

    if (!id) {
       // Coba ambil dari body jika query param kosong
       try {
         const body = await request.json();
         if (body.id) return deleteUser(body.id, env);
       } catch (e) {}
       
       return new Response(JSON.stringify({ error: 'ID user diperlukan' }), { status: 400 });
    }

    return deleteUser(id, env);

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// Helper function untuk delete
async function deleteUser(id, env) {
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  return new Response(JSON.stringify({ success: true, message: 'User berhasil dihapus' }), { status: 200 });
}
