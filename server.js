// ============================================
// RMO Schildersbedrijf — Server
// Express + Nodemailer (Google Workspace SMTP)
// ============================================

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit the email endpoint (max 5 requests per 15 min per IP)
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Te veel aanvragen. Probeer het later opnieuw.' },
});

// Serve static files
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
}));

// --- Nodemailer transporter (Google Workspace SMTP) ---
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify()
  .then(() => console.log('✓ SMTP verbinding succesvol'))
  .catch((err) => console.error('✗ SMTP verbinding mislukt:', err.message));

// --- Helper: build the admin notification email ---
function buildAdminEmail(data) {
  const {
    dienst, type_pand, aantal_ruimtes, planning,
    omschrijving, voornaam, achternaam, email, telefoon,
    adres, gemeente,
  } = data;

  const fullName = `${voornaam} ${achternaam}`;
  const fullAddress = [adres, gemeente].filter(Boolean).join(', ');
  const date = new Date().toLocaleDateString('nl-BE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0D0D0D;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0D0D;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo & Header -->
          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 0;text-align:center;">
                    <span style="font-size:28px;font-weight:700;color:#FFFFFF;letter-spacing:1px;">RMO</span>
                    <span style="font-size:28px;font-weight:300;color:#C4A55A;letter-spacing:1px;"> Schildersbedrijf</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:linear-gradient(145deg,#1A1A1A 0%,#222222 100%);border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">

              <!-- Gold accent bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#C4A55A 0%,#D4BA7A 50%,#C4A55A 100%);"></td>
                </tr>
              </table>

              <!-- Title Section -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 40px 16px;">
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#FFFFFF;">Nieuwe Offerte Aanvraag</h1>
                    <p style="margin:8px 0 0;font-size:14px;color:#8A8679;">${date}</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 40px;">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,#333333,transparent);"></div>
                  </td>
                </tr>
              </table>

              <!-- Service Badge -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 40px 8px;">
                    <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8A8679;font-weight:600;">Gewenste dienst</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:linear-gradient(135deg,#C4A55A,#D4BA7A);color:#1A1A1A;font-size:15px;font-weight:700;padding:10px 24px;border-radius:8px;">
                          ${dienst || '-'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Project Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 40px 0;">
                    <p style="margin:0 0 16px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8A8679;font-weight:600;">Projectgegevens</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:0 40px;">
                <tr>
                  <td width="50%" style="padding:0 8px 12px 0;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;border:1px solid #2A2A2A;">
                      <tr>
                        <td style="padding:16px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">Type Pand</p>
                          <p style="margin:0;font-size:16px;color:#FFFFFF;font-weight:600;">${type_pand || '-'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding:0 0 12px 8px;vertical-align:top;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;border:1px solid #2A2A2A;">
                      <tr>
                        <td style="padding:16px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">Aantal Ruimtes</p>
                          <p style="margin:0;font-size:16px;color:#FFFFFF;font-weight:600;">${aantal_ruimtes || '-'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0 0 12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;border:1px solid #2A2A2A;">
                      <tr>
                        <td style="padding:16px;">
                          <p style="margin:0 0 4px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">Gewenste Planning</p>
                          <p style="margin:0;font-size:16px;color:#FFFFFF;font-weight:600;">${planning || '-'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${omschrijving ? `
              <!-- Description -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 40px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;border:1px solid #2A2A2A;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 6px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">Omschrijving</p>
                          <p style="margin:0;font-size:14px;color:#E5E2DB;line-height:1.6;">${omschrijving}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 40px 0;">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,#333333,transparent);"></div>
                  </td>
                </tr>
              </table>

              <!-- Contact Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 40px 8px;">
                    <p style="margin:0 0 16px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8A8679;font-weight:600;">Contactgegevens</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:0 40px 32px;">
                <tr>
                  <td style="padding:0 0 4px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;border:1px solid #2A2A2A;">
                      <tr>
                        <td style="padding:20px;">
                          <!-- Name -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td width="28" style="vertical-align:top;padding-top:2px;">
                                <span style="font-size:16px;">&#128100;</span>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">Naam</p>
                                <p style="margin:0;font-size:16px;color:#FFFFFF;font-weight:600;">${fullName}</p>
                              </td>
                            </tr>
                          </table>
                          <!-- Email -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td width="28" style="vertical-align:top;padding-top:2px;">
                                <span style="font-size:16px;">&#9993;</span>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">E-mail</p>
                                <a href="mailto:${email}" style="font-size:15px;color:#C4A55A;text-decoration:none;font-weight:500;">${email}</a>
                              </td>
                            </tr>
                          </table>
                          <!-- Phone -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                            <tr>
                              <td width="28" style="vertical-align:top;padding-top:2px;">
                                <span style="font-size:16px;">&#128222;</span>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">Telefoon</p>
                                <a href="tel:${telefoon}" style="font-size:15px;color:#C4A55A;text-decoration:none;font-weight:500;">${telefoon}</a>
                              </td>
                            </tr>
                          </table>
                          <!-- Address -->
                          ${fullAddress ? `
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="28" style="vertical-align:top;padding-top:2px;">
                                <span style="font-size:16px;">&#128205;</span>
                              </td>
                              <td style="vertical-align:top;">
                                <p style="margin:0 0 2px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">Adres</p>
                                <p style="margin:0;font-size:15px;color:#E5E2DB;">${fullAddress}</p>
                              </td>
                            </tr>
                          </table>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 40px 32px;text-align:center;">
                    <a href="mailto:${email}?subject=Offerte%20RMO%20Schildersbedrijf%20-%20${encodeURIComponent(dienst || '')}" style="display:inline-block;background:linear-gradient(135deg,#C4A55A,#D4BA7A);color:#1A1A1A;font-size:15px;font-weight:700;padding:14px 40px;border-radius:8px;text-decoration:none;">
                      Beantwoord deze aanvraag
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#4A4740;">RMO Schildersbedrijf</p>
              <p style="margin:0 0 4px;font-size:12px;color:#4A4740;">Nicolaylaan 147, 3970 Leopoldsburg</p>
              <p style="margin:0;font-size:12px;color:#4A4740;">BTW: BE 0460.214.322</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --- Helper: build the customer confirmation email ---
function buildCustomerEmail(data) {
  const { dienst, voornaam } = data;
  const date = new Date().toLocaleDateString('nl-BE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0D0D0D;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D0D0D;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <span style="font-size:28px;font-weight:700;color:#FFFFFF;letter-spacing:1px;">RMO</span>
              <span style="font-size:28px;font-weight:300;color:#C4A55A;letter-spacing:1px;"> Schildersbedrijf</span>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background:linear-gradient(145deg,#1A1A1A 0%,#222222 100%);border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;">

              <!-- Gold accent bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#C4A55A 0%,#D4BA7A 50%,#C4A55A 100%);"></td>
                </tr>
              </table>

              <!-- Success Icon -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 40px 16px;text-align:center;">
                    <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,rgba(196,165,90,0.15),rgba(196,165,90,0.05));border:2px solid #C4A55A;line-height:64px;font-size:28px;">
                      &#10003;
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px 40px 24px;text-align:center;">
                    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#FFFFFF;">Bedankt, ${voornaam}!</h1>
                    <p style="margin:0;font-size:16px;color:#C8C4BA;line-height:1.6;">
                      Wij hebben uw offerte aanvraag goed ontvangen.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 40px;">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,#333333,transparent);"></div>
                  </td>
                </tr>
              </table>

              <!-- What to expect -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 40px;">
                    <p style="margin:0 0 20px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8A8679;font-weight:600;">Wat kunt u verwachten?</p>

                    <!-- Step 1 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td width="40" style="vertical-align:top;">
                          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#C4A55A,#D4BA7A);color:#1A1A1A;text-align:center;line-height:32px;font-size:14px;font-weight:700;">1</div>
                        </td>
                        <td style="vertical-align:top;padding-top:4px;">
                          <p style="margin:0 0 2px;font-size:15px;color:#FFFFFF;font-weight:600;">Bevestiging ontvangen</p>
                          <p style="margin:0;font-size:13px;color:#8A8679;">Uw aanvraag voor <strong style="color:#C4A55A;">${dienst}</strong> is succesvol verstuurd.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td width="40" style="vertical-align:top;">
                          <div style="width:32px;height:32px;border-radius:50%;background:#2A2A2A;border:2px solid #C4A55A;color:#C4A55A;text-align:center;line-height:28px;font-size:14px;font-weight:700;">2</div>
                        </td>
                        <td style="vertical-align:top;padding-top:4px;">
                          <p style="margin:0 0 2px;font-size:15px;color:#FFFFFF;font-weight:600;">Persoonlijk contact</p>
                          <p style="margin:0;font-size:13px;color:#8A8679;">Wij nemen binnen <strong style="color:#FFFFFF;">24 uur</strong> contact met u op om uw project te bespreken.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="40" style="vertical-align:top;">
                          <div style="width:32px;height:32px;border-radius:50%;background:#2A2A2A;border:2px solid #333;color:#8A8679;text-align:center;line-height:28px;font-size:14px;font-weight:700;">3</div>
                        </td>
                        <td style="vertical-align:top;padding-top:4px;">
                          <p style="margin:0 0 2px;font-size:15px;color:#FFFFFF;font-weight:600;">Vrijblijvende offerte</p>
                          <p style="margin:0;font-size:13px;color:#8A8679;">Na bespreking ontvangt u een gedetailleerde, vrijblijvende offerte op maat.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 40px;">
                    <div style="height:1px;background:linear-gradient(90deg,transparent,#333333,transparent);"></div>
                  </td>
                </tr>
              </table>

              <!-- Request Summary -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 40px;">
                    <p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8A8679;font-weight:600;">Uw aanvraag</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:10px;border:1px solid #2A2A2A;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 2px;font-size:11px;color:#8A8679;text-transform:uppercase;letter-spacing:1px;">Dienst</p>
                          <p style="margin:0;font-size:16px;color:#C4A55A;font-weight:600;">${dienst || '-'}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:16px 0 0;font-size:13px;color:#8A8679;">Datum: ${date}</p>
                  </td>
                </tr>
              </table>

              <!-- Contact Info -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 40px 32px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:14px;color:#C8C4BA;">Vragen? Neem gerust contact met ons op:</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        <td style="padding:0 16px;">
                          <a href="tel:+32473855349" style="font-size:14px;color:#C4A55A;text-decoration:none;font-weight:500;">+32 473 85 53 49</a>
                        </td>
                        <td style="color:#333;">|</td>
                        <td style="padding:0 16px;">
                          <a href="mailto:info@rmoschildersbedrijf.be" style="font-size:14px;color:#C4A55A;text-decoration:none;font-weight:500;">info@rmoschildersbedrijf.be</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#4A4740;">RMO Schildersbedrijf</p>
              <p style="margin:0 0 4px;font-size:12px;color:#4A4740;">Nicolaylaan 147, 3970 Leopoldsburg</p>
              <p style="margin:0 0 12px;font-size:12px;color:#4A4740;">BTW: BE 0460.214.322</p>
              <p style="margin:0;font-size:11px;color:#333;">U ontvangt deze e-mail omdat u een offerte heeft aangevraagd via onze website.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// --- API endpoint: POST /api/offerte ---
app.post('/api/offerte', emailLimiter, async (req, res) => {
  try {
    const data = req.body;

    // Basic validation
    const required = ['dienst', 'voornaam', 'achternaam', 'email', 'telefoon'];
    const missing = required.filter((field) => !data[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Verplichte velden ontbreken: ${missing.join(', ')}`,
      });
    }

    const fullName = `${data.voornaam} ${data.achternaam}`;

    // 1. Send notification email to RMO (admin)
    await transporter.sendMail({
      from: `"RMO Website" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: data.email,
      subject: `Nieuwe offerte aanvraag — ${data.dienst} — ${fullName}`,
      html: buildAdminEmail(data),
    });

    // 2. Send confirmation email to customer
    await transporter.sendMail({
      from: `"RMO Schildersbedrijf" <${process.env.SMTP_USER}>`,
      to: data.email,
      subject: 'Uw offerte aanvraag is ontvangen — RMO Schildersbedrijf',
      html: buildCustomerEmail(data),
    });

    console.log(`✓ Offerte ontvangen van ${fullName} (${data.email})`);

    res.json({ success: true, message: 'Uw aanvraag is succesvol verstuurd!' });
  } catch (error) {
    console.error('✗ Email fout:', error.message);
    res.status(500).json({
      success: false,
      message: 'Er is een fout opgetreden bij het versturen. Probeer het later opnieuw.',
    });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  RMO Schildersbedrijf Server           ║`);
  console.log(`║  http://localhost:${PORT}                 ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});
