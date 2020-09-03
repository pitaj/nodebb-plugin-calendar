/* eslint-disable camelcase, no-underscore-dangle */

interface JQueryStatic {
  _data(element: HTMLElement, prop: string): {
    click: { handler(event: JQuery.Event): boolean }[]
  }
}

interface JQuery {
  size(): number,
}

declare const bootbox: {
  confirm(question: string, callback: (okay: boolean) => void): void;
};

declare const requirejs: (modules: string[], callback?: (...modules: unknown[]) => void) => void;

declare module 'translator' {
  interface NodebbTranslatorInstance {
    translateInPlace(element: HTMLElement): Promise<void>;
  }
}

declare module 'benchpress' {
  const Benchpress: {
    render(template: string, data: unknown): Promise<string>
  };
  export default Benchpress;
}

declare module 'composer' {
  export const active: string;
  export const posts: {
    [key: string]: {
      pid?: number,
      tid?: number,
      cid?: number,
      isMain?: boolean,
    }
  };
}

declare module 'composer/formatting' {
  export const addButtonDispatch: (
    button: string,
    callback: (textarea: HTMLTextAreaElement) => void
  ) => void;
}

declare let __webpack_public_path__: string;

declare const config: {
  relative_path: string,
  userLang: string,
  defaultLang: string,
};

declare const ajaxify: {
  data: {
    template: {
      [key: string]: boolean,
    },
    posts?: {
      pid: number
    }[]
  }
};

declare const calendarEventData: {
  pid: number,
} | null;

declare const app: {
  alertError(err?: Error | string): void,
  alertSuccess(message?: string): void,
  user: {
    uid: number
  }
};

interface Socket extends SocketIOClient.Socket {
  emit<K extends import('./lib/sockets').SocketNamespaces>(
    namespace: K,
    data: import('./lib/sockets').SocketRequests[K],
    ack: (err: Error, response: import('./lib/sockets').SocketResponses[K]) => void
  ): Socket;
}
declare const socket: Socket;
