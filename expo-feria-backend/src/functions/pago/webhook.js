const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { database } = require("../../services/database");
const { emailService } = require("../../services");

module.exports = async function (context, req) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    context.res = { status: 400, body: `Webhook Error: ${err.message}` };
    return;
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    // ... otros casos
  }

  context.res = { body: { received: true } };
};

async function handleSuccessfulPayment(paymentIntent) {
  // 1. Actualizar reservación
  const reservationId = paymentIntent.metadata.reservationId;
  await database.containers.reservations.item(reservationId).patch([
    { op: "replace", path: "/estado", value: "confirmado" },
    { op: "replace", path: "/estadoPago", value: "completado" },
  ]);

  // 2. Enviar email de confirmación final
  const { resource: reservation } = await database.containers.reservations
    .item(reservationId)
    .read();
  const { resource: user } = await database.containers.users
    .item(reservation.userId)
    .read();
  const { resource: stand } = await database.containers.stands
    .item(reservation.standId)
    .read();

  await emailService.sendPaymentConfirmation(user.email, {
    reservationId: reservation.id,
    standName: stand.nombre,
    amount: stand.precio,
    qrCode: await generateQR(reservation.id),
  });
}
