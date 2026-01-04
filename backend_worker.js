export default {
    async fetch(request, env, ctx) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        };
        if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
        const url = new URL(request.url);
        const WORKER_ORIGIN = url.origin;

        // --- DOMAINS ---
        const OLD_ASSETS_DOMAIN = "https://pub-cb3ee67ac9934a35a6d7ddc427fbcab6.r2.dev";
        const OLD_USER_CONTENT_DOMAIN = "https://pub-375895c80d094e3f8ffa936152fa25f5.r2.dev";
        const NEW_ASSETS_DOMAIN = "https://pub-baa736bf74e943b6a7f0e65fc656c0d5.r2.dev";
        const NEW_PROFILE_DOMAIN = "https://pub-9235eabc082d469f8dfd760bf714c0e6.r2.dev";
        const FIREBASE_API_KEY = "AIzaSyDsGYist7f2enKCGyHwBwSUw70wM_he1Ao";
        const ADMINS = ["admin", "sujeet", "RMgX"];

        // --- HELPER: DELETE FROM R2 ---
        async function deleteR2Image(imageUrl) {
            if (!imageUrl) return;
            // Handle both old R2 domains and new proxy URLs
            let key = null;
            if (imageUrl.includes("/content/")) key = imageUrl.split("/content/")[1];
            else if (imageUrl.includes("r2.dev/")) key = imageUrl.split("r2.dev/")[1];
            if (key) {
                // Try delete from both buckets to be safe
                try { await env.PROFILE_BUCKET.delete(key); } catch (e) { }
                try { await env.USER_BUCKET.delete(key); } catch (e) { }
            }
        }

        // --- SECURITY HELPER: VERIFY FIREBASE TOKEN ---
        async function verifyUser(req) {
            const authHeader = req.headers.get("Authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
            const token = authHeader.split(" ")[1];
            try {
                // Verify token with Google
                const googleRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken: token })
                });
                const data = await googleRes.json();
                if (!data.users || data.users.length === 0) return null;
                const email = data.users[0].email;
                // Look up the REAL username in D1 based on the secure email
                const dbUser = await env.DB.prepare("SELECT username FROM users WHERE email = ?").bind(email).first();
                if (!dbUser) return null; // Valid google account, but not registered in your app
                return { username: dbUser.username, email: email };
            } catch (e) {
                return null;
            }
        }

        // =================================================================================
        // PUBLIC READ ENDPOINTS (No Auth Needed)
        // =================================================================================

        // CHAT HISTORY
        if (url.pathname === "/chat/history") {
            try {
                const room_id = url.searchParams.get("room") || "study-room-1";
                const beforeTimestamp = url.searchParams.get("before");
                const limit = 20;
                let query = "SELECT * FROM chats WHERE room_id = ?";
                let params = [room_id];
                if (beforeTimestamp) {
                    query += " AND timestamp < ? ORDER BY timestamp DESC LIMIT ?";
                    params.push(parseInt(beforeTimestamp), limit);
                } else {
                    query += " ORDER BY timestamp DESC LIMIT ?";
                    params.push(limit);
                }
                const { results } = await env.DB.prepare(query).bind(...params).all();
                return new Response(JSON.stringify(results.reverse()), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // JOURNAL POSTS
        if (url.pathname === "/journals/posts") {
            try {
                const journal_id = url.searchParams.get("id");
                const beforeTimestamp = url.searchParams.get("before");
                const limit = 20;
                let query = "SELECT * FROM journal_posts WHERE journal_id = ?";
                let params = [journal_id];
                if (beforeTimestamp) {
                    query += " AND created_at < ? ORDER BY created_at DESC LIMIT ?";
                    params.push(parseInt(beforeTimestamp), limit);
                } else {
                    query += " ORDER BY created_at DESC LIMIT ?";
                    params.push(limit);
                }
                const { results: posts } = await env.DB.prepare(query).bind(...params).all();
                const postIds = posts.map(p => p.id).join(',');
                let reactionsMap = {};
                if (postIds.length > 0) {
                    const { results: reactions } = await env.DB.prepare(`SELECT post_id, emoji, username FROM post_reactions WHERE post_id IN (${postIds})`).all();
                    reactions.forEach(r => {
                        if (!reactionsMap[r.post_id]) reactionsMap[r.post_id] = [];
                        reactionsMap[r.post_id].push(r);
                    });
                }
                const postsWithReactions = posts.map(p => ({ ...p, reactions: reactionsMap[p.id] || [] }));
                return new Response(JSON.stringify(postsWithReactions.reverse()), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // JOURNAL LIST
        if (url.pathname === "/journals/list") {
            try {
                const { results } = await env.DB.prepare("SELECT * FROM community_journals ORDER BY last_updated DESC LIMIT 50").all();
                return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // PUBLIC ASSETS / GALLERY
        if (url.pathname === "/" || url.pathname === "/gallery") {
            try {
                const list = await env.ASSETS_BUCKET.list({ prefix: 'background/', limit: 50 });
                const fileUrls = list.objects.map(item => ({ filename: item.key, url: `${NEW_ASSETS_DOMAIN}/${item.key}` }));
                return new Response(JSON.stringify(fileUrls), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { headers: corsHeaders }); }
        }

        // LEADERBOARD
        if (url.pathname === "/leaderboard") {
            try {
                const timeframe = url.searchParams.get("timeframe") || "all";
                let query = "";
                let params = [];
                if (timeframe === 'daily') {
                    const today = new Date().toISOString().split('T')[0];
                    query = `
                    SELECT users.username, users.photoURL, COALESCE(SUM(study_logs.minutes), 0) as total_minutes 
                    FROM users 
                    LEFT JOIN study_logs ON users.username = study_logs.username AND study_logs.date = ?
                    GROUP BY users.username 
                    ORDER BY total_minutes DESC 
                    LIMIT 50`;
                    params = [today];
                } else if (timeframe === 'weekly') {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    const lastWeek = d.toISOString().split('T')[0];
                    query = `
                    SELECT users.username, users.photoURL, COALESCE(SUM(study_logs.minutes), 0) as total_minutes 
                    FROM users 
                    LEFT JOIN study_logs ON users.username = study_logs.username AND study_logs.date >= ?
                    GROUP BY users.username 
                    ORDER BY total_minutes DESC 
                    LIMIT 50`;
                    params = [lastWeek];
                } else {
                    query = "SELECT username, total_minutes, photoURL FROM users ORDER BY total_minutes DESC LIMIT 50";
                }
                const { results } = await env.DB.prepare(query).bind(...params).all();
                const cacheTtl = timeframe === 'all' ? 10 : 5;
                return new Response(JSON.stringify(results), {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                        "Cache-Control": `public, max-age=${cacheTtl}`
                    }
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
            }
        }

        // USER STATUS
        if (url.pathname === "/user/status" && request.method === "GET") {
            try {
                const username = url.searchParams.get("username");
                const user = await env.DB.prepare("SELECT status_text, photoURL, equipped_frame FROM users WHERE username = ?").bind(username).first();
                return new Response(JSON.stringify({
                    status_text: user?.status_text || "",
                    photoURL: user?.photoURL || null,
                    equipped_frame: user?.equipped_frame || null
                }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // STATS & HISTORY
        if (url.pathname === "/study/stats") {
            try {
                const username = url.searchParams.get("username");
                const user = await env.DB.prepare("SELECT total_minutes FROM users WHERE username = ?").bind(username).first();
                return new Response(JSON.stringify({ total_minutes: user ? user.total_minutes : 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }
        if (url.pathname === "/study/history") {
            try {
                const username = url.searchParams.get("username");
                const { results } = await env.DB.prepare("SELECT date, minutes FROM study_logs WHERE username = ?").bind(username).all();
                const history = {};
                results.forEach(row => history[row.date] = row.minutes);
                return new Response(JSON.stringify(history), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // JOURNAL FOLLOWERS
        if (url.pathname === "/journals/followers") {
            try {
                const journal_id = url.searchParams.get("id");
                const { results } = await env.DB.prepare("SELECT username FROM journal_followers WHERE journal_id = ? ORDER BY created_at DESC LIMIT 5").bind(journal_id).all();
                return new Response(JSON.stringify(results.map(r => r.username)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders }); }
        }
        if (url.pathname === "/journals/following") {
            try {
                const username = url.searchParams.get("username");
                const { results } = await env.DB.prepare("SELECT journal_id FROM journal_followers WHERE username = ?").bind(username).all();
                return new Response(JSON.stringify(results.map(r => r.journal_id)), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders }); }
        }

        // =================================================================================
        // SECURE ENDPOINTS (Require Token Verification)
        // =================================================================================

        // AUTH CHECK
        if (url.pathname === "/auth/google-check" && request.method === "POST") {
            try {
                const { email } = await request.json();
                const user = await env.DB.prepare("SELECT username FROM users WHERE email = ?").bind(email).first();
                if (user) {
                    await env.DB.prepare("UPDATE users SET last_seen = ?1 WHERE email = ?2")
                        .bind(Date.now(), email).run();
                    return new Response(JSON.stringify({ exists: true, username: user.username }), { headers: corsHeaders });
                } else {
                    return new Response(JSON.stringify({ exists: false }), { headers: corsHeaders });
                }
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // AUTH CREATE
        if (url.pathname === "/auth/google-create" && request.method === "POST") {
            try {
                const { email, username } = await request.json();
                if (!username || username.length < 3) return new Response(JSON.stringify({ error: "Username too short" }), { status: 400, headers: corsHeaders });
                const existingName = await env.DB.prepare("SELECT 1 FROM users WHERE username = ?").bind(username).first();
                if (existingName) return new Response(JSON.stringify({ error: "Username taken" }), { status: 409, headers: corsHeaders });
                await env.DB.prepare(
                    "INSERT INTO users (username, email, last_seen, created_at, total_minutes, password, photoURL) VALUES (?, ?, ?, ?, 0, 'google-auth', ?)"
                ).bind(username, email, Date.now(), Date.now(), "").run();
                return new Response(JSON.stringify({ success: true, username }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // UPDATE STATUS
        if (url.pathname === "/user/status" && request.method === "POST") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const { status_text } = await request.json();
                await env.DB.prepare("UPDATE users SET status_text = ?, status_time = ? WHERE username = ?")
                    .bind(status_text, Date.now(), verified.username).run();
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // UPDATE PROFILE (RENAMING & MIGRATION - FIX)
        if (url.pathname === "/user/profile" && request.method === "POST") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const { photoURL, username } = await request.json();
                const oldUsername = verified.username;

                // 1. HANDLE USERNAME CHANGE (MIGRATION)
                if (username && username !== oldUsername) {
                    if (username.length < 3) return new Response(JSON.stringify({ error: "Username too short" }), { status: 400, headers: corsHeaders });
                    const existing = await env.DB.prepare("SELECT 1 FROM users WHERE username = ?").bind(username).first();
                    if (existing) return new Response(JSON.stringify({ error: "Username taken" }), { status: 409, headers: corsHeaders });

                    // Atomic Batch Update to ensure history follows the user
                    await env.DB.batch([
                        env.DB.prepare("UPDATE users SET username = ?, photoURL = COALESCE(?, photoURL) WHERE username = ?").bind(username, photoURL || null, oldUsername),
                        env.DB.prepare("UPDATE chats SET username = ? WHERE username = ?").bind(username, oldUsername),
                        env.DB.prepare("UPDATE study_logs SET username = ? WHERE username = ?").bind(username, oldUsername),
                        env.DB.prepare("UPDATE community_journals SET username = ? WHERE username = ?").bind(username, oldUsername),
                        env.DB.prepare("UPDATE journal_posts SET username = ? WHERE username = ?").bind(username, oldUsername),
                        env.DB.prepare("UPDATE journal_followers SET username = ? WHERE username = ?").bind(username, oldUsername),
                        env.DB.prepare("UPDATE post_reactions SET username = ? WHERE username = ?").bind(username, oldUsername)
                    ]);
                    return new Response(JSON.stringify({ success: true, username }), { headers: corsHeaders });
                }

                // 2. STANDARD PHOTO UPDATE
                if (photoURL) {
                    await env.DB.prepare("UPDATE users SET photoURL = ? WHERE username = ?")
                        .bind(photoURL, oldUsername).run();
                }
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // JOURNAL & POSTS
        if (url.pathname === "/journals/create" && request.method === "POST") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const { title, tags, theme, images } = await request.json();
                const now = Date.now();
                await env.DB.prepare("INSERT INTO community_journals (username, title, tags, theme_color, images, created_at, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?)")
                    .bind(verified.username, title, tags, theme || 'bg-blue-500', images || "", now, now).run();
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        if (url.pathname === "/journals/delete" && request.method === "DELETE") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const { id } = await request.json();
                const journal = await env.DB.prepare("SELECT * FROM community_journals WHERE id = ?").bind(id).first();
                if (!journal) return new Response("Not found", { status: 404, headers: corsHeaders });
                if (journal.username !== verified.username && !ADMINS.includes(verified.username)) {
                    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
                }
                if (journal.images) { const images = journal.images.split(','); for (const img of images) await deleteR2Image(img); }
                await env.DB.batch([env.DB.prepare("DELETE FROM community_journals WHERE id = ?").bind(id), env.DB.prepare("DELETE FROM journal_posts WHERE journal_id = ?").bind(id), env.DB.prepare("DELETE FROM journal_followers WHERE journal_id = ?").bind(id)]);
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        if (url.pathname === "/journals/post" && request.method === "POST") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const { journal_id, content, image_url } = await request.json();
                const now = Date.now();
                await env.DB.prepare("INSERT INTO journal_posts (journal_id, username, content, image_url, created_at) VALUES (?, ?, ?, ?, ?)").bind(journal_id, verified.username, content, image_url || null, now).run();
                await env.DB.prepare("UPDATE community_journals SET last_updated = ? WHERE id = ?").bind(now, journal_id).run();
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // SOCIAL INTERACTIONS
        if (url.pathname === "/journals/follow" && request.method === "POST") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const { journal_id } = await request.json();
                const existing = await env.DB.prepare("SELECT id FROM journal_followers WHERE journal_id = ? AND username = ?").bind(journal_id, verified.username).first();
                if (existing) { await env.DB.prepare("DELETE FROM journal_followers WHERE id = ?").bind(existing.id).run(); return new Response(JSON.stringify({ action: "unfollowed" }), { headers: corsHeaders }); }
                else { await env.DB.prepare("INSERT INTO journal_followers (journal_id, username, created_at) VALUES (?, ?, ?)").bind(journal_id, verified.username, Date.now()).run(); return new Response(JSON.stringify({ action: "followed" }), { headers: corsHeaders }); }
            } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders }); }
        }

        if (url.pathname === "/journals/react" && request.method === "POST") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const { post_id, emoji } = await request.json();
                const existing = await env.DB.prepare("SELECT id FROM post_reactions WHERE post_id = ? AND username = ? AND emoji = ?").bind(post_id, verified.username, emoji).first();
                if (existing) { await env.DB.prepare("DELETE FROM post_reactions WHERE id = ?").bind(existing.id).run(); return new Response(JSON.stringify({ action: "removed" }), { headers: corsHeaders }); }
                else { await env.DB.prepare("INSERT INTO post_reactions (post_id, username, emoji, created_at) VALUES (?, ?, ?, ?)").bind(post_id, verified.username, emoji, Date.now()).run(); return new Response(JSON.stringify({ action: "added" }), { headers: corsHeaders }); }
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // UPLOAD & PROXY
        if (url.pathname === "/upload" && request.method === "PUT") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const id = crypto.randomUUID();
                const key = `journal-uploads/${id}`;
                await env.PROFILE_BUCKET.put(key, request.body);
                return new Response(JSON.stringify({ url: `${NEW_PROFILE_DOMAIN}/${key}` }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        if (url.pathname.startsWith("/content/") && request.method === "GET") {
            const key = url.pathname.replace("/content/", "");
            if (!key) return new Response("Missing key", { status: 400, headers: corsHeaders });
            let object = null;
            try { object = await env.PROFILE_BUCKET.get(key); } catch (e) { }
            if (!object) { try { object = await env.USER_BUCKET.get(key); } catch (e) { } }
            if (!object) return new Response("Not found", { status: 404, headers: corsHeaders });
            const headers = new Headers(object.httpMetadata);
            headers.set("etag", object.httpEtag);
            headers.set("Access-Control-Allow-Origin", "*");
            headers.set("Cache-Control", "public, max-age=31536000");
            return new Response(object.body, { headers });
        }

        // CHAT SEND
        if (url.pathname === "/chat/send" && request.method === "POST") {
            const verified = await verifyUser(request);
            if (!verified) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            try {
                const { room_id, message, photoURL } = await request.json();
                await env.DB.prepare("INSERT INTO chats (room_id, username, message, timestamp, photoURL) VALUES (?, ?, ?, ?, ?)").bind(room_id, verified.username, message, Date.now(), photoURL || "").run();
                return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        // GAMIFICATION
        if (url.pathname === "/gamification/stats") {
            try {
                const username = url.searchParams.get("username");
                const user = await env.DB.prepare("SELECT xp, coins, current_streak, inventory, equipped_badge, equipped_frame, equipped_effect, name_color, photoURL FROM users WHERE username = ?").bind(username).first();
                if (!user) return new Response("User not found", { status: 404, headers: corsHeaders });
                let inventory = [];
                try { inventory = JSON.parse(user.inventory || '[]'); } catch (e) { }
                return new Response(JSON.stringify({
                    xp: user.xp || 0,
                    coins: user.coins || 0,
                    current_streak: user.current_streak || 0,
                    inventory,
                    equipped_badge: user.equipped_badge || "",
                    equipped_frame: user.equipped_frame || "",
                    equipped_effect: user.equipped_effect || "",
                    name_color: user.name_color || "",
                    photoURL: user.photoURL || null
                }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        if ((url.pathname === "/gamification/award" || url.pathname === "/study/update") && request.method === "POST") {
            try {
                const { username, minutes } = await request.json();
                const cleanMinutes = Math.min(Math.max(Number(minutes), 0), 120);
                if (cleanMinutes === 0) return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
                const xpGain = Math.floor(cleanMinutes * 10);
                const coinsGain = Math.floor(cleanMinutes * 5);
                const userExists = await env.DB.prepare("SELECT username FROM users WHERE username = ?").bind(username).first();
                if (!userExists) { await env.DB.prepare("INSERT INTO users (username, xp, coins, total_minutes) VALUES (?, 0, 0, 0)").bind(username).run(); }
                await env.DB.prepare("UPDATE users SET xp = xp + ?1, coins = coins + ?2, total_minutes = total_minutes + ?3 WHERE username = ?4").bind(xpGain, coinsGain, cleanMinutes, username).run();
                const today = new Date().toISOString().split('T')[0];
                const log = await env.DB.prepare("SELECT id FROM study_logs WHERE username = ? AND date = ?").bind(username, today).first();
                if (log) { await env.DB.prepare("UPDATE study_logs SET minutes = minutes + ? WHERE id = ?").bind(cleanMinutes, log.id).run(); }
                else { await env.DB.prepare("INSERT INTO study_logs (username, date, minutes) VALUES (?, ?, ?)").bind(username, today, cleanMinutes).run(); }
                return new Response(JSON.stringify({ success: true, xpGain, coinsGain }), { headers: corsHeaders });
            } catch (err) { return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders }); }
        }

        if (url.pathname === "/gamification/shop/items" && request.method === "GET") {
            try {
                const { results } = await env.DB.prepare("SELECT * FROM shop_items ORDER BY price ASC").all();
                return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
            } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders }); }
        }

        return new Response("Not found", { status: 404, headers: corsHeaders });
    },
};
