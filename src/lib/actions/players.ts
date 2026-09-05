"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertAdminPassword } from "@/lib/admin-password";

export async function createPlayer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("El nombre es obligatorio");
  }

  const photo = formData.get("photo");
  let photoUrl: string | undefined;

  if (photo instanceof File && photo.name && photo.size > 0) {
    const ext = photo.name.split(".").pop() || "jpg";
    const blob = await put(`jugadores/${crypto.randomUUID()}.${ext}`, photo, {
      access: "public",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    photoUrl = blob.url;
  }

  await prisma.player.create({
    data: { name, photoUrl },
  });

  revalidatePath("/jugadores");
  revalidatePath("/partidas/nueva");
}

// La foto de un jugador se puede reemplazar en cualquier momento, incluso
// con partidas en curso: no afecta puntajes ni historial, solo la imagen.
// A diferencia de la foto inicial (al crear el jugador), cambiarla después
// pide la misma contraseña que borrar partida/jugador.
export async function updatePlayerPhoto(playerId: string, formData: FormData) {
  assertAdminPassword(String(formData.get("password") ?? ""));

  const photo = formData.get("photo");
  if (!(photo instanceof File) || !photo.name || photo.size === 0) {
    throw new Error("Elegí una foto");
  }

  const ext = photo.name.split(".").pop() || "jpg";
  const blob = await put(`jugadores/${crypto.randomUUID()}.${ext}`, photo, {
    access: "public",
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  await prisma.player.update({
    where: { id: playerId },
    data: { photoUrl: blob.url },
  });

  revalidatePath("/jugadores");
  revalidatePath("/partidas");
  revalidatePath("/partidas/nueva");
}

export async function updatePlayerName(
  playerId: string,
  name: string,
  password: string
) {
  assertAdminPassword(password);

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("El nombre es obligatorio");
  }

  await prisma.player.update({
    where: { id: playerId },
    data: { name: trimmed },
  });

  revalidatePath("/jugadores");
  revalidatePath("/partidas");
  revalidatePath("/partidas/nueva");
  revalidatePath("/tops");
}

export async function deletePlayer(playerId: string, password: string) {
  assertAdminPassword(password);

  try {
    await prisma.player.delete({ where: { id: playerId } });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      throw new Error(
        "No se puede eliminar: ya participó en alguna partida. Borrá esas partidas primero."
      );
    }
    throw err;
  }

  revalidatePath("/jugadores");
  revalidatePath("/partidas/nueva");
}
