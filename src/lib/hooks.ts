/* eslint-disable camelcase */

import { Router } from 'express';

interface FilterHook<T> {
  (data: T): Promise<T>;
}

interface ActionHook<T> {
  (data: T): void;
}

interface StaticHook<T> {
  (data: T): Promise<void>;
}

interface filter__navigation_available__NavItem {
  route: string,
  title: string,
  iconClass: string,
  textClass: string,
  text: string,
}
export type filter__navigation_available = FilterHook<filter__navigation_available__NavItem[]>;

interface filter__admin_header_build__Header {
  plugins: {
    route: string,
    icon: string,
    name: string,
  }[],
}
export type filter__admin_header_build = FilterHook<filter__admin_header_build__Header>;

interface filter__composer_formatting__Data {
  options: {
    name: string,
    className: string,
    title: string,
  }[]
}
export type filter__composer_formatting = FilterHook<filter__composer_formatting__Data>;

interface filter__sanitize_config_Config {
  allowedTags: string[],
  allowedAttributes: {
    [key: string]: string[]
  },
  allowedClasses: {
    [key: string]: string[]
  }
}
export type filter__sanitize_config = FilterHook<filter__sanitize_config_Config>;

type filter__privileges_list_List = string[];
export type filter__privileges_list = FilterHook<filter__privileges_list_List>;

type filter__privileges_groups_list_List = string[];
export type filter__privileges_groups_list = FilterHook<filter__privileges_groups_list_List>;

type filter__privileges_list_human_List = { name: string }[];
export type filter__privileges_list_human = FilterHook<filter__privileges_list_human_List>;

interface filter__parse_post_Data {
  postData: {
    content: string
  }
}
export type filter__parse_post = FilterHook<filter__parse_post_Data>;

export type filter__parse_raw = FilterHook<string>;

interface filter__post_getPostSummaryByPids_Data {
  posts: {
    content: string
  }[]
}
export type filter__post_getPostSummaryByPids = FilterHook<filter__post_getPostSummaryByPids_Data>;

interface filter__teasers_get_Data {
  teasers: {
    content: string
  }[]
}
export type filter__teasers_get = FilterHook<filter__teasers_get_Data>;

interface filter__post_save_Data {
  uid?: number,
  post: {
    content: string,
    pid?: string,
    tid?: string,
    uid?: number,
    editor?: number,
    isMain?: boolean,
  },
  data: {
    isMain?: boolean,
    pid?: string,
  },
}
export type filter__post_save = FilterHook<filter__post_save_Data>;

interface action__post_Data {
  post: {
    pid: number,
  }
}
export type action__post_delete = ActionHook<action__post_Data>;
export type action__post_restore = ActionHook<action__post_Data>;
export type action__post_purge = ActionHook<action__post_Data>;

interface static__app_load_Params {
  router: Router,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middleware: any
}
export type static__app_load = StaticHook<static__app_load_Params>;
