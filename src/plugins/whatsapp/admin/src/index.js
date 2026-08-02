import { PLUGIN_ID } from './pluginId';
import PluginIcon from './components/PluginIcon';

export default {
  register(app) {
    app.registerPlugin({
      id: PLUGIN_ID,
      name: 'WhatsApp',
    });

    app.addMenuLink({
      to: `/plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'WhatsApp',
      },
      Component: () => import('./pages/HomePage'),
      permissions: [],
    });
  },
};
