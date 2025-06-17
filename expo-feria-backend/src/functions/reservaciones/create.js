const { database, paymentService, emailService } = require("../../services");
const { validateReservationData } = require("../../utils/validators");
const { authenticate } = require("../../utils/auth");

module.exports = async function (context, req) {
  try {
    // Autenticación
    const user = await authenticate(req);

    // Validación
    const { standId, paymentMethodId } = validateReservationData(req.body);

    // 1. Verificar disponibilidad del stand
    const stand = await database.containers.stands.item(standId).read();
    if (stand.resource.estado !== "disponible") {
      throw new Error("El stand seleccionado no está disponible");
    }

    // 2. Crear intención de pago
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: stand.resource.precio * 100,
      currency: "mxn",
      paymentMethodId,
      metadata: { standId, userId: user.id },
    });

    // 3. Crear reservación
    const reservation = {
      id: `res_${Date.now()}`,
      type: "reservation",
      standId,
      userId: user.id,
      fecha: new Date().toISOString(),
      monto: stand.resource.precio,
      estado: "pendiente",
      paymentIntentId: paymentIntent.id,
    };

    await database.containers.reservations.items.create(reservation);

    // 4. Actualizar estado del stand (reservado temporalmente)
    await database.containers.stands.item(standId).patch([
      { op: "replace", path: "/estado", value: "reservado" },
      { op: "add", path: "/reservadoPor", value: user.id },
    ]);

    // 5. Enviar email de confirmación
    await emailService.sendReservationConfirmation(user.email, {
      reservationId: reservation.id,
      standName: stand.resource.nombre,
      amount: stand.resource.precio,
    });

    context.res = {
      status: 201,
      body: {
        success: true,
        reservation,
        clientSecret: paymentIntent.client_secret,
      },
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: { error: error.message },
    };
  }
};
