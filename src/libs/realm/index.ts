import { createRealmContext } from '@realm/react';

import { Historic } from './schemas/Historic';
import { Coords } from './schemas/Coords';

export const {
  RealmProvider,
  useRealm,
  useQuery,
  useObject
} = createRealmContext({
  schema: [Historic, Coords],
  schemaVersion: 1
});