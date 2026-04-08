/**
 * Utilitários de exportação de dados para arquivo local.
 * Funciona inteiramente no browser — não requer backend.
 */

/**
 * Dispara o download de um objeto como arquivo JSON.
 * O browser abre o diálogo "Salvar como" automaticamente.
 */
export function downloadJSON(data: unknown, filename: string): void {
  try {
    const json  = JSON.stringify(data, null, 2);
    const blob  = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url   = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href     = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Libera memória após 1s (tempo suficiente para o navegador iniciar o download)
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.info(`[BYLINE EXPORT] Arquivo "${filename}" gerado automaticamente.`);
  } catch (e) {
    console.warn('[BYLINE EXPORT] Falha ao exportar:', e);
  }
}

/**
 * Cria um blob de download e retorna a URL (para uso com links manuais).
 */
export function createDownloadURL(data: unknown): string {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  return URL.createObjectURL(blob);
}
