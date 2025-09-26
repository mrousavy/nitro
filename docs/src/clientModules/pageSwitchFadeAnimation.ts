import { ClientModule } from '@docusaurus/types';

function getDocsMain(): HTMLElement | null {
  // match "docMainContainer_<hash>" no matter where it appears in class attr
  return document.querySelector(
    'div[class^="docItemContainer_"], div[class*=" docItemContainer_"]'
  )
}
function scrollIntoView(element: HTMLElement) {
  // let layout settle first
  requestAnimationFrame(() => {
    element.scrollIntoView({behavior: 'smooth', block: 'start'})
  });
}
function runFadeInAnimation(element: HTMLElement) {
  element.classList.remove('doc-fade--run')
  void element.offsetWidth; // reflow
  requestAnimationFrame(() => {
    element.classList.add('doc-fade--run')
  });
}


const client: ClientModule = {
  onRouteDidUpdate({ location, previousLocation }) {
    if (previousLocation == null) {
      // first mount should not play an animation
      return
    }
    const pathChanged = location.pathname !== previousLocation.pathname;
    const hashChanged = location.hash !== previousLocation.hash;
    if (!hashChanged && !pathChanged) {
      // nothing changed, do nothing
      return;
    }

    const mainElement = getDocsMain();
    if (mainElement == null) {
      // we're not on our docs page
      return;
    }

    if (hashChanged && !pathChanged) {
      // anchor changed - smoothly scroll to new anchor
      const id = decodeURIComponent(location.hash.replace(/^#/, ''));
      const target = id ? document.getElementById(id) : null;
      if (target != null) {
        scrollIntoView(target);
      }
      return;
    }

    if (pathChanged) {
      // page changed - run fade-in animation
      runFadeInAnimation(mainElement)
    }
  }
}
export default client
