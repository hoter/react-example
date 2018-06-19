import React from 'react';
import Loadable from 'react-loadable'

import AppLayout from './views/AppLayout';

function Loading() {
  return <div>Loading...</div>;
}

const Dashboard = Loadable({
  loader: () => import('./views/Dashboard'),
  loading: Loading,
});

const Queries = Loadable({
  loader: () => import('./views/Reports/Queries'),
  loading: Loading,
});

const CollectionsList = Loadable({
  loader: () => import('./views/Collections/List'),
  loading: Loading,
});

const CollectionsAdd = Loadable({
  loader: () => import('./views/Collections/Add'),
  loading: Loading,
});

const CollectionsGet = Loadable({
  loader: () => import('./views/Collections/Get'),
  loading: Loading,
});

const CrawlersList = Loadable({
  loader: () => import('./views/Crawlers/List'),
  loading: Loading,
});

const CrawlersAdd = Loadable({
  loader: () => import('./views/Crawlers/Add'),
  loading: Loading,
});

const CrawlersView= Loadable({
  loader: () => import('./views/Crawlers/View'),
  loading: Loading,
});

const CrawlersHttpView = Loadable({
  loader: () => import('./views/Crawlers/HTTPView'),
  loading: Loading,
});

const CrawlersEdit = Loadable({
  loader: () => import('./views/Crawlers/Edit'),
  loading: Loading,
});

const Widgets = Loadable({
  loader: () => import('./views/Widgets/Widgets'),
  loading: Loading,
});

const UsersList = Loadable({
  loader: () => import('./views/Settings/Users/List'),
  loading: Loading,
});

const Backup = Loadable({
  loader: () => import('./views/Settings/Backup'),
  loading: Loading,
});

const PinnedDocuments = Loadable({
  loader: () => import('./views/PinnedDocuments'),
  loading: Loading,
});

const PinnedDocumentsEdit = Loadable({
  loader: () => import('./views/PinnedDocuments/Edit'),
  loading: Loading,
});
// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/', exact: true, name: 'Home', component: AppLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/reports/queries', exact: true, name: 'Queries', component: Queries },
  { path: '/collections', exact: true, name: 'Collections', component: CollectionsList },
  { path: '/collections/list', name: 'List', component: CollectionsList },
  { path: '/collections/add', name: 'Add', component: CollectionsAdd },
  { path: '/collections/pinned', exact: true, name: 'Pinned Documents', component: PinnedDocuments },
  { path: '/collections/pinned/:name', name: 'Edit', component: PinnedDocumentsEdit },
  { path: '/collections/:name', name: 'Get', component: CollectionsGet },
  { path: '/crawlers', exact: true, name: 'Crawlers', component: CrawlersList },
  { path: '/crawlers/list', name: 'List', component: CrawlersList },
  { path: '/crawlers/add', name: 'Add', component: CrawlersAdd },
  { path: '/crawlers/edit', name: 'Edit', component: CrawlersEdit },
  { path: '/crawlers/view', exact: true, name: 'View Crawler', component: CrawlersView },
  { path: '/crawlers/view/http', name: 'View HTTP Crawler', component: CrawlersHttpView },
  { path: '/widgets', name: 'Widgets', component: Widgets },
  { path: '/settings', exact: true, name: 'Settings', component: UsersList },
  { path: '/settings/users', name: 'Users and Roles', component: UsersList },
  { path: '/settings/backup', name: 'Backup and Restore', component: Backup },
];

export default routes;
