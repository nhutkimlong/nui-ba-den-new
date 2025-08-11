var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/data-blobs.js
var data_blobs_exports = {};
__export(data_blobs_exports, {
  default: () => data_blobs_default
});
module.exports = __toCommonJS(data_blobs_exports);
var import_blobs = require("@netlify/blobs");
var data_blobs_default = async (req, context) => {
  const store = (0, import_blobs.getStore)("site-data");
  const url = new URL(req.url);
  const file = url.searchParams.get("file");
  if (!file) {
    return new Response("Missing file parameter", { status: 400 });
  }
  if (req.method === "GET") {
    const data = await store.get(file, { type: "json" });
    if (!data) return new Response("Not found", { status: 404 });
    return Response.json(data);
  }
  if (req.method === "POST" || req.method === "PUT") {
    try {
      const body = await req.json();
      await store.setJSON(file, body);
      return new Response("Saved", { status: 200 });
    } catch (e) {
      return new Response("Invalid JSON", { status: 400 });
    }
  }
  return new Response("Method not allowed", { status: 405 });
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibmV0bGlmeS9mdW5jdGlvbnMvZGF0YS1ibG9icy5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgZ2V0U3RvcmUgfSBmcm9tICdAbmV0bGlmeS9ibG9icyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhc3luYyAocmVxLCBjb250ZXh0KSA9PiB7XHJcbiAgY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgnc2l0ZS1kYXRhJyk7IC8vIFRcdTAwRUFuIHN0b3JlIGJsb2JzLCBjXHUwMEYzIHRoXHUxRUMzIFx1MDExMVx1MUVENWkgblx1MUVCRnUgbXVcdTFFRDFuXHJcbiAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcclxuICBjb25zdCBmaWxlID0gdXJsLnNlYXJjaFBhcmFtcy5nZXQoJ2ZpbGUnKTsgLy8gdlx1MDBFRCBkXHUxRUU1OiAnUE9JLmpzb24nLCAnVG91cnMuanNvbicsIC4uLlxyXG5cclxuICBpZiAoIWZpbGUpIHtcclxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ01pc3NpbmcgZmlsZSBwYXJhbWV0ZXInLCB7IHN0YXR1czogNDAwIH0pO1xyXG4gIH1cclxuXHJcbiAgaWYgKHJlcS5tZXRob2QgPT09ICdHRVQnKSB7XHJcbiAgICAvLyBMXHUxRUE1eSBkXHUxRUVGIGxpXHUxRUM3dSBKU09OXHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmUuZ2V0KGZpbGUsIHsgdHlwZTogJ2pzb24nIH0pO1xyXG4gICAgaWYgKCFkYXRhKSByZXR1cm4gbmV3IFJlc3BvbnNlKCdOb3QgZm91bmQnLCB7IHN0YXR1czogNDA0IH0pO1xyXG4gICAgcmV0dXJuIFJlc3BvbnNlLmpzb24oZGF0YSk7XHJcbiAgfVxyXG5cclxuICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnIHx8IHJlcS5tZXRob2QgPT09ICdQVVQnKSB7XHJcbiAgICAvLyBHaGkgZFx1MUVFRiBsaVx1MUVDN3UgSlNPTlxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCk7XHJcbiAgICAgIGF3YWl0IHN0b3JlLnNldEpTT04oZmlsZSwgYm9keSk7XHJcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ1NhdmVkJywgeyBzdGF0dXM6IDIwMCB9KTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnSW52YWxpZCBKU09OJywgeyBzdGF0dXM6IDQwMCB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBuZXcgUmVzcG9uc2UoJ01ldGhvZCBub3QgYWxsb3dlZCcsIHsgc3RhdHVzOiA0MDUgfSk7XHJcbn07Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFBeUI7QUFFekIsSUFBTyxxQkFBUSxPQUFPLEtBQUssWUFBWTtBQUNyQyxRQUFNLFlBQVEsdUJBQVMsV0FBVztBQUNsQyxRQUFNLE1BQU0sSUFBSSxJQUFJLElBQUksR0FBRztBQUMzQixRQUFNLE9BQU8sSUFBSSxhQUFhLElBQUksTUFBTTtBQUV4QyxNQUFJLENBQUMsTUFBTTtBQUNULFdBQU8sSUFBSSxTQUFTLDBCQUEwQixFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsRUFDL0Q7QUFFQSxNQUFJLElBQUksV0FBVyxPQUFPO0FBRXhCLFVBQU0sT0FBTyxNQUFNLE1BQU0sSUFBSSxNQUFNLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDbkQsUUFBSSxDQUFDLEtBQU0sUUFBTyxJQUFJLFNBQVMsYUFBYSxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQzNELFdBQU8sU0FBUyxLQUFLLElBQUk7QUFBQSxFQUMzQjtBQUVBLE1BQUksSUFBSSxXQUFXLFVBQVUsSUFBSSxXQUFXLE9BQU87QUFFakQsUUFBSTtBQUNGLFlBQU0sT0FBTyxNQUFNLElBQUksS0FBSztBQUM1QixZQUFNLE1BQU0sUUFBUSxNQUFNLElBQUk7QUFDOUIsYUFBTyxJQUFJLFNBQVMsU0FBUyxFQUFFLFFBQVEsSUFBSSxDQUFDO0FBQUEsSUFDOUMsU0FBUyxHQUFHO0FBQ1YsYUFBTyxJQUFJLFNBQVMsZ0JBQWdCLEVBQUUsUUFBUSxJQUFJLENBQUM7QUFBQSxJQUNyRDtBQUFBLEVBQ0Y7QUFFQSxTQUFPLElBQUksU0FBUyxzQkFBc0IsRUFBRSxRQUFRLElBQUksQ0FBQztBQUMzRDsiLAogICJuYW1lcyI6IFtdCn0K
