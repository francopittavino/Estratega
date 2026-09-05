"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function createPlayer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("El nombre es obligatorio");
  }

  const photo = formData.get("photo");
  let photoUrl: string | undefined;

  if (photo instanceof File && photo.size > 0) {
    const ext = photo.name.split(".").pop() || "jpg";
    const blob = await put(`jugadores/${crypto.randomUUID()}.${ext}`, photo, {
      access: "public",
      addRandomSuffix: false,
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
export async function updatePlayerPhoto(playerId: string, formData: FormData) {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    throw new Error("Elegí una foto");
  }

  const ext = photo.name.split(".").pop() || "jpg";
  const blob = await put(`jugadores/${crypto.randomUUID()}.${ext}`, photo, {
    access: "public",
    addRandomSuffix: false,
  });

  await prisma.player.update({
    where: { id: playerId },
    data: { photoUrl: blob.url },
  });

  revalidatePath("/jugadores");
  revalidatePath("/partidas");
  revalidatePath("/partidas/nueva");
}
