export type ObjectPostMan = {
  info: InfoPM;
  item: FolderItemPM[];
  variable: VariableEnvPM[];
};

export type ItemPM = {
  name: string;
  request: RequestPM;
};

export type FolderItemPM = {
  name: string;
  item: ItemPM[];
  description?: string;
};

type InfoPM = {
  name: 'P1';
  description: string;
  schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json';
};

type HeaderRequestPM = {
  key: string;
  value: string;
  type: string;
};

type UrlRequestPM = {
  raw: string;
  host: string[];
  path: string[];
};

type BodyRequestPM = {
  mode: 'raw';
  raw: string;
  options: {
    raw: {
      language: 'json';
    };
  };
};

type RequestPM = {
  method: string;
  header: HeaderRequestPM[];
  body?: BodyRequestPM;
  url: UrlRequestPM;
};

type VariableEnvPM = {
  key: string;
  value: string;
  type: string;
};
