const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND = {
  gold: '#C8A55C',
  dark: '#1a1a1a',
  muted: '#777777',
  light: '#f7f6f2',
  border: '#ede9e0',
  white: '#ffffff',
};

// -- Dutch date formatting --------------------------------------------------
function formatDate() {
  return new Date().toLocaleString('nl-BE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Brussels',
  });
}

// -- Shared email helpers ---------------------------------------------------
function row(label, value) {
  if (!value || value === '-') return '';
  return `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid ${BRAND.border};width:40%;font-size:14px;color:${BRAND.muted};vertical-align:top;">${label}</td>
      <td style="padding:12px 16px;border-bottom:1px solid ${BRAND.border};font-size:14px;color:${BRAND.dark};font-weight:600;">${value}</td>
    </tr>`;
}

function sectionTitle(title) {
  return `
    <tr><td colspan="2" style="padding:24px 16px 12px;">
      <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.gold};font-weight:700;">${title}</p>
    </td></tr>`;
}

function emailShell(content) {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BRAND.light};font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.light};padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:${BRAND.white};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);max-width:100%;">
        <!-- Gold top bar -->
        <tr><td style="background:${BRAND.gold};height:6px;"></td></tr>
        ${content}
        <!-- Gold bottom bar -->
        <tr><td style="background:${BRAND.gold};height:4px;"></td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:11px;color:#aaa;text-align:center;">&copy; RMO Schildersbedrijf &mdash; rmoschildersbedrijf.be</p>
    </td></tr>
  </table>
