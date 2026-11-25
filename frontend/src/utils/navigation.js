let navigateRef = null;

export const setGlobalNavigate = (navigate) => {
  navigateRef = navigate;
};

export const globalNavigate = (to, options) => {
  if (navigateRef) {
    navigateRef(to, options);
  }
};
