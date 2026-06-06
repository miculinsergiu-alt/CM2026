const BASE = import.meta.env.VITE_API_URL || "";
export const api = {
  get:  (url)       => fetch(BASE + url).then(r => r.json()),
  post: (url, data) => fetch(BASE + url, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) }).then(r => r.json()),
  put:  (url, data) => fetch(BASE + url, { method:"PUT",  headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) }).then(r => r.json()),
  del:  (url)       => fetch(BASE + url, { method:"DELETE" }).then(r => r.json()),
};
