import jwt from '@tsndr/cloudflare-worker-jwt';

export const onRequest = async (context) => {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 1. Bypass validasi untuk endpoint login
  if (url.pathname.startsWith('/api/auth/login')) {
    return next();
  }

  // 2. Cek Header Authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifikasi Token
    const isValid = await jwt.verify(token, env.JWT_SECRET);
    if (!isValid) {
      throw new Error('Invalid token');
    }

    // Decode payload untuk tahu siapa yang login
    const { payload } = jwt.decode(token);
    context.data.user = payload; // Simpan data user ke context agar bisa dipakai di function lain

    return next();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
  }
};
