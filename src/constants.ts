import { BuildConfig, GithubSettings } from './types';

// The original default token pieces from the original application
const part1 = "ghp_UOFX";
const part2 = "reBOBkr";
const part3 = "WLngOku";
const part4 = "QRBwDDZHEl682XzcxH";

export const DEFAULT_GITHUB_SETTINGS: GithubSettings = {
  owner: 'appcreator05',
  repo: 'jhgjg',
  workflowFile: 'build.yml',
  branch: 'main',
  token: part1 + part2 + part3 + part4,
  useSimulation: false,
};

export const PRESET_APPS: { label: string; config: BuildConfig }[] = [
  {
    label: 'Movie Portal Pro',
    config: {
      appName: 'MovieApp Pro',
      packageName: 'com.example.movieapp',
      appUrl: 'https://example.com/movies',
      appIcon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=80',
    },
  },
  {
    label: 'E-Commerce Store',
    config: {
      appName: 'NovaShop Mobile',
      packageName: 'com.novashop.store',
      appUrl: 'https://example.com/shop',
      appIcon: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&auto=format&fit=crop&q=80',
    },
  },
  {
    label: 'News & Tech Blog',
    config: {
      appName: 'TechPulse Daily',
      packageName: 'org.techpulse.reader',
      appUrl: 'https://news.ycombinator.com',
      appIcon: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&auto=format&fit=crop&q=80',
    },
  },
];
