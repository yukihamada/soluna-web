import PostalMime from "postal-mime";

export default {
  async email(message, env, ctx) {
    // Parse raw email
    const rawBytes = await new Response(message.raw).arrayBuffer();
    const parser = new PostalMime();
    const parsed = await parser.parse(rawBytes);

    const body = {
      from: message.from,
      to: message.to,
      subject: parsed.subject || "(件名なし)",
      text: parsed.text || parsed.html?.replace(/<[^>]*>/g, " ") || "",
    };

    await fetch(`${env.SERVER_URL}/api/email/inbound`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-email-secret": env.EMAIL_WEBHOOK_SECRET,
      },
      body: JSON.stringify(body),
    });
  },
};
