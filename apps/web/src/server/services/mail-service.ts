import { Resend } from "resend";

type EmailBase = {
	to: string;
	subject: string;
	html: string;
	text?: string;
	replyTo?: string | string[];
};

export type EmailServiceDeps = {
	apiKey?: string; // defaults to process.env.RESEND_API_KEY
	from?: string; // defaults to process.env.EMAIL_FROM
};

export const createEmailService = (deps?: EmailServiceDeps) => {
	//const resend = new Resend(deps?.apiKey ?? process.env.RESEND_API_KEY);
	const from = deps?.from ?? process.env.EMAIL_FROM ?? "no-reply@cofiblocks.com";

	//   if (!resend) {
	//     throw new Error("Resend client not initialized: missing RESEND_API_KEY");
	//   }

	const send = async ({ to, subject, html, text }: EmailBase) => {
		// const result = await resend.emails.send({
		//   from,
		//   to,
		//   subject,
		//   html,
		//   text,
		// });
		// if (result.error) {
		//   // expose enough info for logs without leaking internals to clients
		//   throw new Error(
		//     `Resend send failed: ${result.error.name ?? "Unknown"} - ${result.error.message ?? "No message"}`
		//   );
		// }
		// return {
		//   id: result.data?.id ?? null,
		//   // Resend returns { id }; delivery happens asynchronously by the provider
		//   ok: true as const,
		// };
	};

	// ---- Templates (Spanish copy) ----
	const renderVerificationEmail = (params: {
		userName?: string | null;
		verifyUrl: string;
	}) => {
		const appName = "Cofiblocks";
		const saludo = params.userName ? `¡Hola ${params.userName}!` : "¡Hola!";
		const text = [
			`${saludo}`,
			"",
			`Gracias por registrarte en ${appName}. Para completar tu registro, por favor verifica tu correo electrónico:`,
			`${params.verifyUrl}`,
			"",
			"Este enlace expira en 24 horas.",
			"",
			"Si no creaste una cuenta, puedes ignorar este mensaje.",
			"",
			`— El equipo de ${appName}`,
		].join("\n");

		const html = `
      <!doctype html>
      <html>
        <head><meta charSet="utf-8" /></head>
        <body style="font-family: Arial, sans-serif; color:#222; line-height:1.6; margin:0; padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f7fb; padding:24px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="background:#fff; border-radius:12px; padding:24px; box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                  <tr><td style="font-size:16px;">
                    <p style="margin:0 0 16px 0;">${saludo}</p>
                    <p style="margin:0 0 16px 0;">Gracias por registrarte en <strong>${appName}</strong>. Para completar tu registro, verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
                    <p style="margin:24px 0;">
                      <a href="${params.verifyUrl}" style="display:inline-block; padding:12px 20px; border-radius:8px; text-decoration:none; background:#111827; color:#fff; font-weight:600;">
                        Verificar correo
                      </a>
                    </p>
                    <p style="margin:0 0 16px 0;">O copia y pega este enlace en tu navegador:</p>
                    <p style="word-break:break-all; color:#0369a1; margin:0 0 16px 0;">${params.verifyUrl}</p>
                    <p style="margin:0 0 16px 0; color:#666;">Este enlace expirará en 24 horas.</p>
                    <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
                    <p style="margin:0; color:#666;">Si no creaste una cuenta, ignora este mensaje.</p>
                    <p style="margin:16px 0 0 0; color:#666;">— El equipo de ${appName}</p>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

		return { text, html, subject: `Verifica tu correo en ${appName}` };
	};

	const renderPasswordResetEmail = (params: {
		appName?: string;
		userName?: string | null;
		resetUrl: string;
	}) => {
		const appName = params.appName ?? "Cofiblocks";
		const saludo = params.userName ? `¡Hola ${params.userName}!` : "¡Hola!";
		const text = [
			`${saludo}`,
			"",
			`Recibimos una solicitud para restablecer tu contraseña de ${appName}.`,
			"Abre el siguiente enlace para continuar:",
			`${params.resetUrl}`,
			"",
			"Este enlace expira en 24 horas.",
			"",
			"Si no solicitaste este cambio, puedes ignorar este mensaje.",
			"",
			`— El equipo de ${appName}`,
		].join("\n");

		const html = `
      <!doctype html>
      <html>
        <head><meta charSet="utf-8" /></head>
        <body style="font-family: Arial, sans-serif; color:#222; line-height:1.6; margin:0; padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f7fb; padding:24px 0;">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="background:#fff; border-radius:12px; padding:24px; box-shadow:0 1px 4px rgba(0,0,0,0.06);">
                  <tr><td style="font-size:16px;">
                    <p style="margin:0 0 16px 0;">${saludo}</p>
                    <p style="margin:0 0 16px 0;">Recibimos una solicitud para restablecer tu contraseña de <strong>${appName}</strong>.</p>
                    <p style="margin:24px 0;">
                      <a href="${params.resetUrl}" style="display:inline-block; padding:12px 20px; border-radius:8px; text-decoration:none; background:#111827; color:#fff; font-weight:600;">
                        Restablecer contraseña
                      </a>
                    </p>
                    <p style="margin:0 0 16px 0;">O copia y pega este enlace en tu navegador:</p>
                    <p style="word-break:break-all; color:#0369a1; margin:0 0 16px 0;">${params.resetUrl}</p>
                    <p style="margin:0 0 16px 0; color:#666;">El enlace expirará en 24 horas.</p>
                    <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
                    <p style="margin:0; color:#666;">Si no solicitaste este cambio, ignora este mensaje.</p>
                    <p style="margin:16px 0 0 0; color:#666;">— El equipo de ${appName}</p>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

		return { text, html, subject: `Restablece tu contraseña en ${appName}` };
	};

	// ---- Public helpers ----
	const sendVerificationEmail = async (opts: {
		to: string;
		verifyUrl: string;
		userName?: string | null;
	}) => {
		const tpl = renderVerificationEmail({
			userName: opts.userName ?? null,
			verifyUrl: opts.verifyUrl,
		});

		return send({
			to: opts.to,
			subject: tpl.subject,
			html: tpl.html,
			text: tpl.text,
		});
	};

	const sendPasswordResetEmail = async (opts: {
		to: string;
		resetUrl: string;
		userName?: string | null;
		appName?: string;
	}) => {
		const tpl = renderPasswordResetEmail({
			appName: opts.appName,
			userName: opts.userName ?? null,
			resetUrl: opts.resetUrl,
		});

		return send({
			to: opts.to,
			subject: tpl.subject,
			html: tpl.html,
			text: tpl.text,
		});
	};

	return {
		send, // generic
		sendVerificationEmail,
		sendPasswordResetEmail,
	};
};
