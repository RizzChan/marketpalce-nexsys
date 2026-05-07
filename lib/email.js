import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email, name, otp) {
  const { error } = await resend.emails.send({
    from: "Marketplace App <onboarding@resend.dev>",
    to: email,
    subject: "Kode Verifikasi Login Kamu",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="margin-bottom: 8px;">Halo, ${name}! 👋</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Gunakan kode OTP berikut untuk login ke akunmu.
          Kode ini berlaku selama <strong>5 menit</strong>.
        </p>
        <div style="
          background: #f4f4f4;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin-bottom: 24px;
        ">
          <span style="
            font-size: 40px;
            font-weight: bold;
            letter-spacing: 12px;
            color: #111;
          ">${otp}</span>
        </div>
        <p style="color: #999; font-size: 13px;">
          Kalau kamu tidak merasa melakukan login, abaikan email ini.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Gagal kirim email: ${error.message}`);
  }
}