
export type Config = {
  persistance_provider?: DatabasePersistanceProvider;
}

export type DatabasePersistanceProvider = {
  load: () => Promise<any>;
  save: (data: any) => Promise<void>;
}