import AuthLogo from './extensions/logo-golden-gates.png';
import MenuLogo from './extensions/logo-golden-gates.png';
import { PinMap } from '@strapi/icons';

const config = {
  locales: [],
  auth: {
    logo: AuthLogo,
  },
  menu: {
    logo: MenuLogo,
  },
  head: {
    favicon: AuthLogo,
  },
};

const register = (app) => {
  app.registerPlugin({
    id: 'live-bus-tracking',
    name: 'Live Bus Tracking',
  });

  app.addMenuLink({
    to: '/plugins/live-bus-tracking',
    icon: PinMap,
    intlLabel: {
      id: 'live-bus-tracking.menu',
      defaultMessage: 'Live Bus Tracking',
    },
    Component: () => import('./pages/LiveTracking'),
    permissions: [],
  });
};

export default {
  config,
  register,
};
