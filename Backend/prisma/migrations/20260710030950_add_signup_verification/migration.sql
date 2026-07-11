-- CreateTable
CREATE TABLE "SignupVerification" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "otp_expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignupVerification_email_key" ON "SignupVerification"("email");

-- CreateIndex
CREATE INDEX "SignupVerification_email_idx" ON "SignupVerification"("email");

-- CreateIndex
CREATE INDEX "SignupVerification_otp_expires_idx" ON "SignupVerification"("otp_expires");
