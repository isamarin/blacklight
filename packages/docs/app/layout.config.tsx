import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: 'Blacklight',
    url: '/docs'
  },
  githubUrl: 'https://github.com/isamarin/blacklight',
  links: [
    {
      text: 'Home',
      url: '/',
      active: 'nested-url',
    },
    {
      text: 'Documentation',
      url: '/docs',
      active: 'nested-url',
    },
  ],
};
