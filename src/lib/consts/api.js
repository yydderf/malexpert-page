import { PUBLIC_API_BASE } from "$env/static/public";

export const API_BASE = PUBLIC_API_BASE;
export const API_ROUTES = {
    samples: {
        meta: (id) => `/samples/${encodeURIComponent(id)}/metadata`,
        upload: `/samples/upload/form`,
    }
};
