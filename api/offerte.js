export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    dienst,
    type_pand,
    aantal_ruimtes,
    planning,
    omschrijving,
    voornaam,
    achternaam,
    email,
    telefoon,
    adres,
    gemeente,
    _honey,
  } = req.body;

  // Honeypot spam check
  if (_honey) {
    return res.status(200).json({ success: true });
  }

  // Basic validation
  if (!dienst || !voornaam || !achternaam || !email || !telefoon) {
    return res.status(400).json({ success: false, error: 'Vul alle verplichte velden in.' });
  }

  const addressParts = [adres, gemeente].filter(Boolean);
  const address = addressParts.length ? addressParts.join(', ') : '-';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #1a2a1f; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #c4a55a; margin: 0; font-size: 22px;">Nieuwe Offerte Aanvraag</h1>
        <p style="color: rgba(255,255,255,0.5); margin: 8px 0 0; font-size: 14px;">Via de website ontvangen</p>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e5e5;">
        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #c4a55a; margin: 0 0 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Dienst</h2>
        <p style="font-size: 18px; font-weight: 600; margin: 0 0 28px;">${dienst}</p>

        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #c4a55a; margin: 0 0 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Project</h2>
        <table style="width: 100%; margin-bottom: 28px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #888; font-size: 14px; width: 140px;">Type pand</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500;">${type_pand || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888; font-size: 14px;">Aantal ruimtes</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500;">${aantal_ruimtes || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888; font-size: 14px;">Planning</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500;">${planning || '-'}</td>
          </tr>
          ${omschrijving ? `
          <tr>
            <td style="padding: 6px 0; color: #888; font-size: 14px; vertical-align: top;">Omschrijving</td>
            <td style="padding: 6px 0; font-size: 14px; line-height: 1.5;">${omschrijving.replace(/\n/g, '<br>')}</td>
          </tr>` : ''}
        </table>

        <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #c4a55a; margin: 0 0 16px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Contactgegevens</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #888; font-size: 14px; width: 140px;">Naam</td>
            <td style="padding: 6px 0; font-size: 14px; font-weight: 500;">${voornaam} ${achternaam}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888; font-size: 14px;">E-mail</td>
            <td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #c4a55a;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888; font-size: 14px;">Telefoon</td>
            <td style="padding: 6px 0; font-size: 14px;"><a href="tel:${telefoon}" style="color: #c4a55a;">${telefoon}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888; font-size: 14px;">Adres</td>
            <td style="padding: 6px 0; font-size: 14px;">${address}</td>
          </tr>
        </table>
      </div>
      <div style="background: #f8f8f8; padding: 20px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; border-top: 0; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #999;">Dit bericht is automatisch verzonden via rmoschildersbedrijf.be</p>
      </div>
    </div>
  `;

  const confirmHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: #1a2a1f; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #c4a55a; margin: 0; font-size: 22px;">Bedankt voor uw aanvraag</h1>
        <p style="color: rgba(255,255,255,0.5); margin: 8px 0 0; font-size: 14px;">RMO Schildersbedrijf</p>
      </div>
      <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e5e5;">
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Beste ${voornaam},</p>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Wij hebben uw offerte aanvraag in goede orde ontvangen. Hieronder vindt u een overzicht van uw aanvraag.</p>

        <div style="background: #f8f8f8; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #c4a55a; margin: 0 0 12px;">Uw aanvraag</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; color: #888; font-size: 14px; width: 130px;">Dienst</td>
              <td style="padding: 5px 0; font-size: 14px; font-weight: 500;">${dienst}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #888; font-size: 14px;">Type pand</td>
              <td style="padding: 5px 0; font-size: 14px;">${type_pand || '-'}</td>
            </tr>
            ${aantal_ruimtes ? `<tr>
              <td style="padding: 5px 0; color: #888; font-size: 14px;">Ruimtes</td>
              <td style="padding: 5px 0; font-size: 14px;">${aantal_ruimtes}</td>
            </tr>` : ''}
            ${planning ? `<tr>
              <td style="padding: 5px 0; color: #888; font-size: 14px;">Planning</td>
              <td style="padding: 5px 0; font-size: 14px;">${planning}</td>
            </tr>` : ''}
          </table>
        </div>

        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 8px;">Wij nemen <strong>binnen 24 uur</strong> contact met u op om uw project te bespreken.</p>
        <p style="font-size: 15px; line-height: 1.6; margin: 0;">Heeft u in de tussentijd vragen? Neem gerust contact op via <a href="tel:+32471234567" style="color: #c4a55a; text-decoration: none;">telefoon</a> of antwoord op deze e-mail.</p>
      </div>
      <div style="background: #f8f8f8; padding: 20px 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; border-top: 0; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #999;">RMO Schildersbedrijf &mdash; rmoschildersbedrijf.be</p>
      </div>
    </div>
  `;

  try {
    const resendHeaders = {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // Send both emails in parallel: notification to business + confirmation to customer
    const [notifyResponse, confirmResponse] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: resendHeaders,
        body: JSON.stringify({
          from: 'RMO Schildersbedrijf <offerte@rmoschildersbedrijf.be>',
          to: 'info@rmoschildersbedrijf.be',
          reply_to: email,
          subject: `Offerte aanvraag: ${dienst} — ${voornaam} ${achternaam}`,
          html,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: resendHeaders,
        body: JSON.stringify({
          from: 'RMO Schildersbedrijf <offerte@rmoschildersbedrijf.be>',
          to: email,
          subject: `Uw offerte aanvraag — ${dienst}`,
          html: confirmHtml,
        }),
      }),
    ]);

    const notifyData = await notifyResponse.json();
    const confirmData = await confirmResponse.json();

    if (!notifyResponse.ok) {
      console.error('Resend API error (notification):', notifyData);
      return res.status(500).json({ success: false, error: 'E-mail kon niet worden verzonden.' });
    }

    if (!confirmResponse.ok) {
      console.error('Resend API error (confirmation):', confirmData);
      // Notification was sent, so don't fail entirely
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend request failed:', err);
    return res.status(500).json({ success: false, error: 'Er is een serverfout opgetreden.' });
  }
}
