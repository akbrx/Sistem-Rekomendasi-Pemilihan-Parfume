-- CreateTable
CREATE TABLE "perfumes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(255) NOT NULL,
    "sillage" INTEGER NOT NULL,
    "projection" INTEGER NOT NULL,
    "longevity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "olfactory_family" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "perfumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" VARCHAR(255),
    "remember_token" VARCHAR(100),
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "perfume_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_perfume_id_key" ON "favorites"("user_id", "perfume_id");
