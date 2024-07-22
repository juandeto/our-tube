export function initBeforeUnLoad(showExitPrompt: boolean) {
  window.onbeforeunload = (event) => {
    // Show prompt based on state
    if (showExitPrompt) {
      const e = event || window.event;
      e.preventDefault();
      console.log('e: ', e);
      if (e) {
        e.returnValue = '';
      }
      return '';
    }
  };
}