</body>
</html>`;
}

// -- Business email (to info@) ----------------------------------------------
function buildBusinessEmail(d) {
  const fullName = `${d.voornaam} ${d.achternaam}`;
  const address = [d.adres, d.gemeente].filter(Boolean).join(', ');
  const dateStr = formatDate();

  const content = `
    <!-- Header -->
    <tr><td style="padding:32px 40px 24px;border-bottom:1px solid ${BRAND.border};">
      <h1 style="margin:0;font-size:22px;color:${BRAND.dark};font-weight:700;">RMO Schildersbedrijf</h1>
      <p style="margin:6px 0 0;font-size:13px;color:${BRAND.muted};">Nieuwe offerte aanvraag via de website</p>
    </td></tr>

    <!-- Service highlight -->
    <tr><td style="padding:28px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.light};border-radius:10px;border-left:4px solid ${BRAND.gold};">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.muted};font-weight:600;">Gewenste dienst</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:${BRAND.dark};">${d.dienst}</p>
        </td></tr>
      </table>
    </td></tr>

    <!-- Project details -->
    <tr><td style="padding:8px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${sectionTitle('Projectgegevens')}
        ${row('Type pand', d.type_pand)}
        ${row('Aantal ruimtes', d.aantal_ruimtes)}
        ${row('Gewenste planning', d.planning)}
        ${d.omschrijving ? row('Omschrijving', d.omschrijving) : ''}
      </table>
    </td></tr>

    <!-- Contact details -->
    <tr><td style="padding:8px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${sectionTitle('Contactgegevens')}
        ${row('Naam', fullName)}
        ${row('E-mailadres', `<a href="mailto:${d.email}" style="color:${BRAND.gold};text-decoration:none;">${d.email}</a>`)}
        ${row('Telefoon', `<a href="tel:${d.telefoon}" style="color:${BRAND.gold};text-decoration:none;">${d.telefoon}</a>`)}
        ${address ? row('Adres', address) : ''}
      </table>
    </td></tr>

    <!-- Quick-action button -->
    <tr><td style="padding:28px 40px 0;" align="center">
      <a href="mailto:${d.email}?subject=Uw%20offerte%20aanvraag%20%E2%80%94%20RMO%20Schildersbedrijf&body=Beste%20${encodeURIComponent(d.voornaam)}%2C%0A%0ABedankt%20voor%20uw%20aanvraag.%20"
         style="display:inline-block;padding:14px 32px;background:${BRAND.gold};color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">
        Klant beantwoorden
      </a>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:28px 40px;margin-top:20px;background:${BRAND.light};border-top:1px solid ${BRAND.border};">
      <p style="margin:0;font-size:12px;color:${BRAND.muted};">Ontvangen op ${dateStr}</p>
      <p style="margin:6px 0 0;font-size:12px;color:${BRAND.muted};">U kunt ook direct op deze e-mail antwoorden om de klant te bereiken.</p>
    </td></tr>`;

  return emailShell(content);
}

// -- Customer confirmation email --------------------------------------------
function buildCustomerEmail(d) {
  const dateStr = formatDate();

  const content = `
    <!-- Header -->
    <tr><td style="padding:32px 40px 24px;border-bottom:1px solid ${BRAND.border};">
      <h1 style="margin:0;font-size:22px;color:${BRAND.dark};font-weight:700;">RMO Schildersbedrijf</h1>
    </td></tr>

    <!-- Greeting -->
    <tr><td style="padding:32px 40px 0;">
      <h2 style="margin:0 0 12px;font-size:20px;color:${BRAND.dark};">Beste ${d.voornaam},</h2>
      <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">
        Bedankt voor uw offerte aanvraag. Wij hebben deze goed ontvangen en nemen
        <strong>binnen 24 uur</strong> contact met u op om alles te bespreken.
      </p>
    </td></tr>

    <!-- Summary -->
    <tr><td style="padding:28px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.light};border-radius:10px;">
        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.gold};font-weight:700;">Samenvatting van uw aanvraag</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('Dienst', d.dienst)}
            ${row('Type pand', d.type_pand)}
            ${row('Aantal ruimtes', d.aantal_ruimtes)}
            ${row('Planning', d.planning)}
            ${d.omschrijving ? row('Omschrijving', d.omschrijving) : ''}
          </table>
        </td></tr>
      </table>
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:28px 40px 0;">
      <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">
        Heeft u in de tussentijd nog vragen? U kunt ons altijd bereiken:
      </p>
      <table cellpadding="0" cellspacing="0" style="margin-top:16px;">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${BRAND.muted};width:100px;">Telefoon</td>
          <td style="padding:8px 0;font-size:14px;color:${BRAND.dark};font-weight:600;">
            <a href="tel:+32473855349" style="color:${BRAND.gold};text-decoration:none;">+32 473 85 53 49</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${BRAND.muted};">E-mail</td>
          <td style="padding:8px 0;font-size:14px;color:${BRAND.dark};font-weight:600;">
            <a href="mailto:info@rmoschildersbedrijf.be" style="color:${BRAND.gold};text-decoration:none;">info@rmoschildersbedrijf.be</a>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Closing -->
    <tr><td style="padding:28px 40px 0;">
      <p style="margin:0;font-size:15px;line-height:1.7;color:#444;">
        Met vriendelijke groet,<br>
        <strong style="color:${BRAND.dark};">Het team van RMO Schildersbedrijf</strong>
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:28px 40px;margin-top:20px;background:${BRAND.light};border-top:1px solid ${BRAND.border};">
      <p style="margin:0;font-size:12px;color:${BRAND.muted};">Aanvraag ontvangen op ${dateStr}</p>
      <p style="margin:6px 0 0;font-size:12px;color:${BRAND.muted};">Dit is een automatische bevestiging. U hoeft hier niet op te antwoorden.</p>
    </td></tr>`;

  return emailShell(content);
}

// -- Vercel Serverless Handler ----------------------------------------------
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const d = req.body;

  if (!d || !d.dienst || !d.voornaam || !d.achternaam || !d.email || !d.telefoon) {
    return res.status(400).json({ error: 'Verplichte velden ontbreken.' });
  }

  try {
    await Promise.all([
      // Email to the business
      resend.emails.send({
        from: 'RMO Schildersbedrijf <info@rmoschildersbedrijf.be>',
        to: 'info@rmoschildersbedrijf.be',
        subject: `Nieuwe offerte aanvraag: ${d.dienst} \u2014 ${d.voornaam} ${d.achternaam}`,
        html: buildBusinessEmail(d),
        replyTo: d.email,
      }),
      // Confirmation email to the customer
      resend.emails.send({
        from: 'RMO Schildersbedrijf <info@rmoschildersbedrijf.be>',
        to: d.email,
        subject: 'Uw offerte aanvraag is ontvangen \u2014 RMO Schildersbedrijf',
        html: buildCustomerEmail(d),
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Verzenden mislukt. Probeer het later opnieuw.' });
  }
};
