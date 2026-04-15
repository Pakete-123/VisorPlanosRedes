type Delegate = {
  findUnique: (...args: unknown[]) => Promise<unknown>;
  findFirst: (...args: unknown[]) => Promise<unknown>;
  findMany: (...args: unknown[]) => Promise<unknown[]>;
  create: (...args: unknown[]) => Promise<unknown>;
  update: (...args: unknown[]) => Promise<unknown>;
};

function createDelegate(): Delegate {
  return {
    findUnique: () => Promise.resolve(null),
    findFirst: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
  };
}

export class PrismaClient {
  user: Delegate = createDelegate();
  building: Delegate = createDelegate();
  floor: Delegate = createDelegate();

  $connect(): Promise<void> {
    return Promise.resolve();
  }

  $disconnect(): Promise<void> {
    return Promise.resolve();
  }
}
