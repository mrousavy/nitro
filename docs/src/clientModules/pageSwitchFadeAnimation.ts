import { ClientModule } from '@docusaurus/types';

function getDocsMain(): HTMLElement | null {
  // match "docMainContainer_<hash>" no matter where it appears in class attr
  return document.querySelector(
    'main[class^="docMainContainer_"], main[class*=" docMainContainer_"]'
  ) as HTMLElement | null;
}

const client: ClientModule = {
  onRouteDidUpdate() {
    const el = getDocsMain();
    if (!el) return; // not a docs page

    el.classList.remove('doc-fade--run');
    void el.offsetWidth; // reflow
    requestAnimationFrame(() => {
      el.classList.add('doc-fade--run');
    });
  }
}
export default client
