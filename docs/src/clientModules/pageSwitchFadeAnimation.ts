import { ClientModule } from '@docusaurus/types';

function getDocsMain(): HTMLElement | null {
  // match "docMainContainer_<hash>" no matter where it appears in class attr
  return document.querySelector(
    'main[class^="docMainContainer_"], main[class*=" docMainContainer_"]'
  ) as HTMLElement | null;
}

const client: ClientModule = {
  onRouteDidUpdate({ location, previousLocation }) {
    if (previousLocation == null) {
      // first mount should not play an animation
      return
    }
    const pathChanged = location.pathname !== previousLocation.pathname;
    const hashChanged = location.hash !== previousLocation.hash;

    const mainElement = getDocsMain();
    if (mainElement == null) {
      // we're not on our docs page
      return;
    }

    if (hashChanged && !pathChanged) {
      const id = decodeURIComponent(location.hash.replace(/^#/, ''));
      const target = id ? document.getElementById(id) : null;
      if (target) {
        // let layout settle first
        requestAnimationFrame(() => {
          target.scrollIntoView({behavior: 'smooth', block: 'start'});
        });
      }
      return;
    }

    mainElement.classList.remove('doc-fade--run');
    void mainElement.offsetWidth; // reflow
    requestAnimationFrame(() => {
      mainElement.classList.add('doc-fade--run');
    });
  }
}
export default client
