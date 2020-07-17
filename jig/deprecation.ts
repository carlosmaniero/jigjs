const deprecatedLog = (message: string): void =>
  console.warn(`DEPRECATED!

${message}`);

export const deprecation = {
  moduleRoutesOnConstructor: (): void => deprecatedLog(`Router module does not receives a Routes instance anymore.

use instead:
const routerModule = new RouterModule(window, platform);
routerModule.routes.handle(...);
`),
  platformPackageTypo: (): void => deprecatedLog(`There was a typo into the "jigjs/patform/platform.ts". Replace the import with "jigjs/platform."`),
};
