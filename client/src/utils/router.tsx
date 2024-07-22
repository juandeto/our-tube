import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from './routes';
import Layout from 'components/Layout/Layout';

const LandingLazy = React.lazy(() => import('screens/Landing'));
const LoginLazy = React.lazy(() => import('screens/Login'));
const VideoListChannelLazy = React.lazy(
  () => import('screens/video-list/VideoList')
);
const LintEndedLazy = React.lazy(() => import('screens/ListEnded'));

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index={true} element={<LandingLazy />} />
        <Route
          path={ROUTES.LOGIN}
          element={
            <React.Suspense fallback={<p>Loading...</p>}>
              <LoginLazy />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.CHANNEL}
          element={
            <React.Suspense fallback={<p>Loading...</p>}>
              <VideoListChannelLazy />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.LIST_ENDED}
          element={
            <React.Suspense fallback={<p>Loading...</p>}>
              <LintEndedLazy />
            </React.Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
