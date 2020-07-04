import { h } from 'preact';
import { PageContextProvider, usePageContext } from './context/pageContext';
import { AppContextProvider } from './context/appContext';

import { HomePage } from './pages/home';
import { NotFoundPage } from './pages/notFound';
import { RoomPage } from './pages/room';
import { RoomEditor } from './pages/roomEditor';

const Router = () => {
  const [page, params] = usePageContext();

  console.log(`Currently on ${page}`);

  switch (page) {
    case '/room':
      return h(RoomPage);
    case '/room-editor':
      const { roomId } = params;
      return h(RoomEditor, { roomId });
    case '/':
    case '/home':
      return h(HomePage);
    default:
      return h(NotFoundPage);
  }
}

const App = ({ initialPage, initialParams }) => {
  return (
    h(PageContextProvider, { initialPage, initialParams },
      h(AppContextProvider, {}, 
        h(Router)
      )
    )
  );
};

export {
  App,
};
