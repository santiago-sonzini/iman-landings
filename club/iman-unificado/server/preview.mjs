import { writeFile } from 'node:fs/promises';
import { confirmationEmail, ownerEmail, newsletterEmail, newsletterWelcomeEmail } from './email.mjs';
const example={nombre:'Sofía',negocio:'Almacén Central',servicio:'IMAN Fidelización',servicios:['IMAN Fidelización','IMAN Agentes'],email:'sofia@example.com'};
const email = confirmationEmail(example);
await writeFile(new URL('./confirmation-preview.html',import.meta.url),email.html);
await writeFile(new URL('./newsletter-confirmation-preview.html',import.meta.url),newsletterEmail(example,'https://www.iman.ar/','https://www.iman.ar/').html);
await writeFile(new URL('./newsletter-welcome-preview.html',import.meta.url),newsletterWelcomeEmail(example,'https://www.iman.ar/').html);
console.log('Created three HTML email previews with fictional data and inert newsletter links. No email sent.');

await writeFile(new URL('./owner-preview.html',import.meta.url),ownerEmail(example).html);
