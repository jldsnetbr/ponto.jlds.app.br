export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="Carregando">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-midnight-400" />
      <span className="sr-only">Carregando</span>
    </div>
  );
}
