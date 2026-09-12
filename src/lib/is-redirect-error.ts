// redirect() dentro de un server action se propaga al cliente como un error
// especial. Si el componente envuelve la llamada en try/catch para mostrar
// errores, hay que dejar pasar este o se ve un "NEXT_REDIRECT" en pantalla
// en vez de navegar.
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
