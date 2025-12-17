import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // In development, log the OTP to console
        console.log(`\n\n=== EMAIL OTP (${type}) ===`);
        console.log(`To: ${email}`);
        console.log(`OTP: ${otp}`);
        console.log(`===========================\n\n`);
      },
    }),
  ],
});
