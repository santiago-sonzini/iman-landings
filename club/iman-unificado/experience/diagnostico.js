/* IMÁN · Diagnóstico. Eight questions, then a landing built from the answers.
   Everything the page says comes from the tables below: rubros, problems, solutions, prices and example conversations. */
(() => {
  'use strict';
  const quiz=document.querySelector('#quiz');
  if(!quiz)return;
  const AGENDA='https://agenda.iman.ar/', WA='https://wa.me/5493535189997';

  /* ---------- Content ---------- */

  // The four solutions. "desde" is the reference price in pesos per month, the same one the WhatsApp assistant quotes
  // (iman-whatsapp-bot/clientes/iman/negocio.md); null means there is no list price. "servicio" is the name /api/contacto accepts.
  const SOL={
    whatsapp:{servicio:'WhatsApp e IA',nombre:'Asistente de WhatsApp con IA',corto:'un asistente de WhatsApp con IA',desde:100000,url:'/automatizaciones/',texto:'Responde consultas, toma pedidos y agenda con la información de tu negocio.'},
    club:{servicio:'Fidelización y email marketing',nombre:'Club de clientes',corto:'un club de clientes con tu marca',desde:100000,url:'/fidelizacion/',texto:'Puntos, Wallet y email para que quien ya compró vuelva solo.'},
    catalogo:{servicio:'Catálogos y ERP',nombre:'Catálogo con pedidos',corto:'un catálogo con pedidos por WhatsApp',desde:20000,url:'/comercios/',texto:'Productos y precios al día. El pedido llega completo a tu WhatsApp y a tu sistema.'},
    gauss:{servicio:'Gauss · Compras',nombre:'Gauss',corto:'Gauss para tus compras',desde:null,url:'/gauss/',texto:'Les pide precio a tus proveedores, negocia y compara. Vos aprobás.'}
  };

  // Monthly budget brackets, in pesos (ARS). "tope" is what the scope is fitted to; null means not defined yet.
  // "n" are the amounts in the label, shown in dollars too.
  const PRESUPUESTOS=[
    {id:'b1',t:'Hasta ARS 50.000',tope:50000,n:[50000]},
    {id:'b2',t:'Entre ARS 50.000 y 150.000',tope:150000,n:[50000,150000]},
    {id:'b3',t:'Entre ARS 150.000 y 400.000',tope:400000,n:[150000,400000]},
    {id:'b4',t:'Más de ARS 400.000',tope:Infinity,n:[400000]},
    {id:'b0',t:'Todavía no lo definí',tope:null,n:[]}
  ];
  // The official dollar, selling: today's (dolarapi.com) once it answers; until then, or if it fails, the one of 20/10/2026.
  let DOLAR=1545;
  const usd=b=>b.n.length?'≈ USD '+b.n.map(n=>{const v=n/DOLAR;return v<100?Math.round(v):Math.round(v/10)*10}).join('–'):'';
  fetch('https://dolarapi.com/v1/dolares/oficial').then(r=>r.json()).then(d=>{if(d.venta>0)DOLAR=d.venta}).catch(()=>{});

  // Buying intent: how soon they want it running. "cierre" is the line above the booking button.
  const CUANDO=[
    {id:'ya',t:'Ya. Es urgente',d:'Cada semana que pasa cuesta plata.',cierre:'Lo querés andando ya: elegí el primer horario libre y arrancamos por el flujo que más duele.'},
    {id:'mes',t:'Este mes',d:'Quiero resolverlo pronto.',cierre:'Si lo querés andando este mes, conviene que la llamada sea esta semana.'},
    {id:'trimestre',t:'En los próximos tres meses',d:'Lo estoy planificando.',cierre:'Hay tiempo para hacerlo bien: en la llamada definimos el primer flujo y la fecha de arranque.'},
    {id:'mirando',t:'Estoy viendo opciones',d:'Todavía no decidí nada.',cierre:'Sin compromiso: en 30 minutos lo ves andando y te llevás el alcance y la inversión.'}
  ];

  // A problem belongs to a family. The family sets the main solution, the two follow-up questions that size the problem,
  // what it costs (each cost paired with what changes) and the copy of the plan.
  // hoy: [question, [[option, the same thing said back in second person]]]. costos: [[cost, what changes]].
  const FAM={
    consultas:{sol:'whatsapp',extra:['club','catalogo'],unidad:'consultas por día',
      hoy:['¿Quién responde hoy?',[['Yo, cuando puedo','respondés vos cuando podés'],['Alguien del equipo, entre otras tareas','responde alguien del equipo entre otras tareas'],['Un mensaje automático y después a mano','sale un mensaje automático y después se responde a mano'],['Muchas quedan sin responder','muchas quedan sin responder']]],
      vol:['¿Cuántas consultas recibís por día?',['Menos de 10','Entre 10 y 30','Entre 30 y 100','Más de 100']],
      costos:[['Ventas que se enfrían','Cada consulta recibe respuesta en segundos, también de noche y los domingos.'],['Horas respondiendo lo mismo','Tu equipo deja de repetir respuestas y atiende solo lo que necesita una persona.'],['Clientes que se cansan de esperar','El cliente pregunta y resuelve en la misma conversación.'],['No saber en qué quedó cada consulta','Cada conversación queda registrada: quién escribió, qué quería y en qué quedó.']],
      titulo:'Cada consulta sin respuesta es una venta <span class="hl">que se va.</span>',
      bajada:(v,h)=>`Recibís ${v} consultas por día y hoy ${h}. Cada una que espera es una venta que puede irse a otro lado.`,
      hallazgo:'Quien pregunta está decidiendo en ese momento. Si la respuesta tarda, decide sin vos.',
      h:'Un asistente que responde <span class="dim">con la información de tu negocio.</span>',
      p:'Atiende el WhatsApp con tus precios, horarios y stock, toma el pedido o agenda, y le pasa a tu equipo solo lo que necesita una persona.',
      checks:['Responde en segundos, a cualquier hora.','Toma pedidos, turnos y datos, y los deja cargados.','Deriva a tu equipo cuando hace falta una persona.']},
    turnos:{sol:'whatsapp',extra:['club'],unidad:'turnos por semana',
      hoy:['¿Cómo se reservan hoy?',[['Por WhatsApp, mensaje por mensaje','los coordinás por WhatsApp, mensaje por mensaje'],['Por teléfono o en el local','se reservan por teléfono o en el local'],['Con una app de turnos','los manejás con una app de turnos'],['Con agenda de papel o planilla','los anotás en una agenda o una planilla']]],
      vol:['¿Cuántos turnos das por semana?',['Menos de 30','Entre 30 y 100','Entre 100 y 300','Más de 300']],
      costos:[['Horas coordinando por chat','Los turnos se reservan solos mientras vos atendés.'],['Turnos que faltan sin avisar','Cada turno tiene su recordatorio y una forma simple de reprogramar.'],['Horarios que quedan vacíos','El asistente ofrece siempre los lugares libres de tu agenda.'],['Reservas que llegan fuera de hora','Se puede reservar a cualquier hora, sin esperar a que abras.']],
      titulo:'Los turnos se reservan solos. <span class="hl">Vos atendés.</span>',
      bajada:(v,h)=>`Das ${v} turnos por semana y hoy ${h}. Cada reserva que pasa por vos te saca de atender.`,
      hallazgo:'Cada reserva necesita varios mensajes, y mientras los respondés no estás atendiendo.',
      h:'El turno se reserva solo, <span class="dim">en la misma conversación.</span>',
      p:'El asistente ofrece los horarios libres, confirma, recuerda y reprograma. Tu agenda queda al día sin que nadie escriba.',
      checks:['Ofrece horarios libres y confirma al instante.','Recuerda el turno antes de la hora.','Lo que se reserva queda cargado en tu agenda.']},
    recompra:{sol:'club',extra:['whatsapp','catalogo'],unidad:'clientes por mes',
      hoy:['¿Qué sabés hoy de tus clientes?',[['No tengo registro de quién compra','no tenés registro de quién compra'],['Tengo los contactos, pero no los uso','tenés los contactos pero no los usás'],['Mando promos de vez en cuando','mandás promos de vez en cuando'],['Tengo puntos o tarjeta, pero no funciona','tenés puntos o tarjeta que no mueven la aguja']]],
      vol:['¿Cuántos clientes te compran por mes?',['Menos de 100','Entre 100 y 500','Entre 500 y 2.000','Más de 2.000']],
      costos:[['Clientes que no vuelven','Cada cliente tiene un motivo concreto para volver y un aviso cuando le toca.'],['Plata en publicidad y comisiones','Les hablás directo a quienes ya te compraron, por canales que son tuyos.'],['No saber quién me compra','Sabés quién compra, cada cuánto y quién dejó de venir.'],['Promos que no mueven nada','Las campañas salen segmentadas: a cada grupo, lo que le sirve.']],
      titulo:'Ya te eligieron una vez. <span class="hl">Que vuelvan.</span>',
      bajada:(v,h)=>`Te compran ${v} clientes por mes y hoy ${h}. Los que ya te eligieron son la venta más cerca que tenés.`,
      hallazgo:'Sin un motivo y un aviso, que el cliente vuelva depende de que se acuerde.',
      h:'Un club con tu marca <span class="dim">para que vuelvan solos.</span>',
      p:'Puntos, beneficios y campañas por email y Wallet. Sin apps para descargar: el cliente se suma con un QR y vos sabés quién es.',
      checks:['Cada cliente, con nombre e historia.','Avisos cuando le toca volver, no promos al voleo.','Las campañas las hacemos nosotros, con vos.']},
    pedidos:{sol:'catalogo',extra:['whatsapp','club'],unidad:'pedidos por semana',
      hoy:['¿Cómo te llegan hoy los pedidos?',[['Por WhatsApp, entre audios y mensajes','te llegan por WhatsApp, entre audios y mensajes'],['Mando la lista y espero que respondan','mandás la lista y esperás que respondan'],['Por teléfono o con vendedores','los tomás por teléfono o con vendedores'],['Tengo tienda online, pero no alcanza','tenés una tienda online que no alcanza']]],
      vol:['¿Cuántos pedidos tomás por semana?',['Menos de 20','Entre 20 y 100','Entre 100 y 500','Más de 500']],
      costos:[['Errores al pasar pedidos','El pedido llega completo, con cantidades y condiciones, listo para preparar.'],['Horas tomando y cargando pedidos','Dejás de mandar listas y de reescribir pedidos: el cliente lo arma solo.'],['Listas de precios desactualizadas','Cada cliente ve sus precios al día, con sus mínimos y condiciones.'],['Pedidos que no se concretan','El cliente pide cuando quiere, desde el celular, sin esperar respuesta.']],
      titulo:'El pedido tiene que llegar <span class="hl">completo.</span>',
      bajada:(v,h)=>`Tomás ${v} pedidos por semana y hoy ${h}. Cada pedido que hay que reconstruir cuesta tiempo y errores.`,
      hallazgo:'Cada pedido hay que leerlo, interpretarlo y volver a escribirlo antes de prepararlo.',
      h:'Un catálogo donde el cliente <span class="dim">arma el pedido solo.</span>',
      p:'Tus productos con precios al día, mínimos y condiciones por tipo de cliente. El pedido llega completo a tu WhatsApp y a tu sistema.',
      checks:['Precios y listas por tipo de cliente.','Pedido completo, sin reconstruir mensajes.','Conectado con tu ERP o sistema de gestión.']},
    compras:{sol:'gauss',extra:['catalogo','whatsapp'],unidad:'proveedores',
      hoy:['¿Cómo comprás hoy?',[['Pido precios por WhatsApp, uno por uno','pedís precios por WhatsApp, uno por uno'],['Siempre al mismo proveedor','le comprás siempre al mismo'],['Hay una persona dedicada a compras','hay una persona dedicada a comprar'],['Con mails y planillas','lo llevás con mails y planillas']]],
      vol:['¿Cuántos proveedores tenés?',['Menos de 10','Entre 10 y 30','Entre 30 y 100','Más de 100']],
      costos:[['Horas pidiendo y comparando precios','Pedir, insistir y comparar deja de ocupar horas de tu equipo.'],['Comprar sin comparar lo suficiente','Cada compra se decide con todas las propuestas en un mismo cuadro.'],['Insumos que llegan tarde','Cada orden tiene seguimiento hasta la entrega.'],['No saber quién aprobó qué','Cada compra queda con sus propuestas, su aprobación y su historial.']],
      titulo:'Tus compras, <span class="hl">en automático.</span>',
      bajada:(v,h)=>`Tenés ${v} proveedores y hoy ${h}. Comparar bien lleva horas que nadie tiene.`,
      hallazgo:'Comparar bien exige pedir, insistir y ordenar respuestas que llegan en formatos distintos.',
      h:'Gauss pide precios, negocia <span class="dim">y te deja la mejor opción.</span>',
      p:'Les escribe a tus proveedores por WhatsApp y mail, insiste con el que no contesta, arma el cuadro comparativo y espera tu aprobación. Nada se compra sin vos.',
      checks:['Tus proveedores no instalan nada: reciben un mensaje.','Un cuadro comparativo por cada compra.','Para empezar no hace falta tocar tu sistema de gestión.']},
    admin:{sol:'whatsapp',extra:['catalogo','club'],unidad:'horas por semana',
      hoy:['¿Dónde vive hoy esa información?',[['En planillas de Excel','vive en planillas de Excel'],['En un sistema de gestión, cargado a mano','está en un sistema de gestión que se carga a mano'],['En varios sistemas que no se conectan','está repartida en sistemas que no se conectan'],['En papel, chats y memoria','vive en papel, chats y memoria']]],
      vol:['¿Cuántas horas por semana se van en eso?',['Menos de 5','Entre 5 y 15','Entre 15 y 40','Más de 40']],
      costos:[['Horas copiando datos','Un dato se carga una vez y llega a donde tiene que estar.'],['Errores de carga','Sin copiar y pegar, los números coinciden en todos lados.'],['No tener los números al día','La información se actualiza sola y está cuando la necesitás.'],['Gente valiosa en tareas repetidas','Tu equipo usa su tiempo en lo que necesita criterio.']],
      titulo:'Lo que hoy copiás a mano, <span class="hl">conectado.</span>',
      bajada:(v,h)=>`Se van ${v} horas por semana en cargar datos, y hoy la información ${h}. Es trabajo repetido, con reglas claras.`,
      hallazgo:'El mismo dato se escribe más de una vez, y cada copia es una oportunidad de error.',
      h:'Los datos pasan solos <span class="dim">de un lugar al otro.</span>',
      p:'Conectamos WhatsApp, planillas, caja y sistema de gestión. Lo que entra por un lado queda cargado en el otro, con las reglas de tu negocio.',
      checks:['Un dato se carga una vez y llega a donde tiene que estar.','Avisos al equipo cuando algo necesita atención.','Empezamos por un flujo concreto y medimos el antes y el después.']}
  };

  // Rubros and the problems each one is offered: [family, the problem in the owner's words, the detail under it].
  // lugar: how the plan refers to the business. sin: solutions that do not apply.
  // gauss: the business buys from several suppliers, so every plan also offers Gauss ('first' or 'last' among the extras);
  // gaussEn limits that to some families.
  const RUBROS=[
    {id:'gastronomia',t:'Gastronomía y café',d:'Bar, restaurante, cafetería, delivery',lugar:'tu local',gauss:'last',problemas:[
      ['consultas','No llego a responder el WhatsApp','Pedidos y reservas que quedan esperando en hora pico.'],
      ['recompra','Vienen una vez y no vuelven','No sé quiénes son ni cuándo volver a invitarlos.'],
      ['recompra','Dependo de las apps y de las promos','Vendo, pero la comisión se queda con el margen.'],
      ['pedidos','Los pedidos llegan desordenados','Audios, mensajes sueltos y errores al pasarlos.'],
      ['compras','Comprar insumos me lleva horas','Pido precios a cada proveedor y comparo a ojo.']]},
    {id:'comercio',t:'Comercio minorista',d:'Indumentaria, pet shop, limpieza, kiosco',lugar:'tu comercio',gauss:'last',problemas:[
      ['consultas','Preguntan precio y stock todo el día','Respondo lo mismo cien veces y se me escapan ventas.'],
      ['recompra','Compran una vez y no vuelven','No tengo cómo avisarles cuando llega algo para ellos.'],
      ['pedidos','Mostrar productos y tomar pedidos es a mano','Mando fotos y precios por chat, uno por uno.'],
      ['admin','Stock, caja y planillas no se hablan','Cargo lo mismo en tres lugares.'],
      ['compras','Reponer mercadería me lleva horas','Pido precios a cada proveedor y comparo a ojo.']]},
    {id:'mayorista',t:'Mayorista o distribuidora',d:'Venta por mayor, reparto, cartera de clientes',lugar:'tu distribuidora',gauss:'last',problemas:[
      ['pedidos','Los pedidos llegan por audios y mensajes sueltos','Hay que reconstruirlos y pasarlos al sistema.'],
      ['pedidos','Me piden la lista de precios todo el tiempo','Mando PDF y Excel que quedan viejos al otro día.'],
      ['recompra','Clientes que dejan de pedir y no me entero','La cartera se enfría sin que nadie la siga.'],
      ['compras','Comprarles a mis proveedores lleva horas','Pido precios uno por uno y comparo a ojo.']]},
    {id:'turnos',t:'Negocio con turnos',d:'Barbería, estética, consultorio, taller',lugar:'tu negocio',sin:['catalogo'],problemas:[
      ['turnos','Coordinar turnos me come el día','Un ida y vuelta por WhatsApp para cada reserva.'],
      ['turnos','Faltan sin avisar','Horas vacías que ya no se llenan.'],
      ['recompra','No vuelven hasta que se acuerdan','Nadie los invita cuando ya les toca.'],
      ['consultas','Preguntan precios y horarios todo el día','Respondo lo mismo mientras atiendo.']]},
    {id:'autos',t:'Agencia de autos o inmobiliaria',d:'Ventas grandes, muchas consultas',lugar:'tu agencia',sin:['catalogo'],problemas:[
      ['consultas','Las consultas llegan a toda hora','De noche y los fines de semana nadie responde.'],
      ['consultas','Mucho curioso, poco comprador','Los vendedores pierden tiempo con quien no va a comprar.'],
      ['consultas','Los interesados se enfrían','Nadie les vuelve a escribir después de la primera consulta.'],
      ['admin','Los contactos quedan en el celular de cada vendedor','No sé cuántas consultas hubo ni en qué quedaron.']]},
    {id:'industria',t:'Industria o fábrica',d:'Producción, compras, proveedores',lugar:'tu empresa',sin:['club'],gauss:'first',problemas:[
      ['compras','Comprar insumos lleva horas','Pedir precios, insistir y comparar, proveedor por proveedor.'],
      ['compras','Órdenes, remitos y facturas se cargan a mano','Papeles que se pierden y diferencias que aparecen tarde.'],
      ['pedidos','Los pedidos de clientes llegan por mail y WhatsApp','Hay que pasarlos al sistema uno por uno.'],
      ['consultas','Las cotizaciones tardan en salir','El cliente pregunta y espera días.']]},
    {id:'profesional',t:'Servicios profesionales',d:'Estudio, consultora, agencia',lugar:'tu estudio',sin:['catalogo'],problemas:[
      ['consultas','Las consultas quedan sin responder','Llegan mientras estoy con otro cliente.'],
      ['turnos','Agendar reuniones es un ida y vuelta','Cinco mensajes para encontrar un horario.'],
      ['recompra','Los clientes no vuelven a consultarme','Trabajo terminado, relación terminada.'],
      ['admin','Pierdo horas en tareas administrativas','Copiar datos, armar presupuestos, perseguir papeles.']]},
    {id:'otro',t:'Otro rubro',d:'Escribilo y seguimos',lugar:'tu negocio',gauss:'last',gaussEn:['pedidos','admin'],problemas:[
      ['consultas','No llego a responder las consultas','Los mensajes se acumulan y las ventas se enfrían.'],
      ['recompra','Los clientes no vuelven','Compran una vez y no sé cómo traerlos de nuevo.'],
      ['pedidos','Tomar pedidos es un desorden','Mensajes sueltos, listas viejas y errores.'],
      ['turnos','Coordinar turnos me come el día','Un ida y vuelta para cada reserva.'],
      ['compras','Comprar a proveedores lleva horas','Pedir precios y comparar, uno por uno.'],
      ['admin','Todo se copia a mano','El mismo dato, cargado en varios lugares.']]}
  ];

  // Example conversation per rubro, with fictional businesses. o: the customer types; p: the customer taps a button;
  // i: the assistant answers (the third item ticks those rows of the log); b: quick-reply buttons.
  const CHATS={
    gastronomia:{biz:'Verde Café',ej:'una cafetería',hora:'09:02',msgs:[['o','Hola! ¿Puedo pedir para retirar?'],['i','¡Hola Sofi! ☕ Claro. ¿Lo de siempre?<br><b>Flat white + 2 medialunas · $6.100</b>',[0,1]],['b',['Sí, lo de siempre','Ver la carta']],['p','Sí, lo de siempre'],['i','Listo ✅ Pedido <b>#1042</b> para retirar a las <b>9:15</b>.',[2,3]],['i','Sumaste <b>35 puntos</b> 🎁 Te faltan 55 para tu café de regalo.',[4]]],
      log:[['Mensaje recibido','WhatsApp · 09:02'],['Clienta reconocida','Sofía M. · 12 visitas'],['Pedido cargado en caja','#1042 · $6.100'],['Aviso a barra','Retira 9:15'],['+35 puntos acreditados','Wallet actualizada']]},
    comercio:{biz:'Tienda Norte',ej:'una tienda de ropa',hora:'21:40',msgs:[['o','Hola! Tienen la campera puffer en M?'],['i','¡Hola Caro! 👋 Sí, queda en <b>M</b> en negro y en verde. <b>$89.900</b>, 3 cuotas sin interés.',[0,1]],['b',['Reservar la negra','Ver más fotos']],['p','Reservar la negra'],['i','Listo ✅ Te la guardo hasta mañana a las 19. ¿Pasás por el local o te la enviamos?',[2]],['o','Paso mañana'],['i','Perfecto. Te esperamos de 9 a 19. 🙌',[3,4]]],
      log:[['Mensaje recibido','WhatsApp · 21:40'],['Stock consultado','Puffer · talle M · 2 colores'],['Reserva creada','Hasta mañana 19 h'],['Aviso al local','Retira Carolina'],['Conversación resuelta','Sin intervención del equipo']]},
    mayorista:{biz:'Distribuidora Norte',ej:'una distribuidora',hora:'07:48',msgs:[['o','Buen día, me pasás la lista actualizada?'],['i','Buen día, Martín 👋 Acá va tu <b>lista mayorista de hoy</b> 📎',[0,1,2]],['i','¿Repetimos el pedido del mes pasado? <b>12 cajas · $486.000</b>'],['b',['Sí, repetir','Armar uno nuevo']],['p','Sí, repetir'],['i','Listo ✅ Pedido <b>#2318</b> cargado. Sale en el reparto del <b>jueves</b>.',[3,4]]],
      log:[['Mensaje recibido','WhatsApp · 07:48'],['Cliente reconocido','Almacén Martín · lista mayorista'],['Lista enviada','Precios de hoy'],['Pedido cargado en el sistema','#2318 · 12 cajas'],['Reparto asignado','Jueves · zona norte']]},
    turnos:{biz:'Barbería Central',ej:'una barbería',hora:'22:15',msgs:[['o','Hola, tenés turno para mañana?'],['i','¡Hola Nico! 💈 Mañana con Lucas tengo estos horarios:',[0,1,2]],['b',['10:30','17:00']],['p','17:00'],['i','Listo ✅ <b>Corte con Lucas</b>, mañana a las <b>17:00</b>.',[3]],['i','Te aviso una hora antes. Si no podés venir, escribime y lo movemos.',[4]]],
      log:[['Mensaje recibido','WhatsApp · 22:15'],['Cliente reconocido','Nicolás R. · viene cada 4 semanas'],['Horarios libres consultados','Agenda de Lucas'],['Turno agendado','Mañana 17:00'],['Recordatorio programado','Una hora antes']]},
    autos:{biz:'Agencia del Centro',ej:'una agencia de autos',hora:'23:10',msgs:[['o','Hola, sigue disponible la Hilux?'],['i','¡Hola! 👋 Sí, <b>Hilux SRV 2021</b>, 68.000 km, único dueño. ¿Cómo pensás pagarla?',[0,1]],['b',['Contado','Financiado','Entrego un usado']],['p','Financiado'],['i','Bien. Te explico la financiación cuando vengas a verla. Tengo <b>mañana 11:00</b> o <b>16:30</b>.',[2]],['o','Mañana 11'],['i','Agendado ✅ Te espera Julián mañana a las <b>11:00</b>.',[3,4]]],
      log:[['Mensaje recibido','Mercado Libre → WhatsApp · 23:10'],['Unidad consultada','Hilux SRV 2021 · en stock'],['Comprador calificado','Financia · sin usado'],['Visita agendada','Mañana 11:00'],['Aviso al vendedor','Julián · comprador listo']]},
    industria:{biz:'Metalúrgica Sur',ej:'una metalúrgica',hora:'08:12',msgs:[['o','Hola, necesito cotizar 200 bujes B-40'],['i','Hola 👋 Para cotizar me faltan dos datos: ¿material y fecha de entrega?',[0,1]],['o','Bronce, para el 30'],['i','Perfecto. <b>200 bujes B-40 en bronce</b>, entrega el 30. Ya lo tiene ventas con todos los datos.',[2,3]],['i','Te llega la cotización hoy, por este chat.',[4]]],
      log:[['Mensaje recibido','WhatsApp · 08:12'],['Cliente reconocido','Cuenta corriente activa'],['Datos completos','Pieza · material · fecha'],['Pedido de cotización cargado','Ventas · listo para cotizar'],['Aviso al vendedor','Con todos los datos']]},
    profesional:{biz:'Estudio Rivas',ej:'un estudio contable',hora:'20:05',msgs:[['o','Hola, necesito un contador para mi monotributo'],['i','Hola 👋 Te ayudo. ¿Ya estás inscripto o empezás de cero?',[0]],['b',['Ya estoy inscripto','Empiezo de cero']],['p','Empiezo de cero'],['i','Bien. La primera reunión dura 30 minutos. Tengo <b>mañana 10:00</b> o <b>jueves 15:30</b>.',[1,2]],['o','Jueves 15:30'],['i','Agendado ✅ Jueves a las <b>15:30</b>. Te mando el link de la reunión.',[3,4]]],
      log:[['Mensaje recibido','Instagram → WhatsApp · 20:05'],['Necesidad identificada','Alta de monotributo'],['Horarios ofrecidos','Agenda del estudio'],['Reunión agendada','Jueves 15:30'],['Ficha creada','Con los datos de la consulta']]},
    otro:{biz:'Tu negocio',ej:'un comercio',hora:'21:30',msgs:[['o','Hola, ¿qué horarios tienen?'],['i','¡Hola! 👋 Abrimos de lunes a sábado, de 9 a 19. ¿Te ayudo con algo más?',[0,1]],['o','¿Tienen el producto que vi en Instagram?'],['i','Sí, hay stock. Sale <b>$24.500</b>. ¿Te lo reservo o preferís que te lo enviemos?',[2]],['b',['Reservar','Enviar']],['p','Reservar'],['i','Listo ✅ Reservado a tu nombre hasta mañana.',[3,4]]],
      log:[['Mensaje recibido','WhatsApp · 21:30'],['Pregunta frecuente resuelta','Horarios'],['Stock consultado','Disponible'],['Reserva creada','Hasta mañana'],['Aviso al equipo','Retira mañana']]}
  };

  // The club's pass and push, written for each rubro.
  const CLUB={
    gastronomia:['Un regalo de la casa','Sumaste 35 puntos. Te falta poco para tu regalo de la casa.'],
    comercio:['15% en tu próxima compra','Llegó la nueva temporada. Por ser del club, 15% hasta el domingo.'],
    mayorista:['Envío bonificado','Hace 30 días que no pedís. Esta semana, envío sin cargo.'],
    turnos:['Un servicio de regalo','Ya pasaron 4 semanas. ¿Reservamos tu próximo turno?'],
    autos:['Service con beneficio','Tu auto está por cumplir 10.000 km. Tenés beneficio de cliente en el service.'],
    industria:['Condición preferencial','Hay lista nueva. Tu condición de cliente frecuente sigue vigente.'],
    profesional:['Una consulta sin cargo','Se acerca el cierre anual. ¿Agendamos la revisión?'],
    otro:['Un beneficio para volver','Sumaste 35 puntos. Te falta poco para tu próximo beneficio.']
  };

  /* ---------- State ---------- */

  const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // The times on the visitor's clock: whoever opens this from Lima picks Lima's 16:30, and the call is at 16:30 there
  // (the bot gets the zone with the booking). On Argentina's clock, or one that reads the same, the days stay as the agenda
  // sends them; abroad they are regrouped by local day, keeping the times from 8 to 21 there. h.ar keeps Argentina's time.
  const ZONA=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){return ''}})();
  let LOCAL=false;
  const onYourClock=dias=>{
    const all=dias.flatMap(d=>d.horarios);
    LOCAL=all.some(h=>new Date(h.inicio*1000).getTimezoneOffset()!==180);
    if(!LOCAL)return dias;
    const D=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],L=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],M=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const two=n=>String(n).padStart(2,'0'),out={};
    all.forEach(h=>{
      const t=new Date(h.inicio*1000);if(t.getHours()<8||t.getHours()>=21)return;
      const k=`${t.getFullYear()}-${two(t.getMonth()+1)}-${two(t.getDate())}`;
      (out[k]=out[k]||{fecha:k,dia:D[t.getDay()],numero:t.getDate(),mes:M[t.getMonth()].slice(0,3),largo:`${L[t.getDay()]} ${t.getDate()} de ${M[t.getMonth()]}`,horarios:[]})
        .horarios.push(Object.assign({},h,{hora:`${two(t.getHours())}:${two(t.getMinutes())}`,ar:h.hora}));
    });
    return Object.keys(out).sort().map(k=>(out[k].horarios.sort((a,b)=>a.inicio-b.inicio),out[k]));
  };
  const yourTime=h=>h.ar?`, tu hora (${h.ar} en Argentina)`:'';
  const money=n=>'$'+String(n).replace(/\B(?=(\d{3})+$)/g,'.');
  const low=s=>s.charAt(0).toLowerCase()+s.slice(1), cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
  const lista=items=>items.length<2?items.join(''):items.slice(0,-1).join(', ')+' y '+items[items.length-1];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARROW='<span class="arr" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  const TOTAL=8, KEY='iman.diagnostico.1';
  const blank=()=>({rubro:'',otro:'',problema:-1,hoy:-1,vol:-1,costos:[],cuando:'',presupuesto:'',negocio:''});
  let A=blank(), step=0, first=0, current=null, busy=false, comentario='';
  const rubro=()=>RUBROS.find(r=>r.id===A.rubro);
  const problema=()=>rubro()&&rubro().problemas[A.problema];
  const fam=()=>FAM[problema()[0]];
  // Index of the first question still unanswered; the last one (the business name) is optional.
  const missing=()=>!rubro()?0:!problema()?1:A.hoy<0?2:A.vol<0?3:!A.costos.length?4:!A.cuando?5:!A.presupuesto?6:7;
  const save=done=>{try{localStorage.setItem(KEY,JSON.stringify({a:A,done:Boolean(done)}))}catch(e){}};
  const stored=()=>{
    try{
      const data=JSON.parse(localStorage.getItem(KEY)),a=data&&data.a;
      if(!data.done||typeof a.negocio!=='string'||typeof a.otro!=='string')return null;
      const r=RUBROS.find(x=>x.id===a.rubro),f=FAM[r.problemas[a.problema][0]];
      const ok=f.hoy[1][a.hoy]&&f.vol[1][a.vol]&&a.costos.length&&a.costos.every(i=>f.costos[i])&&CUANDO.some(c=>c.id===a.cuando)&&PRESUPUESTOS.some(b=>b.id===a.presupuesto);
      return ok?a:null;
    }catch(e){return null}
  };

  /* ---------- Questions ---------- */

  const stepEl=$('[data-step]'), intro=$('[data-intro]'), back=$('[data-back]'), meter=$('[data-meter]'), count=$('[data-count]'), build=$('[data-build]');
  const res=$('#plan'), detail=$('#detalle'), pill=$('[data-wa-pill]');
  // Each question: options as [title, detail], which one is on, and what picking does. pick() returns false to stay on the question.
  const steps=[
    ()=>({q:'¿Qué negocio tenés?',tiles:true,opts:RUBROS.map(r=>[r.t,r.d]),on:i=>RUBROS[i].id===A.rubro,
      pick(i){const id=RUBROS[i].id;if(id!==A.rubro)Object.assign(A,{rubro:id,problema:-1,hoy:-1,vol:-1,costos:[]});return id!=='otro'},
      text:A.rubro==='otro'&&{label:'¿Cuál es tu rubro?',ph:'Por ejemplo: óptica, vivero, gimnasio',value:A.otro,max:80,go:'Seguir',auto:'off',set(v){A.otro=v}}}),
    ()=>({q:'¿Qué es lo que más te frena hoy?',hint:'Elegí el que más duele. Uno solo.',opts:rubro().problemas.map(p=>[p[1],p[2]]),on:i=>i===A.problema,
      pick(i){if(i!==A.problema)Object.assign(A,{problema:i,hoy:-1,vol:-1,costos:[]});return true}}),
    ()=>({q:fam().hoy[0],opts:fam().hoy[1].map(o=>[o[0]]),on:i=>i===A.hoy,pick(i){A.hoy=i;return true}}),
    ()=>({q:fam().vol[0],opts:fam().vol[1].map(o=>[o]),on:i=>i===A.vol,pick(i){A.vol=i;return true}}),
    ()=>({q:'¿Qué te está costando?',hint:'Marcá todo lo que aplique.',many:true,opts:fam().costos.map(c=>[c[0]]),on:i=>A.costos.includes(i),
      pick(i){A.costos=A.costos.includes(i)?A.costos.filter(x=>x!==i):[...A.costos,i].sort((a,b)=>a-b)},ready:()=>A.costos.length>0}),
    ()=>({q:'¿Para cuándo lo querés andando?',opts:CUANDO.map(c=>[c.t,c.d]),on:i=>CUANDO[i].id===A.cuando,pick(i){A.cuando=CUANDO[i].id;return true}}),
    ()=>({q:'¿Cuánto pensás invertir por mes?',hint:'En pesos argentinos (ARS); en dólares, al oficial de hoy. Sirve para ajustar el alcance y no te compromete a nada.',opts:PRESUPUESTOS.map(b=>[b.t,usd(b)]),on:i=>PRESUPUESTOS[i].id===A.presupuesto,pick(i){A.presupuesto=PRESUPUESTOS[i].id;return true}}),
    ()=>({q:'¿Cómo se llama tu negocio?',hint:'Para ponerle nombre al plan.',text:{label:'Nombre del negocio',ph:'Nombre del negocio',value:A.negocio,max:60,go:'Ver mi plan',skip:'Seguir sin nombre',auto:'organization',set(v){A.negocio=v}}})
  ];

  function render(focus,animate=true){
    const def=current=steps[step]();
    const opening=step===0||step===first;   // the promise stays above the first question they see
    quiz.classList.toggle('is-first',opening);intro.hidden=!opening;back.hidden=step===0;stepEl.hidden=false;build.hidden=true;
    meter.style.width=(step+1)/TOTAL*100+'%';meter.parentNode.setAttribute('aria-valuenow',step+1);count.textContent=String(step+1).padStart(2,'0');
    let html=`<h2 id="q-title" tabindex="-1">${def.q}</h2>`+(def.hint?`<p class="q-hint">${def.hint}</p>`:'');
    if(def.opts)html+=`<div class="q-opts${def.tiles?' tiles':''}" role="group" aria-labelledby="q-title">`+def.opts.map((o,i)=>`<button class="q-opt" type="button" data-i="${i}" aria-pressed="${def.on(i)}"><span class="q-key" aria-hidden="true">${i+1}</span><span><b>${o[0]}</b>${o[1]?`<small>${o[1]}</small>`:''}</span></button>`).join('')+'</div>';
    if(def.text)html+=`<form class="q-text" novalidate><label class="sr" for="q-input">${def.text.label}</label><input id="q-input" maxlength="${def.text.max}" placeholder="${def.text.ph}" value="${esc(def.text.value)}" autocomplete="${def.text.auto}" enterkeyhint="go"><button class="btn btn-ink" type="submit">${def.text.go} ${ARROW}</button>${def.text.skip?`<button class="link" type="button" data-skip>${def.text.skip}</button>`:''}</form>`;
    if(def.many)html+=`<div class="q-next"><button class="btn btn-ink" type="button" data-next${def.ready()?'':' disabled'}>Seguir ${ARROW}</button></div>`;
    stepEl.innerHTML=html;
    if(animate){stepEl.classList.remove('is-in');void stepEl.offsetWidth;stepEl.classList.add('is-in')}
    if(focus){
      if(window.scrollY>0)window.scrollTo(0,0);
      (def.text&&!def.opts?$('#q-input',stepEl):$('#q-title',stepEl)).focus({preventScroll:true});
    }
  }
  const depth=()=>(history.state&&history.state.d)||0;
  function go(n){step=n;history.pushState({s:n,d:depth()+1},'');render(true)}
  function next(){if(step<TOTAL-1)go(step+1);else finish()}
  function choose(i){
    if(busy||!current.opts||i<0||i>=current.opts.length)return;
    const advance=current.pick(i);
    $$('.q-opt',stepEl).forEach((b,k)=>b.setAttribute('aria-pressed',String(current.on(k))));
    if(current.many){$('[data-next]',stepEl).disabled=!current.ready();return}
    if(!advance){render(false,false);$('#q-input',stepEl).focus();return}   // "Otro rubro": ask which one before moving on
    busy=true;setTimeout(()=>{busy=false;next()},reduce?0:240);
  }
  stepEl.addEventListener('click',e=>{
    const opt=e.target.closest('.q-opt');
    if(opt)choose(Number(opt.dataset.i));
    else if(e.target.closest('[data-next]')&&current.ready())next();
    else if(e.target.closest('[data-skip]')){current.text.set('');next()}
  });
  stepEl.addEventListener('submit',e=>{e.preventDefault();current.text.set($('#q-input',stepEl).value.trim());next()});
  // Number keys pick an option; Enter moves on from the question that takes several.
  document.addEventListener('keydown',e=>{
    if(quiz.hidden||stepEl.hidden||e.metaKey||e.ctrlKey||e.altKey||e.target.closest('input,textarea,select'))return;
    if(/^[1-9]$/.test(e.key))choose(Number(e.key)-1);
    else if(e.key==='Enter'&&current&&current.many&&current.ready()&&!e.target.closest('button,a')){e.preventDefault();next()}
  });
  back.addEventListener('click',()=>{
    if(depth()>0)history.back();
    else{step=Math.max(0,step-1);history.replaceState({s:step,d:0},'');render(true)}
  });
  addEventListener('popstate',e=>{if(e.state&&e.state.s!==undefined)show(e.state.s)});
  function show(s){
    if(s==='plan'&&missing()===7){openPlan(false);return}
    closePlan();step=Math.min(s==='plan'?TOTAL-1:s,missing());render(true);
  }
  function finish(){
    save(true);
    const done=()=>{history.pushState({s:'plan',d:depth()+1},'');openPlan(true)};
    if(reduce){done();return}
    stepEl.hidden=true;back.hidden=true;intro.hidden=true;build.hidden=false;meter.style.width='100%';
    const lines=$$('li',build);
    lines.forEach((li,i)=>{li.classList.remove('on');setTimeout(()=>li.classList.add('on'),200+i*380)});
    setTimeout(done,200+lines.length*380+420);
  }

  /* ---------- Plan ---------- */

  // Extras that go with the main solution for this rubro: up to two from the family, plus Gauss wherever it applies.
  function extrasDe(f,r,family){
    const list=f.extra.filter(id=>!(r.sin||[]).includes(id)).slice(0,2);
    if(!r.gauss||f.sol==='gauss'||(r.gaussEn&&!r.gaussEn.includes(family)))return list;
    return r.gauss==='first'?['gauss',...list]:[...list,'gauss'];
  }
  // Fits the plan to the budget: the main solution first, then each extra that still fits under the bracket's top.
  function alcance(f,r,b,family){
    const main=SOL[f.sol],extras=extrasDe(f,r,family),ref='El número exacto sale de la llamada.';
    if(main.desde===null)return {incluye:[f.sol],extras,titulo:'Gauss se arma a medida de tus compras.',nota:'No tiene precio de lista: depende de los rubros, la cantidad de proveedores y el volumen de compras. Se define en la llamada.'};
    if(b.tope===null)return {incluye:[f.sol],extras,titulo:'El alcance se ajusta a lo que decidas invertir.',nota:`Referencia: ${low(main.nombre)} desde ${money(main.desde)} por mes. ${ref}`};
    if(b.tope<main.desde){
      const alt=extras.find(id=>SOL[id].desde!==null&&SOL[id].desde<=b.tope);
      return alt
        ?{incluye:[alt],extras,titulo:'Con ese presupuesto, arrancamos más chico.',nota:`${cap(main.corto)} arranca desde ${money(main.desde)} por mes. Lo que entra hoy: ${SOL[alt].corto}, desde ${money(SOL[alt].desde)} por mes. ${ref}`}
        :{incluye:[],extras,titulo:'Queda por encima de lo que pensabas invertir.',nota:`${cap(main.corto)} arranca desde ${money(main.desde)} por mes. En la llamada vemos los números: qué cambia con esto andando y si cierra para tu negocio.`};
    }
    const incluye=[f.sol];let resto=b.tope-main.desde;
    extras.forEach(id=>{const d=SOL[id].desde;if(d!==null&&d<=resto){incluye.push(id);resto-=d}});
    return {incluye,extras,titulo:['Un flujo concreto, andando.','Lo principal y un complemento.','El sistema completo, conectado.'][incluye.length-1],nota:`Con un presupuesto de ${low(b.t)} por mes apuntamos a ${lista(incluye.map(id=>SOL[id].corto))}. ${ref}`};
  }
  const set=(key,html)=>$$(`[data-f="${key}"]`).forEach(el=>{el.innerHTML=html});
  const items=list=>list.map(x=>`<li>${x}</li>`).join('');
  function fillPlan(){
    const r=rubro(),p=problema(),f=FAM[p[0]],main=SOL[f.sol];
    const hoy=f.hoy[1][A.hoy],vol=f.vol[1][A.vol],cuando=CUANDO.find(c=>c.id===A.cuando),budget=PRESUPUESTOS.find(b=>b.id===A.presupuesto);
    const nombre=A.negocio,rubroT=r.id==='otro'&&A.otro?A.otro:r.t,sc=alcance(f,r,budget,p[0]);
    const planT=[main.nombre,...sc.incluye.filter(id=>id!==f.sol).map(id=>SOL[id].nombre)].join(' + ');
    const rows=[['Rubro',rubroT],['Problema',p[1]],['Hoy',hoy[0]],['Volumen',`${vol} ${f.unidad}`],['Me cuesta',A.costos.map(i=>f.costos[i][0]).join(' · ')],['Cuándo',cuando.t],['Inversión',budget.t+(budget.tope===null?'':` por mes (${usd(budget)})`)],['Plan',planT]];

    set('kick',nombre?`Plan para ${esc(nombre)}`:`Tu diagnóstico · ${esc(rubroT)}`);
    set('titulo',f.titulo);
    set('bajada',`${f.bajada(low(vol),hoy[1])} Esto es lo que ponemos a trabajar en ${esc(nombre||r.lugar)}.`);
    set('ficha-nombre',esc(nombre||'Tu negocio'));
    set('ficha',rows.map(([k,v])=>`<div><dt>${k==='Me cuesta'?'Te cuesta':k}</dt><dd>${esc(v)}</dd></div>`).join(''));

    set('found-titulo',p[1]+'.');set('found-bajada',p[2]);
    set('hoy-h',cap(hoy[1])+'.');set('hoy-p',f.hallazgo);
    set('cuesta',items(A.costos.map(i=>f.costos[i][0])));set('cambia',items(A.costos.map(i=>f.costos[i][1])));

    set('precio',main.desde===null?'<b>A medida</b> de tus compras<small>Sin precio de lista. Se define en la llamada.</small>':`<b>Desde ${money(main.desde)}</b> por mes<small>Referencia. El número exacto sale de la llamada.</small>`);
    set('sol-label',`Lo principal · ${main.servicio}`);set('sol-h',f.h);set('sol-p',f.p);set('sol-checks',items(f.checks));
    $('[data-sol-link]').href=main.url;
    $$('[data-visual]').forEach(el=>{el.hidden=el.dataset.visual!==f.sol});
    if(f.sol==='whatsapp'){
      // A booking problem shows the booking conversation, unless the rubro's own example already books (the accounting firm).
      const chat=CHATS[p[0]==='turnos'&&r.id!=='profesional'?'turnos':r.id];
      set('wa-name',chat.biz);set('wa-avatar',chat.biz.charAt(0));set('wa-log-name',chat.biz);
      set('wa-note',`Así se ve en ${chat.ej}. En la llamada lo ves con tu negocio.`);
      $('[data-wa-thread]').innerHTML=chat.msgs.map(m=>{
        if(m[0]==='b')return `<li class="wa-msg in" data-delay="0" data-with-prev><div class="wa-buttons">${m[1].map(x=>`<span>${x}</span>`).join('')}</div></li>`;
        const out=m[0]!=='i';
        return `<li class="wa-msg ${out?'out':'in'}" data-delay="${out?1400:1900}"${out?` data-${m[0]==='p'?'press':'type'}="${esc(m[1])}"`:''}${m[2]?` data-log="${m[2]}"`:''}><div class="bubble">${m[1]}<span class="meta">${chat.hora}${out?'<i class="ticks read"></i>':''}</span></div></li>`;
      }).join('');
      $('[data-wa-log]').innerHTML=chat.log.map(l=>`<li><span>${l[0]}</span><small>${l[1]}</small></li>`).join('');
    }
    if(f.sol==='club'){
      const marca=esc(nombre||'Tu marca');
      set('pass-name',marca);set('push-name',marca);set('push-ic',esc((nombre||'T').charAt(0).toUpperCase()));
      set('pass-premio',CLUB[r.id][0]);set('push-text',CLUB[r.id][1]);
    }

    set('alcance-titulo',sc.titulo);set('alcance-nota',sc.nota);set('alcance-lista',items(sc.incluye.map(id=>SOL[id].nombre)));
    $('[data-f="alcance-lista"]').hidden=!sc.incluye.length;
    $('.scope-grid').classList.toggle('is-wide',sc.extras.length>2);
    set('extras',[...sc.extras].sort((a,b)=>sc.incluye.includes(b)-sc.incluye.includes(a)).map(id=>{
      const s=SOL[id],dentro=sc.incluye.includes(id);
      return `<article class="extra${dentro?' is-in':''}"><p class="label">${dentro?'Entra en tu presupuesto':'También te sirve'}</p><h3>${s.nombre}</h3><p>${s.texto}</p><div class="extra-foot"><span>${s.desde===null?'A medida':'Desde '+money(s.desde)+' por mes'}</span><a class="link" href="${s.url}">Ver más</a></div></article>`;
    }).join(''));

    // The same summary travels four ways: the card above, the WhatsApp message, the booked call and the inquiry IMÁN receives.
    const lineas=[...(nombre?[['Negocio',nombre]]:[]),...rows].map(([k,v])=>`${k}: ${v}`);
    comentario=['Diagnóstico hecho en iman.ar/diagnostico/',...lineas].join('\n').slice(0,2000);
    set('cierre',cuando.cierre);
    $('[data-wa-link]').href=WA+'?text='+encodeURIComponent(['Hola, quiero info. Hice el diagnóstico en iman.ar:',...lineas].join('\n'));
    $$('#callme-form,[data-bk-form]').forEach(f=>{const business=f.elements.negocio;if(nombre&&!business.value)business.value=nombre});
    form.dataset.rubro=rubroT;form.dataset.servicios=JSON.stringify([...new Set([f.sol,...sc.incluye].map(id=>SOL[id].servicio))]);
  }
  function openPlan(focus){
    fillPlan();
    quiz.hidden=true;res.hidden=false;detail.hidden=false;pill.hidden=booker.booked();
    $$('[data-book]').forEach(a=>a.setAttribute('href','#agenda'));booker.sync();
    window.scrollTo(0,0);dispatchEvent(new Event('resize'));   // the filings canvas takes the new height
    if(focus)$('#res-title').focus({preventScroll:true});
    chat.sync();
  }
  function closePlan(){
    if(res.hidden)return;
    quiz.hidden=false;res.hidden=true;detail.hidden=true;pill.hidden=true;
    $$('[data-book]').forEach(a=>a.setAttribute('href',AGENDA));
    chat.sync();dispatchEvent(new Event('resize'));
  }
  // The floating booking button steps aside while the closing, with its own button, is on screen.
  if('IntersectionObserver' in window)new IntersectionObserver(e=>pill.classList.toggle('is-off',e[0].isIntersecting)).observe($('#llamada'));
  $('[data-restart]').addEventListener('click',()=>{
    A={...blank(),negocio:A.negocio};save(false);closePlan();
    step=0;history.pushState({s:0,d:depth()+1},'');render(true);
  });

  /* ---------- WhatsApp demo: replays the conversation and ticks the log as each step happens ---------- */

  const chat=(()=>{
    const demo=$('[data-wa-demo]'),list=$('[data-wa-thread]',demo),thread=$('.wa-thread',demo),composer=$('.wa-composer',demo),typed=$('[data-wa-typed]',demo),presence=$('.wa-presence',demo);
    let run=0,visible=!('IntersectionObserver' in window);
    const sleep=(ms,id)=>new Promise((ok,stop)=>setTimeout(()=>id===run?ok():stop(),ms));
    const bottom=()=>{thread.scrollTo({top:thread.scrollHeight,behavior:'smooth'});setTimeout(()=>thread.scrollTo({top:thread.scrollHeight,behavior:'smooth'}),420)};
    const play=async()=>{
      const id=++run,msgs=[...list.children],log=$$('[data-wa-log] li',demo);
      try{
        demo.classList.add('wa-live');
        msgs.forEach(m=>m.classList.add('pending'));log.forEach(s=>s.classList.remove('done'));
        thread.scrollTop=0;
        for(const m of msgs){
          if(m.hasAttribute('data-with-prev')){m.classList.remove('pending');bottom();continue}
          await sleep(Number(m.dataset.delay)||900,id);
          const text=m.dataset.type,press=m.dataset.press;
          if(text){
            composer.classList.add('has-text');
            try{for(let c=2;c<=text.length;c+=2){typed.textContent=text.slice(0,c);await sleep(34,id)}typed.textContent=text;await sleep(380,id)}
            finally{typed.textContent='';composer.classList.remove('has-text')}
          }else if(press){
            $$('.wa-buttons span',demo).forEach(b=>{if(b.textContent===press)b.classList.add('pressed')});
            await sleep(420,id);
          }else{
            const dots=document.createElement('li');dots.className='wa-msg in typing-bubble';dots.innerHTML='<div class="bubble"><i></i><i></i><i></i></div>';
            list.insertBefore(dots,m);presence.textContent='escribiendo…';presence.classList.add('typing');bottom();
            try{await sleep(900,id)}finally{dots.remove();presence.textContent='en línea';presence.classList.remove('typing')}
          }
          m.classList.remove('pending');bottom();
          (m.dataset.log||'').split(',').filter(Boolean).forEach((n,k)=>setTimeout(()=>{if(id===run&&log[n])log[n].classList.add('done')},300+k*480));
        }
        await sleep(6500,id);play();
      }catch(e){}
    };
    const sync=()=>{if(visible&&!demo.hidden&&!detail.hidden&&!reduce)play();else run++};
    if('IntersectionObserver' in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;sync()},{threshold:.25}).observe(demo);
    return {sync};
  })();

  /* ---------- "Prefiero que me escriban": the diagnosis goes to /api/contacto, as the site's inquiry form does ---------- */

  const utm=()=>{
    const params=new URLSearchParams(location.search),found={};
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'])if(params.has(key))found[key]=params.get(key).slice(0,key==='utm_source'||key==='utm_medium'?120:180);
    return found;
  };
  const form=$('#callme-form'),ok=$('.callme-ok'),submit=$('[type=submit]',form),label=$('[data-submit-label]',form),status=$('.f-status',form),error=$('.f-error',form);
  let pending=false,previous='',requestId='';
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(pending||!form.reportValidity())return;
    error.hidden=true;error.textContent='';
    const data=new FormData(form),payload={};
    for(const field of ['nombre','negocio','email','whatsapp','sitio_web_empresa'])payload[field]=String(data.get(field)||'').trim();
    Object.assign(payload,{rubro:form.dataset.rubro,servicios:JSON.parse(form.dataset.servicios),comentario,consentimiento:data.get('consentimiento')==='on',source:location.pathname});
    Object.assign(payload,utm());
    const body=JSON.stringify(payload);
    if(body!==previous){previous=body;requestId=crypto.randomUUID()}
    pending=true;submit.disabled=true;form.setAttribute('aria-busy','true');label.textContent='Enviando…';status.textContent='Estamos enviando tu diagnóstico.';
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),25000);
    try{
      const response=await fetch('/api/contacto',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestId},body,signal:controller.signal});
      let result;try{result=await response.json()}catch(x){throw new Error('No pudimos confirmar el envío. Tus datos siguen acá: podés reintentar.')}
      if(!response.ok||result.ok!==true)throw new Error(result.error||'No pudimos confirmar el envío. Probá otra vez o escribinos por WhatsApp.');
      form.hidden=true;ok.hidden=false;
      $('[data-ok-message]',ok).textContent=(result.whatsapp==='enviado'?'Te acabamos de escribir por WhatsApp para seguir por ahí. ':'Te escribimos para coordinar. ')+'Si querés adelantar, elegí vos el horario de la llamada.';
      ok.focus();
      dispatchEvent(new CustomEvent('iman:consulta'));   // pixel.js counts it as a lead
    }catch(problem){
      error.textContent=problem.name==='AbortError'?'El envío tardó más de lo esperado y no podemos confirmarlo todavía. Podés reintentar sin duplicar la consulta.':problem.message;error.hidden=false;
    }finally{clearTimeout(timeout);pending=false;submit.disabled=false;form.removeAttribute('aria-busy');label.textContent='Enviar mi diagnóstico';status.textContent=''}
  });

  /* ---------- The agenda: the free times come from /api/agenda, and the booking carries the diagnosis ---------- */
  // server/booking.mjs asks the WhatsApp assistant's agenda (agenda.iman.ar) and books there; the client gets the Meet by
  // mail and WhatsApp, and the team gets the answers by email. A booking is remembered so the plan reopens on it.

  const booker=(()=>{
    const box=$('[data-booker]'),pick=$('[data-bk-pick]',box),daysEl=$('[data-bk-days]',box),timesEl=$('[data-bk-times]',box),dayEl=$('[data-bk-day]',box);
    const wait=$('[data-bk-wait]',box),note=$('[data-bk-note]',box),bform=$('[data-bk-form]',box),done=$('[data-bk-done]',box),off=$('[data-bk-off]',box);
    const steps=$$('.bk-steps li',box),submit=$('[type=submit]',bform),label=$('[data-bk-label]',bform),status=$('.f-status',bform),error=$('.f-error',bform);
    const SAVED='iman.diagnostico.agenda',fine=matchMedia('(pointer:fine)').matches;
    let days=[],day=0,slot=null,loading=null,sending=false,previous='',requestId='',booked=null;
    try{const b=JSON.parse(localStorage.getItem(SAVED));if(b&&b.fin*1000>Date.now()&&b.cuando)booked=b}catch(e){}

    function show(view,focus){
      const panes={pick,form:bform,done,off},n={pick:0,form:1,done:2,off:0}[view];
      for(const [k,el] of Object.entries(panes))el.hidden=k!==view;
      steps.forEach((li,i)=>{li.classList.toggle('on',i===n);li.classList.toggle('ok',i<n)});
      panes[view].classList.remove('bk-in');void panes[view].offsetWidth;panes[view].classList.add('bk-in');
      if(focus)focus.focus({preventScroll:true});
    }
    function unavailable(free){
      $('[data-bk-off-text]',off).textContent=free?'No quedan horarios libres en los próximos días. Escribinos por WhatsApp y lo coordinamos.':'La agenda no cargó acá. Elegí el horario en la página de la agenda.';
      $('[data-bk-off-label]',off).textContent=free?'Escribir por WhatsApp':'Abrir la agenda';
      const link=$('[data-bk-off-link]',off);link.href=free?$('[data-wa-link]').href:AGENDA;
      if(free){link.target='_blank';link.rel='noopener'}
      show('off');
    }
    const drawDays=()=>{
      daysEl.innerHTML=days.map((d,i)=>`<button class="bk-d" type="button" data-d="${i}" aria-pressed="${i===day}" aria-label="${esc(d.largo)}"><small>${esc(d.dia)}</small><b>${esc(String(d.numero))}</b><small>${esc(d.mes)}</small></button>`).join('');
    };
    const drawTimes=()=>{
      const d=days[day];dayEl.textContent=d.largo;
      timesEl.innerHTML=d.horarios.map((h,i)=>`<button class="bk-t" type="button" data-t="${i}"${h.libre?'':' disabled'} aria-label="${esc(d.largo)} a las ${esc(h.hora)}${h.libre?'':', no disponible'}">${esc(h.hora)}</button>`).join('');
    };
    // Asked once, when the agenda comes near the screen (or someone goes to it); asked again when a time gets taken.
    const load=()=>loading||(loading=(async()=>{
      pick.classList.add('is-loading');wait.hidden=false;daysEl.innerHTML=timesEl.innerHTML=dayEl.textContent='';
      let data=null;
      try{const r=await fetch('/api/agenda',{headers:{Accept:'application/json'},cache:'no-store'});data=await r.json()}catch(e){}
      pick.classList.remove('is-loading');wait.hidden=true;
      const was=days[day]&&days[day].fecha;   // asked again after a time got taken: stay on the day they were looking at
      days=onYourClock(data&&data.disponible&&Array.isArray(data.dias)?data.dias:[]).filter(d=>d.horarios.some(h=>h.libre));
      const zone=$('[data-bk-zone]',box);if(zone)zone.textContent=LOCAL?'En tu hora local.':'Hora de Argentina.';
      if(booked)return;
      if(!days.length){unavailable(Boolean(data&&data.disponible));return}
      day=Math.max(0,days.findIndex(d=>d.fecha===was));drawDays();drawTimes();
    })());

    daysEl.addEventListener('click',e=>{
      const b=e.target.closest('.bk-d');if(!b)return;
      day=Number(b.dataset.d);$$('.bk-d',daysEl).forEach((x,i)=>x.setAttribute('aria-pressed',String(i===day)));drawTimes();
    });
    timesEl.addEventListener('click',e=>{
      const b=e.target.closest('.bk-t');if(!b||b.disabled)return;
      const d=days[day],h=d.horarios[Number(b.dataset.t)];
      slot={inicio:h.inicio,hora:h.hora,largo:d.largo,ar:h.ar};note.hidden=true;error.hidden=true;
      $('[data-bk-chosen]',bform).textContent=`${d.largo} a las ${h.hora}${yourTime(h)}`;
      // With a mouse the cursor goes to the first empty field; on a phone that would open the keyboard over the time chosen.
      show('form',fine&&($$('.fld input',bform).find(i=>!i.value)||submit));
      if(!fine)box.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    });
    $('[data-bk-change]',bform).addEventListener('click',()=>{show('pick',$('.bk-d[aria-pressed=true]',daysEl))});

    const utc=t=>new Date(t*1000).toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
    const calendar=b=>'https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:'Videollamada con Santiago · IMÁN',dates:`${utc(b.inicio)}/${utc(b.fin)}`,details:b.meet?`Link de Google Meet: ${b.meet}`:'',location:b.meet||''});
    function confirmed(b,focus){
      booked=b;pill.hidden=true;
      // Booked: the agenda becomes their call, and the other ways to get in touch step aside.
      $('#bk-title').textContent='Tu llamada con IMÁN';$('#llamada').classList.add('is-booked');
      $('[data-bk-when]',done).textContent=`${cap(b.cuando)}${/\(hora de |tu hora/.test(b.cuando)?'.':', hora de Argentina.'}`;
      $('[data-bk-sent]',done).textContent=(b.whatsapp?'Te mandamos el link de Meet por mail y por WhatsApp.':'Te mandamos el link de Meet por mail.')+' Llegamos a la llamada con tu diagnóstico leído.';
      $('[data-bk-cal]',done).href=calendar(b);
      const meet=$('[data-bk-meet]',done);meet.hidden=!b.meet;if(b.meet)meet.href=b.meet;
      show('done',focus&&done);
    }

    bform.addEventListener('submit',async e=>{
      e.preventDefault();
      if(sending||!slot||!bform.reportValidity())return;
      error.hidden=true;
      const data=new FormData(bform),payload={};
      for(const field of ['nombre','negocio','email','whatsapp','sitio_web_empresa'])payload[field]=String(data.get(field)||'').trim();
      Object.assign(payload,{inicio:slot.inicio,zona:ZONA,rubro:form.dataset.rubro,servicios:JSON.parse(form.dataset.servicios),comentario,consentimiento:data.get('consentimiento')==='on',source:location.pathname},utm());
      const body=JSON.stringify(payload);
      if(body!==previous){previous=body;requestId=crypto.randomUUID()}
      sending=true;submit.disabled=true;bform.setAttribute('aria-busy','true');label.textContent='Agendando…';status.textContent='Estamos reservando tu horario.';
      const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),30000);
      try{
        const response=await fetch('/api/agenda',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestId},body,signal:controller.signal});
        let result;try{result=await response.json()}catch(x){throw new Error('No pudimos confirmar la reserva. Probá otra vez o escribinos por WhatsApp.')}
        if(response.status===409&&result.code==='slot_taken'){
          // Someone else got it first: back to the times, asked again.
          slot=null;loading=null;show('pick');note.textContent=result.error;note.hidden=false;await load();return;
        }
        if(!response.ok||result.ok!==true)throw new Error(result.error||'No pudimos confirmar la reserva. Probá otra vez o escribinos por WhatsApp.');
        const b={inicio:result.inicio||slot.inicio,fin:result.fin||slot.inicio+1800,meet:result.meet||'',cuando:result.cuando||`${slot.largo} a las ${slot.hora}${yourTime(slot)}`,whatsapp:result.whatsapp==='enviado'};
        try{localStorage.setItem(SAVED,JSON.stringify(b))}catch(x){}
        confirmed(b,true);
        dispatchEvent(new CustomEvent('iman:agenda'));   // pixel.js counts it as a booked call
      }catch(problem){
        error.textContent=problem.name==='AbortError'?'La reserva tardó más de lo esperado. Antes de reintentar, fijate si te llegó el mail o el WhatsApp con el link: puede haber quedado agendada.':problem.message;error.hidden=false;
      }finally{clearTimeout(timeout);sending=false;submit.disabled=false;bform.removeAttribute('aria-busy');label.textContent='Confirmar la llamada';status.textContent=''}
    });

    // Every "book a call" link on the plan lands here.
    document.addEventListener('click',e=>{
      const link=e.target.closest&&e.target.closest('a[data-book]');
      if(!link||link.getAttribute('href')!=='#agenda')return;
      e.preventDefault();
      box.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
      $('#bk-title').focus({preventScroll:true});
      if(!booked)load();
    });
    if('IntersectionObserver' in window)new IntersectionObserver(e=>{if(e[0].isIntersecting&&!detail.hidden&&!booked)load()},{rootMargin:'0px 0px 700px 0px'}).observe(box);
    return {
      booked:()=>Boolean(booked),
      sync(){if(booked)confirmed(booked,false);else if(!('IntersectionObserver' in window))load()}
    };
  })();

  /* ---------- Start: a finished diagnosis reopens on its plan; ?rubro=autos skips the first question (for ads by rubro) ---------- */

  const before=stored(),wanted=new URLSearchParams(location.search).get('rubro');
  if(before){A=before;history.replaceState({s:'plan',d:0},'');openPlan(false)}
  else{
    if(RUBROS.some(r=>r.id===wanted&&r.id!=='otro')){A.rubro=wanted;step=first=1}
    history.replaceState({s:step,d:0},'');render(false);
  }
})();
