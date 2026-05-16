export default {
  async email(message, env, ctx) {
    try {
      const rawEmail = await new Response(message.raw).text();
      
      const response = await fetch(env.WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.WEBHOOK_SECRET}`
        },
        body: JSON.stringify({
          raw: rawEmail,
          to: message.to,
          from: message.from
        })
      });

      if (!response.ok) {
        console.error(`Webhook returned ${response.status}: ${await response.text()}`);
      }
    } catch (e) {
      console.error('Worker error:', e);
    }
  }
}
