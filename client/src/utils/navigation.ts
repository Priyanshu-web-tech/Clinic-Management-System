let navigateFn: null | ((path: string) => void) = null;

export const setNavigator = (nav: (path: string) => void) => {
  navigateFn = nav;
};

export const navigate = (path: string) => {
  if (navigateFn) {
    navigateFn(path);
  }
};
