export default {
  root: '.',
  sources: ['examples/modern/src/**/*.{html,js,ts,tsx,jsx,vue,svelte}'],
  modules: {
    button: {
      description: 'Componenti per il bottone primario',
      attachments: [
        { type: 'js', path: 'examples/modern/src/components/button.js', target: 'components' },
        { type: 'css', path: 'examples/modern/src/components/button.css', target: 'components' }
      ]
    },
    dashboard: {
      description: 'Modulo dashboard con bundle composito',
      attachments: [
        { type: 'js', path: 'examples/modern/src/components/dashboard.js', target: 'pages' },
        { type: 'asset', path: 'examples/modern/src/components/dashboard.svg', target: 'media' }
      ]
    }
  },
  output: {
    directory: 'dist/bindep',
    manifest: 'dist/bindep/manifest.json',
    assets: 'dist/bindep/assets',
    publicPath: '/static/bindep/'
  }
};
