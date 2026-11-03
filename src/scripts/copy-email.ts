// Progressive enhancement: the copy button only appears when the Clipboard API is available.
function initCopyEmail(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-copy]');
  const status = document.querySelector<HTMLElement>('[data-copy-status]');
  const label = button?.querySelector<HTMLElement>('[data-copy-label]');
  if (button && status && label && navigator.clipboard) {
    const original = label.textContent ?? '';
    const done = status.dataset.done ?? '';
    const failed = status.dataset.failed ?? '';
    let timer: number | undefined;
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
        label.textContent = done;
        status.classList.add('sr-only');
        status.textContent = done;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          label.textContent = original;
          status.textContent = '';
        }, 2000);
      } catch {
        // Clipboard denied: say so, keep the label so the user can retry; the mailto link still works.
        window.clearTimeout(timer);
        status.classList.remove('sr-only');
        status.textContent = failed;
      }
    });
  }
}

initCopyEmail();

export {};
