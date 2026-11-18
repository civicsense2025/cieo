// Entry point. Only /api/* reaches this Worker (assets.run_worker_first); every other path is served from the static assets.
import { handleContact } from './contact.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') return handleContact(request, env);
    if (pathname.startsWith('/api/')) return new Response('Not found', { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
