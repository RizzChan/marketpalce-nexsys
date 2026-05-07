import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "Akun kamu tidak aktif." },
        { status: 403 }
      );
    }

    // Hapus OTP lama yang belum dipakai
    await prisma.otpCode.deleteMany({
      where: { userId: user.id, used: false },
    });

    // Generate & simpan OTP baru
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt,
      },
    });

    await sendOtpEmail(user.email, user.name, otp);

    return NextResponse.json(
      { message: "Kode OTP telah dikirim ke email kamu." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[REQUEST_OTP_ERROR]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}