'use client';

import {
  ClientEvent,
  createClient,
  MatrixClient,
  NotificationCountType,
  Room,
  RoomEvent,
  SyncState
} from 'matrix-js-sdk';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';

import { getMatrixCredentials } from '@/lib/data/matrix';

type MatrixContextValue = {
  client: MatrixClient | null;
  /** True once the first sync completed and rooms/timelines are usable. */
  ready: boolean;
};

const MatrixContext = createContext<MatrixContextValue>({
  client: null,
  ready: false
});

/**
 * Starts a Matrix session for the logged-in customer and keeps it alive for
 * the whole app (replaces the TalkJS <Session> provider). Credentials are
 * minted through a server action since the customer JWT is a server-only
 * cookie. Renders children immediately — chat surfaces gate on `ready`.
 */
export function MatrixProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<MatrixClient | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let session: MatrixClient | null = null;

    getMatrixCredentials()
      .then(async creds => {
        if (!creds || disposed) return;

        const matrixClient = createClient({
          baseUrl: creds.homeserver_url,
          accessToken: creds.access_token,
          userId: creds.user_id,
          useAuthorizationHeader: true
        });

        await matrixClient.startClient({
          initialSyncLimit: 20,
          lazyLoadMembers: true
        });

        if (disposed) {
          matrixClient.stopClient();
          return;
        }
        session = matrixClient;

        matrixClient.on(ClientEvent.Sync, (state: SyncState) => {
          if (state === SyncState.Prepared) setReady(true);
        });

        // Rooms are normally force-joined server-side; accept any stray
        // invite (e.g. created while this client was offline) automatically.
        matrixClient.on(RoomEvent.MyMembership, (room, membership) => {
          if (membership === 'invite') {
            matrixClient.joinRoom(room.roomId).catch(() => {});
          }
        });

        setClient(matrixClient);
      })
      .catch(error => {
        console.error('Matrix session could not be started', error);
      });

    return () => {
      disposed = true;
      session?.stopClient();
    };
  }, []);

  return (
    <MatrixContext.Provider value={{ client, ready }}>
      {children}
    </MatrixContext.Provider>
  );
}

export const useMatrix = () => useContext(MatrixContext);

const sortByActivity = (rooms: Room[]) =>
  [...rooms].sort(
    (a, b) => b.getLastActiveTimestamp() - a.getLastActiveTimestamp()
  );

/** Joined rooms, most recently active first; live-updates with sync. */
export const useMatrixRooms = (): Room[] => {
  const { client, ready } = useMatrix();
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!client || !ready) return;

    const update = () =>
      setRooms(
        sortByActivity(
          client.getRooms().filter(room => room.getMyMembership() === 'join')
        )
      );

    update();

    const events = [
      ClientEvent.Room,
      ClientEvent.DeleteRoom,
      RoomEvent.Timeline,
      RoomEvent.Name,
      RoomEvent.MyMembership,
      RoomEvent.Receipt,
      RoomEvent.UnreadNotifications
    ] as const;
    events.forEach(event => client.on(event as any, update));

    return () => {
      events.forEach(event => client.removeListener(event as any, update));
    };
  }, [client, ready]);

  return rooms;
};

/** Total unread message count across all rooms (replaces TalkJS useUnreads). */
export const useMatrixUnreads = (): number => {
  const rooms = useMatrixRooms();

  return rooms.reduce(
    (sum, room) =>
      sum +
      (room.getUnreadNotificationCount(NotificationCountType.Total) || 0),
    0
  );
};
