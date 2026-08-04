import nodemailer from 'nodemailer';

export const maxDuration = 10;

const MAX_BODY_BYTES = 20_000;
let mailer;

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function clean(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\0/g, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, maxLength);
}

function singleLine(value, maxLength) {
  return clean(value, maxLength).replace(/\s+/g, ' ');
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function readLead(body) {
  return {
    nombre: singleLine(body.nombre, 100),
    negocio: singleLine(body.negocio, 120),
    rubro: singleLine(body.rubro, 80),
    ciudad: singleLine(body.ciudad, 100),
    email: singleLine(body.email, 200).toLowerCase(),
    whatsapp: singleLine(body.whatsapp, 50),
    telefono: singleLine(body.telefono, 50),
    sucursales: singleLine(body.sucursales, 30),
    web: singleLine(body.web, 250),
    comentario: clean(body.comentario, 1_500),
    consentimiento: body.consentimiento === true,
    origen: singleLine(body.origen, 80),
    url: singleLine(body.url, 500),
    honeypot: singleLine(body.sitio_web_empresa, 200)
  };
}

function validLead(lead) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email);
  const whatsappOk = lead.whatsapp.replace(/\D/g, '').length >= 8;

  return Boolean(
    lead.nombre &&
    lead.negocio &&
    lead.rubro &&
    lead.ciudad &&
    emailOk &&
    whatsappOk &&
    lead.consentimiento
  );
}

function emailBody(lead) {
  const lines = [
    'Nueva solicitud de demo de Imán Club',
    '',
    `Nombre: ${lead.nombre}`,
    `Negocio: ${lead.negocio}`,
    `Rubro: ${lead.rubro}`,
    `Ciudad: ${lead.ciudad}`,
    `Email: ${lead.email}`,
    `WhatsApp: ${lead.whatsapp}`
  ];

  if (lead.telefono) lines.push(`Teléfono alternativo: ${lead.telefono}`);
  if (lead.sucursales) lines.push(`Sucursales: ${lead.sucursales}`);
  if (lead.web) lines.push(`Instagram/Web: ${lead.web}`);
  if (lead.comentario) lines.push('', 'Qué quiere mejorar:', lead.comentario);
  if (lead.origen) lines.push('', `Origen: ${lead.origen}`);
  if (lead.url) lines.push(`Página: ${lead.url}`);

  return lines.join('\n');
}

function getMailer(user, pass) {
  if (!mailer) {
    mailer = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 10_000
    });
  }
  return mailer;
}

export async function POST(request) {
  if (!sameOrigin(request)) {
    return json({ error: 'Origen no permitido.' }, 403);
  }

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json({ error: 'Formato no permitido.' }, 415);
  }

  let raw;
  let body;
  try {
    raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return json({ error: 'Solicitud demasiado grande.' }, 413);
    }
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Solicitud inválida.' }, 400);
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ error: 'Solicitud inválida.' }, 400);
  }

  const lead = readLead(body);

  // Los bots simples suelen completar este campo oculto. Se responde como éxito
  // para no revelarles la regla, pero no se envía ningún correo.
  if (lead.honeypot) {
    return json({ ok: true });
  }

  if (!validLead(lead)) {
    return json({ error: 'Revisá los datos obligatorios.' }, 400);
  }

  const smtpUser = clean(process.env.SMTP_USER, 320);
  const smtpPass = clean(process.env.SMTP_PASS, 200).replace(/\s/g, '');
  const contactEmail = clean(process.env.CONTACT_EMAIL, 320) || smtpUser;

  if (!smtpUser || !smtpPass || !contactEmail) {
    console.error('contact_email_not_configured');
    return json({ error: 'El envío por correo no está configurado.' }, 503);
  }

  try {
    await getMailer(smtpUser, smtpPass).sendMail({
      from: `"Imán Club" <${smtpUser}>`,
      to: contactEmail,
      replyTo: lead.email,
      subject: `Nueva demo de Imán Club · ${lead.negocio}`,
      text: emailBody(lead)
    });

    return json({ ok: true });
  } catch (error) {
    console.error('contact_email_failed', {
      message: error instanceof Error ? error.message : 'unknown_error'
    });
    return json({ error: 'No se pudo enviar el correo.' }, 502);
  }
}

export function GET() {
  return json({ error: 'Método no permitido.' }, 405);
}
