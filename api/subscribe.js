// api/subscribe.js
// NOTE: Before deploying, create these custom fields in Beehiiv dashboard:
//   Settings → Publication → Custom Fields
//   Add: "scroll_hours" (type: text)
//   Add: "top_activity" (type: text)
// Without creating them first, Beehiiv will ignore these fields silently.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, scroll_hours, top_activity } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const payload = {
    email,
    reactivate_existing: true,
    send_welcome_email: true,
  };

  // Attach custom fields if present
  const customFields = [];
  if (scroll_hours !== undefined && scroll_hours !== null) {
    customFields.push({ name: 'scroll_hours', value: String(scroll_hours) });
  }
  if (top_activity) {
    customFields.push({ name: 'top_activity', value: String(top_activity) });
  }
  if (customFields.length > 0) {
    payload.custom_fields = customFields;
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUB_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      const errorText = await response.text();
      console.error('Beehiiv error:', response.status, errorText);
      return res.status(500).json({ error: 'Subscription failed' });
    }
  } catch (err) {
    console.error('Subscribe handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
